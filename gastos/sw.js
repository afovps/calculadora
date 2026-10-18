// Service worker: permite abrir la app sin conexión una vez instalada.
// Red primero (para recibir actualizaciones) y caché si no hay conexión.
const CACHE = 'gastos-v1';
const APP = ['./', 'index.html', 'manifest.json', 'icon.svg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(APP.map(u => c.add(u).catch(() => {}))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Los datos del servidor local (api/ y tickets/) nunca se cachean
  if (e.request.method !== 'GET' || url.origin !== location.origin || /\/(api|tickets)\//.test(url.pathname)) return;
  e.respondWith(fetch(e.request)
    .then(r => {
      if (r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); }
      return r;
    })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html'))));
});
