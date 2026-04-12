// Service Worker for "W Chrystusie" PWA
// Handles notification display and click actions

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Handle notification clicks — navigate to the prayer page
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.href
  if (!url) return

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus an existing window if possible
      for (const client of clients) {
        if (new URL(client.url).origin === self.location.origin) {
          client.focus()
          client.navigate(url)
          return
        }
      }
      // Otherwise open a new window
      return self.clients.openWindow(url)
    }),
  )
})
