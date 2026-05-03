// Service Worker for "W Chrystusie" PWA
// Responsibilities:
//   1. Cache app shell + runtime assets for offline access
//   2. Handle notification display and click actions

const CACHE_VERSION = 'v1-2026-05-01'
const STATIC_CACHE = `wch-static-${CACHE_VERSION}`
const RUNTIME_CACHE = `wch-runtime-${CACHE_VERSION}`

// Files known to exist at deploy time (Vite-hashed JS/CSS are not listed —
// they are picked up at runtime via the fetch handler).
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/logo.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Drop caches that don't belong to the current version
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k)),
      )
      await self.clients.claim()
    })(),
  )
})

// Fetch strategy:
//   - Navigation (HTML)        → network-first, fallback to cached app shell
//   - Same-origin static asset → stale-while-revalidate (cache, refresh in bg)
//   - Google Fonts             → cache-first
//   - Anything else            → just pass through
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // SPA navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstHTML(request))
    return
  }

  // Google Fonts (CSS + woff2)
  if (
    url.hostname === 'fonts.googleapis.com'
    || url.hostname === 'fonts.gstatic.com'
  ) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE))
    return
  }

  // Same-origin static assets
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE))
    return
  }
})

async function networkFirstHTML(request) {
  try {
    const fresh = await fetch(request)
    const cache = await caches.open(STATIC_CACHE)
    cache.put('/index.html', fresh.clone()).catch(() => {})
    return fresh
  } catch {
    const cached = await caches.match('/index.html')
    if (cached) return cached
    return new Response('<h1>Offline</h1>', {
      status: 503,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const fresh = await fetch(request)
    if (fresh && fresh.status === 200) {
      const cache = await caches.open(cacheName)
      cache.put(request, fresh.clone()).catch(() => {})
    }
    return fresh
  } catch {
    return new Response('', { status: 504 })
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  const network = fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone()).catch(() => {})
      }
      return response
    })
    .catch(() => null)
  return cached || (await network) || new Response('', { status: 504 })
}

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
