#!/usr/bin/env node
/**
 * Add Service Worker registration to all HTML files
 */

import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.join(process.cwd(), 'docs');

const swScript = `
                <!-- Service Worker Registration -->
                <script>
                    if ('serviceWorker' in navigator) {
                        window.addEventListener('load', () => {
                            navigator.serviceWorker.register('/sw.js')
                                .then((registration) => {
                                    console.log('[SW] Registered:', registration.scope);
                                    setInterval(() => registration.update(), 60 * 60 * 1000);
                                })
                                .catch((error) => {
                                    console.log('[SW] Registration failed:', error);
                                });
                        });
                        
                        navigator.serviceWorker.addEventListener('message', (event) => {
                            if (event.data?.type === 'DAILY_MAINTENANCE') {
                                console.log('[SW] Daily maintenance triggered');
                                if (window.GeocitiesGrimoire?.dailyVisit?.checkVisit) {
                                    window.GeocitiesGrimoire.dailyVisit.checkVisit(
                                        new Date().toISOString().split('T')[0]
                                    );
                                }
                            }
                        });
                    }
                </script>`;

function addSWRegistration(html, filePath) {
  // Check if already has SW registration
  if (html.includes('serviceWorker.register') || html.includes('sw.js')) {
    return html;
  }
  
  // Insert before </body>
  const updatedHtml = html.replace('</body>', `${swScript}\n</body>`);
  
  if (updatedHtml === html) {
    console.log(`✗ Could not inject SW registration: ${path.relative(DOCS_DIR, filePath)}`);
  } else {
    console.log(`✓ Added SW registration: ${path.relative(DOCS_DIR, filePath)}`);
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
      const updatedHtml = addSWRegistration(html, file);
      if (updatedHtml !== html) {
        fs.writeFileSync(file, updatedHtml, 'utf8');
        updated++;
      }
    } catch (e) {
      console.error(`Error processing ${file}:`, e.message);
    }
  }
  
  console.log(`\n✅ Complete: ${updated} files updated with SW registration`);
}

processAllHtml();