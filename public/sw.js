/*
 * Service worker клуба «Второе дыхание».
 * Стратегия: network-first для навигации (чтобы после деплоя всегда
 * открывалась свежая версия) и stale-while-revalidate для статики.
 * При изменении логики обязательно увеличивайте CACHE_VERSION.
 */
const CACHE_VERSION = 'v4';
const CACHE_NAME = `vtoroe-dyhanie-${CACHE_VERSION}`;
const BASE = '';
const PRECACHE = [`${BASE}/`, `${BASE}/index.html`, `${BASE}/manifest.json`, `${BASE}/logo.jpg`];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Не вмешиваемся в не-GET запросы и сторонние ресурсы (картинки, шрифты)
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Навигация: сначала сеть, при офлайне — кэш
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(`${BASE}/index.html`, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(`${BASE}/index.html`);
          return cached || Response.error();
        })
    );
    return;
  }

  // Статика: отдаём из кэша и параллельно обновляем
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
