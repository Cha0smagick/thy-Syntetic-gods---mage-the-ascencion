/**
 * Service Worker for The Synthetic Gods Grimoire
 * Provides offline support and caching for Geocities-style static site
 * Version: 1.0.0
 */

const CACHE_NAME = 'synthetic-gods-ee19267b26d3';
const OFFLINE_URL = 'index.html';

// Assets to cache on install
const PRECACHE_ASSETS = [
  'index.html',
  'pages/neon-oracle.html',
  'css/geocities.css',
  'js/geocities.js',
  'images/banner-synthetic-gods.jpg',
  'images/under-construction.jpg',
  'images/sigil-workshop.jpg',
  'images/egregore-community.jpg',
  'images/astrosoma-archivist.jpg',
  'images/astrosoma-router.jpg',
  'images/astrosoma-glitch.jpg',
  'images/astrosoma-counter.jpg',
  'images/astrosoma-ritual.jpg',
  'images/sigil-ascii.png',
  'images/sigil-html-source.png',
  'images/egregore-birth.png',
  'images/egregore-war.png',
  'images/synthetic-muse.png',
  'sitemap.xml',
  'robots.txt',
  'sitemap.html',
];

// Character portraits (cached on first visit)
const CHARACTER_PORTRAITS = [
  'images/characters/technocracy-voss.jpg',
  'images/characters/technocracy-chen.jpg',
  'images/characters/technocracy-keres.jpg',
  'images/characters/technocracy-volkov.png',
  'images/characters/technocracy-smith.jpg',
  'images/characters/technocracy-patel.jpg',
  'images/characters/technocracy-kowalski.png',
  'images/characters/technocracy-lovelace.jpg',
  'images/characters/technocracy-sato.jpg',
  'images/characters/technocracy-architect.jpg',
  'images/characters/virtual-adepts-webspinner.jpg',
  'images/characters/virtual-adepts-zero-cool.png',
  'images/characters/virtual-adepts-acid-burn.jpg',
  'images/characters/virtual-adepts-cereal-killer.jpg',
  'images/characters/virtual-adepts-prophet.jpg',
  'images/characters/virtual-adepts-ghost.png',
  'images/characters/virtual-adepts-lady-ada.jpg',
  'images/characters/virtual-adepts-root.jpg',
  'images/characters/virtual-adepts-packet-witch.jpg',
  'images/characters/virtual-adepts-neon-samurai.jpg',
  'images/characters/cypherpunks-satoshi.jpg',
  'images/characters/cypherpunks-cipher.png',
  'images/characters/cypherpunks-anonymous.jpg',
  'images/characters/cypherpunks-snowden.jpg',
  'images/characters/cypherpunks-assange.jpg',
  'images/characters/cypherpunks-merkle.jpg',
  'images/characters/cypherpunks-diffie.jpg',
  'images/characters/cypherpunks-hellman.jpg',
  'images/characters/cypherpunks-tor.jpg',
  'images/characters/cypherpunks-pgp.jpg',
  'images/characters/hollow-ones-raven.jpg',
  'images/characters/hollow-ones-lilith.png',
  'images/characters/hollow-ones-malakai.jpg',
  'images/characters/hollow-ones-vesper.jpg',
  'images/characters/hollow-ones-crowley.jpg',
  'images/characters/hollow-ones-spare.png',
  'images/characters/hollow-ones-baphomet.jpg',
  'images/characters/hollow-ones-eris.jpg',
  'images/characters/hollow-ones-nyx.jpg',
  'images/characters/hollow-ones-khaos.jpg',
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
                  '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect fill="#000" width="512" height="512"><text x="256" y="256" font-family="monospace" font-size="16" fill="#0F0" text-anchor="middle">IMAGE UNAVAILABLE OFFLINE</text></svg>',
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
    icon: new URL('images/banner-synthetic-gods.jpg', self.registration.scope).href,
    badge: new URL('images/banner-synthetic-gods.jpg', self.registration.scope).href,
    vibrate: [100, 50, 100],
    data: {
      url: data.url || self.registration.scope
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
      clients.openWindow(event.notification.data.url || self.registration.scope)
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