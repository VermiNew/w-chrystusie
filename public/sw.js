// Service Worker for "W Chrystusie" PWA
// Responsibilities:
//   1. Cache app shell + runtime assets for offline access
//   2. Handle notification display and click actions

const CACHE_VERSION = new URL(self.location.href).searchParams.get('v') || 'dev'
const STATIC_CACHE = `wch-static-${CACHE_VERSION}`
const RUNTIME_CACHE = `wch-runtime-${CACHE_VERSION}`
const MAX_RUNTIME_ENTRIES = 80

// Files known to exist at deploy time. Vite-hashed JS/CSS are listed in the
// generated asset manifest and added to the same cache during installation.
const APP_SHELL = [
  '/',
  '/index.html',
  '/asset-manifest.json',
  '/manifest.json',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/logo.png',
  '/fonts/literata-italic-latin-ext.woff2',
  '/fonts/literata-italic-latin.woff2',
  '/fonts/literata-normal-latin-ext.woff2',
  '/fonts/literata-normal-latin.woff2',
  '/fonts/poppins-400-latin-ext.woff2',
  '/fonts/poppins-400-latin.woff2',
  '/fonts/poppins-500-latin-ext.woff2',
  '/fonts/poppins-500-latin.woff2',
  '/fonts/poppins-600-latin-ext.woff2',
  '/fonts/poppins-600-latin.woff2',
  '/fonts/space-grotesk-latin-ext.woff2',
  '/fonts/space-grotesk-latin.woff2',
]

self.addEventListener('install', (event) => {
  event.waitUntil(precacheAppShell())
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

self.addEventListener('message', (event) => {
  const message = event.data
  if (!message || typeof message !== 'object') return

  if (message.type === 'SKIP_WAITING') {
    self.skipWaiting()
    return
  }

})

// Fetch strategy:
//   - Navigation (HTML)        → network-first, fallback to cached app shell
//   - Same-origin static asset → stale-while-revalidate (cache, refresh in bg)
//   - Anything else            → just pass through
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Always fetch the service worker itself from the network so updates are not
  // hidden behind the runtime cache.
  if (url.origin === self.location.origin && url.pathname === '/sw.js') {
    event.respondWith(fetch(request))
    return
  }

  // SPA navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstHTML(request))
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
    if (fresh.ok && fresh.type !== 'opaque') {
      const cache = await caches.open(RUNTIME_CACHE)
      await cache.put(request, fresh.clone())
      await trimCache(RUNTIME_CACHE, MAX_RUNTIME_ENTRIES)
    }
    return fresh
  } catch {
    const cached = await caches.match(request) || await caches.match('/index.html')
    if (cached) return cached
    return new Response('<h1>Offline</h1>', {
      status: 503,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await caches.match(request, { ignoreVary: true })
  const network = fetch(request)
    .then(async (response) => {
      if (isCacheableResponse(response)) {
        await cache.put(request, response.clone())
        await trimCache(cacheName, MAX_RUNTIME_ENTRIES)
      }
      return response
    })
    .catch(() => null)
  return cached || (await network) || new Response('', { status: 504 })
}

async function precacheAppShell() {
  const cache = await caches.open(STATIC_CACHE)
  await cache.addAll(APP_SHELL)

  const manifestResponse = await cache.match('/asset-manifest.json')
  if (!manifestResponse) return

  const manifest = await manifestResponse.json()
  if (!Array.isArray(manifest)) return
  const assetPaths = manifest.filter(
    (assetPath) => typeof assetPath === 'string' && assetPath.startsWith('/assets/'),
  )
  if (assetPaths.length > 0) await cache.addAll(assetPaths)
}

function isCacheableResponse(response, allowOpaque = false) {
  return Boolean(response && (response.ok || (allowOpaque && response.type === 'opaque')))
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  const excessEntries = keys.length - maxEntries
  if (excessEntries <= 0) return
  await Promise.all(keys.slice(0, excessEntries).map((key) => cache.delete(key)))
}

// Handle notification clicks — navigate to the prayer page
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const href = event.notification.data?.href || '/'
  let targetUrl
  try {
    targetUrl = new URL(href, self.location.origin).href
  } catch {
    targetUrl = self.location.origin + '/'
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus an existing window if possible
      for (const client of clients) {
        if (new URL(client.url).origin === self.location.origin) {
          client.focus()
          client.navigate(targetUrl)
          return
        }
      }
      // Otherwise open a new window
      return self.clients.openWindow(targetUrl)
    }),
  )
})
