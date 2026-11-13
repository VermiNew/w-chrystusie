/**
 * On-demand loading of prayer and song texts.
 *
 * Each Markdown file becomes its own small chunk, so opening one prayer (e.g. from
 * a shared link) downloads only that prayer instead of all ~400 (~360 KB gzip).
 * The whole collection is still available for searching inside the texts.
 * Offline this works too: the service worker precaches every chunk.
 */
import { parseMarkdown, type MarkdownEntry } from './markdown'

type MarkdownLoaders = Record<string, () => Promise<string>>

const prayerLoaders = import.meta.glob('./prayers/*.md', { query: '?raw', import: 'default' }) as MarkdownLoaders
const songLoaders = import.meta.glob('./songs/*.md', { query: '?raw', import: 'default' }) as MarkdownLoaders

function createEntryLoader(loaders: MarkdownLoaders, directory: string) {
  return async (id: string): Promise<MarkdownEntry | undefined> => {
    const load = loaders[`${directory}${id}.md`]
    return load ? parseMarkdown(id, await load()) : undefined
  }
}

export const loadPrayerEntry = createEntryLoader(prayerLoaders, './prayers/')
export const loadSongEntry = createEntryLoader(songLoaders, './songs/')

export const loadAllPrayers = () => import('./prayers').then((module) => module.prayers)
export const loadAllSongs = () => import('./songs').then((module) => module.songs)
