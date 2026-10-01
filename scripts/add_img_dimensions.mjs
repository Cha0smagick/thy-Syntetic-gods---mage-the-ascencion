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
// Only used as an OVERRIDE / fallback for files we cannot probe on disk.
// Real dimensions are read from the file's magic bytes first (see probeDimensions)
// so newly generated images never inherit a stale guess.
const imageDimensions = {
  // Main images
  'banner-synthetic-gods.jpg': { width: 468, height: 60 },
  'under-construction.jpg': { width: 200, height: 200 },
};

/**
 * Read intrinsic dimensions straight from the file header.
 * Supports PNG (IHDR) and JPEG (SOFn markers). Returns null when the format
 * is unknown, the file is missing, or the header is unparseable.
 */
function probeDimensions(absPath) {
  let buf;
  try {
    buf = fs.readFileSync(absPath);
  } catch {
    return null;
  }
  if (buf.length < 24) return null;

  // PNG: 8-byte signature, then an IHDR chunk with width/height at 16..24
  if (buf.readUInt32BE(0) === 0x89504e47 && buf.readUInt32BE(4) === 0x0d0a1a0a) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }

  // JPEG: walk the marker segments looking for a Start-Of-Frame
  if (buf.readUInt16BE(0) === 0xffd8) {
    let offset = 2;
    while (offset + 9 < buf.length) {
      if (buf[offset] !== 0xff) {
        offset++;
        continue;
      }
      const marker = buf[offset + 1];
      // SOF0..SOF15, excluding DHT (c4), JPG (c8) and DAC (cc)
      if (
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc
      ) {
        return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
      }
      const segmentLength = buf.readUInt16BE(offset + 2);
      if (segmentLength < 2) return null;
      offset += 2 + segmentLength;
    }
  }

  return null;
}

// Get dimensions for an image file
function getImageDimensions(imagePath) {
  const filename = path.basename(imagePath);

  // 1. Truth first: whatever the file on disk actually says
  const probed = probeDimensions(imagePath);
  if (probed && probed.width > 0 && probed.height > 0) {
    return probed;
  }

  // 2. Explicit override for assets that have no readable header (e.g. .svg)
  if (imageDimensions[filename]) {
    return imageDimensions[filename];
  }

  // 3. Fallbacks
  if (imagePath.includes(path.join('characters', '')) && filename.endsWith('.svg')) {
    return { width: 256, height: 256 }; // Display size in dossiers
  }

  return { width: 512, height: 512 };
}

// Add width/height to img tags
function addDimensionsToImages(html, filePath) {
  let updated = false;
  
  // Regex to find img tags without width/height
  const imgRegex = /<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi;
  
  const updatedHtml = html.replace(imgRegex, (match, beforeSrc, src, afterSrc) => {
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

    const declaredWidth = /\bwidth=["']?(\d+)/i.exec(match);
    const declaredHeight = /\bheight=["']?(\d+)/i.exec(match);

    if (declaredWidth && declaredHeight) {
      // Both attributes present. They are presentational hints that act as the
      // display size, but the browser also derives the placeholder aspect ratio
      // from them — so a ratio that disagrees with the real file causes a layout
      // shift on load. Keep the intended display width, repair the height.
      const wantedRatio = dims.width / dims.height;
      const currentRatio = Number(declaredWidth[1]) / Number(declaredHeight[1]);
      if (Math.abs(currentRatio - wantedRatio) / wantedRatio < 0.02) {
        return match; // already correct
      }
      const repairedHeight = Math.max(1, Math.round(Number(declaredWidth[1]) / wantedRatio));
      if (repairedHeight === Number(declaredHeight[1])) {
        return match;
      }
      updated = true;
      return match.replace(
        /\bheight\s*=\s*["']?\d+["']?/i,
        `height="${repairedHeight}"`
      );
    }
    
    // Build new attributes
    let newBeforeSrc = beforeSrc;
    let newAfterSrc = afterSrc;
    
    // Add width if missing
    if (!declaredWidth) {
      newBeforeSrc += ` width="${dims.width}"`;
    }
    
    // Add height if missing
    if (!declaredHeight) {
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