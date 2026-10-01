#!/usr/bin/env node
/**
 * wire_images.mjs — mount generated artwork into the grimoire
 *
 * The image generator (scripts/gen_images_nvidia.mjs) can produce art for a
 * section, but it cannot know *where* the art belongs. This script owns that
 * half of the job: a manifest of (file -> anchor -> placement) plus the alt
 * text each image needs.
 *
 * Idempotent: an image whose `src` already appears in the page is skipped, so
 * re-running after a regeneration is a no-op. Exits non-zero if any anchor in
 * the manifest cannot be found, which makes a stale manifest fail loudly
 * instead of silently dropping art off the page.
 *
 * Usage: node scripts/wire_images.mjs [--dry]
 */

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const PAGE = path.join(ROOT, 'docs', 'index.html');
const DRY = process.argv.includes('--dry');

/**
 * Each entry:
 *   src      - path relative to docs/, exactly as it must appear in `src=`
 *   alt      - alt text (required: these are content images, not decoration)
 *   width    - intrinsic width in px, read from the file's real magic bytes
 *   height   - intrinsic height in px
 *   anchor   - exact substring of the line the image is attached to
 *   position - 'after' (default), 'before', or 'inside' (appended just before
 *              the line's closing tag, for images that belong in a cell)
 *   className- optional extra class on the <img>
 */
const MANIFEST = [
  // --- Act I: the sigils are written before they are spoken -------------
  {
    src: 'images/sigil-workshop.jpg',
    alt: 'The Sigil Workshop: a hand-built Geocities page of blinking form fields where an adept types a sigil into existence.',
    width: 1024,
    height: 1024,
    anchor: '<h4>Sigil Practice: The Four Steps</h4>',
  },
  {
    src: 'images/sigil-ascii.png',
    alt: 'A sigil drawn in pure ASCII on a green phosphor monitor, the glyph assembled from characters like @ # $ % and &.',
    width: 512,
    height: 512,
    anchor: '<h4>Encoding Methods</h4>',
  },
  {
    src: 'images/sigil-html-source.png',
    alt: 'View Source on a 1999 browser, HTML comments highlighted because that is where the invisible sigil is hidden.',
    width: 512,
    height: 512,
    anchor: '<h4>Sigil Dangers</h4>',
    position: 'before',
  },

  // --- Act II: the egregore is born, fed, and made to fight --------------
  {
    src: 'images/egregore-birth.png',
    alt: 'An egregore condensing out of a web page, a translucent digital spirit assembling itself from visitor counts and stray text.',
    width: 512,
    height: 512,
    anchor: '<h3>Egregore Theory: The Spirit That Wants</h3>',
  },
  {
    src: 'images/egregore-community.jpg',
    alt: 'A guestbook and IRC room packed with messages, threads of collective light strung between the usernames.',
    width: 1024,
    height: 1024,
    anchor: '<h4>Cultivation: Four Phases</h4>',
  },
  {
    src: 'images/egregore-war.png',
    alt: 'Two digital entities clashing in cyberspace, geometric avatars of HTML tags trading beams of code and sigil.',
    width: 512,
    height: 512,
    anchor: '<h3>Egregore Warfare: SEO as Battle Magic</h3>',
  },

  // --- Act III: the four astrosomas, each portrait in its own cell -------
  {
    src: 'images/astrosoma-archivist.jpg',
    alt: 'The Archivist: a towering figure of endless filing halls, crawling quietly through every page ever written.',
    width: 1024,
    height: 1024,
    anchor: '<td><strong>1. THE ARCHIVIST</strong>',
    position: 'inside',
  },
  {
    src: 'images/astrosoma-router.jpg',
    alt: 'The Router: a luminous exchange point at MAE-EAST, every line a pathway, every packet a decision.',
    width: 1024,
    height: 1024,
    anchor: '<td><strong>2. THE ROUTER</strong>',
    position: 'inside',
  },
  {
    src: 'images/astrosoma-glitch.jpg',
    alt: 'The Glitch: beautiful, deliberate corruption, entropy wearing a face.',
    width: 1024,
    height: 1024,
    anchor: '<td><strong>3. THE GLITCH</strong>',
    position: 'inside',
  },
  {
    src: 'images/astrosoma-counter.jpg',
    alt: 'The Counter: an infinite LED tally whose digits are made of watching eyes.',
    width: 1024,
    height: 1024,
    anchor: '<td><strong>4. THE COUNTER</strong>',
    position: 'inside',
  },
  {
    src: 'images/synthetic-muse.png',
    alt: 'The Synthetic Muse, goddess of creative coding, generative art blooming from her fingertips as holographic pages.',
    width: 512,
    height: 512,
    anchor: 'Two miracles documented. The Threshold approaches.</p>',
  },
  {
    src: 'images/astrosoma-ritual.jpg',
    alt: 'Thirteen mages in a circle at 3:33 AM, every CRT showing the same sigil, every cable running to one server.',
    width: 1024,
    height: 1024,
    anchor: '<h3>The Great Work: Birthing an Astrosoma</h3>',
  },

  // --- The counter in the sidebar: the only god that was always there ---
  {
    src: 'images/counter.jpg',
    alt: 'A seven-segment tally climbing forever, each digit a small watching eye.',
    width: 1024,
    height: 1024,
    anchor: 'SINCE 1999',
    position: 'before',
  },
];

