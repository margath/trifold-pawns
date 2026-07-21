// Service worker for Trifold Pawns.
// Bump CACHE_NAME any time app-shell files change so old caches get cleared out.
const CACHE_NAME = 'trifold-pawns-v1';

const APP_SHELL = [
    './',
    './index.html',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-maskable-512.png',
    './icons/apple-touch-icon.png',
    './icons/favicon-64.png',
    './default-pawns.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            // Cache each file individually so one missing file (e.g. a deployment
            // without default-pawns.json) doesn't fail the whole install.
            await Promise.all(APP_SHELL.map(async (url) => {
                try {
                    await cache.add(url);
                } catch (err) {
                    console.warn('[service-worker] Skipping cache for', url, err);
                }
            }));
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

// Stale-while-revalidate: serve from cache immediately when available (fast,
// works offline), and refresh the cache in the background from the network.
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return; // don't intercept cross-origin requests

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const networkFetch = fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.ok) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
                    }
                    return networkResponse;
                })
                .catch(() => cachedResponse);

            return cachedResponse || networkFetch;
        })
    );
});
