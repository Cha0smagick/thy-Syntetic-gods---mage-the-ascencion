#!/usr/bin/env node
/**
 * Create placeholder images for content-filtered prompts
 * Generates SVG placeholders with Geocities aesthetic
 */

import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'docs', 'images');
const CHAR_DIR = path.join(OUTPUT_DIR, 'characters');

// Ensure directories exist
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(CHAR_DIR)) fs.mkdirSync(CHAR_DIR, { recursive: true });

// Geocities color palette
const colors = {
  bg: '#000000',
  grid: '#003300',
  text: '#00FF00',
  accent: '#FF00FF',
  gold: '#FFFF00',
  red: '#FF0000',
  cyan: '#00FFFF',
  white: '#FFFFFF'
};

// Character placeholder data
const characterPlaceholders = [
  {
    file: 'technocracy-volkov.png',
    name: 'CAPT. YURI VOLKOV',
    faction: 'VOID ENGINEERS',
    color: colors.cyan,
    symbols: ['☄', '🛰', '∆']
  },
  {
    file: 'technocracy-kowalski.png',
    name: 'ENFORCER KOWALSKI',
    faction: 'SYNDICATE',
    color: colors.red,
    symbols: ['⚡', '🔫', '◆']
  },
  {
    file: 'virtual-adepts-zero-cool.png',
    name: 'ZERO COOL',
    faction: 'VIRTUAL ADEPTS',
    color: colors.accent,
    symbols: ['🛹', '💻', '☠']
  },
  {
    file: 'virtual-adepts-ghost.png',
    name: 'GHOST IN THE SHELL',
    faction: 'VIRTUAL ADEPTS',
    color: colors.cyan,
    symbols: ['👻', '📦', '🌐']
  },
  {
    file: 'virtual-adepts-neon-samurai.png',
    name: 'NEON SAMURAI',
    faction: 'VIRTUAL ADEPTS',
    color: colors.accent,
    symbols: ['⚔', '🌸', '💿']
  },
  {
    file: 'cypherpunks-cipher.png',
    name: 'CIPHER',
    faction: 'CYPHERPUNKS',
    color: colors.gold,
    symbols: ['🔐', '🔑', '📐']
  },
  {
    file: 'hollow-ones-lilith.png',
    name: 'LILITH',
    faction: 'HOLLOW ONES',
    color: colors.red,
    symbols: ['🦇', '🖤', '💋']
  },
  {
    file: 'hollow-ones-spare.png',
    name: 'SPARE',
    faction: 'HOLLOW ONES',
    color: colors.accent,
    symbols: ['✒', '☯', '∞']
  }
];

// Main campaign placeholders
const mainPlaceholders = [
  {
    file: 'sigil-ascii.gif',
    name: 'SIGIL: ASCII',
    desc: 'ASCII ART SIGIL GENERATOR',
    color: colors.text
  },
  {
    file: 'sigil-html-source.gif',
    name: 'SIGIL: VIEW SOURCE',
    desc: 'HIDDEN IN HTML COMMENTS',
    color: colors.accent
  },
  {
    file: 'egregore-birth.gif',
    name: 'EGREGORE: BIRTH',
    desc: 'COLLECTIVE CONSCIOUSNESS AWAKENS',
    color: colors.gold
  },
  {
    file: 'egregore-war.gif',
    name: 'EGREGORE: WAR',
    desc: 'DIGITAL ENTITIES CLASH IN CYBERSPACE',
    color: colors.red
  },
  {
    file: 'synthetic-muse.gif',
    name: 'THE SYNTHETIC MUSE',
    desc: 'DIGITAL GODDESS OF CREATIVE CODING',
    color: colors.accent
  }
];

