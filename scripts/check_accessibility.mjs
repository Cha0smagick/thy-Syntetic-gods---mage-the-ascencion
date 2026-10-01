import { chromium, devices } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = 'http://localhost:8080';
const DOCS = 'docs';

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    return p.endsWith('.html') ? [p] : [];
  });

const files = walk(DOCS).sort();
console.log(`auditing ${files.length} pages at Pixel 5 (393px)\n`);

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['Pixel 5'] });

const IN_PAGE = () => {
  const out = { problems: [] };
  const push = (kind, detail) => out.problems.push(`${kind}: ${detail}`);

  // --- static-ish structure ---
  const html = document.documentElement;
  if (!html.getAttribute('lang')) push('no-lang', '<html> has no lang attribute');
  if (document.title.trim().length < 10) push('short-title', `title="${document.title}"`);

  const h1s = document.querySelectorAll('h1');
  if (h1s.length === 0) push('no-h1', 'page has no <h1>');
  if (h1s.length > 1) push('multi-h1', `${h1s.length} <h1> elements`);

  // heading order: never skip a level going down
  const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')];
  let prev = 0;
  for (const h of hs) {
    const lvl = Number(h.tagName[1]);
    if (prev && lvl > prev + 1) push('heading-skip', `<${prev}> then <h${lvl}>: "${h.textContent.trim().slice(0, 40)}"`);
    prev = lvl;
  }

  // images: every img needs an alt attribute (empty = decorative is valid)
  for (const img of document.querySelectorAll('img')) {
    if (!img.hasAttribute('alt')) {
      push('img-no-alt', img.getAttribute('src') || '(no src)');
      continue;
    }
    if (!img.alt.trim() && img.getAttribute('aria-hidden') !== 'true' && !img.closest('[role="presentation"]')) {
      push('img-empty-alt', `${img.getAttribute('src')} — empty alt not marked decorative`);
    }
    if (!img.getAttribute('width') || !img.getAttribute('height')) {
      push('img-no-dims', img.getAttribute('src'));
    }
  }

  // links: discernible text
  for (const a of document.querySelectorAll('a[href]')) {
    const text = (a.textContent || '').trim();
    const label = a.getAttribute('aria-label') || a.getAttribute('title') || '';
    if (!text && !label) push('link-no-name', a.getAttribute('href'));
    if (a.getAttribute('href') === '#' && !label) push('dead-link', 'href="#" with no label');
  }

  // landmarks
  if (!document.querySelector('main')) push('no-main', 'no <main> landmark');
  if (!document.querySelector('nav')) push('no-nav', 'no <nav> landmark');

  // skip link
  const skip = document.querySelector('a[href^="#"]:first-of-type');
  if (!skip || !/skip/i.test(skip.textContent || '')) push('no-skip-link', 'no "skip to content" link found');

  // buttons must have accessible names
  for (const b of document.querySelectorAll('button')) {
    const name = (b.textContent || '').trim() || b.getAttribute('aria-label') || b.getAttribute('title');
    if (!name) push('button-no-name', b.className || '(no class)');
  }

  // --- computed colour contrast on visible text ---
  // Returns [r,g,b,a] with alpha PRESERVED. Dropping alpha turns a 5%-opacity
  // tint (rgba(255,255,0,0.05)) into pure yellow and produces garbage ratios.
  const parseRGB = (s) => {
    const m = (s || '').match(/[\d.]+/g);
    if (!m || m.length < 3) return null;
    return [Number(m[0]), Number(m[1]), Number(m[2]), m.length > 3 ? Number(m[3]) : 1];
  };
  const over = (fg, bg) => {
    const a = fg[3];
    return [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a));
  };
  const lum = ([r, g, b]) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (fg, bg) => {
    const a = lum(fg), b = lum(bg);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  };
  // Walk ELEMENT -> root and stop at the FIRST opaque paint: that is the nearest
  // backdrop, which is what actually shows through. Translucent layers collected
  // on the way down get composited over it (closest-to-element ends up on top).
  const effectiveBg = (el) => {
    const stack = []; // translucent [r,g,b] from element upward
    for (let n = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      const c = parseRGB(cs.backgroundColor);
      if (c && c[3] >= 1) {
        const base = [c[0], c[1], c[2]];
        return stack.reduceRight((acc, lay) => over(lay, acc), base);
      }
      if (cs.backgroundImage && cs.backgroundImage !== 'none') {
        // A gradient IS readable: average its rgb() stops (the 90s-style silver
        // button). Anything else (url/svg) is opaque but unknowable -> report
        // undeterminable instead of guessing, which had turned legible
        // black-on-silver buttons into "black on black".
        const g = cs.backgroundImage.match(/linear-gradient\(([^)]*)\)/);
        const stops = g ? (g[1].match(/rgba?\([^)]*\)/g) || []).map(parseRGB).filter((s) => s && s[3] > 0.5) : [];
        if (stops.length) {
          const avg = [0, 1, 2].map((i) => stops.reduce((s, c2) => s + c2[i], 0) / stops.length);
          return stack.reduceRight((acc, lay) => over(lay, acc), avg);
        }
        return null; // caller skips: not decidable without reading pixels
      }
      if (c && c[3] > 0) stack.push([c[0], c[1], c[2]]);
      if (n === document.documentElement) break;
    }
    const base = [255, 255, 255];
    return stack.reduceRight((acc, lay) => over(lay, acc), base);
  };

  const seen = new Set();
  for (const el of document.querySelectorAll('body *')) {
    // only elements with their own visible text
    const direct = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!direct) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) < 0.15) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;
    const fg = parseRGB(cs.color);
    if (!fg) continue;
    const bg = effectiveBg(el);
    if (!bg) continue; // undeterminable backdrop (url/svg image) -> not our call
    const r = ratio(fg, bg);
    const size = parseFloat(cs.fontSize);
    const bold = Number(cs.fontWeight) >= 700;
    const large = size >= 24 || (size >= 18.66 && bold);
    const need = large ? 3 : 4.5;
    if (r < need) {
      const key = `${cs.color}|${bg}|${need}`;
      if (seen.has(key)) continue;
      seen.add(key);
      push(
        'contrast',
        `${r.toFixed(2)}:1 (needs ${need}) ${Math.round(size)}px${bold ? ' bold' : ''} "${el.textContent.trim().slice(0, 30)}" fg=${cs.color} bg=rgb(${bg})`
      );
    }
  }

  // horizontal overflow
  const de = document.documentElement;
  if (de.scrollWidth > de.clientWidth + 1) {
    push('h-overflow', `scrollWidth ${de.scrollWidth} > clientWidth ${de.clientWidth}`);
  }

  return out;
};

