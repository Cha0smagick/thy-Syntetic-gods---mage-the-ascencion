#!/usr/bin/env node
/**
 * run_lighthouse.mjs — run `lhci autorun` with a Chrome binary we can actually drive.
 *
 * Why this exists: Lighthouse needs CHROME_PATH pointed at a working browser, but an
 * npm script cannot set an environment variable portably. `FOO=bar cmd` is POSIX-only
 * and `$env:FOO='bar'; cmd` is PowerShell-only, while npm runs scripts through cmd.exe
 * on Windows and /bin/sh everywhere else. Doing it in Node sidesteps both.
 *
 * It also deliberately does NOT start its own web server: lighthouserc.json already
 * declares collect.startServerCommand, and lhci starts and reaps that server itself.
 * The previous version spawned a detached one that outlived the run and then held port
 * 8080 hostage for the next command.
 *
 * Any extra arguments are forwarded to lhci, e.g. a fast single pass:
 *   node scripts/run_lighthouse.mjs --collect.numberOfRuns=1
 */
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// 1. Resolve the browser. find_chrome.mjs prints the path on stdout and exits
//    non-zero when it finds nothing, so let its message through untouched.
const found = spawnSync(process.execPath, [path.join(root, 'scripts', 'find_chrome.mjs')], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'inherit'],
});

if (found.status !== 0) {
  console.error('lighthouse:local aborted — no usable Chrome/Chromium binary.');
  process.exit(found.status ?? 1);
}

const chromePath = found.stdout.trim();
console.log(`lighthouse:local — CHROME_PATH=${chromePath}`);

// 2. Run lhci, letting it own the server, and relay its exit code.
const child = spawn('npx', ['lhci', 'autorun', ...process.argv.slice(2)], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, CHROME_PATH: chromePath },
  shell: process.platform === 'win32',
});

child.on('error', (err) => {
  console.error('lighthouse:local failed to start lhci:', err.message);
  process.exit(1);
});

child.on('close', (code) => process.exit(code ?? 1));