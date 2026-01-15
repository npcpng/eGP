/**
 * PNG eGP System - Service Worker
 * Provides offline capabilities for forms and critical pages
 */

const CACHE_NAME = 'png-egp-v1';
const OFFLINE_CACHE = 'png-egp-offline-v1';
const FORM_DATA_STORE = 'png-egp-forms';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
];

// Pages that should work offline
const OFFLINE_PAGES = [
  '/',
  '/tenders',
  '/tenders/bidder-portal',
  '/contracts',
  '/suppliers',
  '/planning/annual-plans',
];

// API routes to cache responses
const CACHEABLE_API_ROUTES = [
  '/api/tenders',
  '/api/suppliers',
  '/api/contracts',
  '/api/catalogue',
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );

  // Activate immediately
  self.skipWaiting();
});

/**
 * Activate event - clean old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== OFFLINE_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );

  // Take control immediately
  self.clients.claim();
});

/**
 * Fetch event - handle requests with caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (we'll handle form submissions separately)
  if (request.method !== 'GET') {
    // For POST requests, attempt network first, queue if offline
    if (request.method === 'POST') {
      event.respondWith(handleFormSubmission(request));
    }
    return;
  }

  // API requests - Network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Static assets - Cache first
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Pages - Network first with offline fallback
  event.respondWith(networkFirstWithOfflineFallback(request));
});

/**
 * Network first strategy - try network, fall back to cache
 */
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

/**
 * Cache first strategy - try cache, fall back to network
 */
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.log('[SW] Failed to fetch:', request.url);
    throw error;
  }
}

/**
 * Network first with offline fallback for pages
 */
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache the page for offline use
    if (networkResponse.ok) {
      const cache = await caches.open(OFFLINE_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Offline, trying cache for:', request.url);

    // Try cached version
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page
    const offlinePage = await caches.match('/offline');
    if (offlinePage) {
      return offlinePage;
    }

    // Last resort - return a basic offline response
    return new Response(
      '<html><body><h1>Offline</h1><p>Please check your connection.</p></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

/**
 * Handle form submissions with background sync
 */
async function handleFormSubmission(request) {
  try {
    // Try to submit normally
    const response = await fetch(request.clone());
    return response;
  } catch (error) {
    // Network failed - queue for later sync
    console.log('[SW] Queueing form submission for background sync');

    // Store the form data in IndexedDB
    const formData = await request.clone().json();
    await storeFormData({
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: formData,
      timestamp: Date.now(),
    });

    // Register for background sync
    if ('sync' in self.registration) {
      await self.registration.sync.register('form-sync');
    }

    // Return a response indicating the form was queued
    return new Response(
      JSON.stringify({
        success: true,
        queued: true,
        message: 'Form submission queued for when you are back online',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 202,
      }
    );
  }
}

/**
 * Background sync event - process queued forms
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'form-sync') {
    event.waitUntil(processQueuedForms());
  }
});

/**
 * Process all queued form submissions
 */
async function processQueuedForms() {
  const db = await openFormDatabase();
  const tx = db.transaction(FORM_DATA_STORE, 'readwrite');
  const store = tx.objectStore(FORM_DATA_STORE);

  const forms = await getAllFromStore(store);

  for (const form of forms) {
    try {
      const response = await fetch(form.url, {
        method: form.method,
        headers: form.headers,
        body: JSON.stringify(form.body),
      });

      if (response.ok) {
        // Remove from queue on success
        await deleteFromStore(store, form.id);

        // Notify the client
        const clients = await self.clients.matchAll();
        clients.forEach((client) => {
          client.postMessage({
            type: 'FORM_SYNCED',
            formId: form.id,
            success: true,
          });
        });
      }
    } catch (error) {
      console.log('[SW] Failed to sync form:', form.id);
    }
  }
}

/**
 * IndexedDB helpers for form storage
 */
function openFormDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('png-egp-offline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(FORM_DATA_STORE)) {
        db.createObjectStore(FORM_DATA_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function storeFormData(data) {
  const db = await openFormDatabase();
  const tx = db.transaction(FORM_DATA_STORE, 'readwrite');
  const store = tx.objectStore(FORM_DATA_STORE);
  return store.add(data);
}

function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function deleteFromStore(store, id) {
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Push notification handler
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: data.data,
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

/**
 * Notification click handler
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Check if there's already a window open
      for (const client of clients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

console.log('[SW] Service Worker loaded');
