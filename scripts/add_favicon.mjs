#!/usr/bin/env node
/**
 * add_favicon.mjs — inject a real favicon link into every .html file under docs.
 *
 * Why: without an explicit <link rel="icon">, browsers fall back to requesting
 * /favicon.ico. That returned 404 on 45 of the 47 pages (only index.html and
 * pages/neon-oracle.html carried an inline SVG data-URI icon), which Lighthouse
 * reports as errors-in-console and which costs best-practices points.
 *
 * The href is computed relative to each page's own directory so that nested
 * pages (characters/*.html, pages/*.html) resolve correctly.
 *
 * Idempotent: pages already carrying rel="icon" are rewritten, not duplicated.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = path.join(__dirname, '..', 'docs');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.toLowerCase().endsWith('.html')) out.push(p);
  }
  return out;
}

// The two pages that shipped an inline SVG data-URI favicon carried a MALFORMED
// one: an unescaped double quote inside the href terminated the attribute early,
// so the tail (`<text ...>...</text></svg>">`) leaked into the document as
// visible text and pushed the CSP <meta> outside <head>. Match that whole block
// including its trailing `">` so nothing is left behind.
const LEGACY_DATA_URI_RE =
  /<link\b[^>]*\brel=["']icon["'][^>]*\bsvg\+xml[\s\S]*?<\/svg>">/i;

// Matches any remaining well-formed <link ... rel="icon" ...>.
const LINK_RE = /<link\b[^>]*\brel=["']icon["'][^>]*>/i;

let updated = 0;
const files = walk(DOCS_DIR).sort();

for (const file of files) {
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('</head>')) continue;

  const rel = path
    .relative(path.dirname(file), path.join(DOCS_DIR, 'favicon.ico'))
    .split(path.sep)
    .join('/');
  const tag = `<link rel="icon" href="${rel}" type="image/x-icon">`;

  const hasLegacy = LEGACY_DATA_URI_RE.test(html);

  let next;
  if (hasLegacy) {
    next = html.replace(LEGACY_DATA_URI_RE, tag);
    console.log(
      `  ✦ removed malformed data-URI icon from ${path.relative(DOCS_DIR, file)}`,
    );
  } else if (LINK_RE.test(html)) {
    next = html.replace(LINK_RE, tag);
  } else {
    next = html.replace('</head>', `  ${tag}\n</head>`);
  }

  if (next !== html) {
    fs.writeFileSync(file, next);
    updated++;
    if (!hasLegacy) console.log(`  ✓ ${path.relative(DOCS_DIR, file)} -> ${rel}`);
  }
}

console.log(`\n✅ Complete: ${updated} files updated with favicon link`);