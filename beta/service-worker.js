/* The Tri-Fold Pawn Maker - offline service worker.
 *
 * Strategy:
 *   - navigations  : network-first, falling back to the cached shell, so a
 *                    freshly deployed build is picked up immediately when
 *                    online but the tool still opens at the table with no wifi.
 *   - static assets: stale-while-revalidate - instant from cache, refreshed in
 *                    the background for next launch.
 *
 * Bump CACHE_VERSION on every deploy; the activate handler evicts old caches.
 */
const CACHE_VERSION = 'trifold-v2026.08.03.01';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-64.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-64.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      // addAll rejects the whole batch if any single file 404s, which would
      // leave the app permanently uninstallable. Add them individually.
      .then(cache => Promise.all(SHELL.map(url =>
        cache.add(url).catch(err => console.warn('[sw] skipped', url, err))
      )))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;   // never touch cross-origin

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then(c => c.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request)
        .then(response => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then(c => c.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

// Lets the page trigger an immediate update rather than waiting for all tabs
// to close (see the "update ready" prompt in index.html).
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
