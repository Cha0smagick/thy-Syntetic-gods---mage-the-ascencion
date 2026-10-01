#!/usr/bin/env node
/**
 * Add og:image and twitter:card meta tags to all HTML files
 * For The Synthetic Gods grimoire
 */

import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.join(process.cwd(), 'docs');
const OG_DIR = path.join(DOCS_DIR, 'images', 'og');
const BASE_URL = 'https://cha0smagick.github.io/thy-Syntetic-gods---mage-the-ascencion'; // Update with actual GitHub Pages URL

/** Normalise a Windows relative path to forward slashes. */
function toPosix(p) {
  return p.split(path.sep).join('/');
}

function getRelativePath(fromFile, toFile) {
  const fromDir = path.dirname(fromFile);
  return toPosix(path.relative(fromDir, toFile));
}

/**
 * Map a page to its dedicated link-preview card.
 *
 * One og:image for the whole site meant every share of every page looked
 * identical. Each page now gets its own 1200x640 card, named after its path
 * with the separators flattened: docs/characters/neon-samurai.html ->
 * images/og/og-characters-virtual-adepts-neon-samurai.jpg. The root index is
 * the special case (index.html -> og-home.jpg).
 */
function ogImageForPage(relPath) {
  let slug = relPath.replace(/\.html$/, '');
  slug = slug === 'index' ? 'home' : slug.replace(/\//g, '-');
  return `images/og/og-${slug}.jpg`;
}

/** True when the dedicated card actually exists on disk. */
function ogImageExists(relPath) {
  return fs.existsSync(path.join(DOCS_DIR, ogImageForPage(relPath)));
}

/** Per-page title pulled from <title> / <h1>, falling back to the site name. */
function titleForPage(html, relPath) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) {
    const text = h1[1]
      .replace(/<[^>]+>/g, '')
      .replace(/&#\d+;/g, '')
      .trim();
    // Quotes inside an <h1> (e.g. ITERATION X-7 "SMITH") must be escaped or
    // they terminate the content attribute early and corrupt the tag.
    if (text) return `${escapeAttr(text)} - The Synthetic Gods`;
  }
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) {
    const text = title[1].replace(/<[^>]+>/g, '').trim();
    if (text) return escapeAttr(text);
  }
  return `The Synthetic Gods - Mage: The Ascension Chronicle`;
}

