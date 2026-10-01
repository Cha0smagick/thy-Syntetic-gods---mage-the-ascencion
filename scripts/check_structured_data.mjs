import fs from 'fs';
import path from 'path';

const DOCS = 'docs';
const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.html') ? [path.join(d, e.name)] : []
  );

const files = walk(DOCS);
const problems = [];
const typeCount = {};

// every real file on disk, for magic-byte checks
const allFiles = walkAll('docs');

// detect images that lie about their extension (repo-wide problem class)
const realFormat = new Map();
for (const f of allFiles) {
  const head = fs.readFileSync(f).subarray(0, 12);
  let fmt = 'unknown';
  // normalise to the canonical on-disk extension so jpeg-vs-jpg never reads as a lie
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) fmt = 'jpg';
  else if (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e) fmt = 'png';
  else if (head.slice(0, 3).toString() === 'GIF') fmt = 'gif';
  else if (head.slice(4, 8).toString() === 'WEBP') fmt = 'webp';
  else if (head[0] === 0x42 && head[1] === 0x4d) fmt = 'bmp';
  else if (head.slice(0, 4).toString() === 'RIFF') fmt = 'webp';
  const ext = path.extname(f).slice(1).toLowerCase() === 'jpeg' ? 'jpg' : path.extname(f).slice(1).toLowerCase();
  realFormat.set(path.relative('docs', f).replace(/\\/g, '/'), fmt);
  if (fmt !== 'unknown' && fmt !== ext) {
    problems.push({ file: path.relative('docs', f), issue: `EXTENSION LIE: .${ext} file is actually ${fmt}` });
  }
}

function walkAll(d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walkAll(path.join(d, e.name)) : [path.join(d, e.name)]
  );
}

// recurse into @graph and arrays so nested nodes get validated too
function eachNode(node, visit, isRoot = true) {
  if (Array.isArray(node)) return node.forEach((n) => eachNode(n, visit, isRoot));
  if (!node || typeof node !== 'object') return;
  visit(node, isRoot);
  if (node['@graph']) eachNode(node['@graph'], visit, false);
  for (const [k, v] of Object.entries(node)) {
    if (k !== '@graph' && v && typeof v === 'object') eachNode(v, visit, false);
  }
}

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(DOCS, file);
  const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];

  if (blocks.length === 0) {
    problems.push({ file: rel, issue: 'NO JSON-LD block' });
    continue;
  }

  for (const [, raw] of blocks) {
    let json;
    try {
      json = JSON.parse(raw);
    } catch (e) {
      problems.push({ file: rel, issue: `INVALID JSON: ${e.message}` });
      continue;
    }
    eachNode(json, (item, isRoot) => {
      const t = item['@type'] || (item['@graph'] ? '@graph-container' : '<none>');
      typeCount[t] = (typeCount[t] || 0) + 1;

      // @context is only required on the top-level node; nested nodes inherit it
      if (isRoot && !item['@context']) problems.push({ file: rel, issue: `root node missing @context` });
      if (item.url && !/^https?:\/\//.test(item.url)) problems.push({ file: rel, issue: `type=${t} url not absolute: ${item.url}` });
      if (item.url && !urlExists(item.url, files)) problems.push({ file: rel, issue: `type=${t} url has NO matching page: ${item.url}` });

      // images referenced by structured data must be real, correctly-typed files
      for (const field of ['logo', 'image']) {
        const v = item[field];
        const vals = Array.isArray(v) ? v : v ? [v] : [];
        for (const entry of vals) {
          const src = typeof entry === 'string' ? entry : entry?.url;
          if (!src || !/^https?:\/\//.test(src)) continue;
          const relPath = src.split('/thy-Syntetic-gods---mage-the-ascencion/')[1];
          if (!relPath) continue;
          const fmt = realFormat.get(relPath);
          if (fmt === undefined) problems.push({ file: rel, issue: `${field} points to MISSING file: ${relPath}` });
          else if (fmt !== 'unknown' && fmt !== path.extname(relPath).slice(1).toLowerCase())
            problems.push({ file: rel, issue: `${field} points at ${relPath} (.${path.extname(relPath).slice(1)} but actually ${fmt})` });
        }
      }

      if (t === 'Article' || t === 'TechArticle' || t === 'WebPage') {
        for (const req of ['headline', 'image', 'datePublished', 'author']) {
          if (t === 'WebPage' && (req === 'headline' || req === 'datePublished' || req === 'author')) continue;
          if (!item[req]) problems.push({ file: rel, issue: `type=${t} missing required ${req}` });
        }
      }
      if (t === 'BreadcrumbList') {
        const positions = (item.itemListElement || []).map((e) => e.position);
        const uniq = new Set(positions);
        if (positions.length !== uniq.size) problems.push({ file: rel, issue: `BreadcrumbList duplicate positions: ${positions}` });
        const expected = (item.itemListElement || []).map((_, i) => i + 1);
        if (JSON.stringify(positions) !== JSON.stringify(expected)) problems.push({ file: rel, issue: `BreadcrumbList positions not sequential: ${positions}` });
      }
    });
  }
}

function urlExists(url, files) {
  try {
    let rel = new URL(url).pathname.replace(/^\/.*?thy-Syntetic-gods---mage-the-ascencion\/?/, '');
    rel = rel.replace(/^\//, '').replace(/\/$/, '');
    if (rel === '') rel = 'index.html'; // site root == index.html
    const want = rel.replace(/\.html$/, '');
    return files.some((f) => path.relative(DOCS, f).replace(/\\/g, '/').replace(/\.html$/, '') === want);
  } catch {
    return false;
  }
}

console.log('html files:', files.length);
console.log('@type counts:', typeCount);
console.log('problems:', problems.length);

// group by category so 200 image-extension-lies don't drown real structural defects
const byCat = new Map();
for (const p of problems) {
  const cat = p.issue
    .replace(/\.\w+ file is actually \w+.*/, 'IMAGE EXTENSION LIE')
    .replace(/\.\w+ but actually \w+\)/, 'IMAGE EXTENSION LIE (referenced by JSON-LD)')
    .replace(/https?:\/\/\S+/, '<url>')
    .replace(/missing required \w+/, 'missing required field')
    .replace(/positions not sequential.*/, 'breadcrumb positions not sequential')
    .replace(/duplicate positions.*/, 'breadcrumb duplicate positions')
    .replace(/INVALID JSON:.*/, 'INVALID JSON');
  if (!byCat.has(cat)) byCat.set(cat, []);
  byCat.get(cat).push(p);
}
console.log('\n=== BY CATEGORY ===');
for (const [cat, list] of [...byCat.entries()].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n[${list.length}] ${cat}`);
  for (const p of list.slice(0, 6)) console.log(`    ${p.file} -> ${p.issue}`);
  if (list.length > 6) console.log(`    ... +${list.length - 6} more`);
}