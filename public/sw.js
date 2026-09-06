// Service Worker for Progressive Web App (PWA)
// This enables offline functionality and caching

const CACHE_NAME = 'dealflow-v2';
const API_CACHE_NAME = 'dealflow-api-v1';
const OFFLINE_URL = '/offline';

// Max age for API cache (5 minutes)
const API_CACHE_MAX_AGE = 5 * 60 * 1000;

// Files to cache on install
const STATIC_CACHE = [
  '/',
  '/dashboard',
  '/dashboard/deals',
  '/dashboard/analytics',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// API routes that benefit from stale-while-revalidate
const API_CACHE_PATTERNS = [
  '/api/deals',
  '/api/analytics',
  '/api/notifications',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching static assets');
      return cache.addAll(STATIC_CACHE);
    })
  );
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => {
            console.log('[ServiceWorker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  
  // Claim clients immediately
  return self.clients.claim();
});

// Check if URL matches API cache patterns
function shouldCacheAPI(url) {
  const pathname = new URL(url).pathname;
  return API_CACHE_PATTERNS.some(pattern => pathname.startsWith(pattern));
}

// Stale-while-revalidate for API requests
async function staleWhileRevalidate(request) {
  const cache = await caches.open(API_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Start network fetch in background
  const networkFetch = fetch(request).then(async (response) => {
    if (response.status === 200) {
      // Store with timestamp
      const responseToCache = response.clone();
      const headers = new Headers(responseToCache.headers);
      headers.append('sw-cached-at', Date.now().toString());
      
      const body = await responseToCache.blob();
      const cachedResponseWithTime = new Response(body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers,
      });
      
      cache.put(request, cachedResponseWithTime);
    }
    return response;
  }).catch(() => null);

  // Return cached response immediately if available and not too old
  if (cachedResponse) {
    const cachedAt = cachedResponse.headers.get('sw-cached-at');
    const age = cachedAt ? Date.now() - parseInt(cachedAt) : Infinity;
    
    // If cache is fresh enough, return it
    if (age < API_CACHE_MAX_AGE) {
      // Still revalidate in background (fire and forget)
      networkFetch.catch(() => {});
      return cachedResponse;
    }
  }

  // Wait for network if no cache or cache is stale
  const networkResponse = await networkFetch;
  if (networkResponse) {
    return networkResponse;
  }

  // Fallback to cached response even if stale
  if (cachedResponse) {
    return cachedResponse;
  }

  // No cache, no network
  return new Response(JSON.stringify({ error: 'Offline' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip POST requests and other non-GET methods
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip auth-related routes - these should always go to the server
  const url = new URL(event.request.url);
  if (
    url.pathname.startsWith('/login') ||
    url.pathname.startsWith('/auth') ||
    url.pathname.startsWith('/onboarding') ||
    url.searchParams.has('invite')
  ) {
    return;
  }

  // Use stale-while-revalidate for API routes that benefit from it
  if (shouldCacheAPI(event.request.url)) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  // Skip other API routes
  if (url.pathname.startsWith('/api')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response because it can only be consumed once
        const responseToCache = response.clone();

        // Cache successful GET requests
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      })
      .catch(() => {
        // If network fails, try to serve from cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }

          // If not in cache and offline, show offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }

          // For other requests, return a basic offline response
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain',
            }),
          });
        });
      })
  );
});

// Background sync for form submissions (optional enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-deals') {
    event.waitUntil(syncDeals());
  }
});

async function syncDeals() {
  console.log('[ServiceWorker] Syncing offline deals...');
  // This would sync any deals submitted while offline
  // Implementation depends on your IndexedDB storage
}

// Push notification support (optional)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'LotMerit Notification';
  const options = {
    body: data.body || 'New activity on your deals',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    tag: data.tag || 'default',
    data: data,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if a window is already open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
