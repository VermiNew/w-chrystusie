import { loadMarkdownFiles, type MarkdownEntry } from './markdown'

export interface Announcement extends MarkdownEntry {
  date: string
  pinned: boolean
}

const modules = import.meta.glob('./announcements/*.md', { query: '?raw', eager: true, import: 'default' }) as Record<string, string>

const raw = loadMarkdownFiles(modules, './announcements/')

export const announcements: Announcement[] = raw.map((entry) => ({
  ...entry,
  date: typeof entry['date'] === 'string' ? entry['date'] : '1970-01-01',
  pinned: entry['pinned'] === true,
}))
