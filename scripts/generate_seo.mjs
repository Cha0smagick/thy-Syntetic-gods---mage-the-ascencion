#!/usr/bin/env node
/**
 * Generate sitemap.xml and robots.txt for The Synthetic Gods
 */

import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.join(process.cwd(), 'docs');
const BASE_URL = 'https://los-dioses-sinteticos.github.io'; // Update with actual URL

// All HTML pages to include in sitemap
const pages = [
  // Main
  { url: '', changefreq: 'weekly', priority: 1.0 },
  { url: 'pages/neon-oracle.html', changefreq: 'monthly', priority: 0.8 },
  
  // Faction indexes
  { url: 'characters/technocracy-index.html', changefreq: 'monthly', priority: 0.7 },
  { url: 'characters/virtual-adepts-index.html', changefreq: 'monthly', priority: 0.7 },
  { url: 'characters/cypherpunks-index.html', changefreq: 'monthly', priority: 0.7 },
  { url: 'characters/hollow-ones-index.html', changefreq: 'monthly', priority: 0.7 },
  
  // Technocracy dossiers
  { url: 'characters/technocracy-voss.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/technocracy-chen.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/technocracy-keres.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/technocracy-volkov.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/technocracy-smith.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/technocracy-patel.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/technocracy-kowalski.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/technocracy-lovelace.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/technocracy-sato.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/technocracy-architect.html', changefreq: 'yearly', priority: 0.6 },
  
  // Virtual Adepts dossiers
  { url: 'characters/virtual-adepts-webspinner.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/virtual-adepts-zero-cool.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/virtual-adepts-acid-burn.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/virtual-adepts-cereal-killer.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/virtual-adepts-prophet.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/virtual-adepts-ghost.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/virtual-adepts-lady-ada.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/virtual-adepts-root.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/virtual-adepts-packet-witch.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/virtual-adepts-neon-samurai.html', changefreq: 'yearly', priority: 0.6 },
  
  // Cypherpunks dossiers
  { url: 'characters/cypherpunks-satoshi.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/cypherpunks-cipher.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/cypherpunks-anonymous.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/cypherpunks-snowden.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/cypherpunks-assange.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/cypherpunks-merkle.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/cypherpunks-diffie.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/cypherpunks-hellman.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/cypherpunks-tor.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/cypherpunks-pgp.html', changefreq: 'yearly', priority: 0.6 },
  
  // Hollow Ones dossiers
  { url: 'characters/hollow-ones-raven.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/hollow-ones-lilith.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/hollow-ones-malakai.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/hollow-ones-vesper.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/hollow-ones-crowley.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/hollow-ones-spare.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/hollow-ones-baphomet.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/hollow-ones-eris.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/hollow-ones-nyx.html', changefreq: 'yearly', priority: 0.6 },
  { url: 'characters/hollow-ones-khaos.html', changefreq: 'yearly', priority: 0.6 },
];

function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  for (const page of pages) {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/${page.url}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  }
  
  xml += '</urlset>\n';
  
  fs.writeFileSync(path.join(DOCS_DIR, 'sitemap.xml'), xml);
  console.log(`✓ Generated sitemap.xml with ${pages.length} URLs`);
}

function generateRobotsTxt() {
  const robots = `# The Synthetic Gods - robots.txt
User-agent: *
Allow: /

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml

# Crawl-delay (be nice to server)
Crawl-delay: 1

# Disallow admin/private areas (none in static site)
# Disallow: /scripts/
# Disallow: /node_modules/
`;
  
  fs.writeFileSync(path.join(DOCS_DIR, 'robots.txt'), robots);
  console.log('✓ Generated robots.txt');
}

