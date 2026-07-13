import { useCallback, useEffect, useState } from 'react'

export type ContentKind = 'prayer' | 'song'

const FAVORITES_KEY = 'content-favorites'
const RECENT_KEY = 'content-recent'
const CHANGE_EVENT = 'content-library-change'
const RECENT_LIMIT = 5

const makeKey = (kind: ContentKind, id: string) => `${kind}:${id}`

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

  const keysFor = useCallback((keys: string[], kind: ContentKind) => {
    const prefix = `${kind}:`
    return keys.filter((key) => key.startsWith(prefix)).map((key) => key.slice(prefix.length))
  }, [])

  return {
    favoriteIds: keysFor(favorites, kind),
    recentIds: keysFor(recent, kind),
    isFavorite: activeId ? favorites.includes(makeKey(kind, activeId)) : false,
    toggleFavorite,
  }
}
