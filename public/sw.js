// Very small service worker for offline caching (demo)
const CACHE = 'aegis-v1';
const toCache = ['/', '/dashboard.html', '/index.html', '/register.html', '/src/api.js'];
self.addEventListener('install', ev=>{ ev.waitUntil(caches.open(CACHE).then(c=>c.addAll(toCache))); });
self.addEventListener('fetch', ev=>{ ev.respondWith(caches.match(ev.request).then(r=>r||fetch(ev.request))); });
