//THE SERVICE WORKER: Handles the "Push" event
// ServiceWorker.js
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'No payload',
        icon: 'icon.png', // path to an icon if you have one
    };

    event.waitUntil(
        self.registration.showNotification('Push Message', options)
    );
});