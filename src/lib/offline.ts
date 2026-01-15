/**
 * Offline Form Management
 * Handles storing and syncing form data when offline
 */

const DB_NAME = 'png-egp-offline';
const DB_VERSION = 1;
const FORM_STORE = 'png-egp-forms';

export interface OfflineFormData {
  id?: number;
  formType: string;
  formId: string;
  url: string;
  method: string;
  body: Record<string, unknown>;
  timestamp: number;
  synced: boolean;
  syncAttempts: number;
}

/**
 * Open the IndexedDB database
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(FORM_STORE)) {
        const store = db.createObjectStore(FORM_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('formType', 'formType', { unique: false });
        store.createIndex('formId', 'formId', { unique: false });
        store.createIndex('synced', 'synced', { unique: false });
      }
    };
  });
}

/**
 * Save form data for offline sync
 */
export async function saveFormOffline(data: Omit<OfflineFormData, 'id' | 'timestamp' | 'synced' | 'syncAttempts'>): Promise<number> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(FORM_STORE, 'readwrite');
    const store = tx.objectStore(FORM_STORE);

    const formData: Omit<OfflineFormData, 'id'> = {
      ...data,
      timestamp: Date.now(),
      synced: false,
      syncAttempts: 0,
    };

    const request = store.add(formData);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as number);
  });
}

/**
 * Get all unsynced forms
 */
export async function getUnsyncedForms(): Promise<OfflineFormData[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(FORM_STORE, 'readonly');
    const store = tx.objectStore(FORM_STORE);
    const index = store.index('synced');
    const request = index.getAll(IDBKeyRange.only(false));

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Mark a form as synced
 */
export async function markFormSynced(id: number): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(FORM_STORE, 'readwrite');
    const store = tx.objectStore(FORM_STORE);
    const getRequest = store.get(id);

    getRequest.onerror = () => reject(getRequest.error);
    getRequest.onsuccess = () => {
      const data = getRequest.result;
      if (data) {
        data.synced = true;
        const putRequest = store.put(data);
        putRequest.onerror = () => reject(putRequest.error);
        putRequest.onsuccess = () => resolve();
      } else {
        resolve();
      }
    };
  });
}

/**
 * Delete a synced form
 */
export async function deleteForm(id: number): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(FORM_STORE, 'readwrite');
    const store = tx.objectStore(FORM_STORE);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Clear all synced forms
 */
export async function clearSyncedForms(): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(FORM_STORE, 'readwrite');
    const store = tx.objectStore(FORM_STORE);
    const index = store.index('synced');
    const request = index.openCursor(IDBKeyRange.only(true));

    request.onerror = () => reject(request.error);
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve();
      }
    };
  });
}

/**
 * Sync all pending forms when back online
 */
export async function syncPendingForms(): Promise<{ success: number; failed: number }> {
  const forms = await getUnsyncedForms();
  let success = 0;
  let failed = 0;

  for (const form of forms) {
    try {
      const response = await fetch(form.url, {
        method: form.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form.body),
      });

      if (response.ok) {
        await markFormSynced(form.id!);
        success++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error('Failed to sync form:', form.id, error);
      failed++;
    }
  }

  // Clean up synced forms
  await clearSyncedForms();

  return { success, failed };
}

/**
 * Check if we're online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Register service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('[SW] Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[SW] Service worker registered:', registration.scope);

    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            console.log('[SW] New version available');
            // Could show a toast to the user here
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('[SW] Registration failed:', error);
    return null;
  }
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    return await Notification.requestPermission();
  }

  return Notification.permission;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(
  registration: ServiceWorkerRegistration,
  vapidPublicKey: string
): Promise<PushSubscription | null> {
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    console.log('[Push] Subscribed:', subscription.endpoint);
    return subscription;
  } catch (error) {
    console.error('[Push] Subscription failed:', error);
    return null;
  }
}

/**
 * Convert base64 to Uint8Array for VAPID key
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Check for app updates
 */
export async function checkForUpdates(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  const registration = await navigator.serviceWorker.getRegistration();
  if (registration) {
    await registration.update();
    return registration.waiting !== null;
  }

  return false;
}

/**
 * Skip waiting and activate new service worker
 */
export async function activateNewVersion(): Promise<void> {
  const registration = await navigator.serviceWorker.getRegistration();
  if (registration?.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }
}