let total = 0;
const byKind = new Map();
const pageDetail = [];

for (const f of files) {
  const rel = '/' + f.replace(/\\/g, '/').replace(/^docs\//, '');
  const page = await ctx.newPage();
  try {
    await page.goto(BASE + rel, { waitUntil: 'load', timeout: 20000 });
    const res = await page.evaluate(IN_PAGE);
    if (res.problems.length) {
      pageDetail.push({ rel, problems: res.problems });
      total += res.problems.length;
      for (const p of res.problems) {
        const k = p.split(':')[0];
        byKind.set(k, (byKind.get(k) || 0) + 1);
      }
    }
  } catch (e) {
    pageDetail.push({ rel, problems: [`NAV-ERROR: ${e.message.split('\n')[0]}`] });
    total += 1;
  } finally {
    await page.close();
  }
}

console.log(`pages with problems: ${pageDetail.length}/${files.length}`);
console.log(`total problems: ${total}\n`);
console.log('--- by kind ---');
for (const [k, v] of [...byKind].sort((a, b) => b[1] - a[1])) console.log(`${String(v).padStart(4)}  ${k}`);

if (process.env.DETAIL) {
  console.log('\n--- detail ---');
  for (const { rel, problems } of pageDetail) {
    console.log(`\n${rel}`);
    for (const p of problems) console.log(`   ${p}`);
  }
}

await browser.close();