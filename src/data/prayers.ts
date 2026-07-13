import { loadMarkdownFiles, type MarkdownEntry } from './markdown'

export type Prayer = MarkdownEntry

const modules = import.meta.glob('./prayers/*.md', { query: '?raw', eager: true, import: 'default' }) as Record<string, string>

export const prayers = loadMarkdownFiles(modules, './prayers/')

const dailyPrayers = [...prayers].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))

export function getPrayerOfDay(date = new Date()) {
  const dayNumber = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000)
  return dailyPrayers[dayNumber % dailyPrayers.length]
}
