import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputDirectory = path.join(projectRoot, 'src', 'data', 'generated')
// Full catalog with excerpts: prayer/song lists and their page metadata.
const outputFile = path.join(outputDirectory, 'content-catalog.json')
// Titles only: the home page ("Modlitwa dnia", "Kontynuuj") without the ~270 KB of excerpts.
const indexFile = path.join(outputDirectory, 'content-index.json')
// Just the numbers: the About dialog, which is part of the entry bundle.
const countsFile = path.join(outputDirectory, 'content-counts.json')
const EXCERPT_LENGTH = 220

function parseMarkdown(filename, raw) {
  const match = raw.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) return { id: filename, title: filename, body: raw.trim() }

  const attributes = {}
  for (const line of match[1].split(/\r?\n/)) {
    const separatorIndex = line.indexOf(':')
    if (separatorIndex > 0) {
      attributes[line.slice(0, separatorIndex).trim()] = line.slice(separatorIndex + 1).trim()
    }
  }

  return {
    id: filename,
    title: attributes.title || filename,
    category: attributes.category || undefined,
    body: match[2].trim(),
  }
}

function createExcerpt(body) {
  return body
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, EXCERPT_LENGTH)
    .trimEnd()
}

async function loadCatalog(directoryName) {
  const directory = path.join(projectRoot, 'src', 'data', directoryName)
  const filenames = (await readdir(directory))
    .filter((filename) => filename.endsWith('.md'))
    .sort((first, second) => first.localeCompare(second, 'pl'))

  return Promise.all(filenames.map(async (filename) => {
    const id = filename.replace(/\.md$/, '')
    const entry = parseMarkdown(id, await readFile(path.join(directory, filename), 'utf8'))
    return {
      id: entry.id,
      title: entry.title,
      ...(entry.category ? { category: entry.category } : {}),
      excerpt: createExcerpt(entry.body),
    }
  }))
}

const [prayers, songs] = await Promise.all([
  loadCatalog('prayers'),
  loadCatalog('songs'),
])

const withoutExcerpt = (entries) => entries.map(({ id, title, category }) => ({ id, title, ...(category ? { category } : {}) }))

await mkdir(outputDirectory, { recursive: true })
await Promise.all([
  writeFile(outputFile, `${JSON.stringify({ prayers, songs }, null, 2)}\n`, 'utf8'),
  writeFile(indexFile, `${JSON.stringify({ prayers: withoutExcerpt(prayers), songs: withoutExcerpt(songs) }, null, 2)}\n`, 'utf8'),
  writeFile(countsFile, `${JSON.stringify({ prayers: prayers.length, songs: songs.length }, null, 2)}\n`, 'utf8'),
])

console.log(`[catalog] Wygenerowano ${prayers.length} modlitw i ${songs.length} pieśni.`)
