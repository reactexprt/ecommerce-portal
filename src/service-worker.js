import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { BroadcastUpdatePlugin } from 'workbox-broadcast-update';
import { Queue } from 'workbox-background-sync';
import { clientsClaim } from 'workbox-core';

// Precache all assets generated during the build process
precacheAndRoute(self.__WB_MANIFEST);

// Cleanup outdated caches from previous service worker versions
cleanupOutdatedCaches();

// Claim control of clients immediately
clientsClaim();

// Cache images with a CacheFirst strategy to save bandwidth and improve loading speed
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      {
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // Cache images for 30 days
        },
      },
    ],
  })
);

// Cache CSS and JS files with StaleWhileRevalidate strategy for quick loading and regular updates
registerRoute(
  ({ request }) => request.destination === 'style' || request.destination === 'script',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [new BroadcastUpdatePlugin()],
  })
);

// Handle API requests with background sync in case of offline mode
const bgSyncPlugin = new BackgroundSyncPlugin('api-queue', {
  maxRetentionTime: 24 * 60, // Retry failed requests for up to 24 hours
});

registerRoute(
  /\/api\/.*\/*.json/,
  new NetworkFirst({
    cacheName: 'api-responses',
    plugins: [bgSyncPlugin], // Queue failed requests for retry when online
  })
);

// // Handle navigation requests for offline support
// self.addEventListener('fetch', (event) => {
//   if (event.request.mode === 'navigate') {
//     event.respondWith(
//       fetch(event.request).catch(() => caches.match('/offline.html')) // Serve offline page if network fails
//     );
//   }
// });

// Push Notification setup
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: 'icons/icon-192x192.png', // TODO --> add real icon and badge
    badge: 'icons/badge-72x72.png', // TODO
    actions: [
      { action: 'open_url', title: 'View Details' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'open_url') {
    clients.openWindow(event.notification.data.url); // Open the URL from the notification
  }
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'skipWaiting') {
      self.skipWaiting();
    }
});  

// Background sync for failed API requests
const queue = new Queue('api-sync-queue', {
  onSync: async ({ queue }) => {
    let entry;
    while (entry = await queue.shiftRequest()) {
      try {
        await fetch(entry.request.clone());
      } catch (error) {
        await queue.unshiftRequest(entry); // If still fails, put it back in the queue
        throw error;
      }
    }
  },
});

// Catch fetch errors and retry failed API calls with background sync
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(async () => {
        await queue.pushRequest({ request: event.request });
      })
    );
  }
});
