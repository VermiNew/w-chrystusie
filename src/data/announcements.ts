import { loadMarkdownFiles, type MarkdownEntry } from './markdown'

export interface Announcement extends MarkdownEntry {
  date: string
  pinned: boolean
  category: string
}

const modules = import.meta.glob('./announcements/*.md', { query: '?raw', eager: true, import: 'default' }) as Record<string, string>

const raw = loadMarkdownFiles(modules, './announcements/')
const now = new Date()
const today = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0'),
].join('-')

export const announcements: Announcement[] = raw
  .map((entry) => ({
    ...entry,
    date: typeof entry['date'] === 'string' ? entry['date'] : '1970-01-01',
    pinned: entry['pinned'] === true,
    category: entry.category ?? 'Pozostałe',
  }))
  .filter((announcement) => announcement.date <= today)
