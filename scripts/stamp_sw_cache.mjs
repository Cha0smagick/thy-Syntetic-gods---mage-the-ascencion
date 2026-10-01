#!/usr/bin/env node
/**
 * Stamp a content-derived version into the Service Worker cache name.
 *
 * Why this exists:
 *   sw.js precaches CSS/JS/images and serves static assets cache-first.
 *   The browser only re-installs a Service Worker when sw.js ITSELF changes
 *   byte-for-byte, so deploying an updated geocities.css alone would NOT
 *   refresh the precache — returning visitors would keep getting the stale
 *   stylesheet (which, for the mobile nav fix, meant no navigation at all).
 *
 * What this does:
 *   Hashes every precached asset and rewrites CACHE_NAME to
 *   'synthetic-gods-<hash>'. The cache name only changes when precached
 *   content changes, so:
 *     - deploying a real change  -> new cache name -> fresh install + precache
 *     - running with no changes   -> identical hash -> file untouched (idempotent)
 *
 * The sw.js `activate` handler already deletes every cache whose name differs
 * from the current CACHE_NAME, so old caches are evicted automatically.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DOCS_DIR = path.join(process.cwd(), 'docs');
const SW_PATH = path.join(DOCS_DIR, 'sw.js');

// Mirror the asset lists already declared inside sw.js so the hash covers
// exactly what gets precached. Kept as literals rather than parsed from sw.js
// so a malformed sw.js can never silently produce an empty hash.
const TRACKED_ASSETS = [
  'index.html',
  'pages/neon-oracle.html',
  'css/geocities.css',
  'js/geocities.js',
  'sitemap.xml',
  'robots.txt',
  'sitemap.html',
];

function hashAssets() {
  const hash = crypto.createHash('sha256');
  let found = 0;
  let missing = 0;

  for (const rel of TRACKED_ASSETS) {
    const abs = path.join(DOCS_DIR, rel);
    hash.update(rel);
    if (fs.existsSync(abs)) {
      hash.update(fs.readFileSync(abs));
      found++;
    } else {
      // Still mix in the name so a missing file changes the hash.
      hash.update('::missing::');
      missing++;
    }
  }

  return { digest: hash.digest('hex').slice(0, 12), found, missing };
}

function main() {
  if (!fs.existsSync(SW_PATH)) {
    console.error('✗ docs/sw.js not found — nothing to stamp.');
    process.exitCode = 1;
    return;
  }

  const { digest, found, missing } = hashAssets();
  const stamp = `synthetic-gods-${digest}`;
  const sw = fs.readFileSync(SW_PATH, 'utf8');

  const pattern = /const CACHE_NAME = 'synthetic-gods-[^']*';/;
  if (!pattern.test(sw)) {
    console.error("✗ Could not find a `const CACHE_NAME = 'synthetic-gods-...';` line in sw.js.");
    process.exitCode = 1;
    return;
  }

  const next = sw.replace(pattern, `const CACHE_NAME = '${stamp}';`);

  if (next === sw) {
    console.log(`⊘ sw.js already stamped: ${stamp} (${found} assets hashed${missing ? `, ${missing} missing` : ''})`);
    return;
  }

  fs.writeFileSync(SW_PATH, next, 'utf8');
  console.log(`✓ Stamped sw.js cache: ${stamp} (${found} assets hashed${missing ? `, ${missing} missing` : ''})`);
}

main();