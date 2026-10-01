import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const DOCS = 'docs';
const DRY = process.argv.includes('--dry');

const walkAll = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walkAll(path.join(d, e.name)) : [path.join(d, e.name)]
  );

const MAGIC = (buf) => {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: 'jpg', mime: 'image/jpeg' };
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e) return { ext: 'png', mime: 'image/png' };
  if (buf.slice(0, 3).toString() === 'GIF') return { ext: 'gif', mime: 'image/gif' };
  if (buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') return { ext: 'webp', mime: 'image/webp' };
  return null;
};

// 1. plan renames: only images whose real format differs from their extension
const images = walkAll(DOCS).filter((f) => /\.(gif|png|jpg|jpeg|webp)$/i.test(f));
const renames = [];
for (const f of images) {
  const real = MAGIC(fs.readFileSync(f).subarray(0, 12));
  if (!real) { console.log(`SKIP (unknown magic): ${path.relative(DOCS, f)}`); continue; }
  const ext = path.extname(f).slice(1).toLowerCase();
  const canon = ext === 'jpeg' ? 'jpg' : ext;
  if (real.ext !== canon) {
    const target = path.join(path.dirname(f), `${path.basename(f, path.extname(f))}.${real.ext}`);
    if (fs.existsSync(target)) { console.log(`CONFLICT (target exists): ${path.relative(DOCS, f)} -> ${path.basename(target)}`); continue; }
    renames.push({ from: f, to: target, ext, real });
  }
}

console.log(`\nrenames planned: ${renames.length}`);
const byPair = {};
for (const r of renames) {
  const k = `.${r.ext} -> .${r.real.ext}`;
  byPair[k] = (byPair[k] || 0) + 1;
}
console.log('breakdown:', byPair);

if (DRY) {
  console.log('\n--dry, listing first 10--');
  for (const r of renames.slice(0, 10)) console.log(`  ${path.relative(DOCS, r.from)} -> ${path.relative(DOCS, r.to)}`);
  process.exit(0);
}

// 2. rename files
for (const r of renames) fs.renameSync(r.from, r.to);
console.log(`\nrenamed ${renames.length} files`);

// 3. rewrite references in every text file under docs + the sw precache list + generators
const targets = walkAll(DOCS).filter((f) => /\.(html|js|css|xml|txt|json)$/i.test(f));
const repoScripts = fs.existsSync('scripts') ? walkAll('scripts').filter((f) => /\.(mjs|js)$/i.test(f)) : [];
let touched = 0;
for (const file of [...targets, ...repoScripts]) {
  let text = fs.readFileSync(file, 'utf8');
  const before = text;
  for (const r of renames) {
    const relFrom = path.relative(DOCS, r.from).replace(/\\/g, '/');
    const relTo = path.relative(DOCS, r.to).replace(/\\/g, '/');
    // replace any reference containing the old path
    text = text.split(relFrom).join(relTo);
    text = text.split(path.basename(r.from)).join(path.basename(r.to));
  }
  if (text !== before) { fs.writeFileSync(file, text, 'utf8'); touched++; }
}
console.log(`updated references in ${touched} files`);

// 4. re-verify: no extension lies remain
const after = [];
for (const f of walkAll(DOCS).filter((f) => /\.(gif|png|jpg|jpeg|webp)$/i.test(f))) {
  const real = MAGIC(fs.readFileSync(f).subarray(0, 12));
  const canon = real && (real.ext === 'jpg') ? 'jpg' : real?.ext;
  const ext = path.extname(f).slice(1).toLowerCase() === 'jpeg' ? 'jpg' : path.extname(f).slice(1).toLowerCase();
  if (real && real.ext !== ext) after.push(`${path.relative(DOCS, f)}: .${ext} is ${real.ext}`);
}
console.log(`\nremaining extension lies: ${after.length}`);
for (const a of after.slice(0, 10)) console.log('  ' + a);