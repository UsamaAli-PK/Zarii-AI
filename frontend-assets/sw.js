/* ZARii AI Service Worker — App Shell Cache */
const CACHE = 'zarii-v2';
const SHELL = [
  '/',
  '/styles.css?v=4',
  '/src/api.js?v=4',
  '/components/shared.jsx?v=4',
  '/components/Landing.jsx?v=4',
  '/components/Onboarding.jsx?v=4',
  '/components/Dashboard.jsx?v=4',
  '/components/Analyze.jsx?v=4',
  '/components/Pages.jsx?v=4',
  '/components/WhatsAppComingSoon.jsx?v=4',
  '/src/app.jsx?v=4',
  '/assets/farmer-badge.png',
  '/assets/zarii-full-logo.png',
  '/assets/zarii-logo.png',
  '/manifest.json',
];

// Install — pre-cache shell assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

// Activate — delete old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — network first for API, cache first for assets
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Always fetch API calls fresh — never cache
  if (url.pathname.startsWith('/api/')) return;

  // For navigation requests (HTML pages) — network first, fall back to cached shell
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/'))
    );
    return;
  }

  // For static assets — cache first, update in background
  e.respondWith(
    caches.match(e.request).then(cached => {
      const networkFetch = fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
      return cached || networkFetch;
    })
  );
});
