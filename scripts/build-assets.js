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
 * Top-level JS names (function/var/let/const declared outside any function)
 * are mangled too, not just local variables — that's what actually makes the
 * shipped code hard to read, since most of the "readable" surface in a
 * minify-only build is exactly the top-level function names. The catch: a
 * lot of this codebase's top-level functions are called from `onclick="..."`
 * (and similar) attributes in .pug views, or from ANOTHER script file as an
 * implicit global (these files aren't modules, they all share one global
 * scope in the browser) — Terser can't see either of those call sites, so
 * blindly mangling everything would silently break them. Before mangling,
 * this script scans every target JS file plus every .pug view for where each
 * top-level name is actually used, and reserves (never renames) any name
 * that's referenced from outside the file that declares it. Only names used
 * exclusively within their own file get renamed — but that ends up being
 * almost everything, since cross-file/HTML-facing entry points are a small
 * fraction of the code.
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
const VIEWS_DIR = path.join(ROOT, 'views');
const OUT_DIR = path.join(ROOT, 'public-dist');

const EXCLUDE_DIRS = new Set(['vendors', 'majestic', 'accordion', 'fonts']);

function walk(dir, test, excludeDirs, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (excludeDirs && excludeDirs.has(entry.name)) continue;
      walk(abs, test, excludeDirs, files);
    } else if (test(entry.name)) {
      files.push(abs);
    }
  }
  return files;
}

function hashOf(content) {
  return crypto.createHash('md5').update(content).digest('hex').slice(0, 10);
}

function tokenize(source) {
  return source.match(/[A-Za-z_$][A-Za-z0-9_$]*/g) || [];
}

// A name declared at the start of a line (no leading whitespace) is, in
// practice, a top-level declaration in this codebase's style — none of it
// is wrapped in an IIFE/module, so column 0 == global scope.
const TOP_LEVEL_DECL_RE = /^(?:function\s+([A-Za-z_$][\w$]*)\s*\(|(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=)/gm;

/**
 * Returns the set of top-level names that MUST NOT be renamed: anything
 * referenced anywhere outside the single file that declares it (another
 * target JS file, or any .pug view — inline onclick attributes, JS-built
 * onclick strings, and inline `script.` blocks all count, since they're
 * plain text as far as this scan is concerned).
 */
function computeReservedNames(jsFiles, pugFiles) {
  const sources = new Map();
  const declaredIn = new Map(); // name -> Set<file>

  for (const file of jsFiles) {
    const source = fs.readFileSync(file, 'utf8');
    sources.set(file, source);
    let m;
    TOP_LEVEL_DECL_RE.lastIndex = 0;
    while ((m = TOP_LEVEL_DECL_RE.exec(source))) {
      const name = m[1] || m[2];
      if (!declaredIn.has(name)) declaredIn.set(name, new Set());
      declaredIn.get(name).add(file);
    }
  }

  const perFileCounts = new Map(); // file -> Map<name, count>
  const fullCounts = new Map(); // name -> count (across all JS files + all pug views)

  for (const [file, source] of sources) {
    const counts = new Map();
    for (const tok of tokenize(source)) {
      counts.set(tok, (counts.get(tok) || 0) + 1);
      fullCounts.set(tok, (fullCounts.get(tok) || 0) + 1);
    }
    perFileCounts.set(file, counts);
  }

  for (const pugFile of pugFiles) {
    for (const tok of tokenize(fs.readFileSync(pugFile, 'utf8'))) {
      fullCounts.set(tok, (fullCounts.get(tok) || 0) + 1);
    }
  }

  const reserved = new Set();
  for (const [name, declFiles] of declaredIn) {
    const ownCount = [...declFiles].reduce((sum, f) => sum + (perFileCounts.get(f).get(name) || 0), 0);
    const total = fullCounts.get(name) || 0;
    // If the name shows up anywhere beyond its own declaring file(s), some
    // other file or view is depending on that exact name — keep it.
    if (total > ownCount) reserved.add(name);
  }

  return reserved;
}

async function build() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });

  const files = walk(SRC_DIR, (name) => /\.(js|css)$/.test(name) && !/\.min\.(js|css)$/.test(name), EXCLUDE_DIRS);
  const jsFiles = files.filter((f) => f.endsWith('.js'));
  const pugFiles = fs.existsSync(VIEWS_DIR) ? walk(VIEWS_DIR, (name) => name.endsWith('.pug'), null) : [];
  const reservedNames = computeReservedNames(jsFiles, pugFiles);

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
        const result = await minifyJs(source, {
          mangle: { toplevel: true, reserved: [...reservedNames] },
          compress: true,
        });
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
  console.log(`[build-assets] ${reservedNames.size} top-level name(s) reserved (used outside their own file)`);
  console.log(`[build-assets] ${(totalBefore / 1024).toFixed(0)} KB -> ${(totalAfter / 1024).toFixed(0)} KB (-${pct}%)`);
  if (failed) console.warn(`[build-assets] ${failed} file(s) could not be minified and were copied as-is (see warnings above)`);
}

build().catch((err) => {
  console.error('[build-assets] fatal error:', err);
  process.exit(1);
});
