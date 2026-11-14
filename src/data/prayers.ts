import { loadMarkdownFiles, type MarkdownEntry } from './markdown'

export type Prayer = MarkdownEntry

// The whole collection (~1.2 MB), for searching inside the texts: the global search
// and the list filter. The prayer pages themselves load single texts on demand
// (contentLoaders.ts); the prayer of the day comes from the catalog (contentCatalog.ts).
const modules = import.meta.glob('./prayers/*.md', { query: '?raw', eager: true, import: 'default' }) as Record<string, string>

export const prayers = loadMarkdownFiles(modules, './prayers/')
