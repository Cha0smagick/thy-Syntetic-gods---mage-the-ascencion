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
const PROMPTS_FILE = path.join(PROJECT_ROOT, 'docs', 'image_prompts.json');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'docs', 'images');
const ENV_FILE = path.join('D:', 'Videos', 'Crear_videos', '.env');

// Load API key from .env
function loadApiKey() {
  try {
    const envContent = fs.readFileSync(ENV_FILE, 'utf8');
    const match = envContent.match(/NVIDIA_API_KEY\s*=\s*(.+)/);
    if (match) return match[1].trim();
  } catch (e) {
    console.error('Could not read .env file:', e.message);
  }
  // Fallback to environment variable
  return process.env.NVIDIA_API_KEY;
}

const API_KEY = loadApiKey();

if (!API_KEY) {
  console.error('ERROR: NVIDIA_API_KEY not found in .env or environment');
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
    // Flux.2 Klein 4B API only accepts: prompt, width, height, seed
    const payload = JSON.stringify({
      prompt: prompt,
      width: options.width || 1024,
      height: options.height || 1024,
      seed: options.seed || Math.floor(Math.random() * 2147483647)
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

    try {
      // Flux.2 Klein 4B requires dimensions that are multiples of 16
      // Use 1024x1024 for square, 1024x576 for 16:9, 1280x720 for 16:9 HD
      const isBanner = prompt.file.startsWith('banner-');
      const isBackground = prompt.file.startsWith('bg-');
      
      let width, height;
      if (isBanner) {
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