// This is the service worker with the combined offline experience (Offline page + Offline copy of pages)

//A copy of each page is stored in the cache as your visitors view them. This allows a visitor to load any previously viewed 
//page while they are offline. This then adds the "offline page" that allows you to customize the message and experience if the 
//app is offline, and the page is not in the cache.
const CACHE = "pwabuilder-offline-page";

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

// TODO: replace the following with the correct offline fallback page i.e.: const offlineFallbackPage = "offline.html";
const offlineFallbackPage = "offline.html";

// Add whichever assets you want to pre-cache here:
const PRECACHE_ASSETS = [
    '/js/',
    '/img/',
    '/css/'
]

self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

self.addEventListener('install', async (event) => {
    event.waitUntil(
        caches.open(CACHE)
        .then((cache) => cache.add(offlineFallbackPage))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

if (workbox.navigationPreload.isSupported()) {
    workbox.navigationPreload.enable();
}

workbox.routing.registerRoute(
    new RegExp('/*'),
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: CACHE
    })
);

self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith((async () => {
            try {
                const preloadResp = await event.preloadResponse;

                if (preloadResp) {
                    return preloadResp;
                }

                const networkResp = await fetch(event.request);
                return networkResp;
            } catch (error) {

                const cache = await caches.open(CACHE);
                const cachedResp = await cache.match(offlineFallbackPage);
                return cachedResp;
            }
        })());
    }
});

// Add an event listener for the `sync` event in your service worker.
self.addEventListener('sync', event => {

    // Check for correct tag on the sync event.
    if (event.tag === 'database-sync') {

        // Execute the desired behavior with waitUntil().
        //event.waitUntil(

            // This is just a hypothetical function for the behavior we desire.
            //pushLocalDataToDatabase();
        //);
    }
});

// Listen for the `periodicsync` event.
self.addEventListener('periodicsync', event => {

  // Check for correct tag on the periodicSyncPermissionsync event.
  if (event.tag === 'fetch-new-content') {

    // Execute the desired behavior with waitUntil().
    //event.waitUntil(

      // This is just a hypothetical function for the behavior we desire.
      //fetchNewContent();
    //);
  }
});

//We can listen to the updatefound event to see if we have a new service worker.
//If there is a service worker is installing, we listen to the statechange event,
//once the install is finished, we can display a message to notify our users.
self.addEventListener("updatefound", () => {
    if (self.registration.installing) {
		self.registration.installing.addEventListener("statechange", () => {
			if (worker.state == "installed") {
				// display a message to tell our users that
				// there's a new service worker is installed
				
				// notify all clients with a Broadcast message update
				const channel = new BroadcastChannel('sw-messages');
				channel.postMessage({title: 'New update available'});
			}
		});
    }
});

self.addEventListener('push', (event) => {
 	let payload = event.data.json();
 	let options = payload.notification;
 	let data = payload.data;

 	options.data = {};
 	options.requireInteraction = true;
 	options.data.url = options.click_action || (event.currentTarget ? event.currentTarget.origin : null);

 	options.body = options.body || 'Need your attention';
 	options.icon = options.icon || '/img/logo.png';
 	options.badge = options.badge || '/img/logo.png';

 	let title = options.title;

 	event.waitUntil(
 		self.registration.showNotification(title, options)
 	);
});

// self.addEventListener('notificationclick', (event) => {
// 	event.notification.close();

// 	let url = event.notification.data && event.notification.data.url ? event.notification.data.url : event.currentTarget ? event.currentTarget.origin : null;
// 	let clickResponsePromise = Promise.resolve();

// 	if (url) {
// 		event.waitUntil(clients.matchAll({
// 			type: "window"
// 		}).then((clientList) => {
// 			for (let i = 0; i < clientList.length; i++) {
// 				let client = clientList[i];
// 				if (client.url && 'focus' in client)
// 					return client.focus();
// 			}
// 			if (clients.openWindow)
// 				return clients.openWindow(url);
// 		}));
// 	} else {
// 		event.waitUntil(
// 			clickResponsePromise
// 		);
// 	}
// });