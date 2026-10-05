import { readStorage, removeStorage, writeStorage } from './storage'

/**
 * Backup of everything the app remembers in this browser: favorites,
 * history, reading positions, Bible progress, read announcements,
 * reminders and display settings. Everything lives only in localStorage,
 * so clearing site data or changing phones would otherwise lose it.
 */

const APP_ID = 'w-chrystusie'
const BACKUP_VERSION = 1

// Exact keys and key prefixes that belong to the app. Session-only state
// (current rosary step, list scroll) is deliberately left out.
const BACKUP_KEYS = [
  'content-favorites',
  'content-recent',
  'scripture-progress',
  'read-announcements',
  'prayer-reminders',
  'prayer-reminders-times',
  'prayer-reminders-notif',
  'content-font-size',
  'theme',
]
const BACKUP_PREFIXES = ['reading-position:']

const isBackupKey = (key: string) => BACKUP_KEYS.includes(key) || BACKUP_PREFIXES.some((prefix) => key.startsWith(prefix))

interface BackupFile {
  app: typeof APP_ID
  version: number
  exportedAt: string
  data: Record<string, string>
}

function listStoredKeys(): string[] {
  try {
    return Object.keys(window.localStorage)
  } catch {
    return []
  }
}

export function createBackup(now = new Date()): BackupFile {
  const data: Record<string, string> = {}
  for (const key of listStoredKeys()) {
    if (!isBackupKey(key)) continue
    const value = readStorage(key)
    if (value !== null) data[key] = value
  }
  return { app: APP_ID, version: BACKUP_VERSION, exportedAt: now.toISOString(), data }
}

export function backupFileName(now = new Date()): string {
  const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-')
  return `w-chrystusie-kopia-${date}.json`
}

export type BackupParseResult =
  | { ok: true, backup: BackupFile, entryCount: number }
  | { ok: false, reason: string }

/** Validates an imported file; only known keys with string values are accepted. */
export function parseBackup(text: string): BackupParseResult {
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    return { ok: false, reason: 'To nie jest plik kopii zapasowej (niepoprawny JSON).' }
  }
  if (typeof value !== 'object' || value === null) return { ok: false, reason: 'Nieprawidłowy plik kopii zapasowej.' }

  const candidate = value as Partial<BackupFile>
  if (candidate.app !== APP_ID) return { ok: false, reason: 'Ten plik nie pochodzi z aplikacji „W Chrystusie”.' }
  if (typeof candidate.version !== 'number' || candidate.version > BACKUP_VERSION) {
    return { ok: false, reason: 'Ten plik pochodzi z nowszej wersji aplikacji. Odśwież aplikację i spróbuj ponownie.' }
  }
  if (typeof candidate.data !== 'object' || candidate.data === null) return { ok: false, reason: 'Plik nie zawiera danych.' }

  const data: Record<string, string> = {}
  for (const [key, entry] of Object.entries(candidate.data)) {
    if (isBackupKey(key) && typeof entry === 'string') data[key] = entry
  }
  return {
    ok: true,
    backup: { app: APP_ID, version: candidate.version, exportedAt: String(candidate.exportedAt ?? ''), data },
    entryCount: Object.keys(data).length,
  }
}

/** Replaces the app's stored data with the backup. Returns false when storage is unavailable. */
export function restoreBackup(backup: BackupFile): boolean {
  for (const key of listStoredKeys()) {
    if (isBackupKey(key)) removeStorage(key)
  }
  return Object.entries(backup.data).every(([key, value]) => writeStorage(key, value))
}