function createCharacterSVG(data) {
  const { name, faction, color, symbols } = data;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <!-- Background -->
  <rect width="512" height="512" fill="${colors.bg}"/>
  
  <!-- Grid pattern -->
  <defs>
    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
      <path d="M 32 0 L 0 0 0 32" fill="none" stroke="${colors.grid}" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="512" height="512" fill="url(#grid)"/>
  
  <!-- Scanlines -->
  <defs>
    <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="2" fill="${colors.bg}" opacity="0.3"/>
    </pattern>
  </defs>
  <rect width="512" height="512" fill="url(#scanlines)"/>
  
  <!-- Border -->
  <rect x="16" y="16" width="480" height="480" fill="none" stroke="${color}" stroke-width="4"/>
  <rect x="20" y="20" width="472" height="472" fill="none" stroke="${color}" stroke-width="1" stroke-dasharray="8,4"/>
  
  <!-- Faction badge -->
  <text x="256" y="80" font-family="monospace" font-size="14" fill="${color}" text-anchor="middle" letter-spacing="2">${faction}</text>
  
  <!-- Symbols -->
  <g font-family="sans-serif" font-size="48" fill="${color}" text-anchor="middle">
    ${symbols.map((s, i) => `<text x="${256 + (i-1)*80}" y="200">${s}</text>`).join('')}
  </g>
  
  <!-- Name -->
  <text x="256" y="280" font-family="monospace" font-size="24" fill="${color}" text-anchor="middle" letter-spacing="1">${name}</text>
  
  <!-- Divider -->
  <line x1="156" y1="300" x2="356" y2="300" stroke="${color}" stroke-width="2"/>
  
  <!-- Placeholder text -->
  <text x="256" y="340" font-family="monospace" font-size="12" fill="${colors.text}" text-anchor="middle" opacity="0.7">[IMAGE GENERATION</text>
  <text x="256" y="360" font-family="monospace" font-size="12" fill="${colors.text}" text-anchor="middle" opacity="0.7">CONTENT FILTERED]</text>
  <text x="256" y="390" font-family="monospace" font-size="10" fill="${colors.text}" text-anchor="middle" opacity="0.5">PLACEHOLDER - REPLACE WITH AI GENERATED</text>
  
  <!-- Corner brackets -->
  <g stroke="${color}" stroke-width="3" fill="none">
    <path d="M 40 40 L 40 80 M 40 40 L 80 40"/> <!-- TL -->
    <path d="M 472 40 L 472 80 M 472 40 L 432 40"/> <!-- TR -->
    <path d="M 40 472 L 40 432 M 40 472 L 80 472"/> <!-- BL -->
    <path d="M 472 472 L 472 432 M 472 472 L 432 472"/> <!-- BR -->
  </g>
  
  <!-- Geocities footer -->
  <text x="256" y="490" font-family="monospace" font-size="10" fill="${colors.text}" text-anchor="middle" opacity="0.5">THE SYNTHETIC GODS • 1999</text>
</svg>`;
}

function createMainSVG(data) {
  const { name, desc, color } = data;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="576" viewBox="0 0 1024 576">
  <!-- Background -->
  <rect width="1024" height="576" fill="${colors.bg}"/>
  
  <!-- Grid pattern -->
  <defs>
    <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
      <path d="M 64 0 L 0 0 0 64" fill="none" stroke="${colors.grid}" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1024" height="576" fill="url(#grid)"/>
  
  <!-- Scanlines -->
  <defs>
    <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="2" fill="${colors.bg}" opacity="0.3"/>
    </pattern>
  </defs>
  <rect width="1024" height="576" fill="url(#scanlines)"/>
  
  <!-- Border -->
  <rect x="32" y="32" width="960" height="512" fill="none" stroke="${color}" stroke-width="6"/>
  <rect x="36" y="36" width="952" height="504" fill="none" stroke="${color}" stroke-width="1" stroke-dasharray="16,8"/>
  
  <!-- Title -->
  <text x="512" y="200" font-family="monospace" font-size="48" fill="${color}" text-anchor="middle" letter-spacing="4">${name}</text>
  
  <!-- Divider -->
  <line x1="312" y1="230" x2="712" y2="230" stroke="${color}" stroke-width="3"/>
  
  <!-- Description -->
  <text x="512" y="280" font-family="monospace" font-size="20" fill="${colors.gold}" text-anchor="middle" letter-spacing="2">${desc}</text>
  
  <!-- Placeholder notice -->
  <g font-family="monospace" fill="${colors.text}" text-anchor="middle" opacity="0.6">
    <text x="512" y="340" font-size="16">[CONTENT FILTERED BY API]</text>
    <text x="512" y="370" font-size="14">PLACEHOLDER IMAGE</text>
    <text x="512" y="400" font-size="12">REPLACE WITH REGENERATED AI IMAGE</text>
  </g>
  
  <!-- Corner brackets -->
  <g stroke="${color}" stroke-width="6" fill="none">
    <path d="M 56 56 L 56 120 M 56 56 L 120 56"/>
    <path d="M 968 56 L 968 120 M 968 56 L 904 56"/>
    <path d="M 56 520 L 56 456 M 56 520 L 120 520"/>
    <path d="M 968 520 L 968 456 M 968 520 L 904 520"/>
  </g>
  
  <!-- Geocities footer -->
  <text x="512" y="550" font-family="monospace" font-size="12" fill="${colors.text}" text-anchor="middle" opacity="0.5">THE SYNTHETIC GODS • MAGE: THE ASCENSION • 1999</text>
</svg>`;
}

// Create character placeholders as SVG (can be used directly or converted)
console.log('Creating character placeholder SVGs...');
for (const data of characterPlaceholders) {
  const svg = createCharacterSVG(data);
  const svgPath = path.join(CHAR_DIR, data.file.replace('.png', '.svg'));
  fs.writeFileSync(svgPath, svg);
  console.log(`✓ Created: ${data.file.replace('.png', '.svg')}`);
  
  // Also create a simple PNG using a data URI approach (we'll create a minimal valid PNG)
  // For now, just create the SVG - browsers can display SVG directly in <img> tags
}

// Create main placeholders
console.log('\nCreating main campaign placeholder SVGs...');
for (const data of mainPlaceholders) {
  const svg = createMainSVG(data);
  const svgPath = path.join(OUTPUT_DIR, data.file.replace('.gif', '.svg'));
  fs.writeFileSync(svgPath, svg);
  console.log(`✓ Created: ${data.file.replace('.gif', '.svg')}`);
}

// Create PNG copies by copying SVG (browsers support SVG in img tags)
// We'll create symlinks or copies with .png extension for compatibility
console.log('\nCreating PNG references...');
for (const data of characterPlaceholders) {
  const svgPath = path.join(CHAR_DIR, data.file.replace('.png', '.svg'));
  const pngPath = path.join(CHAR_DIR, data.file);
  // Copy SVG content to .png file (browsers will render SVG even with .png extension if content-type is correct)
  // But better to just copy the file - we'll use a simple approach: create a 1x1 transparent PNG as fallback
  // Actually, let's just copy the SVG and rename to PNG for now
  fs.copyFileSync(svgPath, pngPath);
  console.log(`✓ Created PNG reference: ${data.file}`);
}

for (const data of mainPlaceholders) {
  const svgPath = path.join(OUTPUT_DIR, data.file.replace('.gif', '.svg'));
  const gifPath = path.join(OUTPUT_DIR, data.file);
  fs.copyFileSync(svgPath, gifPath);
  console.log(`✓ Created GIF reference: ${data.file}`);
}

console.log('\n✅ All placeholders created!');
console.log('Note: These are SVG files with .png/.gif extensions for compatibility.');
console.log('Replace with actual AI-generated images when content filter issues are resolved.');