function generateSitemapIndex() {
  // Also create a simple HTML sitemap for visitors
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Site Map - The Synthetic Gods</title>
    <link rel="stylesheet" href="css/geocities.css">
</head>
<body>
    <table class="main-table" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td colspan="2" class="header-cell">
                <div class="header-content">
                    <img src="images/banner-synthetic-gods.gif" alt="The Synthetic Gods Banner" width="468" height="60" class="banner-img">
                </div>
            </td>
        </tr>
        <tr>
            <td class="sidebar-cell" valign="top">
                <div class="sidebar">
                    <div class="nav-section">
                        <div class="nav-title">NAVIGATION</div>
                    </div>
                    <table class="nav-table" cellpadding="0" cellspacing="0" border="0">
                        <tr><td><a href="index.html">← MAIN GRIMOIRE</a></td></tr>
                        <tr><td><a href="pages/neon-oracle.html">NEON ORACLE</a></td></tr>
                    </table>
                </div>
            </td>
            <td class="content-cell" valign="top">
                <div class="content-area">
                    <h1>SITE MAP</h1>
                    <hr>
                    
                    <h2>📜 MAIN GRIMOIRE</h2>
                    <ul>
                        <li><a href="index.html">The Synthetic Gods - Main Grimoire</a></li>
                        <li><a href="pages/neon-oracle.html">Neon Oracle - HTTP Divination</a></li>
                    </ul>
                    
                    <h2>🏛️ FACTION DOSSIERS</h2>
                    
                    <h3>Technocracy (New World Order)</h3>
                    <ul>
                        <li><a href="characters/technocracy-index.html">Technocracy Index</a></li>
                        <li><a href="characters/technocracy-voss.html">Director Helena Voss</a></li>
                        <li><a href="characters/technocracy-chen.html">Agent Marcus Chen</a></li>
                        <li><a href="characters/technocracy-keres.html">Dr. Sarah Keres</a></li>
                        <li><a href="characters/technocracy-volkov.html">Captain Yuri Volkov</a></li>
                        <li><a href="characters/technocracy-smith.html">X-7 "Smith"</a></li>
                        <li><a href="characters/technocracy-patel.html">Analyst Priya Patel</a></li>
                        <li><a href="characters/technocracy-kowalski.html">Enforcer Kowalski</a></li>
                        <li><a href="characters/technocracy-lovelace.html">Engineer Ada Lovelace-II</a></li>
                        <li><a href="characters/technocracy-sato.html">Navigator Hana Sato</a></li>
                        <li><a href="characters/technocracy-architect.html">The Architect</a></li>
                    </ul>
                    
                    <h3>Virtual Adepts</h3>
                    <ul>
                        <li><a href="characters/virtual-adepts-index.html">Virtual Adepts Index</a></li>
                        <li><a href="characters/virtual-adepts-webspinner.html">The Webspinner</a></li>
                        <li><a href="characters/virtual-adepts-zero-cool.html">Zero Cool</a></li>
                        <li><a href="characters/virtual-adepts-acid-burn.html">Acid Burn</a></li>
                        <li><a href="characters/virtual-adepts-cereal-killer.html">Cereal Killer</a></li>
                        <li><a href="characters/virtual-adepts-prophet.html">The Prophet</a></li>
                        <li><a href="characters/virtual-adepts-ghost.html">Ghost in the Shell</a></li>
                        <li><a href="characters/virtual-adepts-lady-ada.html">Lady Ada</a></li>
                        <li><a href="characters/virtual-adepts-root.html">Root</a></li>
                        <li><a href="characters/virtual-adepts-packet-witch.html">Packet Witch</a></li>
                        <li><a href="characters/virtual-adepts-neon-samurai.html">Neon Samurai</a></li>
                    </ul>
                    
                    <h3>Cypherpunks</h3>
                    <ul>
                        <li><a href="characters/cypherpunks-index.html">Cypherpunks Index</a></li>
                        <li><a href="characters/cypherpunks-satoshi.html">Satoshi</a></li>
                        <li><a href="characters/cypherpunks-cipher.html">Cipher</a></li>
                        <li><a href="characters/cypherpunks-anonymous.html">Anonymous</a></li>
                        <li><a href="characters/cypherpunks-snowden.html">Snowden</a></li>
                        <li><a href="characters/cypherpunks-assange.html">Assange</a></li>
                        <li><a href="characters/cypherpunks-merkle.html">Merkle</a></li>
                        <li><a href="characters/cypherpunks-diffie.html">Diffie</a></li>
                        <li><a href="characters/cypherpunks-hellman.html">Hellman</a></li>
                        <li><a href="characters/cypherpunks-tor.html">Tor</a></li>
                        <li><a href="characters/cypherpunks-pgp.html">PGP</a></li>
                    </ul>
                    
                    <h3>Hollow Ones</h3>
                    <ul>
                        <li><a href="characters/hollow-ones-index.html">Hollow Ones Index</a></li>
                        <li><a href="characters/hollow-ones-raven.html">Raven</a></li>
                        <li><a href="characters/hollow-ones-lilith.html">Lilith</a></li>
                        <li><a href="characters/hollow-ones-malakai.html">Malakai</a></li>
                        <li><a href="characters/hollow-ones-vesper.html">Vesper</a></li>
                        <li><a href="characters/hollow-ones-crowley.html">Crowley</a></li>
                        <li><a href="characters/hollow-ones-spare.html">Spare</a></li>
                        <li><a href="characters/hollow-ones-baphomet.html">Baphomet</a></li>
                        <li><a href="characters/hollow-ones-eris.html">Eris</a></li>
                        <li><a href="characters/hollow-ones-nyx.html">Nyx</a></li>
                        <li><a href="characters/hollow-ones-khaos.html">Khaos</a></li>
                    </ul>
                    
                    <hr>
                    <p class="copyright">THE SYNTHETIC GODS • Mage: The Ascension Chronicle • 1999</p>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`;
  
  fs.writeFileSync(path.join(DOCS_DIR, 'sitemap.html'), html);
  console.log('✓ Generated sitemap.html (human-readable)');
}

generateSitemap();
generateRobotsTxt();
generateSitemapIndex();
console.log('\n✅ SEO files generated!');