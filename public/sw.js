const PUBLIC_CACHE = 'lotmerit-public-v4';
const SUPERSEDED_CACHES = new Set(['dealflow-v1', 'dealflow-v2', 'dealflow-v3', 'dealflow-api-v1']);
const OFFLINE_URL = '/offline';
const RESTRICTED_CACHE_CONTROL = /(?:^|,)\s*(?:private|no-store|no-cache)\b/i;

const PRECACHE = [
  OFFLINE_URL,
  '/manifest.json',
  '/brand/lotmerit-mark.png',
  '/icons/icon-96x96.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

const PUBLIC_FILES = new Set([
  '/manifest.json',
  '/brand/lotmerit-mark.png',
  '/example-property.webp',
  '/favicon.ico',
  '/favicon.png',
]);

function isPublicAsset(pathname) {
  return PUBLIC_FILES.has(pathname)
    || pathname.startsWith('/_next/static/')
    || /^\/icons\/(?:icon-\d+x\d+\.png|icon\.svg|apple-touch-icon\.png)$/.test(pathname);
}

function permitsOfflineStorage(response, offlinePage = false) {
  if (response.status !== 200 || response.redirected || response.type === 'opaque') return false;

  const controls = response.headers.get('Cache-Control') || '';
  const vary = (response.headers.get('Vary') || '').toLowerCase().split(',').map((name) => name.trim());
  const isHtml = /^text\/html\b/i.test(response.headers.get('Content-Type') || '');
  return isHtml === offlinePage
    && !RESTRICTED_CACHE_CONTROL.test(controls)
    && !vary.some((name) => name === '*' || name === 'cookie' || name === 'authorization');
}

async function cacheIfPublic(request, response, offlinePage = false) {
  if (!permitsOfflineStorage(response, offlinePage)) return;
  try {
    const cache = await caches.open(PUBLIC_CACHE);
    await cache.put(request, response.clone());
  } catch {
    // Storage failures must not prevent online responses.
  }
}

async function readPublicCache(request) {
  try {
    const cache = await caches.open(PUBLIC_CACHE);
    return await cache.match(request);
  } catch {
    return undefined;
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    await Promise.allSettled(PRECACHE.map(async (path) => {
      const request = new Request(new URL(path, self.location.origin), {
        credentials: 'omit',
        cache: 'reload',
      });
      await cacheIfPublic(request, await fetch(request), path === OFFLINE_URL);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => SUPERSEDED_CACHES.has(name)).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

async function navigate(request) {
  try {
    return await fetch(request, { cache: 'no-store' });
  } catch {
    const offlinePage = await readPublicCache(new URL(OFFLINE_URL, self.location.origin).href);
    return new Response(
      offlinePage?.body ?? '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Offline</title><main><h1>You’re offline</h1><p>Check your internet connection and try again.</p></main>',
      {
        status: 503,
        headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
      },
    );
  }
}

async function loadPublicAsset(request) {
  try {
    const response = await fetch(request, { credentials: 'omit' });
    await cacheIfPublic(request, response);
    return response;
  } catch {
    return (await readPublicCache(request)) ?? Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (url.pathname === '/api' || url.pathname.startsWith('/api/') || request.headers.has('Authorization')) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }

  // Navigations always fetch the server. Only a generic page can be served offline.
  if (request.mode === 'navigate') {
    event.respondWith(navigate(request));
    return;
  }

  const requestControls = request.headers.get('Cache-Control') || '';
  if (isPublicAsset(url.pathname) && request.cache !== 'no-store' && !RESTRICTED_CACHE_CONTROL.test(requestControls)) {
    event.respondWith(loadPublicAsset(request));
  } else {
    event.respondWith(fetch(request, { cache: 'no-store' }));
  }
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
