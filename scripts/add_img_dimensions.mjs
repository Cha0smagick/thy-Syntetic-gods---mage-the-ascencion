#!/usr/bin/env node
/**
 * Add width/height attributes to all img tags to prevent CLS
 * For The Synthetic Gods grimoire
 */

import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.join(process.cwd(), 'docs');
const IMAGES_DIR = path.join(DOCS_DIR, 'images');

// Known image dimensions
const imageDimensions = {
  // Main images
  'banner-synthetic-gods.gif': { width: 468, height: 60 },
  'under-construction.gif': { width: 200, height: 200 },
  'sigil-workshop.gif': { width: 512, height: 512 },
  'egregore-community.gif': { width: 512, height: 512 },
  'astrosoma-archivist.gif': { width: 512, height: 512 },
  'astrosoma-router.gif': { width: 512, height: 512 },
  'astrosoma-glitch.gif': { width: 512, height: 512 },
  'astrosoma-counter.gif': { width: 512, height: 512 },
  'astrosoma-ritual.gif': { width: 512, height: 512 },
  'sigil-ascii.gif': { width: 512, height: 512 },
  'sigil-html-source.gif': { width: 512, height: 512 },
  'egregore-birth.gif': { width: 512, height: 512 },
  'egregore-war.gif': { width: 512, height: 512 },
  'synthetic-muse.gif': { width: 512, height: 512 },
  
  // Character portraits (all 512x512 from Flux)
  // We'll set default for any character image
};

// Get dimensions for an image file
function getImageDimensions(imagePath) {
  const filename = path.basename(imagePath);
  
  // Check known dimensions
  if (imageDimensions[filename]) {
    return imageDimensions[filename];
  }
  
  // Default for character portraits
  if (imagePath.includes('characters/') && (filename.endsWith('.png') || filename.endsWith('.svg'))) {
    return { width: 256, height: 256 }; // Display size in dossiers
  }
  
  // Default for other images
  return { width: 512, height: 512 };
}

// Add width/height to img tags
function addDimensionsToImages(html, filePath) {
  let updated = false;
  
  // Regex to find img tags without width/height
  const imgRegex = /<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi;
  
  const updatedHtml = html.replace(imgRegex, (match, beforeSrc, src, afterSrc) => {
    // Skip if already has width and height
    if (/\bwidth\s*=/i.test(match) && /\bheight\s*=/i.test(match)) {
      return match;
    }
    
    // Resolve relative path
    let fullImagePath = src;
    if (src.startsWith('../')) {
      fullImagePath = path.resolve(path.dirname(filePath), src);
    } else if (src.startsWith('images/')) {
      fullImagePath = path.join(DOCS_DIR, src);
    } else if (src.startsWith('/')) {
      fullImagePath = path.join(DOCS_DIR, src.slice(1));
    }
    
    const dims = getImageDimensions(fullImagePath);
    
    // Build new attributes
    let newBeforeSrc = beforeSrc;
    let newAfterSrc = afterSrc;
    
    // Add width if missing
    if (!/\bwidth\s*=/i.test(match)) {
      newBeforeSrc += ` width="${dims.width}"`;
    }
    
    // Add height if missing
    if (!/\bheight\s*=/i.test(match)) {
      newAfterSrc += ` height="${dims.height}"`;
    }
    
    updated = true;
    return `<img ${newBeforeSrc}src="${src}"${newAfterSrc}>`;
  });
  
  if (updated) {
    console.log(`✓ Added dimensions: ${path.relative(DOCS_DIR, filePath)}`);
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
      const updatedHtml = addDimensionsToImages(html, file);
      if (updatedHtml !== html) {
        fs.writeFileSync(file, updatedHtml, 'utf8');
        updated++;
      }
    } catch (e) {
      console.error(`Error processing ${file}:`, e.message);
    }
  }
  
  console.log(`\n✅ Complete: ${updated} files updated with img dimensions`);
}

processAllHtml();