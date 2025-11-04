const CACHE_NAME = 'suivi-chrono-v1';
const ASSETS = [
  '/html/formulaire.html',
  '/html/button.html',
  '/html/resume.html',
  '/css/style.css',
  '/css/buttons.css',
  '/css/formulaire.css',
  '/css/resume.css',
  '/js/main.js',
  '/js/chrono.js',
  '/js/buttons.js',
  '/js/formulaire.js',
  '/js/modal.js',
  '/js/resume.js'
];
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => {
      return resp || fetch(event.request).catch(() => caches.match('/html/formulaire.html'));
    })
  );
});