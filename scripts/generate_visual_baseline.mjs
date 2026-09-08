#!/usr/bin/env node
/**
 * Generate visual regression baseline screenshots
 * Run this once to establish baseline, then use in CI for comparison
 */

import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const BASELINE_DIR = path.join(process.cwd(), 'tests', 'visual-baseline');
const PAGES = [
  { path: '/index.html', name: 'main-grimoire' },
  { path: '/pages/neon-oracle.html', name: 'neon-oracle' },
  { path: '/characters/technocracy-index.html', name: 'technocracy-index' },
  { path: '/characters/virtual-adepts-index.html', name: 'virtual-adepts-index' },
  { path: '/characters/cypherpunks-index.html', name: 'cypherpunks-index' },
  { path: '/characters/hollow-ones-index.html', name: 'hollow-ones-index' },
  { path: '/characters/technocracy-voss.html', name: 'dossier-technocracy-voss' },
];

async function generateBaseline() {
  // Ensure baseline directory exists
  if (!fs.existsSync(BASELINE_DIR)) {
    fs.mkdirSync(BASELINE_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
  });

  console.log('📸 Generating visual regression baseline...\n');

  for (const pageInfo of PAGES) {
    const page = await context.newPage();
    
    try {
      console.log(`  Capturing: ${pageInfo.name}`);
      
      await page.goto(`http://localhost:8080${pageInfo.path}`, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Wait for animations to settle
      await page.waitForTimeout(1000);
      
      // Hide dynamic elements that change between runs
      await page.addStyleTag({
        content: `
          .visitor-counter, [data-counter], .counter-digit,
          [data-egregore-tracker], .egregore-tracker-section,
          .blink, .construction-gif,
          [style*="animation"], [style*="transition"] {
            visibility: hidden !important;
          }
        `
      });
      
      // Wait a bit more for styles to apply
      await page.waitForTimeout(500);
      
      const screenshotPath = path.join(BASELINE_DIR, `${pageInfo.name}.png`);
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true,
        animations: 'disabled'
      });
      
      console.log(`  ✓ Saved: ${screenshotPath}`);
    } catch (error) {
      console.error(`  ✗ Failed: ${pageInfo.name} - ${error.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('\n✅ Visual regression baseline generated!');
  console.log(`   Baseline directory: ${BASELINE_DIR}`);
}

generateBaseline().catch(console.error);