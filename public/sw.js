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
//   - Hashed /assets/ file     → cache-first (immutable)
//   - Other same-origin file   → stale-while-revalidate (cache, refresh in bg)
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

  // Vite-hashed files never change under the same name, so the cache is authoritative.
  if (url.origin === self.location.origin && url.pathname.startsWith('/assets/')) {
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

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request, { ignoreVary: true })
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (isCacheableResponse(response)) {
      const cache = await caches.open(cacheName)
      await cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('', { status: 504 })
  }
}

// Everything the app needs offline: the shell above plus every file from the
// generated manifest (all JS/CSS chunks, including each Bible book, and the
// images used on pages). One visit online is enough to use the app offline.
async function precacheAppShell() {
  const cache = await caches.open(STATIC_CACHE)
  await cache.addAll(APP_SHELL)

  const manifestResponse = await cache.match('/asset-manifest.json')
  if (!manifestResponse) return

  const manifest = await manifestResponse.json()
  if (!Array.isArray(manifest)) return
  const paths = manifest.filter((assetPath) => typeof assetPath === 'string' && assetPath.startsWith('/'))

  // Old caches are deleted only on activate, so during install the previous
  // version is still there. Hashed /assets/ files that did not change are copied
  // from it instead of being downloaded again on every deploy.
  const missing = []
  await Promise.all(paths.map(async (assetPath) => {
    const previous = assetPath.startsWith('/assets/') ? await caches.match(assetPath) : undefined
    if (previous) {
      await cache.put(assetPath, previous)
    } else {
      missing.push(assetPath)
    }
  }))
  if (missing.length > 0) await cache.addAll(missing)
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
