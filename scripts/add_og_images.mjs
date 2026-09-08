#!/usr/bin/env node
/**
 * Add og:image and twitter:card meta tags to all HTML files
 * For The Synthetic Gods grimoire
 */

import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.join(process.cwd(), 'docs');
const BASE_URL = 'https://los-dioses-sinteticos.github.io'; // Update with actual GitHub Pages URL

// Map each HTML file to its appropriate og:image
const ogImageMap = {
  // Main grimoire
  'index.html': 'images/banner-synthetic-gods.gif',
  
  // Oracle
  'pages/neon-oracle.html': 'images/sigil-workshop.gif',
  
  // Faction indexes
  'characters/technocracy-index.html': 'images/characters/technocracy-voss.png',
  'characters/virtual-adepts-index.html': 'images/characters/virtual-adepts-webspinner.png',
  'characters/cypherpunks-index.html': 'images/characters/cypherpunks-satoshi.png',
  'characters/hollow-ones-index.html': 'images/characters/hollow-ones-raven.png',
  
  // Character dossiers - Technocracy
  'characters/technocracy-voss.html': 'images/characters/technocracy-voss.png',
  'characters/technocracy-chen.html': 'images/characters/technocracy-chen.png',
  'characters/technocracy-keres.html': 'images/characters/technocracy-keres.png',
  'characters/technocracy-volkov.html': 'images/characters/technocracy-volkov.png',
  'characters/technocracy-smith.html': 'images/characters/technocracy-smith.png',
  'characters/technocracy-patel.html': 'images/characters/technocracy-patel.png',
  'characters/technocracy-kowalski.html': 'images/characters/technocracy-kowalski.png',
  'characters/technocracy-lovelace.html': 'images/characters/technocracy-lovelace.png',
  'characters/technocracy-sato.html': 'images/characters/technocracy-sato.png',
  'characters/technocracy-architect.html': 'images/characters/technocracy-architect.png',
  
  // Character dossiers - Virtual Adepts
  'characters/virtual-adepts-webspinner.html': 'images/characters/virtual-adepts-webspinner.png',
  'characters/virtual-adepts-zero-cool.html': 'images/characters/virtual-adepts-zero-cool.png',
  'characters/virtual-adepts-acid-burn.html': 'images/characters/virtual-adepts-acid-burn.png',
  'characters/virtual-adepts-cereal-killer.html': 'images/characters/virtual-adepts-cereal-killer.png',
  'characters/virtual-adepts-prophet.html': 'images/characters/virtual-adepts-prophet.png',
  'characters/virtual-adepts-ghost.html': 'images/characters/virtual-adepts-ghost.png',
  'characters/virtual-adepts-lady-ada.html': 'images/characters/virtual-adepts-lady-ada.png',
  'characters/virtual-adepts-root.html': 'images/characters/virtual-adepts-root.png',
  'characters/virtual-adepts-packet-witch.html': 'images/characters/virtual-adepts-packet-witch.png',
  'characters/virtual-adepts-neon-samurai.html': 'images/characters/virtual-adepts-neon-samurai.png',
  
  // Character dossiers - Cypherpunks
  'characters/cypherpunks-satoshi.html': 'images/characters/cypherpunks-satoshi.png',
  'characters/cypherpunks-cipher.html': 'images/characters/cypherpunks-cipher.png',
  'characters/cypherpunks-anonymous.html': 'images/characters/cypherpunks-anonymous.png',
  'characters/cypherpunks-snowden.html': 'images/characters/cypherpunks-snowden.png',
  'characters/cypherpunks-assange.html': 'images/characters/cypherpunks-assange.png',
  'characters/cypherpunks-merkle.html': 'images/characters/cypherpunks-merkle.png',
  'characters/cypherpunks-diffie.html': 'images/characters/cypherpunks-diffie.png',
  'characters/cypherpunks-hellman.html': 'images/characters/cypherpunks-hellman.png',
  'characters/cypherpunks-tor.html': 'images/characters/cypherpunks-tor.png',
  'characters/cypherpunks-pgp.html': 'images/characters/cypherpunks-pgp.png',
  
  // Character dossiers - Hollow Ones
  'characters/hollow-ones-raven.html': 'images/characters/hollow-ones-raven.png',
  'characters/hollow-ones-lilith.html': 'images/characters/hollow-ones-lilith.png',
  'characters/hollow-ones-malakai.html': 'images/characters/hollow-ones-malakai.png',
  'characters/hollow-ones-vesper.html': 'images/characters/hollow-ones-vesper.png',
  'characters/hollow-ones-crowley.html': 'images/characters/hollow-ones-crowley.png',
  'characters/hollow-ones-spare.html': 'images/characters/hollow-ones-spare.png',
  'characters/hollow-ones-baphomet.html': 'images/characters/hollow-ones-baphomet.png',
  'characters/hollow-ones-eris.html': 'images/characters/hollow-ones-eris.png',
  'characters/hollow-ones-nyx.html': 'images/characters/hollow-ones-nyx.png',
  'characters/hollow-ones-khaos.html': 'images/characters/hollow-ones-khaos.png',
};

function getRelativePath(fromFile, toFile) {
  const fromDir = path.dirname(fromFile);
  const relative = path.relative(fromDir, toFile);
  return relative.replace(/\\/g, '/');
}

function addOgTags(html, filePath) {
  const relPath = path.relative(DOCS_DIR, filePath).replace(/\\/g, '/');
  const ogImage = ogImageMap[relPath];
  
  if (!ogImage) {
    console.log(`⚠ No og:image mapping for: ${relPath}`);
    return html;
  }
  
  // Calculate relative path from this HTML file to the image
  const imagePath = getRelativePath(filePath, path.join(DOCS_DIR, ogImage));
  const fullImageUrl = `${BASE_URL}/${ogImage}`;
  
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
    console.log(`✓ Added og tags: ${relPath} → ${ogImage}`);
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