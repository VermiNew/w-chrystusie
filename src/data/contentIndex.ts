/**
 * Light lists of prayers and songs: ids, titles and categories, without the
 * excerpts of the full catalog (contentCatalog.ts). Enough for the home page.
 */
import indexData from './generated/content-index.json'

export interface ContentIndexEntry {
  id: string
  title: string
  category?: string
}

export const prayerIndex = indexData.prayers as readonly ContentIndexEntry[]
export const songIndex = indexData.songs as readonly ContentIndexEntry[]

/**
 * One entry per calendar day, the same for everybody, cycling through the entries
 * ordered by id. Shared by the home page and the prayer pages.
 */
export function pickEntryForDay<T extends { id: string }>(entries: readonly T[], date = new Date()): T {
  const sorted = [...entries].sort((first, second) => (first.id < second.id ? -1 : first.id > second.id ? 1 : 0))
  const dayNumber = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000)
  return sorted[dayNumber % sorted.length]
}

export const getIndexPrayerOfDay = (date = new Date()) => pickEntryForDay(prayerIndex, date)
