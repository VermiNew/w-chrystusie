import { readStorage, removeStorage, writeStorage } from './storage'
import { normalizeSearchText } from './searchText'

/**
 * Recent search phrases, newest first. A phrase is saved when the user opens a
 * result or confirms it with Enter, not on every keystroke.
 */

const STORAGE_KEY = 'search-history'
export const SEARCH_HISTORY_LIMIT = 8

export function readSearchHistory(): string[] {
  try {
    const parsed: unknown = JSON.parse(readStorage(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === 'string').slice(0, SEARCH_HISTORY_LIMIT)
      : []
  } catch {
    return []
  }
}

function save(history: string[]): string[] {
  if (history.length === 0) removeStorage(STORAGE_KEY)
  else writeStorage(STORAGE_KEY, JSON.stringify(history))
  return history
}

const isSamePhrase = (a: string, b: string) => normalizeSearchText(a) === normalizeSearchText(b)

export function addSearchHistory(phrase: string): string[] {
  const trimmed = phrase.trim().replace(/\s+/g, ' ')
  const history = readSearchHistory()
  if (trimmed.length < 2) return history
  return save([trimmed, ...history.filter((entry) => !isSamePhrase(entry, trimmed))].slice(0, SEARCH_HISTORY_LIMIT))
}

export function removeSearchHistory(phrase: string): string[] {
  return save(readSearchHistory().filter((entry) => entry !== phrase))
}

export function clearSearchHistory(): string[] {
  return save([])
}
