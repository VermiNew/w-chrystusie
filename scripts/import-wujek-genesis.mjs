import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputFile = path.join(projectRoot, 'src', 'data', 'generated', 'genesis-wujek.json')
const sourcePagePrefix = 'Biblia Wujka (1923)/Księga Rodzaju '
const sourceUrlPrefix =
  'https://pl.wikisource.org/wiki/Biblia_Wujka_%281923%29/Ksi%C4%99ga_Rodzaju_'
const sourceBookUrl =
  'https://pl.wikisource.org/wiki/Biblia_Wujka_%281923%29/Ksi%C4%99ga_Rodzaju_%28ca%C5%82o%C5%9B%C4%87%29'
const apiUrl = 'https://pl.wikisource.org/w/api.php'
const userAgent = 'WChrystusieContentImporter/1.0 (https://w-chrystusie.pages.dev)'
const chapterCount = 50

function decodeHtml(value) {
  const namedEntities = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"',
    shy: '',
  }

  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&([a-z]+);/gi, (entity, name) => namedEntities[name.toLowerCase()] ?? entity)
}

function textFromHtml(value) {
  return decodeHtml(
    value
      .replace(/<span><span class="ws-pagenum[\s\S]*?<\/span><\/span>/gi, '')
      .replace(/<sup[^>]*class="reference"[^>]*>[\s\S]*?<\/sup>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/\s+/g, ' ')
    .trim()
}

function parseChapter(chapterNumber, html) {
  const verseParagraphPattern = /<p>([\s\S]*?)<\/p>/gi
  const markerPattern = /<span[^>]*id="(\d+):(\d+)\.?"[^>]*>[\s\S]*?<\/span>/i
  const verses = []

  for (const paragraphMatch of html.matchAll(verseParagraphPattern)) {
    const paragraph = paragraphMatch[1]
    const marker = paragraph.match(markerPattern)
    if (!marker || Number(marker[1]) !== chapterNumber) continue

    const markerEnd = marker.index + marker[0].length
    const text = textFromHtml(paragraph.slice(markerEnd))
    if (text) verses.push({ number: Number(marker[2]), text })
  }

  if (verses.length === 0) {
    throw new Error(`Księga Rodzaju ${chapterNumber}: nie znaleziono żadnego wersetu.`)
  }

  const expectedVerseNumbers = Array.from({ length: verses.length }, (_, index) => index + 1)
  const hasCompleteSequence = expectedVerseNumbers.every(
    (verseNumber, index) => verses[index]?.number === verseNumber,
  )
  if (!hasCompleteSequence) {
    throw new Error(
      `Księga Rodzaju ${chapterNumber}: wersety nie tworzą pełnej sekwencji od 1 (${verses.map((verse) => verse.number).join(', ')}).`,
    )
  }

  return {
    number: chapterNumber,
    sourceUrl: `${sourceUrlPrefix}${chapterNumber}`,
    verses,
  }
}

async function fetchChapter(chapterNumber) {
  const parameters = new URLSearchParams({
    action: 'parse',
    page: `${sourcePagePrefix}${chapterNumber}`,
    prop: 'text',
    format: 'json',
    formatversion: '2',
  })
  const response = await fetch(`${apiUrl}?${parameters}`, {
    headers: { 'User-Agent': userAgent },
  })

  if (!response.ok) {
    throw new Error(`Księga Rodzaju ${chapterNumber}: API zwróciło HTTP ${response.status}.`)
  }

  const payload = await response.json()
  if (payload.error || !payload.parse?.text) {
    throw new Error(`Księga Rodzaju ${chapterNumber}: API nie zwróciło renderowanego tekstu.`)
  }

  return parseChapter(chapterNumber, payload.parse.text)
}

const chapters = []
for (let chapterNumber = 1; chapterNumber <= chapterCount; chapterNumber += 1) {
  const chapter = await fetchChapter(chapterNumber)
  chapters.push(chapter)
  console.log(`[genesis] Pobrano rozdział ${chapterNumber} (${chapter.verses.length} wersetów).`)
}

const genesis = {
  id: 'gen',
  name: 'Księga Rodzaju',
  translation: 'Biblia Jakuba Wujka (1599), wydanie 1923',
  sourceName: 'Wikiźródła',
  sourceBookUrl,
  sourceRights: 'Domena publiczna (wydanie); CC BY-SA 4.0 (transkrypcja Wikiźródeł)',
  chapters,
}

await mkdir(path.dirname(outputFile), { recursive: true })
await writeFile(outputFile, `${JSON.stringify(genesis, null, 2)}\n`, 'utf8')
console.log(`[genesis] Zapisano ${chapters.length} rozdziałów w ${path.relative(projectRoot, outputFile)}.`)
