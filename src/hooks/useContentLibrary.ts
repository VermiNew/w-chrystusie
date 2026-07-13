import { useCallback, useEffect, useState } from 'react'

export type ContentKind = 'prayer' | 'song'

export interface RecentContent {
  kind: ContentKind
  id: string
}

const FAVORITES_KEY = 'content-favorites'
const RECENT_KEY = 'content-recent'
const CHANGE_EVENT = 'content-library-change'
const RECENT_LIMIT = 5

const makeKey = (kind: ContentKind, id: string) => `${kind}:${id}`

const parseKey = (key: string | undefined): RecentContent | null => {
  if (!key) return null
  const separatorIndex = key.indexOf(':')
  const kind = key.slice(0, separatorIndex)
  const id = key.slice(separatorIndex + 1)
  if ((kind !== 'prayer' && kind !== 'song') || !id) return null
  return { kind, id }
}

const readKeys = (storageKey: string) => {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]')
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

const writeKeys = (storageKey: string, keys: string[]) => {
  localStorage.setItem(storageKey, JSON.stringify(keys))
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function useContentLibrary(kind: ContentKind, activeId?: string) {
  const [favorites, setFavorites] = useState(() => readKeys(FAVORITES_KEY))
  const [recent, setRecent] = useState(() => readKeys(RECENT_KEY))

  useEffect(() => {
    const refresh = () => {
      setFavorites(readKeys(FAVORITES_KEY))
      setRecent(readKeys(RECENT_KEY))
    }

    window.addEventListener('storage', refresh)
    window.addEventListener(CHANGE_EVENT, refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener(CHANGE_EVENT, refresh)
    }
  }, [])

  useEffect(() => {
    if (!activeId) return
    const key = makeKey(kind, activeId)
    const nextRecent = [key, ...readKeys(RECENT_KEY).filter((item) => item !== key)].slice(0, RECENT_LIMIT)
    writeKeys(RECENT_KEY, nextRecent)
  }, [activeId, kind])

  const toggleFavorite = useCallback((kind: ContentKind, id: string) => {
    const key = makeKey(kind, id)
    const current = readKeys(FAVORITES_KEY)
    const next = current.includes(key)
      ? current.filter((item) => item !== key)
      : [...current, key]
    writeKeys(FAVORITES_KEY, next)
  }, [])

  const removeFavorite = useCallback((kind: ContentKind, id: string) => {
    const key = makeKey(kind, id)
    writeKeys(FAVORITES_KEY, readKeys(FAVORITES_KEY).filter((item) => item !== key))
  }, [])

  const clearRecent = useCallback(() => {
    writeKeys(RECENT_KEY, [])
  }, [])

  const keysFor = useCallback((keys: string[], kind: ContentKind) => {
    const prefix = `${kind}:`
    return keys.filter((key) => key.startsWith(prefix)).map((key) => key.slice(prefix.length))
  }, [])

  return {
    favoriteIds: keysFor(favorites, kind),
    recentIds: keysFor(recent, kind),
    latestRecent: parseKey(recent[0]),
    isFavorite: activeId ? favorites.includes(makeKey(kind, activeId)) : false,
    toggleFavorite,
    removeFavorite,
    clearRecent,
  }
}
