import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'read-announcements'

function getReadIds(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

// External store for cross-component reactivity
let listeners: (() => void)[] = []
let snapshot = getReadIds()

function subscribe(listener: () => void) {
  listeners = [...listeners, listener]
  return () => { listeners = listeners.filter((l) => l !== listener) }
}

function getSnapshot() {
  return snapshot
}

// Keeps the in-memory state even when storage is unavailable (private mode, full quota).
function saveReadIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // Read state then lasts only for this session.
  }
  snapshot = ids
  listeners.forEach((l) => l())
}

export function markAsRead(id: string) {
  if (!snapshot.includes(id)) saveReadIds([...snapshot, id])
}

export function markAsUnread(id: string) {
  if (snapshot.includes(id)) saveReadIds(snapshot.filter((i) => i !== id))
}

export function useReadAnnouncements() {
  return useSyncExternalStore(subscribe, getSnapshot)
}

export function useUnreadCount(allIds: string[]): number {
  const readIds = useReadAnnouncements()
  return allIds.filter((id) => !readIds.includes(id)).length
}

export function useIsRead(id: string): boolean {
  const readIds = useReadAnnouncements()
  return readIds.includes(id)
}
