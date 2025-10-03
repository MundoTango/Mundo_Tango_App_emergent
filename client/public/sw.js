/**
 * ESA LIFE CEO 61x21 - Enhanced Service Worker (Phase 12)
 * Advanced caching strategies with offline support and background sync
 */

const CACHE_VERSION = 'v2.0.1-memories-fix';
const CACHE_NAMES = {
  STATIC: `static-${CACHE_VERSION}`,
  DYNAMIC: `dynamic-${CACHE_VERSION}`,
  IMAGES: `images-${CACHE_VERSION}`,
  API: `api-${CACHE_VERSION}`,
  OFFLINE: 'offline-queue'
};

// Static resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/favicon.ico'
];

// API endpoints that should be cached
const CACHEABLE_API_PATTERNS = [
  /\/api\/profile\/public/,
  /\/api\/events\/public/,
  /\/api\/communities/,
  /\/api\/groups\/city/,
  /\/api\/memories\/feed/
];

// Network timeout for fetch requests
const NETWORK_TIMEOUT = 3000;

// ============= Install Event =============
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAMES.STATIC);
      await cache.addAll(STATIC_ASSETS);
      
      // Pre-cache critical routes
      const criticalRoutes = [
        '/login',
        '/register',
        '/profile',
        '/events',
        '/community'
      ];
      
      try {
        await cache.addAll(criticalRoutes);
      } catch (error) {
        console.warn('[ServiceWorker] Some routes failed to cache:', error);
      }
      
      await self.skipWaiting();
    })()
  );
});

// ============= Activate Event =============
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheNames = await caches.keys();
      const currentCaches = Object.values(CACHE_NAMES);
      
      await Promise.all(
        cacheNames
          .filter(name => !currentCaches.includes(name))
          .map(name => caches.delete(name))
      );
      
      await self.clients.claim();
    })()
  );
});

// ============= Fetch Event =============
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    if (request.method === 'POST' && url.pathname.startsWith('/api/')) {
      // Handle offline POST requests
      event.respondWith(handleOfflinePost(request));
    }
    return;
  }

  // Handle different resource types with appropriate strategies
  // CRITICAL FIX: Skip service worker for API requests in development
  // This prevents caching of error responses and allows direct server communication
  if (url.pathname.startsWith('/api/')) {
    return; // Let the request pass through to the server without service worker intervention
  } else if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
  } else if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(handleStaticAsset(request));
  } else {
    event.respondWith(handleGeneralRequest(request));
  }
});

// ============= Caching Strategies =============

// Network First with Cache Fallback (for API)
async function handleApiRequest(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_NAMES.API);
  
  try {
    const networkResponse = await fetchWithTimeout(request, NETWORK_TIMEOUT);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const shouldCache = CACHEABLE_API_PATTERNS.some(pattern => 
        pattern.test(request.url)
      );
      
      if (shouldCache) {
        await cache.put(request, networkResponse.clone());
      }
    }
    
    return networkResponse;
  } catch (error) {
    // Try cache on network failure
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('[ServiceWorker] Serving API from cache:', request.url);
      return cachedResponse;
    }
    
    // Return error response
    return new Response(
      JSON.stringify({ error: 'Network error', offline: true }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Cache First with Network Fallback (for images)
async function handleImageRequest(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_NAMES.IMAGES);
  
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    // Update cache in background
    fetchAndCache(request, cache);
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetchWithTimeout(request, NETWORK_TIMEOUT);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return placeholder image
    return new Response(
      `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#e0f2fe"/>
        <text x="50%" y="50%" text-anchor="middle" fill="#64748b">Image unavailable</text>
      </svg>`,
      {
        headers: { 'Content-Type': 'image/svg+xml' }
      }
    );
  }
}

// Stale While Revalidate (for static assets)
async function handleStaticAsset(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_NAMES.STATIC);
  
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });
  
  return cachedResponse || fetchPromise;
}

// Network First with Offline Page Fallback
async function handleGeneralRequest(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_NAMES.DYNAMIC);
  
  try {
    const networkResponse = await fetchWithTimeout(request, NETWORK_TIMEOUT);
    
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html') || new Response('Offline');
    }
    
    throw error;
  }
}

// ============= Offline Support =============
async function handleOfflinePost(request: Request): Promise<Response> {
  try {
    const response = await fetch(request.clone());
    return response;
  } catch (error) {
    // Queue for background sync
    const queue = await caches.open(CACHE_NAMES.OFFLINE);
    await queue.put(request.url + Date.now(), request.clone());
    
    // Register sync event
    if ('sync' in self.registration) {
      await self.registration.sync.register('offline-posts');
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        offline: true, 
        message: 'Request queued for sync' 
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// ============= Background Sync =============
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'offline-posts') {
    event.waitUntil(syncOfflineRequests());
  }
});

async function syncOfflineRequests(): Promise<void> {
  const queue = await caches.open(CACHE_NAMES.OFFLINE);
  const requests = await queue.keys();
  
  for (const request of requests) {
    try {
      const cachedRequest = await queue.match(request);
      if (!cachedRequest) continue;
      
      const response = await fetch(cachedRequest.clone());
      
      if (response.ok) {
        await queue.delete(request);
        
        // Notify clients of successful sync
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_SUCCESS',
            url: request.url
          });
        });
      }
    } catch (error) {
      console.error('[ServiceWorker] Sync failed:', error);
    }
  }
}

// ============= Push Notifications =============
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'New notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('MundoTango', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    self.clients.openWindow('/')
  );
});

// ============= Utility Functions =============
function fetchWithTimeout(request: Request, timeout: number): Promise<Response> {
  return Promise.race([
    fetch(request),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
}

async function fetchAndCache(request: Request, cache: Cache): Promise<void> {
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response);
    }
  } catch (error) {
    // Silent fail for background updates
  }
}

// ============= Performance Monitoring =============
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data?.type === 'GET_CACHE_SIZE') {
    getCacheSize().then(size => {
      event.ports[0].postMessage({ type: 'CACHE_SIZE', size });
    });
  }
});

async function getCacheSize(): Promise<number> {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }
  
  return totalSize;
}