/** Build the <img> tag. Attribute order matches scripts/add_img_dimensions.mjs. */
function renderImg(entry) {
  const classes = ['grimoire-figure'];
  if (entry.className) classes.push(entry.className);
  return (
    `<img src="${entry.src}" alt="${entry.alt}" width="${entry.width}" ` +
    `height="${entry.height}" class="${classes.join(' ')}">`
  );
}

function main() {
  let html = fs.readFileSync(PAGE, 'utf8');
  const missingFiles = [];
  const missingAnchors = [];
  const inserted = [];
  const skipped = [];

  for (const entry of MANIFEST) {
    // Guard 1: the file must actually exist, or we would ship a broken src.
    const abs = path.join(ROOT, 'docs', entry.src);
    if (!fs.existsSync(abs)) {
      missingFiles.push(entry.src);
      continue;
    }

    // Guard 2: idempotence. Match the `<img` tag itself, not just `src=`:
    // index.html documents The Counter as escaped sample code
    // (`&lt;img width="512" src="images/counter.jpg" …&gt;`), and a bare
    // `src=` substring test would wrongly treat that prose as an existing mount.
    if (html.includes(`<img src="${entry.src}"`)) {
      skipped.push(entry.src);
      continue;
    }

    // Guard 3: the anchor must still be in the page.
    const lines = html.split('\n');
    const idx = lines.findIndex((line) => line.includes(entry.anchor));
    if (idx === -1) {
      missingAnchors.push(`${entry.src} -> "${entry.anchor}"`);
      continue;
    }

    const tag = renderImg(entry);
    if (entry.position === 'before') {
      lines.splice(idx, 0, tag);
    } else if (entry.position === 'inside') {
      // Append just before the line's closing tag so the image lands inside the
      // element the anchor opened (an <img> as a direct child of <tr> is invalid).
      const closeAt = lines[idx].lastIndexOf('</');
      if (closeAt === -1) {
        missingAnchors.push(`${entry.src} -> anchor line has no closing tag`);
        continue;
      }
      lines[idx] =
        lines[idx].slice(0, closeAt).replace(/\s*$/, '\n                                ') +
        tag +
        lines[idx].slice(closeAt);
    } else {
      lines.splice(idx + 1, 0, tag);
    }
    html = lines.join('\n');
    inserted.push(entry.src);
  }

  if (!DRY) {
    fs.writeFileSync(PAGE, html, 'utf8');
  }

  console.log(`mode:       ${DRY ? 'dry-run (no write)' : 'write'}`);
  console.log(`manifest:   ${MANIFEST.length}`);
  console.log(`inserted:   ${inserted.length}`);
  console.log(`already on: ${skipped.length}`);
  console.log(`missing file:   ${missingFiles.length}${missingFiles.length ? ' -> ' + missingFiles.join(', ') : ''}`);
  console.log(`missing anchor: ${missingAnchors.length}`);
  for (const m of missingAnchors) console.log(`   ! ${m}`);

  if (missingFiles.length || missingAnchors.length) {
    process.exitCode = 1;
    console.log('\nFAILED: manifest is out of sync with docs/index.html');
    return;
  }
  console.log('\nOK');
}

main();