/**
 * @file service-worker.js
 * @brief Service Worker pour la mise en cache des ressources de l'application "suivi-chrono".
 *
 * Permet de rendre l'application accessible hors-ligne en mettant en cache les pages HTML,
 * les fichiers CSS et JavaScript nécessaires.
 *
 * @date 2025-10-09
 * @author Lola Gauducheau
 */
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

/**
 * @brief Événement d'installation du service worker.
 */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

/**
 * @brief Événement d'activation du service worker.
 */
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

/**
 * @brief Événement de récupération des ressources (fetch).
 * @param {FetchEvent} event Événement fetch.
 */

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => {
      return resp || fetch(event.request).catch(() => caches.match('/html/formulaire.html'));
    })
  );
});