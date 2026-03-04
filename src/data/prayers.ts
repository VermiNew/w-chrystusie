import { loadMarkdownFiles, type MarkdownEntry } from './markdown'

export type Prayer = MarkdownEntry

const modules = import.meta.glob('./prayers/*.md', { query: '?raw', eager: true, import: 'default' }) as Record<string, string>

export const prayers = loadMarkdownFiles(modules, './prayers/')
