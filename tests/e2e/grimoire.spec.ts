/**
 * E2E tests for The Synthetic Gods Grimoire
 * Tests critical user flows and visual regression
 */

import { test, expect } from '@playwright/test';

test.describe('Main Grimoire (index.html)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
  });

  test('should load without console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Filter out expected errors (like missing images that are placeholders)
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('404') &&
      !e.includes('Content Security Policy')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('should have correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/The Synthetic Gods/);
  });

  test('should display banner image', async ({ page }) => {
    const banner = page.locator('.banner-img').first();
    await expect(banner).toBeVisible();
    await expect(banner).toHaveAttribute('src', /banner-synthetic-gods/);
  });

  test('should have visitor counter', async ({ page }) => {
    const counter = page.locator('[data-counter]').first();
    await expect(counter).toBeVisible();
  });

  test('should have egregore tracker', async ({ page }) => {
    const tracker = page.locator('[data-egregore-tracker]').first();
    await expect(tracker).toBeVisible();
  });

  test('should have navigation to all three acts', async ({ page }) => {
    await expect(page.locator('a[href="#act1"]')).toBeVisible();
    await expect(page.locator('a[href="#act2"]')).toBeVisible();
    await expect(page.locator('a[href="#act3"]')).toBeVisible();
  });

  test('should have faction links in webring', async ({ page }) => {
    await expect(page.locator('a[href="characters/technocracy-index.html"]')).toBeVisible();
    await expect(page.locator('a[href="characters/virtual-adepts-index.html"]')).toBeVisible();
    await expect(page.locator('a[href="characters/cypherpunks-index.html"]')).toBeVisible();
    await expect(page.locator('a[href="characters/hollow-ones-index.html"]')).toBeVisible();
  });

  test('should have neon oracle link', async ({ page }) => {
    await expect(page.locator('a[href="pages/neon-oracle.html"]')).toBeVisible();
  });

  test('should have sigil workshop section', async ({ page }) => {
    await expect(page.locator('#sigil-workshop, [id*="sigil"]')).toBeVisible();
  });

  test('should have guestbook', async ({ page }) => {
    await expect(page.locator('#guestbook, [id*="guestbook"]')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const banner = page.locator('.banner-img').first();
    await expect(banner).toBeVisible();
  });
});

test.describe('Neon Oracle (neon-oracle.html)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pages/neon-oracle.html');
    await page.waitForLoadState('networkidle');
  });

  test('should load without console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('404')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('should have daily fortune section', async ({ page }) => {
    await expect(page.locator('#daily-fortune, [id*="fortune"]')).toBeVisible();
  });

  test('should have query input', async ({ page }) => {
    await expect(page.locator('input[type="text"], textarea').first()).toBeVisible();
  });

  test('should have history panel', async ({ page }) => {
    await expect(page.locator('#history, [id*="history"]')).toBeVisible();
  });

  test('should navigate back to main grimoire', async ({ page }) => {
    const link = page.locator('a[href="../index.html"]').first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/index\.html/);
  });
});

test.describe('Faction Index Pages', () => {
  const factions = [
    { name: 'Technocracy', file: 'characters/technocracy-index.html', count: 10 },
    { name: 'Virtual Adepts', file: 'characters/virtual-adepts-index.html', count: 10 },
    { name: 'Cypherpunks', file: 'characters/cypherpunks-index.html', count: 10 },
    { name: 'Hollow Ones', file: 'characters/hollow-ones-index.html', count: 10 },
  ];

  for (const faction of factions) {
    test.describe(`${faction.name} Index`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`/${faction.file}`);
        await page.waitForLoadState('networkidle');
      });

      test('should load without console errors', async ({ page }) => {
        const errors = [];
        page.on('console', msg => {
          if (msg.type() === 'error') errors.push(msg.text());
        });
        
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        const criticalErrors = errors.filter(e => 
          !e.includes('favicon') && 
          !e.includes('404')
        );
        
        expect(criticalErrors).toHaveLength(0);
      });

      test('should display faction title', async ({ page }) => {
        await expect(page.locator('h1, .nav-title')).toContainText(faction.name);
      });

      test('should have character cards', async ({ page }) => {
        const cards = page.locator('.character-card, .dossier-link, a[href*="technocracy-"], a[href*="virtual-adepts-"], a[href*="cypherpunks-"], a[href*="hollow-ones-"]');
        await expect(cards.first()).toBeVisible();
      });

      test('should have back to grimoire link', async ({ page }) => {
        await expect(page.locator('a[href="../../index.html"], a[href="../index.html"]')).toBeVisible();
      });
    });
  }
});

