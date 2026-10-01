#!/usr/bin/env node
/**
 * Add og:image and twitter:card meta tags to all HTML files
 * For The Synthetic Gods grimoire
 */

import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.join(process.cwd(), 'docs');
const BASE_URL = 'https://cha0smagick.github.io/thy-Syntetic-gods---mage-the-ascencion'; // Update with actual GitHub Pages URL


function getRelativePath(fromFile, toFile) {
  const fromDir = path.dirname(fromFile);
  const relative = path.relative(fromDir, toFile);
  return relative.replace(/\\/g, '/');
}

function addOgTags(html, filePath) {
  const relPath = path.relative(DOCS_DIR, filePath).replace(/\\/g, '/');
  
  // Every legacy image in this repo is a real JPEG or PNG wearing the wrong
  // extension (.gif/.png files holding JPEG bytes). Browsers content-sniff so
  // <img> is fine, but GitHub Pages sends Content-Type by extension, and strict
  // link-preview scrapers (Reddit, Facebook) reject a .gif that decodes as JPEG.
  // og-cover.png is a genuine 1200x630 PNG, so it is always a valid preview.
  const OG_IMAGE = 'images/og-cover.png';
  const pageUrl = `${BASE_URL}/${relPath}`;
  const fullImageUrl = `${BASE_URL}/${OG_IMAGE}`;

  // Check if og:image already exists
  if (html.includes('property="og:image"') || html.includes("property='og:image'")) {
    console.log(`⊘ Already has og:image: ${relPath}`);
    return html;
  }
  
  // Find the closing </head> tag and inject before it
  const ogTags = `
    <meta property="og:title" content="The Synthetic Gods - Mage: The Ascension Chronicle">
    <meta property="og:description" content="A Mage: The Ascension Chronicle of Digital Divinity - Geocities 1999 Aesthetic">
    <meta property="og:image" content="${fullImageUrl}">
    <meta property="og:url" content="${pageUrl}">
    <link rel="canonical" href="${pageUrl}" />
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="The Synthetic Gods">
    <meta name="twitter:description" content="A Mage: The Ascension Chronicle of Digital Divinity">
    <meta name="twitter:image" content="${fullImageUrl}">
  `;
  
  const updatedHtml = html.replace('</head>', `${ogTags}\n</head>`);
  
  if (updatedHtml === html) {
    console.log(`✗ Could not inject og tags: ${relPath}`);
  } else {
    console.log(`✓ Added og tags: ${relPath}`);
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
}

processAllHtml();