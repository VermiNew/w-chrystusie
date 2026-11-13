import catalogData from './generated/content-catalog.json'
import { pickEntryForDay } from './contentIndex'

export interface ContentCatalogEntry {
  id: string
  title: string
  category?: string
  excerpt: string
}

export const prayerCatalog = catalogData.prayers as readonly ContentCatalogEntry[]
export const songCatalog = catalogData.songs as readonly ContentCatalogEntry[]

export const getCatalogPrayerOfDay = (date = new Date()) => pickEntryForDay(prayerCatalog, date)
