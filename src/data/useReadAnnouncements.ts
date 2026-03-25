import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'read-announcements'

function getReadIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
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

function notify() {
  snapshot = getReadIds()
  listeners.forEach((l) => l())
}

export function markAsRead(id: string) {
  const ids = getReadIds()
  if (!ids.includes(id)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids, id]))
    notify()
  }
}

export function markAsUnread(id: string) {
  const ids = getReadIds()
  if (ids.includes(id)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.filter((i) => i !== id)))
    notify()
  }
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
