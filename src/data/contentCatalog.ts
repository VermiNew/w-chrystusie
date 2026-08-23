import catalogData from './generated/content-catalog.json'

export interface ContentCatalogEntry {
  id: string
  title: string
  category?: string
  excerpt: string
}

export const prayerCatalog = catalogData.prayers as readonly ContentCatalogEntry[]
export const songCatalog = catalogData.songs as readonly ContentCatalogEntry[]

const dailyPrayerCatalog = [...prayerCatalog].sort((first, second) => (
  first.id < second.id ? -1 : first.id > second.id ? 1 : 0
))

export function getCatalogPrayerOfDay(date = new Date()) {
  const dayNumber = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000)
  return dailyPrayerCatalog[dayNumber % dailyPrayerCatalog.length]
}
