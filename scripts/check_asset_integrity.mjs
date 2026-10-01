import fs from 'fs';
import path from 'path';

const DOCS = 'docs';
const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]
  );

// 1. every local src/href in every HTML page must exist on disk
const html = walk(DOCS).filter((f) => f.endsWith('.html'));
let refs = 0;
const missing = [];
for (const f of html) {
  const text = fs.readFileSync(f, 'utf8');
  for (const m of text.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    const u = m[1].split('#')[0].split('?')[0];
    if (!u || /^(https?:)?\/\//.test(u) || u.startsWith('data:') || u.startsWith('mailto:')) continue;
    refs++;
    // resolve relative to the page's own directory (f already includes docs/)
    if (!fs.existsSync(path.resolve(path.dirname(f), u))) missing.push(`${path.relative(DOCS, f)} -> ${u}`);
  }
}

// 2. every asset named in sw.js precache lists must exist
const sw = fs.readFileSync(path.join(DOCS, 'sw.js'), 'utf8');
const precache = [...new Set([...sw.matchAll(/["']([\w\-/.]+\.(?:png|jpe?g|gif|webp|svg|css|js|xml|txt|html))["']/g)].map((m) => m[1]))];
const swMissing = precache.filter((p) => !fs.existsSync(path.join(DOCS, p)));

// 3. image_prompts.json file entries must match files on disk
let promptMissing = 0;
const promptFile = path.join(DOCS, 'image_prompts.json');
if (fs.existsSync(promptFile)) {
  const prompts = JSON.parse(fs.readFileSync(promptFile, 'utf8'));
  for (const p of prompts) {
    if (!fs.existsSync(path.join(DOCS, 'images', p.file))) { promptMissing++; console.log('  prompt -> missing images/' + p.file); }
  }
}

console.log('html pages          :', html.length);
console.log('local asset refs    :', refs, '| missing:', missing.length);
missing.slice(0, 15).forEach((m) => console.log('   MISSING ' + m));
console.log('sw precache entries :', precache.length, '| missing:', swMissing.length);
swMissing.forEach((m) => console.log('   MISSING ' + m));
console.log('image_prompts.json  : missing files:', promptMissing);
console.log('\nRESULT:', missing.length + swMissing.length + promptMissing === 0 ? 'ALL ASSETS RESOLVE' : 'BROKEN REFERENCES REMAIN');