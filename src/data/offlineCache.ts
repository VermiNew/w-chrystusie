/**
 * Talks to the service worker about the offline copy of the app:
 * how many files are stored and re-downloading them on request.
 */

export interface OfflineStatus {
  version: string
  total: number
  cached: number
  missing: string[]
}

export type OfflineMessage =
  | ({ type: 'status' } & OfflineStatus)
  | { type: 'progress'; done: number; total: number }
  | { type: 'error' }

/** The worker that controls this page, or null (dev mode, unsupported browser, first visit). */
async function getActiveWorker(): Promise<ServiceWorker | null> {
  if (!('serviceWorker' in navigator)) return null
  const registration = await navigator.serviceWorker.getRegistration()
  return registration?.active ?? null
}

export async function isOfflineSupported() {
  return (await getActiveWorker()) !== null
}

/**
 * Sends a request to the worker and forwards each reply to `onMessage`.
 * Resolves with the final status (or null when the worker is unavailable or failed).
 */
async function ask(
  type: 'GET_OFFLINE_STATUS' | 'REFRESH_OFFLINE',
  onMessage?: (message: OfflineMessage) => void,
): Promise<OfflineStatus | null> {
  const worker = await getActiveWorker()
  if (!worker) return null

  return new Promise((resolve) => {
    const channel = new MessageChannel()
    // A refresh of ~150 files on a slow connection can take a while; the timeout only
    // protects against a worker that never answers (e.g. replaced mid-request).
    const timeout = window.setTimeout(() => {
      channel.port1.close()
      resolve(null)
    }, type === 'REFRESH_OFFLINE' ? 10 * 60_000 : 15_000)

    channel.port1.onmessage = (event: MessageEvent<OfflineMessage>) => {
      const message = event.data
      onMessage?.(message)
      if (message.type === 'progress') return
      window.clearTimeout(timeout)
      channel.port1.close()
      if (message.type === 'status') {
        const { version, total, cached, missing } = message
        resolve({ version, total, cached, missing })
      } else {
        resolve(null)
      }
    }
    worker.postMessage({ type }, [channel.port2])
  })
}

export const getOfflineStatus = () => ask('GET_OFFLINE_STATUS')

/** Checks for a new app version, then downloads every offline file again. */
export async function refreshOfflineCopy(onProgress: (done: number, total: number) => void) {
  try {
    // Ask the browser not to evict the offline copy when storage runs low.
    await navigator.storage?.persist?.()
  } catch {
    // Not supported — the copy still works, it may just be evicted under pressure.
  }
  try {
    const registration = await navigator.serviceWorker.getRegistration()
    // A new version installs and precaches itself; the refresh below covers the current one.
    await registration?.update()
  } catch {
    // Offline — the refresh below reports which files could not be downloaded.
  }
  return ask('REFRESH_OFFLINE', (message) => {
    if (message.type === 'progress') onProgress(message.done, message.total)
  })
}

export interface StorageInfo {
  usedBytes: number | null
  persisted: boolean | null
}

export async function getStorageInfo(): Promise<StorageInfo> {
  const [estimate, persisted] = await Promise.all([
    navigator.storage?.estimate?.().catch(() => undefined),
    navigator.storage?.persisted?.().catch(() => null),
  ])
  return { usedBytes: estimate?.usage ?? null, persisted: persisted ?? null }
}

export function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}
