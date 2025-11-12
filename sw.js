const CACHE_NAME = 'resistor-calculator-cache-v1';
// Lista de archivos a cachear. Estos son la "cáscara" de la aplicación.
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/components/Resistor.tsx',
  '/components/ColorSelector.tsx',
  '/components/CameraInput.tsx',
  '/components/InverseCalculator.tsx',
  '/components/LearnMore.tsx',
  '/constants.ts',
  '/types.ts',
  '/services/geminiService.ts',
  'https://cdn.tailwindcss.com'
];

// Evento de instalación: se abre el caché y se añaden los archivos de la app.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de fetch: intercepta las peticiones de red.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si el recurso está en el caché, se devuelve desde ahí.
        if (response) {
          return response;
        }
        // Si no, se busca en la red.
        return fetch(event.request);
      }
    )
  );
});

// Evento de activación: limpia cachés viejos para mantener la app actualizada.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
