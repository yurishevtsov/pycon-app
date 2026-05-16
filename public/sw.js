// PyCon US 2026 — service worker
// Bump CACHE when shipping breaking changes to invalidate old caches.
const CACHE = 'pycon-app-v1';

// Pre-cache the four main routes so the app shell loads instantly,
// even on a cold first-offline visit (after this SW has installed once).
const PRECACHE = ['/', '/speakers', '/schedule', '/favorites', '/manifest.webmanifest', '/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      // addAll is atomic — if any single request fails, the SW won't install.
      // We use individual `add`s so a transient image failure doesn't block install.
      Promise.all(PRECACHE.map((url) => cache.add(url).catch(() => undefined))),
    ),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    if (cached) return cached;
    throw err;
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);
  const networkPromise = fetch(req)
    .then((res) => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || networkPromise;
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Cache-first for Next.js immutable chunks (content-hashed filenames).
  if (url.origin === self.location.origin && url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Cache-first for speaker photos served from S3 — they don't change.
  if (url.hostname === 'pycon-assets.s3.amazonaws.com') {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Stale-while-revalidate for same-origin HTML/JSON — keeps the experience snappy
  // and lets users open routes offline once they've visited them online.
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(req));
  }
});
