#!/usr/bin/env node
/**
 * Add CSP and Referrer Policy meta tags to all HTML files
 * For The Synthetic Gods grimoire
 */

import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.join(process.cwd(), 'docs');

function addSecurityHeaders(html, filePath) {
  // Check if CSP already exists
  if (html.includes('http-equiv="Content-Security-Policy"') || html.includes("http-equiv='Content-Security-Policy'")) {
    return html;
  }
  
  // CSP for static Geocities site with inline scripts/styles (necessary for 90s aesthetic)
  // We allow inline scripts/styles because the site uses them heavily for the retro feel
  // But we restrict external resources to self and known CDNs
  const csp = `    <meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com;
    img-src 'self' data: https:;
    connect-src 'self';
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  ">`;
  
  const referrerPolicy = `    <meta name="referrer" content="strict-origin-when-cross-origin">`;
  
  const securityTags = `${csp}\n    ${referrerPolicy}`;
  
  // Inject before </head>
  const updatedHtml = html.replace('</head>', `${securityTags}\n</head>`);
  
  if (updatedHtml === html) {
    console.log(`✗ Could not inject security headers: ${path.relative(DOCS_DIR, filePath)}`);
  } else {
    console.log(`✓ Added security headers: ${path.relative(DOCS_DIR, filePath)}`);
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
      const updatedHtml = addSecurityHeaders(html, file);
      if (updatedHtml !== html) {
        fs.writeFileSync(file, updatedHtml, 'utf8');
        updated++;
      }
    } catch (e) {
      console.error(`Error processing ${file}:`, e.message);
    }
  }
  
  console.log(`\n✅ Complete: ${updated} files updated with security headers`);
}

processAllHtml();