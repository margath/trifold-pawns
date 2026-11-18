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
// The beta app shares an origin with the main app, so it keeps to its own
// 'trifold-beta-' cache names and never touches (or is touched by) the main app's.
const CACHE_PREFIX = 'trifold-beta-';
const CACHE_VERSION = CACHE_PREFIX + 'v2026.11.17.02';
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

// The pages the app cannot open offline without. If either fails to cache the
// install is abandoned, so the previous worker (and its cache) stays in charge
// instead of being replaced by one with no shell to fall back on.
const REQUIRED = ['./', './index.html'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache =>
      // addAll rejects the whole batch if any single file 404s, which would
      // leave the app permanently uninstallable. Add them individually, and
      // only treat the required pages as fatal.
      Promise.all(SHELL.map(url =>
        cache.add(url).then(() => null, err => {
          console.warn('[sw] could not cache', url, err);
          return REQUIRED.includes(url) ? url : null;
        })
      )).then(failed => {
        const missing = failed.filter(Boolean);
        if (missing.length) {
          // Drop the half-filled cache; activate would otherwise keep it.
          return caches.delete(CACHE_VERSION).then(() => {
            throw new Error('shell not cached: ' + missing.join(', '));
          });
        }
      })
    ).then(() => self.skipWaiting())
  );
});

// Earlier beta builds used the main app's unprefixed 'trifold-v...' cache names.
// Those can't be told apart by name, so look inside: a cache whose every entry
// lives under this worker's own scope (/beta/) is a leftover beta cache; the
// main app's cache holds pages from outside that path and is left alone.
function dropIfLegacyBeta(name) {
  const scopePath = new URL(self.registration.scope).pathname;
  return caches.open(name)
    .then(cache => cache.keys())
    .then(reqs => {
      const allBeta = reqs.length > 0 && reqs.every(r => new URL(r.url).pathname.startsWith(scopePath));
      return allBeta ? caches.delete(name) : false;
    })
    .catch(() => false);
}

// Lookups only ever consult this build's cache, so a leftover cache from any
// other build can never answer a request.
function cachedResponse(request) {
  return caches.open(CACHE_VERSION).then(c => c.match(request));
}

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => k.startsWith(CACHE_PREFIX)
          ? caches.delete(k)
          : dropIfLegacyBeta(k))
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
        .catch(() => cachedResponse(request).then(r => r || cachedResponse('./index.html')))
    );
    return;
  }

  event.respondWith(
    cachedResponse(request).then(cached => {
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