/** Escape a string so it is safe inside a double-quoted HTML attribute value. */
function escapeAttr(value) {
  return value.replace(/&(?!#?\w+;)/g, '&amp;').replace(/"/g, '&quot;');
}

/**
 * Per-page description, reusing the SEO meta description the site already
 * generates so the link preview and the search snippet never disagree.
 */
function descriptionForPage(html) {
  const m = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  if (m && m[1].trim()) return escapeAttr(m[1].trim());
  return 'A Mage: The Ascension Chronicle of Digital Divinity - Geocities 1999 Aesthetic';
}

/**
 * Rewrite the `content` of the <meta> tag identified by `metaKey`
 * (e.g. `property="og:image"`), leaving the rest of the tag untouched.
 *
 * The whole tag is matched first so attribute order does not matter, then the
 * content value is swapped inside that tag. Matching `<meta property="og:image"=`
 * directly would never fire — there is no `=` after the attribute value.
 */
function replaceMetaContent(html, metaKey, value) {
  const eq = metaKey.indexOf('=');
  const attrName = metaKey.slice(0, eq);
  // Drop any surrounding quotes: the pattern supplies its own.
  const attrValue = metaKey.slice(eq + 1).replace(/^["']|["']$/g, '');
  const tagPattern = new RegExp(
    `<meta\\s[^>]*${attrName}=["']${attrValue}["'][^>]*>`,
    'gi'
  );
  return html.replace(tagPattern, (tag) => {
    if (!/\bcontent\s*=/i.test(tag)) return tag;
    return tag.replace(/(content=["'])[^"']*(["'])/i, `$1${value}$2`);
  });
}

function addOgTags(html, filePath) {
  const relPath = toPosix(path.relative(DOCS_DIR, filePath));

  // Every legacy image in this repo is a real JPEG or PNG wearing the wrong
  // extension (.gif/.png files holding JPEG bytes). Browsers content-sniff so
  // <img> is fine, but GitHub Pages sends Content-Type by extension, and strict
  // link-preview scrapers (Reddit, Facebook) reject a .gif that decodes as JPEG.
  // The generated cards in images/og/ are genuine PNGs, so they are always a
  // valid preview; og-cover.png remains the fallback for a page with no card.
  const hasCard = ogImageExists(relPath);
  const OG_IMAGE = hasCard ? ogImageForPage(relPath) : 'images/og-cover.png';
  const pageUrl =
    relPath === 'index.html' ? `${BASE_URL}/` : `${BASE_URL}/${relPath}`;
  const fullImageUrl = `${BASE_URL}/${OG_IMAGE}`;
  const title = titleForPage(html, relPath);
  const description = descriptionForPage(html);

  const alreadyHasOg = html.includes('property="og:image"') || html.includes("property='og:image'");

  if (alreadyHasOg) {
    // Already tagged from a previous run: retarget the card and the title in
    // place instead of stacking a second copy on top of the old one.
    let updatedHtml = replaceMetaContent(html, 'property="og:image"', fullImageUrl);
    updatedHtml = replaceMetaContent(updatedHtml, 'name="twitter:image"', fullImageUrl);
    updatedHtml = replaceMetaContent(updatedHtml, 'property="og:title"', title);
    updatedHtml = replaceMetaContent(updatedHtml, 'property="og:description"', description);
    updatedHtml = replaceMetaContent(updatedHtml, 'name="twitter:description"', description);
    updatedHtml = replaceMetaContent(updatedHtml, 'name="twitter:title"', title);
    updatedHtml = replaceMetaContent(updatedHtml, 'property="og:url"', pageUrl);
    updatedHtml = updatedHtml.replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
      `<link rel="canonical" href="${pageUrl}">`
    );

    if (updatedHtml === html) {
      console.log(`⊘ Already up to date: ${relPath}`);
      return html;
    }
    console.log(`✓ Retargeted og:image: ${relPath} -> ${OG_IMAGE}`);
    return updatedHtml;
  }

  // Find the closing </head> tag and inject before it
  const ogTags = `
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="A Mage: The Ascension Chronicle of Digital Divinity - Geocities 1999 Aesthetic">
    <meta property="og:image" content="${fullImageUrl}">
    <meta property="og:url" content="${pageUrl}">
    <link rel="canonical" href="${pageUrl}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="A Mage: The Ascension Chronicle of Digital Divinity">
    <meta name="twitter:image" content="${fullImageUrl}">
  `;

  const updatedHtml = html.replace('</head>', `${ogTags}\n</head>`);

  if (updatedHtml === html) {
    console.log(`✗ Could not inject og tags: ${relPath}`);
  } else {
    console.log(`✓ Added og tags: ${relPath} -> ${OG_IMAGE}`);
  }

  return updatedHtml;
}

function processAllHtml() {
  function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        results = results.concat(walk(fullPath));
      } else if (file.endsWith('.html')) {
        results.push(fullPath);
      }
    }
    return results;
  }
  
  const htmlFiles = walk(DOCS_DIR);
  console.log(`Found ${htmlFiles.length} HTML files\n`);
  
  let updated = 0;
  for (const file of htmlFiles) {
    try {
      const html = fs.readFileSync(file, 'utf8');
      const updatedHtml = addOgTags(html, file);
      if (updatedHtml !== html) {
        fs.writeFileSync(file, updatedHtml, 'utf8');
        updated++;
      }
    } catch (e) {
      console.error(`Error processing ${file}:`, e.message);
    }
  }
  
  console.log(`\n✅ Complete: ${updated} files updated with og:image tags`);
  console.log(`   Cards in ${toPosix(path.relative(process.cwd(), OG_DIR))}/: ${fs.existsSync(OG_DIR) ? fs.readdirSync(OG_DIR).filter(f => f.endsWith('.jpg')).length : 0}`);
}

processAllHtml();