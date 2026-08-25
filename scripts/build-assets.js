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
 * ## Why most files only get LOCAL-scope mangling
 *
 * These files are separate <script src> tags, not modules — on a given page
 * they all share one global scope in the browser, and plenty of top-level
 * names are called from `onclick="..."` in .pug views or referenced from
 * another file as an implicit global. Terser mangles each file
 * independently with no idea what sibling files or the HTML need, so
 * top-level mangling on standalone files reliably makes two unrelated files
 * pick the same short name (e.g. both rename something to `t`) — if either
 * was a `let`/`const`, redeclaring it across script tags on the same page is
 * a hard SyntaxError that kills the whole script (this broke the site once
 * — see git history around "mangle top-level names"). Local/function-scoped
 * variables don't have this problem: each file's own scope is
 * self-contained, so mangling those is always safe. Standalone files below
 * only ever get that safe, local-only treatment.
 *
 * ## BUNDLES: real top-level obfuscation, done safely
 *
 * A BUNDLES entry concatenates a page's own script files (in the exact
 * order their <script> tags load today) into ONE file and minifies that as
 * a SINGLE Terser compilation unit. Because it's one unit, there is no
 * "other file" for a mangled name to collide with — Terser can safely
 * mangle top-level names too. The only names it must still leave alone are
 * ones referenced from OUTSIDE the bundle: an onclick="..." in a .pug view,
 * or a name some other, non-bundled file/bundle depends on. Those are found
 * automatically (see reservedNamesFor) by scanning every .pug view and
 * every other JS file for the bundle's own top-level names — anything that
 * turns up outside the bundle is reserved (left un-renamed); everything
 * else is fair game.
 *
 * A bundle's manifest key (e.g. "remate/bundle.js") is virtual — no such
 * file exists under public/. Views load it via asset('/remate/bundle.js')
 * same as any real asset. Adding/editing a bundle here also requires
 * updating the view(s) that load its members to load the single bundle
 * script instead — see views/cattle/remate.pug.
 *
 * Usage:
 *   npm run build:assets
 *
 * Run this after changing any file it covers, then commit both the source
 * change and the resulting public-dist/ output — this repo's deploy is a
 * plain `git pull` + `pm2 reload`, there is no build step on the server.
 * Always run the build (and eyeball the site) BEFORE `pm2 reload all`, not
 * after — the manifest is only read once, at server startup.
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

// key: virtual manifest path (doesn't exist as a real file under public/).
// value: member files (relative to public/), in load order.
const BUNDLES = {
  'remate/bundle.js': [
    'remate/scripts.js',
    'remate/search-scripts.js',
    'remate/chat-scripts.js',
    'remate/lot-template.js',
    'remate/carousel-scripts.js',
    'remate/lot-scripts.js',
    'remate/auctions.js',
    'remate/countdowns.js',
    'remate/toast_manager.js',
  ],
};

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

function topLevelNamesIn(source) {
  const names = new Set();
  let m;
  TOP_LEVEL_DECL_RE.lastIndex = 0;
  while ((m = TOP_LEVEL_DECL_RE.exec(source))) names.add(m[1] || m[2]);
  return names;
}

