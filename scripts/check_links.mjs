#!/usr/bin/env node
/**
 * Link checker for The Synthetic Gods grimoire
 * Checks all internal links in HTML files
 */

import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.join(process.cwd(), 'docs');

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

function extractLinks(html, basePath) {
  const links = [];
  
  // Find all href attributes
  const hrefRegex = /href=["']([^"']+)["']/gi;
  let match;
  
  while ((match = hrefRegex.exec(html)) !== null) {
    const href = match[1];
    
    // Skip external links, mailto, tel, javascript, anchors only, data URIs
    if (href.startsWith('http://') || 
        href.startsWith('https://') || 
        href.startsWith('mailto:') || 
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        href.startsWith('#') ||
        href.startsWith('data:')) {
      continue;
    }
    
    links.push({ href, source: basePath });
  }
  
  // Find all src attributes (images, scripts)
  const srcRegex = /src=["']([^"']+)["']/gi;
  while ((match = srcRegex.exec(html)) !== null) {
    const src = match[1];
    
    // Skip external and data URIs
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
      continue;
    }
    
    links.push({ href: src, source: basePath, type: 'asset' });
  }
  
  return links;
}

function resolvePath(href, sourceFile) {
  const sourceDir = path.dirname(sourceFile);
  
  // Handle relative paths
  if (href.startsWith('./') || href.startsWith('../') || !href.startsWith('/')) {
    return path.resolve(sourceDir, href);
  }
  
  // Handle absolute paths from docs root
  if (href.startsWith('/')) {
    return path.join(DOCS_DIR, href.slice(1));
  }
  
  return path.resolve(sourceDir, href);
}

function checkLinks() {
  const htmlFiles = walk(DOCS_DIR);
  console.log(`Checking ${htmlFiles.length} HTML files...\n`);
  
  let totalLinks = 0;
  let brokenLinks = 0;
  const broken = [];
  
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const links = extractLinks(html, file);
    totalLinks += links.length;
    
    for (const link of links) {
      const resolvedPath = resolvePath(link.href, file);
      const exists = fs.existsSync(resolvedPath);
      
      if (!exists) {
        brokenLinks++;
        broken.push({
          source: path.relative(DOCS_DIR, file),
          href: link.href,
          resolved: path.relative(DOCS_DIR, resolvedPath),
          type: link.type || 'link'
        });
      }
    }
  }
  
  console.log(`\n📊 Results:`);
  console.log(`   Total links checked: ${totalLinks}`);
  console.log(`   Broken links: ${brokenLinks}`);
  console.log(`   Success rate: ${((totalLinks - brokenLinks) / totalLinks * 100).toFixed(1)}%`);
  
  if (broken.length > 0) {
    console.log('\n❌ Broken links:');
    for (const b of broken) {
      console.log(`   ${b.source} → ${b.href} (resolves to: ${b.resolved}) [${b.type}]`);
    }
  } else {
    console.log('\n✅ All links valid!');
  }
  
  return broken.length === 0;
}

const success = checkLinks();
process.exit(success ? 0 : 1);