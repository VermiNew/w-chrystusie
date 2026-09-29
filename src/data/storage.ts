/**
 * Browser storage that never throws. Storage can be unavailable (blocked
 * cookies/site data, some private modes) or full; then reads return null and
 * writes are skipped, so preferences simply are not remembered instead of the
 * page crashing.
 */
type StorageKind = 'local' | 'session'

function getStorage(kind: StorageKind): Storage | null {
  try {
    // Even reading window.localStorage throws a SecurityError when site data is blocked.
    return kind === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

export function readStorage(key: string, kind: StorageKind = 'local'): string | null {
  try {
    return getStorage(kind)?.getItem(key) ?? null
  } catch {
    return null
  }
}

export function writeStorage(key: string, value: string, kind: StorageKind = 'local'): boolean {
  try {
    getStorage(kind)?.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export function removeStorage(key: string, kind: StorageKind = 'local'): void {
  try {
    getStorage(kind)?.removeItem(key)
  } catch {
    // Nothing to clean up when storage is unavailable.
  }
}
