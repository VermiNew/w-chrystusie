import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const apiUrl = 'https://pl.wikisource.org/w/api.php'
const userAgent = 'WChrystusieContentImporter/1.0 (https://w-chrystusie.pages.dev)'

const books = {
  gen: {
    id: 'gen',
    name: 'Księga Rodzaju',
    chapterCount: 50,
    outputFile: path.join(projectRoot, 'src', 'data', 'generated', 'genesis-wujek.json'),
    sourcePagePrefix: 'Biblia Wujka (1923)/Księga Rodzaju ',
    sourceUrlPrefix:
      'https://pl.wikisource.org/wiki/Biblia_Wujka_%281923%29/Ksi%C4%99ga_Rodzaju_',
    sourceBookUrl:
      'https://pl.wikisource.org/wiki/Biblia_Wujka_%281923%29/Ksi%C4%99ga_Rodzaju_%28ca%C5%82o%C5%9B%C4%87%29',
  },
  exo: {
    id: 'exo',
    name: 'Księga Wyjścia',
    chapterCount: 40,
    outputFile: path.join(projectRoot, 'src', 'data', 'generated', 'exodus-wujek.json'),
    sourcePagePrefix: 'Biblia Wujka (1923)/Księga Wyjścia ',
    sourceUrlPrefix:
      'https://pl.wikisource.org/wiki/Biblia_Wujka_%281923%29/Ksi%C4%99ga_Wyj%C5%9Bcia_',
    sourceBookUrl:
      'https://pl.wikisource.org/wiki/Biblia_Wujka_%281923%29/Ksi%C4%99ga_Wyj%C5%9Bcia_%28ca%C5%82o%C5%9B%C4%87%29',
  },
  num: {
    id: 'num',
    name: 'Księga Liczb',
    chapterCount: 36,
    outputFile: path.join(projectRoot, 'src', 'data', 'generated', 'numbers-wujek.json'),
    sourcePagePrefix: 'Biblia Wujka (1923)/Księga Liczb ',
    sourceUrlPrefix: 'https://pl.wikisource.org/wiki/Biblia_Wujka_%281923%29/Ksi%C4%99ga_Liczb_',
    sourceBookUrl: 'https://pl.wikisource.org/wiki/Biblia_Wujka_%281923%29/Ksi%C4%99ga_Liczb_%28ca%C5%82o%C5%9B%C4%87%29',
  },
}

const requestedBookId = process.argv[2] === '--book' ? process.argv[3] : 'gen'
const book = books[requestedBookId]
if (!book) throw new Error(`Nieznana księga: ${requestedBookId}. Dostępne: ${Object.keys(books).join(', ')}.`)

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
  const markerPattern = /<span[^>]*id="(\d+):(\d+)(?:\.|&#\d+;)?"[^>]*>[\s\S]*?<\/span>/i
  const verses = []

  for (const paragraphMatch of html.matchAll(verseParagraphPattern)) {
    const paragraph = paragraphMatch[1]
    const marker = paragraph.match(markerPattern)
    const plainMarker = marker ? null : paragraph.match(/^\s*(\d+)\.\s*/)
    if (marker && Number(marker[1]) !== chapterNumber) continue
    if (!marker && !plainMarker) continue

    const verseNumber = marker ? Number(marker[2]) : Number(plainMarker[1])
    const markerEnd = marker ? marker.index + marker[0].length : plainMarker[0].length
    const text = textFromHtml(paragraph.slice(markerEnd))
    if (text) verses.push({ number: verseNumber, text })
  }

  if (verses.length === 0) {
    throw new Error(`${book.name} ${chapterNumber}: nie znaleziono żadnego wersetu.`)
  }

  const expectedVerseNumbers = Array.from({ length: verses.length }, (_, index) => index + 1)
  const hasCompleteSequence = expectedVerseNumbers.every(
    (verseNumber, index) => verses[index]?.number === verseNumber,
  )
  if (!hasCompleteSequence) {
    throw new Error(
      `${book.name} ${chapterNumber}: wersety nie tworzą pełnej sekwencji od 1 (${verses.map((verse) => verse.number).join(', ')}).`,
    )
  }

  return {
    number: chapterNumber,
    sourceUrl: `${book.sourceUrlPrefix}${chapterNumber}`,
    verses,
  }
}

async function fetchChapter(chapterNumber) {
  const parameters = new URLSearchParams({
    action: 'parse',
    page: `${book.sourcePagePrefix}${chapterNumber}`,
    prop: 'text',
    format: 'json',
    formatversion: '2',
  })
  const response = await fetch(`${apiUrl}?${parameters}`, {
    headers: { 'User-Agent': userAgent },
  })

  if (!response.ok) {
    throw new Error(`${book.name} ${chapterNumber}: API zwróciło HTTP ${response.status}.`)
  }

  const payload = await response.json()
  if (payload.error || !payload.parse?.text) {
    throw new Error(`${book.name} ${chapterNumber}: API nie zwróciło renderowanego tekstu.`)
  }

  return parseChapter(chapterNumber, payload.parse.text)
}

const chapters = []
for (let chapterNumber = 1; chapterNumber <= book.chapterCount; chapterNumber += 1) {
  const chapter = await fetchChapter(chapterNumber)
  chapters.push(chapter)
  console.log(`[${book.id}] Pobrano rozdział ${chapterNumber} (${chapter.verses.length} wersetów).`)
}

const importedBook = {
  id: book.id,
  name: book.name,
  translation: 'Biblia Jakuba Wujka (1599), wydanie 1923',
  sourceName: 'Wikiźródła',
  sourceBookUrl: book.sourceBookUrl,
  sourceRights: 'Domena publiczna (wydanie); CC BY-SA 4.0 (transkrypcja Wikiźródeł)',
  chapters,
}

await mkdir(path.dirname(book.outputFile), { recursive: true })
await writeFile(book.outputFile, `${JSON.stringify(importedBook, null, 2)}\n`, 'utf8')
console.log(`[${book.id}] Zapisano ${chapters.length} rozdziałów w ${path.relative(projectRoot, book.outputFile)}.`)
