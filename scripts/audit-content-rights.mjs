import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const collections = [
  { name: 'Modlitwy', directory: 'prayers' },
  { name: 'Pieśni', directory: 'songs' },
]
const knownRightsStatuses = new Set([
  'licensed',
  'permission-required',
  'permission-granted',
  'public-domain',
])

function parseFrontmatter(raw) {
  const match = raw.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!match) return null

  return Object.fromEntries(
    match[1]
      .split(/\r?\n/)
      .map((line) => {
        const separatorIndex = line.indexOf(':')
        if (separatorIndex < 1) return null
        return [
          line.slice(0, separatorIndex).trim(),
          line.slice(separatorIndex + 1).trim(),
        ]
      })
      .filter(Boolean),
  )
}

function createAudit(collection, entries) {
  const result = {
    collection: collection.name,
    total: entries.length,
    exactSourceUrls: 0,
    missingOrInvalidSourceUrls: [],
    sourceDomains: new Map(),
    rightsStatuses: new Map(),
    missingRightsStatus: [],
    missingAuthor: [],
    missingVerificationDate: [],
  }

  for (const entry of entries) {
    const metadata = entry.metadata
    const source = metadata?.source

    try {
      const sourceUrl = new URL(source)
      if (sourceUrl.protocol !== 'https:' && sourceUrl.protocol !== 'http:') {
        throw new Error('unsupported protocol')
      }
      if (sourceUrl.pathname === '/' || sourceUrl.pathname === '') {
        throw new Error('domain-only URL')
      }

      result.exactSourceUrls += 1
      const hostname = sourceUrl.hostname.toLowerCase().replace(/^www\./, '')
      result.sourceDomains.set(hostname, (result.sourceDomains.get(hostname) ?? 0) + 1)
    } catch {
      result.missingOrInvalidSourceUrls.push(entry.file)
    }

    const rightsStatus = metadata?.rightsStatus
    if (!rightsStatus || !knownRightsStatuses.has(rightsStatus)) {
      result.missingRightsStatus.push(entry.file)
    } else {
      result.rightsStatuses.set(
        rightsStatus,
        (result.rightsStatuses.get(rightsStatus) ?? 0) + 1,
      )
    }

    if (!metadata?.author) result.missingAuthor.push(entry.file)
    if (!metadata?.verifiedAt) result.missingVerificationDate.push(entry.file)
  }

  return result
}

function printAudit(audit) {
  console.log(`\n${audit.collection}: ${audit.total}`)
  console.log(`  dokładne URL-e źródeł: ${audit.exactSourceUrls}/${audit.total}`)
  console.log(
    `  status prawny: ${audit.total - audit.missingRightsStatus.length}/${audit.total}`,
  )
  console.log(`  autor: ${audit.total - audit.missingAuthor.length}/${audit.total}`)
  console.log(
    `  data weryfikacji: ${audit.total - audit.missingVerificationDate.length}/${audit.total}`,
  )

  const statuses = [...audit.rightsStatuses.entries()]
    .sort((first, second) => second[1] - first[1])
    .map(([status, count]) => `${status}: ${count}`)
    .join(', ')
  console.log(`  rozpoznane statusy: ${statuses || 'brak'}`)

  const domains = [...audit.sourceDomains.entries()]
    .sort((first, second) => second[1] - first[1])
    .map(([domain, count]) => `${domain}: ${count}`)
    .join(', ')
  console.log(`  domeny źródłowe: ${domains || 'brak'}`)

  if (audit.missingOrInvalidSourceUrls.length > 0) {
    console.log(
      `  brak/niepoprawny URL: ${audit.missingOrInvalidSourceUrls.slice(0, 10).join(', ')}`,
    )
  }
}

const audits = []

for (const collection of collections) {
  const directory = path.join(projectRoot, 'src', 'data', collection.directory)
  const files = (await readdir(directory)).filter((file) => file.endsWith('.md'))
  const entries = await Promise.all(
    files.map(async (file) => ({
      file,
      metadata: parseFrontmatter(await readFile(path.join(directory, file), 'utf8')),
    })),
  )
  audits.push(createAudit(collection, entries))
}

console.log('Audyt źródeł i praw treści')
for (const audit of audits) printAudit(audit)

const issueCount = audits.reduce(
  (total, audit) =>
    total + audit.missingOrInvalidSourceUrls.length + audit.missingRightsStatus.length,
  0,
)
console.log(`\nPozycje wymagające działania: ${issueCount}`)

if (process.argv.includes('--strict') && issueCount > 0) process.exitCode = 1
