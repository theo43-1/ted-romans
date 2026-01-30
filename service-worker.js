const CACHE_NAME = 'ted-romans-v1.0';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/auth.html',
  '/ads.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/images/teddy.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Installation
self.addEventListener('install', event => {
  console.log('[Service Worker] Installation');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[Service Worker] Mise en cache des assets statiques');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activation');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Stratégie: Cache First, Network Fallback
self.addEventListener('fetch', event => {
  // Ne pas intercepter les requêtes d'analytics
  if (event.request.url.includes('google-analytics')) return;
  
  // Pour les pages HTML: Network First
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request).then(cached => cached || caches.match('/')))
    );
    return;
  }

  // Pour les assets statiques: Cache First
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        return cached || fetch(event.request)
          .then(response => {
            // Mettre en cache les nouvelles ressources
            if (!event.request.url.startsWith('chrome-extension')) {
              const clone = response.clone();
              caches.open(DYNAMIC_CACHE).then(cache => cache.put(event.request, clone));
            }
            return response;
          })
          .catch(error => {
            console.error('[Service Worker] Fetch échoué:', error);
            // Retourner une page offline pour les pages
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Gestion des push notifications
self.addEventListener('push', event => {
  const data = event.data?.json() || { title: 'TED Romans', body: 'Nouveau chapitre disponible!' };
  
  const options = {
    body: data.body,
    icon: '/images/teddy.png',
    badge: '/images/teddy.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});