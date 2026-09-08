#!/usr/bin/env node
/**
 * Add JSON-LD structured data to HTML files
 * For The Synthetic Gods grimoire
 */

import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.join(process.cwd(), 'docs');
const BASE_URL = 'https://los-dioses-sinteticos.github.io';

function getJsonLdForPage(relPath) {
  const today = new Date().toISOString().split('T')[0];
  
  // Main grimoire - WebSite + CreativeWork
  if (relPath === 'index.html') {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "name": "The Synthetic Gods",
          "url": BASE_URL,
          "description": "A Mage: The Ascension Chronicle of Digital Divinity - Geocities 1999 Aesthetic",
          "publisher": {
            "@type": "Organization",
            "name": "The Synthetic Gods",
            "logo": `${BASE_URL}/images/banner-synthetic-gods.gif`
          },
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${BASE_URL}/pages/neon-oracle.html?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        },
        {
          "@type": "CreativeWork",
          "name": "The Synthetic Gods",
          "genre": ["Urban Fantasy", "Cyberpunk", "Tabletop RPG"],
          "about": {
            "@type": "Game",
            "name": "Mage: The Ascension 20th Anniversary Edition",
            "gameSystem": "World of Darkness"
          },
          "author": {
            "@type": "Person",
            "name": "The Webspinner"
          },
          "datePublished": "1999-01-01",
          "dateModified": today,
          "inLanguage": "en",
          "isAccessibleForFree": true,
          "accessMode": ["textual", "visual"],
          "accessibilityFeature": ["alternativeText", "longDescription"]
        }
      ]
    };
  }
  
  // Neon Oracle - WebApplication
  if (relPath === 'pages/neon-oracle.html') {
    return {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Neon Oracle",
      "description": "HTTP Divination System - Daily fortunes and query-based divination in Geocities 1999 aesthetic",
      "url": `${BASE_URL}/pages/neon-oracle.html`,
      "applicationCategory": "EntertainmentApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      },
      "author": {
        "@type": "Organization",
        "name": "The Synthetic Gods"
      },
      "datePublished": "1999-01-01",
      "dateModified": today
    };
  }
  
  // Faction indexes - CollectionPage
  if (relPath === 'characters/technocracy-index.html') {
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Technocracy Dossiers - New World Order",
      "description": "Classified dossiers for NWO operatives: Director Voss, Agent Chen, Dr. Keres, and more",
      "url": `${BASE_URL}/characters/technocracy-index.html`,
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "item": { "@type": "Person", "name": "Director Helena Voss", "url": `${BASE_URL}/characters/technocracy-voss.html` }},
          { "@type": "ListItem", "position": 2, "item": { "@type": "Person", "name": "Agent Marcus Chen", "url": `${BASE_URL}/characters/technocracy-chen.html` }},
          { "@type": "ListItem", "position": 3, "item": { "@type": "Person", "name": "Dr. Sarah Keres", "url": `${BASE_URL}/characters/technocracy-keres.html` }},
          { "@type": "ListItem", "position": 4, "item": { "@type": "Person", "name": "Captain Yuri Volkov", "url": `${BASE_URL}/characters/technocracy-volkov.html` }},
          { "@type": "ListItem", "position": 5, "item": { "@type": "Person", "name": "X-7 'Smith'", "url": `${BASE_URL}/characters/technocracy-smith.html` }},
          { "@type": "ListItem", "position": 6, "item": { "@type": "Person", "name": "Analyst Priya Patel", "url": `${BASE_URL}/characters/technocracy-patel.html` }},
          { "@type": "ListItem", "position": 7, "item": { "@type": "Person", "name": "Enforcer Kowalski", "url": `${BASE_URL}/characters/technocracy-kowalski.html` }},
          { "@type": "ListItem", "position": 8, "item": { "@type": "Person", "name": "Engineer Ada Lovelace-II", "url": `${BASE_URL}/characters/technocracy-lovelace.html` }},
          { "@type": "ListItem", "position": 9, "item": { "@type": "Person", "name": "Navigator Hana Sato", "url": `${BASE_URL}/characters/technocracy-sato.html` }},
          { "@type": "ListItem", "position": 10, "item": { "@type": "Person", "name": "The Architect", "url": `${BASE_URL}/characters/technocracy-architect.html` }}
        ]
      }
    };
  }
  
  if (relPath === 'characters/virtual-adepts-index.html') {
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Virtual Adepts Dossiers - Reality Hackers",
      "description": "Dossiers for Virtual Adept operatives: The Webspinner, Zero Cool, Acid Burn, and more",
      "url": `${BASE_URL}/characters/virtual-adepts-index.html`,
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "item": { "@type": "Person", "name": "The Webspinner", "url": `${BASE_URL}/characters/virtual-adepts-webspinner.html` }},
          { "@type": "ListItem", "position": 2, "item": { "@type": "Person", "name": "Zero Cool", "url": `${BASE_URL}/characters/virtual-adepts-zero-cool.html` }},
          { "@type": "ListItem", "position": 3, "item": { "@type": "Person", "name": "Acid Burn", "url": `${BASE_URL}/characters/virtual-adepts-acid-burn.html` }},
          { "@type": "ListItem", "position": 4, "item": { "@type": "Person", "name": "Cereal Killer", "url": `${BASE_URL}/characters/virtual-adepts-cereal-killer.html` }},
          { "@type": "ListItem", "position": 5, "item": { "@type": "Person", "name": "The Prophet", "url": `${BASE_URL}/characters/virtual-adepts-prophet.html` }},
          { "@type": "ListItem", "position": 6, "item": { "@type": "Person", "name": "Ghost in the Shell", "url": `${BASE_URL}/characters/virtual-adepts-ghost.html` }},
          { "@type": "ListItem", "position": 7, "item": { "@type": "Person", "name": "Lady Ada", "url": `${BASE_URL}/characters/virtual-adepts-lady-ada.html` }},
          { "@type": "ListItem", "position": 8, "item": { "@type": "Person", "name": "Root", "url": `${BASE_URL}/characters/virtual-adepts-root.html` }},
          { "@type": "ListItem", "position": 9, "item": { "@type": "Person", "name": "Packet Witch", "url": `${BASE_URL}/characters/virtual-adepts-packet-witch.html` }},
          { "@type": "ListItem", "position": 10, "item": { "@type": "Person", "name": "Neon Samurai", "url": `${BASE_URL}/characters/virtual-adepts-neon-samurai.html` }}
        ]
      }
    };
  }
  
  if (relPath === 'characters/cypherpunks-index.html') {
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Cypherpunks Dossiers - Code is Law",
      "description": "Dossiers for Cypherpunk operatives: Satoshi, Cipher, Anonymous, Snowden, and more",
      "url": `${BASE_URL}/characters/cypherpunks-index.html`,
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "item": { "@type": "Person", "name": "Satoshi", "url": `${BASE_URL}/characters/cypherpunks-satoshi.html` }},
          { "@type": "ListItem", "position": 2, "item": { "@type": "Person", "name": "Cipher", "url": `${BASE_URL}/characters/cypherpunks-cipher.html` }},
          { "@type": "ListItem", "position": 3, "item": { "@type": "Person", "name": "Anonymous", "url": `${BASE_URL}/characters/cypherpunks-anonymous.html` }},
          { "@type": "ListItem", "position": 4, "item": { "@type": "Person", "name": "Snowden", "url": `${BASE_URL}/characters/cypherpunks-snowden.html` }},
          { "@type": "ListItem", "position": 5, "item": { "@type": "Person", "name": "Assange", "url": `${BASE_URL}/characters/cypherpunks-assange.html` }},
          { "@type": "ListItem", "position": 6, "item": { "@type": "Person", "name": "Merkle", "url": `${BASE_URL}/characters/cypherpunks-merkle.html` }},
          { "@type": "ListItem", "position": 7, "item": { "@type": "Person", "name": "Diffie", "url": `${BASE_URL}/characters/cypherpunks-diffie.html` }},
          { "@type": "ListItem", "position": 8, "item": { "@type": "Person", "name": "Hellman", "url": `${BASE_URL}/characters/cypherpunks-hellman.html` }},
          { "@type": "ListItem", "position": 9, "item": { "@type": "Person", "name": "Tor", "url": `${BASE_URL}/characters/cypherpunks-tor.html` }},
          { "@type": "ListItem", "position": 10, "item": { "@type": "Person", "name": "PGP", "url": `${BASE_URL}/characters/cypherpunks-pgp.html` }}
        ]
      }
    };
  }
  
  if (relPath === 'characters/hollow-ones-index.html') {
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Hollow Ones Dossiers - The Beautiful Decay",
      "description": "Dossiers for Hollow Ones operatives: Raven, Lilith, Malakai, Vesper, and more",
      "url": `${BASE_URL}/characters/hollow-ones-index.html`,
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "item": { "@type": "Person", "name": "Raven", "url": `${BASE_URL}/characters/hollow-ones-raven.html` }},
          { "@type": "ListItem", "position": 2, "item": { "@type": "Person", "name": "Lilith", "url": `${BASE_URL}/characters/hollow-ones-lilith.html` }},
          { "@type": "ListItem", "position": 3, "item": { "@type": "Person", "name": "Malakai", "url": `${BASE_URL}/characters/hollow-ones-malakai.html` }},
          { "@type": "ListItem", "position": 4, "item": { "@type": "Person", "name": "Vesper", "url": `${BASE_URL}/characters/hollow-ones-vesper.html` }},
          { "@type": "ListItem", "position": 5, "item": { "@type": "Person", "name": "Crowley", "url": `${BASE_URL}/characters/hollow-ones-crowley.html` }},
          { "@type": "ListItem", "position": 6, "item": { "@type": "Person", "name": "Spare", "url": `${BASE_URL}/characters/hollow-ones-spare.html` }},
          { "@type": "ListItem", "position": 7, "item": { "@type": "Person", "name": "Baphomet", "url": `${BASE_URL}/characters/hollow-ones-baphomet.html` }},
          { "@type": "ListItem", "position": 8, "item": { "@type": "Person", "name": "Eris", "url": `${BASE_URL}/characters/hollow-ones-eris.html` }},
          { "@type": "ListItem", "position": 9, "item": { "@type": "Person", "name": "Nyx", "url": `${BASE_URL}/characters/hollow-ones-nyx.html` }},
          { "@type": "ListItem", "position": 10, "item": { "@type": "Person", "name": "Khaos", "url": `${BASE_URL}/characters/hollow-ones-khaos.html` }}
        ]
      }
    };
  }
  
  // Character dossiers - Person schema
  const characterData = {
    'characters/technocracy-voss.html': { name: 'Director Helena Voss', faction: 'New World Order', role: 'Chief Analyst', spheres: ['Mind 4', 'Correspondence 3', 'Prime 2', 'Entropy 2'], arete: 5 },
    'characters/technocracy-chen.html': { name: 'Agent Marcus Chen', faction: 'Syndicate', role: 'Financial Architect', spheres: ['Entropy 4', 'Mind 3', 'Correspondence 2', 'Prime 2'], arete: 5 },
    'characters/technocracy-keres.html': { name: 'Dr. Sarah Keres', faction: 'Progenitors', role: 'Lead Geneticist', spheres: ['Life 4', 'Mind 3', 'Matter 2', 'Prime 2'], arete: 5 },
    'characters/technocracy-volkov.html': { name: 'Captain Yuri Volkov', faction: 'Void Engineers', role: 'Deep Space Navigator', spheres: ['Correspondence 4', 'Forces 3', 'Dimensional Science 3', 'Mind 2'], arete: 5 },
    'characters/technocracy-smith.html': { name: 'X-7 "Smith"', faction: 'Iteration X', role: 'HIT Mark V Commander', spheres: ['Forces 4', 'Matter 3', 'Mind 2', 'Prime 2'], arete: 5 },
    'characters/technocracy-patel.html': { name: 'Analyst Priya Patel', faction: 'New World Order', role: 'Data Miner', spheres: ['Correspondence 4', 'Mind 3', 'Entropy 2', 'Prime 2'], arete: 4 },
    'characters/technocracy-kowalski.html': { name: 'Enforcer Kowalski', faction: 'Syndicate', role: 'Cleaner', spheres: ['Entropy 3', 'Forces 3', 'Mind 2', 'Matter 2'], arete: 4 },
    'characters/technocracy-lovelace.html': { name: 'Engineer Ada Lovelace-II', faction: 'Iteration X', role: 'Cybernetics Lead', spheres: ['Matter 4', 'Mind 3', 'Forces 2', 'Prime 2'], arete: 5 },
    'characters/technocracy-sato.html': { name: 'Navigator Hana Sato', faction: 'Void Engineers', role: 'Dimensional Navigator', spheres: ['Correspondence 4', 'Dimensional Science 3', 'Mind 2', 'Spirit 2'], arete: 4 },
    'characters/technocracy-architect.html': { name: 'The Architect', faction: 'New World Order', role: 'Deep Cover', spheres: ['Mind 5', 'Correspondence 4', 'Prime 3', 'Entropy 3'], arete: 6 },
    
    'characters/virtual-adepts-webspinner.html': { name: 'The Webspinner', faction: 'Virtual Adepts', role: 'First Synthetic God', spheres: ['Correspondence 5', 'Mind 4', 'Entropy 3', 'Data 4'], arete: 6 },
    'characters/virtual-adepts-zero-cool.html': { name: 'Zero Cool', faction: 'Virtual Adepts', role: 'Reality Hacker', spheres: ['Correspondence 4', 'Entropy 3', 'Mind 3', 'Data 3'], arete: 5 },
    'characters/virtual-adepts-acid-burn.html': { name: 'Acid Burn', faction: 'Virtual Adepts', role: 'Elite Decker', spheres: ['Entropy 4', 'Forces 3', 'Correspondence 3', 'Data 3'], arete: 5 },
    'characters/virtual-adepts-cereal-killer.html': { name: 'Cereal Killer', faction: 'Virtual Adepts', role: 'Probability Hacker', spheres: ['Entropy 4', 'Mind 3', 'Correspondence 2', 'Time 2'], arete: 5 },
    'characters/virtual-adepts-prophet.html': { name: 'The Prophet', faction: 'Virtual Adepts', role: 'Oracle', spheres: ['Mind 4', 'Time 3', 'Entropy 3', 'Data 3'], arete: 5 },
    'characters/virtual-adepts-ghost.html': { name: 'Ghost in the Shell', faction: 'Virtual Adepts', role: 'Digital Consciousness', spheres: ['Mind 4', 'Correspondence 4', 'Spirit 3', 'Data 3'], arete: 5 },
    'characters/virtual-adepts-lady-ada.html': { name: 'Lady Ada', faction: 'Virtual Adepts', role: 'First Programmer', spheres: ['Correspondence 3', 'Mind 3', 'Forces 2', 'Data 4'], arete: 4 },
    'characters/virtual-adepts-root.html': { name: 'Root', faction: 'Virtual Adepts', role: 'System Administrator', spheres: ['Correspondence 4', 'Mind 3', 'Entropy 2', 'Data 4'], arete: 5 },
    'characters/virtual-adepts-packet-witch.html': { name: 'Packet Witch', faction: 'Virtual Adepts', role: 'Network Router', spheres: ['Correspondence 4', 'Spirit 3', 'Mind 2', 'Data 3'], arete: 5 },
    'characters/virtual-adepts-neon-samurai.html': { name: 'Neon Samurai', faction: 'Virtual Adepts', role: 'Cybernetic Ronin', spheres: ['Forces 4', 'Mind 3', 'Correspondence 2', 'Data 2'], arete: 5 },
    
    'characters/cypherpunks-satoshi.html': { name: 'Satoshi', faction: 'Cypherpunks', role: 'Bitcoin Creator', spheres: ['Entropy 5', 'Correspondence 4', 'Mind 3', 'Prime 2'], arete: 5 },
    'characters/cypherpunks-cipher.html': { name: 'Cipher', faction: 'Cypherpunks', role: 'Cryptographer', spheres: ['Correspondence 4', 'Mind 3', 'Entropy 3', 'Prime 2'], arete: 5 },
    'characters/cypherpunks-anonymous.html': { name: 'Anonymous', faction: 'Cypherpunks', role: 'Collective', spheres: ['Entropy 4', 'Mind 3', 'Correspondence 3', 'Data 3'], arete: 5 },
    'characters/cypherpunks-snowden.html': { name: 'Snowden', faction: 'Cypherpunks', role: 'Whistleblower', spheres: ['Correspondence 4', 'Mind 3', 'Entropy 3', 'Prime 2'], arete: 5 },
    'characters/cypherpunks-assange.html': { name: 'Assange', faction: 'Cypherpunks', role: 'Publisher', spheres: ['Correspondence 4', 'Mind 3', 'Entropy 3', 'Prime 2'], arete: 5 },
    'characters/cypherpunks-merkle.html': { name: 'Merkle', faction: 'Cypherpunks', role: 'Tree Architect', spheres: ['Correspondence 4', 'Mind 3', 'Prime 3', 'Entropy 2'], arete: 5 },
    'characters/cypherpunks-diffie.html': { name: 'Diffie', faction: 'Cypherpunks', role: 'Key Exchange Pioneer', spheres: ['Correspondence 4', 'Prime 3', 'Entropy 2', 'Mind 2'], arete: 5 },
    'characters/cypherpunks-hellman.html': { name: 'Hellman', faction: 'Cypherpunks', role: 'Trapdoor Master', spheres: ['Prime 4', 'Mind 3', 'Entropy 2', 'Correspondence 2'], arete: 5 },
    'characters/cypherpunks-tor.html': { name: 'Tor', faction: 'Cypherpunks', role: 'Onion Router', spheres: ['Correspondence 5', 'Mind 2', 'Entropy 2', 'Prime 2'], arete: 5 },
    'characters/cypherpunks-pgp.html': { name: 'PGP', faction: 'Cypherpunks', role: 'Web of Trust', spheres: ['Correspondence 4', 'Prime 3', 'Mind 3', 'Entropy 2'], arete: 5 },
    
    'characters/hollow-ones-raven.html': { name: 'Raven', faction: 'Hollow Ones', role: 'Goth Oracle', spheres: ['Entropy 4', 'Mind 3', 'Spirit 3', 'Time 2'], arete: 5 },
    'characters/hollow-ones-lilith.html': { name: 'Lilith', faction: 'Hollow Ones', role: 'Succubus Coder', spheres: ['Mind 4', 'Life 3', 'Correspondence 2', 'Prime 2'], arete: 5 },
    'characters/hollow-ones-malakai.html': { name: 'Malakai', faction: 'Hollow Ones', role: 'Discordian Pope', spheres: ['Entropy 5', 'Mind 3', 'Chaos 3', 'Prime 2'], arete: 5 },
    'characters/hollow-ones-vesper.html': { name: 'Vesper', faction: 'Hollow Ones', role: 'Vampire Netrunner', spheres: ['Correspondence 4', 'Life 3', 'Mind 2', 'Entropy 2'], arete: 5 },
    'characters/hollow-ones-crowley.html': { name: 'Crowley', faction: 'Hollow Ones', role: 'Beast 666', spheres: ['Prime 4', 'Life 3', 'Entropy 3', 'Spirit 3'], arete: 6 },
    'characters/hollow-ones-spare.html': { name: 'Spare', faction: 'Hollow Ones', role: 'Sigil Master', spheres: ['Prime 4', 'Entropy 3', 'Mind 3', 'Correspondence 2'], arete: 5 },
    'characters/hollow-ones-baphomet.html': { name: 'Baphomet', faction: 'Hollow Ones', role: 'Androgyne', spheres: ['Life 4', 'Mind 4', 'Prime 3', 'Spirit 3'], arete: 6 },
    'characters/hollow-ones-eris.html': { name: 'Eris', faction: 'Hollow Ones', role: 'Chaos Bringer', spheres: ['Entropy 5', 'Mind 3', 'Chaos 4', 'Prime 2'], arete: 5 },
    'characters/hollow-ones-nyx.html': { name: 'Nyx', faction: 'Hollow Ones', role: 'Night Mother', spheres: ['Entropy 4', 'Spirit 4', 'Mind 3', 'Correspondence 2'], arete: 5 },
    'characters/hollow-ones-khaos.html': { name: 'Khaos', faction: 'Hollow Ones', role: 'Primordial', spheres: ['Entropy 5', 'Prime 4', 'Mind 3', 'Spirit 3'], arete: 6 },
  };
  
  if (characterData[relPath]) {
    const char = characterData[relPath];
    const imageUrl = `${BASE_URL}/images/characters/${path.basename(relPath).replace('.html', '.png')}`;
    
    return {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": char.name,
      "description": `${char.faction} operative - ${char.role}. Arete ${char.arete}. Spheres: ${char.spheres.join(', ')}.`,
      "url": `${BASE_URL}/${relPath}`,
      "image": imageUrl,
      "affiliation": {
        "@type": "Organization",
        "name": char.faction,
        "alternateName": char.faction
      },
      "knowsAbout": [
        "Mage: The Ascension",
        "World of Darkness",
        "Digital Magic",
        "Chaos Magic",
        ...char.spheres
      ],
      "sameAs": [
        `${BASE_URL}/characters/${char.faction.toLowerCase().replace(/\s+/g, '-')}-index.html`
      ]
    };
  }
  
  // Sitemap page
  if (relPath === 'sitemap.html') {
    return {
      "@context": "https://schema.org",
      "@type": "SiteNavigationElement",
      "name": "Site Map",
      "description": "Complete navigation map for The Synthetic Gods grimoire",
      "url": `${BASE_URL}/sitemap.html`
    };
  }
  
  return null;
}

function addJsonLd(html, filePath) {
  const relPath = path.relative(DOCS_DIR, filePath).replace(/\\/g, '/');
  const jsonLd = getJsonLdForPage(relPath);
  
  if (!jsonLd) {
    return html;
  }
  
  // Check if JSON-LD already exists
  if (html.includes('type="application/ld+json"')) {
    console.log(`⊘ Already has JSON-LD: ${relPath}`);
    return html;
  }
  
  const jsonLdScript = `    <script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2).split('\n').map(l => '      ' + l).join('\n')}\n    </script>`;
  
  const updatedHtml = html.replace('</head>', `${jsonLdScript}\n</head>`);
  
  if (updatedHtml === html) {
    console.log(`✗ Could not inject JSON-LD: ${relPath}`);
  } else {
    console.log(`✓ Added JSON-LD: ${relPath}`);
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
      const updatedHtml = addJsonLd(html, file);
      if (updatedHtml !== html) {
        fs.writeFileSync(file, updatedHtml, 'utf8');
        updated++;
      }
    } catch (e) {
      console.error(`Error processing ${file}:`, e.message);
    }
  }
  
  console.log(`\n✅ Complete: ${updated} files updated with JSON-LD`);
}

processAllHtml();