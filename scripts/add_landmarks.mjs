#!/usr/bin/env node
/**
 * add_landmarks.mjs — WCAG 2.4.1 (Bypass Blocks) for The Synthetic Gods.
 *
 * Every page ships all navigation inside a plain <div class="sidebar">, and the
 * page body inside a plain <div class="content-area">. Screen-reader users
 * therefore get no <nav> landmark to jump to, no <main> landmark to jump to,
 * and no keyboard way to skip the 40-link navigation block entirely.
 *
 * This script, for every .html file under docs:
 *   1. inserts a keyboard-visible "Skip to content" link as the first body child
 *   2. re-tags <div class="sidebar">  -> <nav class="sidebar" aria-label="...">
 *   3. re-tags <div class="content-area"> -> <main id="main-content" class="content-area">
 *
 * Only the TAG changes; the class attribute is preserved, so every existing CSS
 * rule keeps matching and the 1998-Geocities look is untouched.
 *
 * Idempotent: re-running is a no-op. It must be wired into prepare:deploy so
 * the landmarks survive the other generators rewriting <head>/<body>.
 */
import fs from 'fs';
import path from 'path';

const DOCS_DIR = 'docs';

const SKIP_LINK = '<a class="skip-link" href="#main-content">Skip to content</a>';

const NAV_LABEL = 'Primary navigation';
const MAIN_ID = 'main-content';

/**
 * Given the index just past an opening tag, return the index of the matching
 * close tag. Handles nesting for the tag name given.
 */
function findMatchingClose(html, afterOpen, tag) {
  const open = new RegExp(`<${tag}(?=[\\s>])`, 'gi');
  const close = new RegExp(`</${tag}\\s*>`, 'gi');
  let depth = 1; // the opening tag we were handed is depth 1
  let i = afterOpen;
  while (i < html.length) {
    open.lastIndex = i;
    close.lastIndex = i;
    const o = open.exec(html);
    const c = close.exec(html);
    if (!c) break;
    if (o && o.index < c.index) {
      // self-closing?
      const gt = html.indexOf('>', o.index);
      if (html[gt - 1] !== '/') depth++;
      i = gt + 1;
    } else {
      depth--;
      if (depth === 0) return c.index;
      i = c.index + c[0].length;
    }
  }
  return -1;
}

/** Collects [openStart, contentStart, closeStart] for every `<tag class="cls" ...>`. */
function findElements(html, tag, cls) {
  const re = new RegExp(`<${tag}(?=[\\s>])[^>]*class="[^"]*\\b${cls}\\b[^"]*"[^>]*>`, 'gi');
  const found = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    found.push({ openStart: m.index, openEnd: m.index + m[0].length, openTag: m[0] });
  }
  return found;
}

let changed = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.name.endsWith('.html')) {
      process1(full);
    }
  }
}

function process1(file) {
  let html = fs.readFileSync(file, 'utf8');
  const original = html;
  const rel = path.relative(DOCS_DIR, file);
  const notes = [];

  // ---- 3. content-area div -> <main>, back-to-front so indices stay valid ----
  const mains = findElements(html, 'div', 'content-area').filter((e) => !/<(nav|main)\b/i.test(e.openTag));
  for (let k = mains.length - 1; k >= 0; k--) {
    const el = mains[k];
    const close = findMatchingClose(html, el.openEnd, 'div');
    if (close === -1) continue;
    const openTag = el.openTag
      .replace(/^<div/i, '<main')
      .replace(/\s*\bid="[^"]*"/i, '') // main already gets its own id
      .replace(/<main/i, `<main id="${MAIN_ID}"`);
    html = html.slice(0, el.openStart) + openTag + html.slice(el.openEnd, close) + '</main>' + html.slice(close + 6);
    notes.push('main');
  }

  // ---- 2. sidebar div -> <nav> ----
  const navs = findElements(html, 'div', 'sidebar').filter((e) => !/<(nav|main)\b/i.test(e.openTag));
  for (let k = navs.length - 1; k >= 0; k--) {
    const el = navs[k];
    const close = findMatchingClose(html, el.openEnd, 'div');
    if (close === -1) continue;
    const openTag = el.openTag.replace(/^<div/i, `<nav aria-label="${NAV_LABEL}"`);
    html = html.slice(0, el.openStart) + openTag + html.slice(el.openEnd, close) + '</nav>' + html.slice(close + 6);
    notes.push('nav');
  }

  // ---- 1. skip link as first body child ----
  if (!html.includes('class="skip-link"')) {
    const b = html.search(/<body[^>]*>/i);
    if (b !== -1) {
      const at = html.indexOf('>', b) + 1;
      html = html.slice(0, at) + '\n    ' + SKIP_LINK + html.slice(at);
      notes.push('skip');
    }
  }

  if (html !== original) {
    fs.writeFileSync(file, html, 'utf8');
    changed++;
    console.log(`  ✓ ${rel}  [${notes.join(', ')}]`);
  }
}

console.log('Adding skip link + nav/main landmarks (WCAG 2.4.1)...');
walk(DOCS_DIR);
console.log(`\n✅ Complete: ${changed} files updated with landmarks`);