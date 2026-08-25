#!/usr/bin/env node

/**
 * Minifies the site's own JS/CSS under public/ into public-dist/, with a
 * content hash in each output filename, and writes public-dist/manifest.json
 * mapping the original path to the built one.
 *
 * Third-party/vendor code (public/vendors, public/majestic, public/accordion,
 * public/fonts, and anything already named *.min.js / *.min.css) is left
 * alone — it's either already minified or risky to touch blind.
 *
 * JS mangling is intentionally LOCAL-SCOPE ONLY (no `mangle.toplevel`).
 * These files are separate <script src> tags, not modules — they all share
 * one global scope in the browser, and plenty of top-level names are called
 * from `onclick="..."` in .pug views or referenced from another file as an
 * implicit global. Terser mangles each file independently with no idea what
 * the other files or the HTML need, so top-level mangling reliably makes two
 * unrelated files pick the same short name (e.g. both rename something to
 * `t`) — if either was a `let`/`const`, redeclaring it across script tags on
 * the same page is a hard SyntaxError that kills the whole script (this
 * broke the site once — see git history around "mangle top-level names").
 * Local/function-scoped variables don't have this problem: each file's own
 * scope is self-contained, so mangling those is always safe.
 *
 * Usage:
 *   npm run build:assets
 *
 * Run this after changing any file it covers, then commit both the source
 * change and the resulting public-dist/ output — this repo's deploy is a
 * plain `git pull` + `pm2 reload`, there is no build step on the server.
 *
 * Views read the manifest through the `asset()` Pug helper (see app.js):
 *   script(src=asset('/remate/scripts.js'))
 * That also means: after rebuilding, the running server needs a reload
 * (`pm2 reload all`) to pick up the new manifest.json.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { minify: minifyJs } = require('terser');
const CleanCSS = require('clean-css');

const ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'public');
const OUT_DIR = path.join(ROOT, 'public-dist');

const EXCLUDE_DIRS = new Set(['vendors', 'majestic', 'accordion', 'fonts']);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      walk(abs, files);
    } else if (/\.(js|css)$/.test(entry.name) && !/\.min\.(js|css)$/.test(entry.name)) {
      files.push(abs);
    }
  }
  return files;
}

function hashOf(content) {
  return crypto.createHash('md5').update(content).digest('hex').slice(0, 10);
}

async function build() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });

  const files = walk(SRC_DIR);
  const manifest = {};
  let totalBefore = 0;
  let totalAfter = 0;
  let failed = 0;

  for (const absPath of files) {
    const relPath = path.relative(SRC_DIR, absPath).split(path.sep).join('/');
    const source = fs.readFileSync(absPath, 'utf8');
    totalBefore += Buffer.byteLength(source);

    let output;
    try {
      if (absPath.endsWith('.js')) {
        const result = await minifyJs(source, { mangle: true, compress: true });
        if (result.error) throw result.error;
        output = result.code;
      } else {
        const result = new CleanCSS({ level: 2 }).minify(source);
        if (result.errors.length) throw new Error(result.errors.join(', '));
        output = result.styles;
      }
    } catch (err) {
      // Never let one bad file kill the whole build or ship broken JS/CSS:
      // fall back to the original source for that file and keep going.
      console.warn(`[build-assets] could not minify ${relPath}, keeping unminified: ${err.message || err}`);
      output = source;
      failed++;
    }
    totalAfter += Buffer.byteLength(output);

    const ext = path.extname(relPath);
    const base = relPath.slice(0, -ext.length);
    const hash = hashOf(output);
    const outRel = `${base}.${hash}.min${ext}`;
    const outAbs = path.join(OUT_DIR, outRel);

    fs.mkdirSync(path.dirname(outAbs), { recursive: true });
    fs.writeFileSync(outAbs, output);

    manifest[`/${relPath}`] = `/dist/${outRel}`;
  }

  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  const pct = totalBefore ? (100 - (totalAfter / totalBefore) * 100).toFixed(1) : '0.0';
  console.log(`[build-assets] built ${files.length} file(s) -> public-dist/`);
  console.log(`[build-assets] ${(totalBefore / 1024).toFixed(0)} KB -> ${(totalAfter / 1024).toFixed(0)} KB (-${pct}%)`);
  if (failed) console.warn(`[build-assets] ${failed} file(s) could not be minified and were copied as-is (see warnings above)`);
}

build().catch((err) => {
  console.error('[build-assets] fatal error:', err);
  process.exit(1);
});
