#!/usr/bin/env node
/**
 * find_chrome.mjs — print the path to a usable Chrome/Chromium binary.
 *
 * Why this exists: on this machine Lighthouse 12.6.1 cannot drive the system
 * Chrome (every run ends in NO_FCP / PROTOCOL_TIMEOUT), but it drives
 * Playwright's bundled Chromium perfectly well. We therefore point Lighthouse at
 * that binary via the CHROME_PATH environment variable.
 *
 * Resolution order:
 *   1. CHROME_PATH already set and valid  -> use it
 *   2. newest Playwright Chromium build    -> use it
 *   3. system Chrome / Edge               -> use it
 *   4. nothing found                      -> exit 1 with an explanatory message
 *
 * Prints only the path on stdout, so callers can capture it directly:
 *   $env:CHROME_PATH = (node scripts/find_chrome.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';

const isExe = (p) => {
  try {
    return fs.existsSync(p) && fs.statSync(p).isFile();
  } catch {
    return false;
  }
};

// 1. respect an existing, valid CHROME_PATH
if (process.env.CHROME_PATH && isExe(process.env.CHROME_PATH)) {
  console.log(process.env.CHROME_PATH);
  process.exit(0);
}

const LOCALAPPDATA = process.env.LOCALAPPDATA || '';

// 2. Playwright's bundled Chromium. Note the chrome-win64 subdirectory: a bare
//    chromium-*\chrome.exe glob matches nothing.
if (LOCALAPPDATA) {
  const pwRoot = path.join(LOCALAPPDATA, 'ms-playwright');
  const builds = [];
  try {
    for (const name of fs.readdirSync(pwRoot)) {
      const m = /^chromium-(\d+)$/.exec(name);
      if (!m) continue;
      const exe = path.join(
        pwRoot,
        name,
        'chrome-win64',
        'chrome.exe',
      );
      if (isExe(exe)) builds.push({ version: Number(m[1]), exe });
    }
  } catch {
    /* ms-playwright not installed */
  }
  if (builds.length) {
    builds.sort((a, b) => b.version - a.version);
    console.log(builds[0].exe);
    process.exit(0);
  }
}

// 3. fall back to a system browser
const candidates = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  process.env.PROGRAMFILES &&
    path.join(process.env.PROGRAMFILES, 'Google/Chrome/Application/chrome.exe'),
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

for (const c of candidates) {
  if (isExe(c)) {
    console.log(c);
    process.exit(0);
  }
}

console.error(
  'No Chrome/Chromium binary found.\n' +
    'Install one with:  npx playwright install chromium\n' +
    'or set CHROME_PATH to an existing Chrome executable.',
);
process.exit(1);