/**
 * Vitest setup file - configures global mocks for jsdom environment
 */

import { vi } from 'vitest';

// Mock crypto.randomUUID for consistent testing
vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9)),
});

// Mock matchMedia
vi.stubGlobal('matchMedia', vi.fn(() => ({
  matches: false,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
})));

// Mock requestAnimationFrame
vi.stubGlobal('requestAnimationFrame', vi.fn((cb) => setTimeout(cb, 16)));
vi.stubGlobal('cancelAnimationFrame', vi.fn());

// Mock AudioContext
class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.destination = {};
  }
  createOscillator() {
    return {
      type: 'sine',
      frequency: { value: 440 },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }
  createGain() {
    return {
      gain: { value: 0.5 },
      connect: vi.fn(),
    };
  }
  resume() { return Promise.resolve(); }
  close() { return Promise.resolve(); }
}
vi.stubGlobal('AudioContext', MockAudioContext);
vi.stubGlobal('webkitAudioContext', MockAudioContext);

// Mock Image
class MockImage {
  constructor() {
    this.onload = null;
    this.onerror = null;
    this.src = '';
    this.width = 100;
    this.height = 100;
    // Simulate load
    setTimeout(() => this.onload?.(), 0);
  }
}
vi.stubGlobal('Image', MockImage);

// Mock localStorage
const mockStorage = {};
vi.stubGlobal('localStorage', {
  getItem: vi.fn((key) => mockStorage[key] || null),
  setItem: vi.fn((key, value) => { mockStorage[key] = value; }),
  removeItem: vi.fn((key) => { delete mockStorage[key]; }),
  clear: vi.fn(() => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }),
});

// Mock sessionStorage
vi.stubGlobal('sessionStorage', {
  getItem: vi.fn((key) => mockStorage[key] || null),
  setItem: vi.fn((key, value) => { mockStorage[key] = value; }),
  removeItem: vi.fn((key) => { delete mockStorage[key]; }),
});

// Mock navigator
vi.stubGlobal('navigator', {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  language: 'en-US',
  languages: ['en-US', 'en'],
  cookieEnabled: true,
  onLine: true,
  platform: 'Win32',
});

// Mock window.innerWidth/innerHeight
Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 768 });

// Mock HTMLElement constructor for jsdom
const originalCreateElement = document.createElement.bind(document);
document.createElement = vi.fn((tagName, options) => {
  const el = originalCreateElement(tagName, options);
  // Ensure style object exists
  if (!el.style) el.style = {};
  // Ensure classList methods
  if (!el.classList) {
    el.classList = {
      add: vi.fn(),
      remove: vi.fn(),
      toggle: vi.fn(),
      contains: vi.fn(),
      replace: vi.fn(),
    };
  }
  // Ensure dataset
  if (!el.dataset) el.dataset = {};
  return el;
});

// Suppress specific console errors in tests
const originalConsoleError = console.error;
console.error = (...args) => {
  // Filter out known acceptable errors
  const msg = args.join(' ');
  if (
    msg.includes('Content Security Policy') ||
    msg.includes('favicon') ||
    msg.includes('404')
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};