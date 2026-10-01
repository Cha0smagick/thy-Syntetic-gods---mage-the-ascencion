#!/usr/bin/env node
/**
 * NVIDIA Flux.2 Klein 4B Image Generator
 * For The Synthetic Gods campaign
 * Reads image_prompts.json and generates all required images
 */

import fs from 'fs';
import path from 'path';
import https from 'https';

// Configuration
const API_ENDPOINT = 'https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.2-klein-4b';
const PROJECT_ROOT = process.cwd();
const DEFAULT_PROMPTS_FILE = path.join(PROJECT_ROOT, 'docs', 'image_prompts.json');
const DEFAULT_OUTPUT_DIR = path.join(PROJECT_ROOT, 'docs', 'images');

// Overridable via CLI so one generator serves every image deliverable.
let PROMPTS_FILE = DEFAULT_PROMPTS_FILE;
let OUTPUT_DIR = DEFAULT_OUTPUT_DIR;
// Candidate .env locations, searched in order. The repo-local `.env` is the
// supported one (git-ignored); the rest are historical locations kept so an
// existing machine setup keeps working without reconfiguration.
const ENV_FILES = [
  path.join(PROJECT_ROOT, '.env'),
  path.join(process.env.USERPROFILE || '', '.config', 'opencode', '.env'),
  path.join('D:', 'Paginas web', 'audit-n-make-money', 'business-partner', '.env'),
  path.join('D:', 'Videos', 'Crear_videos', '.env'),
];

// Resolve the API key: explicit environment variable wins, then the .env
// cascade. Never throws - returns null so the caller can report one clear error.
function loadApiKey() {
  if (process.env.NVIDIA_API_KEY) return process.env.NVIDIA_API_KEY.trim();

  for (const envFile of ENV_FILES) {
    if (!envFile) continue;
    let envContent;
    try {
      envContent = fs.readFileSync(envFile, 'utf8');
    } catch {
      continue; // not present - try the next candidate
    }
    const match = envContent.match(/^\s*NVIDIA_API_KEY\s*=\s*(.+)$/m);
    if (match) {
      const value = match[1].trim().replace(/^["']|["']$/g, '');
      if (value) {
        console.error(`Loaded NVIDIA_API_KEY from ${envFile}`);
        return value;
      }
    }
  }
  return null;
}

const API_KEY = loadApiKey();

if (!API_KEY) {
  console.error(
    'ERROR: NVIDIA_API_KEY not found.\n' +
    `  Set it in the environment:  set NVIDIA_API_KEY=nvapi-...\n` +
    `  Or create ${path.join(PROJECT_ROOT, '.env')} containing:\n` +
    '  NVIDIA_API_KEY=nvapi-...\n' +
    `  Searched: ${ENV_FILES.join(', ')}`
  );
  process.exit(1);
}

// Load prompts
function loadPrompts() {
  try {
    const content = fs.readFileSync(PROMPTS_FILE, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    console.error('Could not load prompts:', e.message);
    process.exit(1);
  }
}

// Generate image via NVIDIA API
function generateImage(prompt, outputPath, options = {}) {
  return new Promise((resolve, reject) => {
    // Flux.2 Klein 4B accepts: prompt, width, height, seed, steps
    const payload = JSON.stringify({
      prompt: prompt,
      width: options.width || 1024,
      height: options.height || 1024,
      seed: options.seed || Math.floor(Math.random() * 2147483647),
      steps: options.steps || 4
    });

    const reqOptions = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(API_ENDPOINT, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          // Handle different response formats
          let base64Image = null;
          
          if (response.image) {
            base64Image = response.image;
          } else if (response.artifacts && response.artifacts.length > 0) {
            base64Image = response.artifacts[0].base64;
            if (response.artifacts[0].finishReason === 'CONTENT_FILTERED') {
              reject(new Error('Content filtered by API'));
              return;
            }
          } else if (response.error) {
            reject(new Error(`API Error: ${response.error}`));
            return;
          } else {
            reject(new Error(`Unexpected response format: ${JSON.stringify(response).slice(0, 300)}`));
            return;
          }
          
          if (base64Image) {
            const buffer = Buffer.from(base64Image, 'base64');
            fs.writeFileSync(outputPath, buffer);
            console.log(`✓ Generated: ${path.basename(outputPath)}`);
            resolve(outputPath);
          } else {
            reject(new Error('No image data in response'));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// Main generation function
async function main() {
  const projectName = process.argv[2] || 'synthetic-gods';

  // Optional overrides: --prompts <file> --out <dir>
  const argi = process.argv.indexOf('--prompts');
  if (argi !== -1 && process.argv[argi + 1]) {
    PROMPTS_FILE = path.resolve(process.cwd(), process.argv[argi + 1]);
  }
  const argo = process.argv.indexOf('--out');
  if (argo !== -1 && process.argv[argo + 1]) {
    OUTPUT_DIR = path.resolve(process.cwd(), process.argv[argo + 1]);
  }

  const prompts = loadPrompts();

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`\n🌌 THE SYNTHETIC GODS - IMAGE GENERATION 🌌`);
  console.log(`Project: ${projectName}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Prompts: ${prompts.length} images to generate\n`);

  let success = 0;
  let failed = 0;

  for (const prompt of prompts) {
    const outputPath = path.join(OUTPUT_DIR, prompt.file);

    // Skip if already exists (idempotent)
    if (fs.existsSync(outputPath)) {
      console.log(`⊘ Skipped (exists): ${prompt.file}`);
      continue;
    }

    console.log(`🎨 Generating: ${prompt.file}`);
    console.log(`   Prompt: ${prompt.prompt.slice(0, 80)}...`);

    // Prompts may use nested paths (e.g. "characters/x.jpg"), so make sure the
    // parent directory exists before writing.
    const parentDir = path.dirname(outputPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    try {
      // Flux.2 Klein 4B requires dimensions that are multiples of 16.
      // An explicit width/height on the prompt entry always wins, so
      // non-square deliverables (e.g. 1200x630 social cards) are possible.
      const isBanner = prompt.file.startsWith('banner-');
      const isBackground = prompt.file.startsWith('bg-');

      let width, height;
      if (Number.isInteger(prompt.width) && Number.isInteger(prompt.height)) {
        width = prompt.width;
        height = prompt.height;
      } else if (isBanner) {
        width = 1024;
        height = 576; // 16:9 compatible
      } else if (isBackground) {
        width = 1024;
        height = 1024; // Square for tiling
      } else {
        width = 1024;
        height = 1024; // Square for characters/scenes
      }
      
      await generateImage(prompt.prompt, outputPath, {
        width,
        height
      });
      success++;

      // Rate limiting - be nice to the API
      await new Promise(r => setTimeout(r, 3000));
    } catch (e) {
      console.error(`✗ Failed: ${prompt.file} - ${e.message}`);
      failed++;
    }
  }

  console.log(`\n✅ Complete: ${success} generated, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});