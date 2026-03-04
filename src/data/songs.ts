import { loadMarkdownFiles, type MarkdownEntry } from './markdown'

export type Song = MarkdownEntry

const modules = import.meta.glob('./songs/*.md', { query: '?raw', eager: true, import: 'default' }) as Record<string, string>

export const songs = loadMarkdownFiles(modules, './songs/')