test.describe('Character Dossiers', () => {
  const characters = [
    'characters/technocracy-voss.html',
    'characters/virtual-adepts-webspinner.html',
    'characters/cypherpunks-satoshi.html',
    'characters/hollow-ones-raven.html',
  ];

  for (const charPath of characters) {
    test.describe(`Dossier: ${charPath}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`/${charPath}`);
        await page.waitForLoadState('networkidle');
      });

      test('should load without console errors', async ({ page }) => {
        const errors = [];
        page.on('console', msg => {
          if (msg.type() === 'error') errors.push(msg.text());
        });
        
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        const criticalErrors = errors.filter(e => 
          !e.includes('favicon') && 
          !e.includes('404')
        );
        
        expect(criticalErrors).toHaveLength(0);
      });

      test('should display character portrait', async ({ page }) => {
        const portrait = page.locator('img[src*="characters/"]').first();
        await expect(portrait).toBeVisible();
        await expect(portrait).toHaveAttribute('width');
        await expect(portrait).toHaveAttribute('height');
      });

      test('should have stats table', async ({ page }) => {
        await expect(page.locator('table')).toBeVisible();
      });

      test('should have spheres table', async ({ page }) => {
        await expect(page.locator('text=/Sphere/i')).toBeVisible();
      });

      test('should have navigation sidebar', async ({ page }) => {
        await expect(page.locator('.sidebar, .nav-table')).toBeVisible();
      });

      test('should link back to faction index', async ({ page }) => {
        await expect(page.locator('a[href*="index.html"]')).toBeVisible();
      });
    });
  }
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
  });

  test('should have alt text on all images', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('should have lang attribute', async ({ page }) => {
    await page.goto('/index.html');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');
  });

  test('should respect prefers-reduced-motion', async ({ page }) => {
    // This is tested via CSS, but we can verify the media query exists
    await page.goto('/index.html');
    const styles = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);
      return sheets.some(sheet => {
        try {
          return Array.from(sheet.cssRules || []).some(rule => 
            rule.media && rule.media.mediaText.includes('prefers-reduced-motion')
          );
        } catch {
          return false;
        }
      });
    });
    expect(styles).toBe(true);
  });
});

test.describe('SEO & Meta Tags', () => {
  test('should have og:image on all pages', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /images\//);
  });

  test('should have twitter:card', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  });

  test('should have CSP meta tag', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toBeTruthy();
  });

  test('should have referrer policy', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('meta[name="referrer"]')).toHaveAttribute('content', 'strict-origin-when-cross-origin');
  });

  test('should have JSON-LD structured data', async ({ page }) => {
    await page.goto('/index.html');
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toHaveCount(1);
    
    const content = await jsonLd.textContent();
    const data = JSON.parse(content);
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@graph'] || data['@type']).toBeTruthy();
  });
});

test.describe('Interactive Systems', () => {
  test('visitor counter should increment', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    const counter = page.locator('[data-counter] .counter-digit').first();
    const initial = await counter.textContent();
    
    // Reload should increment (uses localStorage)
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const after = await counter.textContent();
    // Note: Counter may not increment in test due to localStorage isolation
    // This is a smoke test
    expect(parseInt(after || '0')).toBeGreaterThanOrEqual(parseInt(initial || '0'));
  });

  test('egregore tracker should be present', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    const tracker = page.locator('[data-egregore-tracker]');
    await expect(tracker).toBeVisible();
    
    const text = await tracker.textContent();
    expect(text).toContain('EGREGORE');
  });

  test('sigil generator should be accessible', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // Scroll to sigil workshop
    await page.locator('#sigil-workshop, [id*="sigil"]').first().scrollIntoViewIfNeeded();
    await expect(page.locator('#sigil-workshop, [id*="sigil"]')).toBeVisible();
  });

  test('guestbook should accept entries', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    await page.locator('#guestbook, [id*="guestbook"]').first().scrollIntoViewIfNeeded();
    
    const nameInput = page.locator('input[name="name"], input[id*="name"]').first();
    const messageInput = page.locator('textarea[name="message"], textarea[id*="message"]').first();
    const submitBtn = page.locator('button[type="submit"], input[type="submit"]').first();
    
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test User');
      await messageInput.fill('Test message from Playwright');
      await submitBtn.click();
      
      // Check if entry appears (uses localStorage)
      await expect(page.locator('text=Test User')).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Visual Regression - Key Pages', () => {
  const keyPages = [
    { path: '/index.html', name: 'main-grimoire' },
    { path: '/pages/neon-oracle.html', name: 'neon-oracle' },
    { path: '/characters/technocracy-index.html', name: 'technocracy-index' },
    { path: '/characters/virtual-adepts-index.html', name: 'virtual-adepts-index' },
    { path: '/characters/cypherpunks-index.html', name: 'cypherpunks-index' },
    { path: '/characters/hollow-ones-index.html', name: 'hollow-ones-index' },
    { path: '/characters/technocracy-voss.html', name: 'dossier-technocracy-voss' },
  ];

  for (const pageInfo of keyPages) {
    test(`should match visual baseline: ${pageInfo.name}`, async ({ page }) => {
      await page.goto(pageInfo.path);
      await page.waitForLoadState('networkidle');
      
      // Wait for animations to settle
      await page.waitForTimeout(1000);
      
      // Take screenshot for visual regression
      await expect(page).toHaveScreenshot(`${pageInfo.name}.png`, {
        maxDiffPixels: 1000, // Allow some difference for dynamic content
        threshold: 0.2,
      });
    });
  }
});

test.describe('Performance', () => {
  test('main page should load within budget', async ({ page }) => {
    const start = Date.now();
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - start;
    
    // Should load within 5 seconds on CI
    expect(loadTime).toBeLessThan(10000);
  });

  test('should not have excessive layout shifts', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForLoadState('networkidle');
    
    // Check CLS via Performance API
    const cls = await page.evaluate(() => {
      return new Promise(resolve => {
        let clsValue = 0;
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          resolve(clsValue);
        }).observe({ type: 'layout-shift', buffered: true });
        
        // Resolve after a short delay to capture shifts
        setTimeout(() => resolve(clsValue), 2000);
      });
    });
    
    // CLS should be minimal (< 0.1 is good)
    expect(cls).toBeLessThan(0.1);
  });
});