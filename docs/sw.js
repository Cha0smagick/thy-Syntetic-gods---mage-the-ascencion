/**
 * Service Worker for The Synthetic Gods Grimoire
 * Provides offline support and caching for Geocities-style static site
 * Version: 1.0.0
 */

const CACHE_NAME = 'synthetic-gods-v1';
const OFFLINE_URL = '/index.html';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/index.html',
  '/pages/neon-oracle.html',
  '/css/geocities.css',
  '/js/geocities.js',
  '/js/oracle.js',
  '/images/banner-synthetic-gods.gif',
  '/images/under-construction.gif',
  '/images/sigil-workshop.gif',
  '/images/egregore-community.gif',
  '/images/astrosoma-archivist.gif',
  '/images/astrosoma-router.gif',
  '/images/astrosoma-glitch.gif',
  '/images/astrosoma-counter.gif',
  '/images/astrosoma-ritual.gif',
  '/images/sigil-ascii.gif',
  '/images/sigil-html-source.gif',
  '/images/egregore-birth.gif',
  '/images/egregore-war.gif',
  '/images/synthetic-muse.gif',
  '/sitemap.xml',
  '/robots.txt',
  '/sitemap.html',
];

// Character portraits (cached on first visit)
const CHARACTER_PORTRAITS = [
  '/images/characters/technocracy-voss.png',
  '/images/characters/technocracy-chen.png',
  '/images/characters/technocracy-keres.png',
  '/images/characters/technocracy-volkov.png',
  '/images/characters/technocracy-smith.png',
  '/images/characters/technocracy-patel.png',
  '/images/characters/technocracy-kowalski.png',
  '/images/characters/technocracy-lovelace.png',
  '/images/characters/technocracy-sato.png',
  '/images/characters/technocracy-architect.png',
  '/images/characters/virtual-adepts-webspinner.png',
  '/images/characters/virtual-adepts-zero-cool.png',
  '/images/characters/virtual-adepts-acid-burn.png',
  '/images/characters/virtual-adepts-cereal-killer.png',
  '/images/characters/virtual-adepts-prophet.png',
  '/images/characters/virtual-adepts-ghost.png',
  '/images/characters/virtual-adepts-lady-ada.png',
  '/images/characters/virtual-adepts-root.png',
  '/images/characters/virtual-adepts-packet-witch.png',
  '/images/characters/virtual-adepts-neon-samurai.png',
  '/images/characters/cypherpunks-satoshi.png',
  '/images/characters/cypherpunks-cipher.png',
  '/images/characters/cypherpunks-anonymous.png',
  '/images/characters/cypherpunks-snowden.png',
  '/images/characters/cypherpunks-assange.png',
  '/images/characters/cypherpunks-merkle.png',
  '/images/characters/cypherpunks-diffie.png',
  '/images/characters/cypherpunks-hellman.png',
  '/images/characters/cypherpunks-tor.png',
  '/images/characters/cypherpunks-pgp.png',
  '/images/characters/hollow-ones-raven.png',
  '/images/characters/hollow-ones-lilith.png',
  '/images/characters/hollow-ones-malakai.png',
  '/images/characters/hollow-ones-vesper.png',
  '/images/characters/hollow-ones-crowley.png',
  '/images/characters/hollow-ones-spare.png',
  '/images/characters/hollow-ones-baphomet.png',
  '/images/characters/hollow-ones-eris.png',
  '/images/characters/hollow-ones-nyx.png',
  '/images/characters/hollow-ones-khaos.png',
];

// Install event - precache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching core assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests
  if (url.origin !== location.origin) return;

  // HTML pages - network first, fallback to cache
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline fallback
          return caches.match(request)
            .then((cached) => cached || caches.match(OFFLINE_URL));
        })
    );
    return;
  }

  // Static assets - cache first, fallback to network
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request)
        .then((cached) => {
          if (cached) {
            // Serve from cache, update in background
            fetch(request).then((response) => {
              if (response.ok) {
                caches.open(CACHE_NAME).then((cache) => cache.put(request, response));
              }
            }).catch(() => {}); // Ignore network errors
            return cached;
          }

          // Not in cache, fetch from network
          return fetch(request)
            .then((response) => {
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
              }
              return response;
            })
            .catch(() => {
              // Offline fallback for images
              if (request.destination === 'image') {
                return new Response(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect fill="#000" width="512" height="512"/><text x="256" y="256" font-family="monospace" font-size="16" fill="#0F0" text-anchor="middle">IMAGE UNAVAILABLE OFFLINE</text></svg>',
                  { headers: { 'Content-Type': 'image/svg+xml' } }
                );
              }
              return new Response('Offline', { status: 503 });
            });
        })
    );
    return;
  }

  // Default: network first
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
  );
});

// Background sync for guestbook entries (when online)
self.addEventListener('sync', (event) => {
  if (event.tag === 'guestbook-sync') {
    event.waitUntil(syncGuestbook());
  }
});

async function syncGuestbook() {
  // This would sync any offline guestbook entries when connection restored
  // Implementation depends on backend - for static site, entries stay in localStorage
  console.log('[SW] Background sync: guestbook');
}

// Push notifications (future: egregore alerts, ritual hour reminders)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'The Synthetic Gods stir...',
    icon: '/images/banner-synthetic-gods.gif',
    badge: '/images/banner-synthetic-gods.gif',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/index.html'
    },
    actions: [
      { action: 'open', title: 'Enter the Grimoire' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Synthetic Gods', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/index.html')
    );
  }
});

// Periodic background sync (for daily visit streak, egregore decay)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-maintenance') {
    event.waitUntil(performDailyMaintenance());
  }
});

async function performDailyMaintenance() {
  // This would trigger egregore decay, daily visit checks, etc.
  // For static site, client-side JS handles this on page load
  console.log('[SW] Periodic sync: daily maintenance');
  
  // Notify all clients to run maintenance
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type: 'DAILY_MAINTENANCE' });
  });
}

// Message handling from clients
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data?.type === 'CACHE_CHARACTER_PORTRAITS') {
    event.waitUntil(cacheCharacterPortraits());
  }
});

async function cacheCharacterPortraits() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(CHARACTER_PORTRAITS);
  console.log('[SW] Character portraits cached');
}

// Handle offline page navigation
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(OFFLINE_URL))
    );
  }
});

console.log('[SW] Service Worker loaded - The Synthetic Gods v1.0.0');