// '...', "...", `...` — used to find names Terser could never see as
// identifiers because they're just text to it: onclick="fn(...)" (whether
// that's literal HTML in a .pug view, or built by JS via string
// concatenation), setInterval('fn()', ms) (old-style string-eval'd
// callback), etc. Terser only ever renames real identifiers, so a
// declaration invoked this way breaks the instant it's renamed — even when
// the string lives in the exact same file as the declaration, which is why
// this has to be checked in addition to (not instead of) cross-file usage.
const STRING_LITERAL_RE = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`/g;

function stringLiteralContents(source) {
  return (source.match(STRING_LITERAL_RE) || []).join(' ');
}

// Names in `ownSource` that must NOT be renamed: any of its own top-level
// declarations that either (a) appear as plain code anywhere in
// `externalSource` — everything outside this compilation unit — or (b) turn
// up inside a string literal ANYWHERE, including this same source. (b)
// covers onclick="..." / setInterval('...') style stringly-typed calls,
// which are just as invisible to Terser within one file as across files.
function reservedNamesFor(ownSource, externalSource) {
  const declared = topLevelNamesIn(ownSource);
  if (!declared.size) return [];
  const externalTokens = new Set(tokenize(externalSource));
  const stringTokens = new Set(tokenize(`${stringLiteralContents(ownSource)} ${stringLiteralContents(externalSource)}`));
  return [...declared].filter((name) => externalTokens.has(name) || stringTokens.has(name));
}

async function minifyStandalone(absPath) {
  const source = fs.readFileSync(absPath, 'utf8');
  if (!absPath.endsWith('.js')) {
    const result = new CleanCSS({ level: 2 }).minify(source);
    if (result.errors.length) throw new Error(result.errors.join(', '));
    return { source, output: result.styles };
  }
  const result = await minifyJs(source, { mangle: true, compress: true });
  if (result.error) throw result.error;
  return { source, output: result.code };
}

function writeOutput(manifest, relKey, output) {
  const ext = path.extname(relKey);
  const base = relKey.slice(0, -ext.length);
  const hash = hashOf(output);
  const outRel = `${base}.${hash}.min${ext}`;
  const outAbs = path.join(OUT_DIR, outRel);
  fs.mkdirSync(path.dirname(outAbs), { recursive: true });
  fs.writeFileSync(outAbs, output);
  manifest[`/${relKey}`] = `/dist/${outRel}`;
}

async function build() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });

  const bundleSourceSet = new Set();
  for (const key of Object.keys(BUNDLES)) {
    for (const rel of BUNDLES[key]) bundleSourceSet.add(path.join(SRC_DIR, rel));
  }

  const allFiles = walk(SRC_DIR, (name) => /\.(js|css)$/.test(name) && !/\.min\.(js|css)$/.test(name), EXCLUDE_DIRS);
  const standaloneFiles = allFiles.filter((f) => !bundleSourceSet.has(f));
  const pugFiles = fs.existsSync(VIEWS_DIR) ? walk(VIEWS_DIR, (name) => name.endsWith('.pug'), null) : [];

  const manifest = {};
  let totalBefore = 0;
  let totalAfter = 0;
  let failed = 0;

  const pugCorpus = pugFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  const standaloneCorpus = standaloneFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  const bundleSource = {}; // bundleKey -> concatenated raw source
  for (const key of Object.keys(BUNDLES)) {
    bundleSource[key] = BUNDLES[key].map((rel) => fs.readFileSync(path.join(SRC_DIR, rel), 'utf8')).join('\n;\n');
  }

  // --- Bundles ---
  for (const bundleKey of Object.keys(BUNDLES)) {
    const combinedSource = bundleSource[bundleKey];
    totalBefore += Buffer.byteLength(combinedSource);

    const otherBundlesCorpus = Object.keys(BUNDLES)
      .filter((k) => k !== bundleKey)
      .map((k) => bundleSource[k])
      .join('\n');
    const externalCorpus = `${pugCorpus}\n${standaloneCorpus}\n${otherBundlesCorpus}`;
    const reserved = reservedNamesFor(combinedSource, externalCorpus);

    let output;
    try {
      const result = await minifyJs(combinedSource, {
        mangle: { toplevel: true, reserved },
        compress: true,
      });
      if (result.error) throw result.error;
      output = result.code;
    } catch (err) {
      console.warn(`[build-assets] could not minify bundle ${bundleKey}, keeping unminified: ${err.message || err}`);
      output = combinedSource;
      failed++;
    }
    totalAfter += Buffer.byteLength(output);
    writeOutput(manifest, bundleKey, output);
    console.log(`[build-assets] bundle ${bundleKey}: ${BUNDLES[bundleKey].length} file(s) combined, ${reserved.length} name(s) reserved`);
  }

  // --- Standalone files (unchanged behavior: local-scope mangling only) ---
  for (const absPath of standaloneFiles) {
    const relPath = path.relative(SRC_DIR, absPath).split(path.sep).join('/');
    totalBefore += fs.statSync(absPath).size;

    let output;
    try {
      ({ output } = await minifyStandalone(absPath));
    } catch (err) {
      const source = fs.readFileSync(absPath, 'utf8');
      console.warn(`[build-assets] could not minify ${relPath}, keeping unminified: ${err.message || err}`);
      output = source;
      failed++;
    }
    totalAfter += Buffer.byteLength(output);
    writeOutput(manifest, relPath, output);
  }

  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  const pct = totalBefore ? (100 - (totalAfter / totalBefore) * 100).toFixed(1) : '0.0';
  console.log(`[build-assets] built ${standaloneFiles.length} standalone file(s) + ${Object.keys(BUNDLES).length} bundle(s) -> public-dist/`);
  console.log(`[build-assets] ${(totalBefore / 1024).toFixed(0)} KB -> ${(totalAfter / 1024).toFixed(0)} KB (-${pct}%)`);
  if (failed) console.warn(`[build-assets] ${failed} file(s)/bundle(s) could not be minified and were copied as-is (see warnings above)`);
}

build().catch((err) => {
  console.error('[build-assets] fatal error:', err);
  process.exit(1);
});
