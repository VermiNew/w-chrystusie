import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputFile = path.join(projectRoot, 'src', 'data', 'generated', 'psalms-wujek.json')
const sourcePagePrefix = 'Biblia_Wujka_(1923)/Księga_Psalmów_'
const sourceUrlPrefix =
  'https://pl.wikisource.org/wiki/Biblia_Wujka_%281923%29/Ksi%C4%99ga_Psalm%C3%B3w_'
// index.php?action=render returns the same rendered page as the API, but is not
// subject to the API's strict per-IP rate limit.
const renderUrl = 'https://pl.wikisource.org/w/index.php'
const requestDelayMs = 700
const userAgent = 'WChrystusieContentImporter/1.0 (https://w-chrystusie.pages.dev)'
const psalmsWithContinuedSourceNumbering = new Set([115, 147])

function parseRange(argumentsList) {
  const fromIndex = argumentsList.indexOf('--from')
  const toIndex = argumentsList.indexOf('--to')
  const from = Number(fromIndex >= 0 ? argumentsList[fromIndex + 1] : 1)
  const to = Number(toIndex >= 0 ? argumentsList[toIndex + 1] : 150)

  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to > 150 || from > to) {
    throw new Error('Zakres musi zawierać pełne liczby od 1 do 150, a --from nie może być większe niż --to.')
  }

  return { from, to }
}

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
      .replace(/<span[^>]*><span class="ws-pagenum[\s\S]*?<\/span><\/span>/gi, '')
      .replace(/<sup[^>]*class="[^"]*\breference\b[^"]*"[^>]*>[\s\S]*?<\/sup>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeVerseNumbers(numbers, continueFromPreviousPsalm) {
  let offset = continueFromPreviousPsalm ? 1 - (numbers[0] ?? 1) : 0

  return numbers.map((number, index) => {
    if (number === 1 && index > 0) offset = index
    return number + offset
  })
}

function parsePsalm(number, html) {
  const verseParagraphPattern = /<p\b[^>]*>([\s\S]*?)<\/p>/gi
  const markerPattern = /<span[^>]*id="\d+:(\d+)\.?"[^>]*>[\s\S]*?<\/span>/i
  const sourceMarkerPattern = /id="\d+:(\d+)\.?"/g
  const rawVerses = []

  for (const paragraphMatch of html.matchAll(verseParagraphPattern)) {
    const paragraph = paragraphMatch[1]
    const marker = paragraph.match(markerPattern)
    if (!marker) {
      // In psalms with a superscription, verse 1 is printed as two paragraphs:
      // the title ("Psalm Dawidowi.") with the verse marker, then the opening words
      // (with a drop cap) without one. Without this the psalm would lose its first line.
      const continuation = textFromHtml(paragraph)
      if (continuation && rawVerses.length > 0) {
        rawVerses.at(-1).text = `${rawVerses.at(-1).text} ${continuation}`
      }
      continue
    }

    const markerEnd = marker.index + marker[0].length
    const text = textFromHtml(paragraph.slice(markerEnd))
    if (text) rawVerses.push({ number: Number(marker[1]), text })
  }

  const continueFromPreviousPsalm = psalmsWithContinuedSourceNumbering.has(number)
  const normalizedVerseNumbers = normalizeVerseNumbers(
    rawVerses.map((verse) => verse.number),
    continueFromPreviousPsalm,
  )
  const verses = rawVerses.map((verse, index) => ({
    number: normalizedVerseNumbers[index],
    text: verse.text,
  }))

  const summaryMatch = html.match(
    /<div class="center"[^>]*><b[^>]*><span[^>]*>PSALM<\/span>[\s\S]*?<\/div>\s*(?:<span[^>]*>\s*<\/span>\s*)?<div[^>]*font-size:85%[^>]*>([\s\S]*?)<\/div>/i,
  )

  if (verses.length === 0) {
    throw new Error(`Psalm ${number}: nie znaleziono żadnego wersetu.`)
  }

  const uniqueVerseNumbers = new Set(verses.map((verse) => verse.number))
  if (uniqueVerseNumbers.size !== verses.length) {
    throw new Error(`Psalm ${number}: wykryto powtórzone numery wersetów.`)
  }

  const expectedVerseNumbers = Array.from({ length: verses.length }, (_, index) => index + 1)
  const hasCompleteSequence = expectedVerseNumbers.every(
    (verseNumber, index) => verses[index]?.number === verseNumber,
  )
  if (!hasCompleteSequence) {
    throw new Error(
      `Psalm ${number}: wersety nie tworzą pełnej sekwencji od 1 (${verses.map((verse) => verse.number).join(', ')}).`,
    )
  }

  const sourceVerseNumbers = normalizeVerseNumbers(
    [...html.matchAll(sourceMarkerPattern)].map((match) => Number(match[1])),
    continueFromPreviousPsalm,
  )
  const missingVerseNumbers = sourceVerseNumbers.filter(
    (verseNumber) => !uniqueVerseNumbers.has(verseNumber),
  )
  if (sourceVerseNumbers.length !== verses.length || missingVerseNumbers.length > 0) {
    throw new Error(
      `Psalm ${number}: importer odczytał ${verses.length} z ${sourceVerseNumbers.length} znaczników wersetów.`,
    )
  }

  return {
    number,
    title: `Psalm ${number}`,
    summary: summaryMatch ? textFromHtml(summaryMatch[1]) : '',
    verses,
    translation: 'Biblia Jakuba Wujka (1599), wydanie 1923',
    sourceName: 'Wikiźródła',
    sourceUrl: `${sourceUrlPrefix}${number}`,
    rightsStatus: 'public-domain',
  }
}

async function fetchPsalm(number) {
  const parameters = new URLSearchParams({
    title: `${sourcePagePrefix}${number}`,
    action: 'render',
  })
  const response = await fetch(`${renderUrl}?${parameters}`, {
    headers: { 'User-Agent': userAgent },
  })

  if (!response.ok) {
    throw new Error(`Psalm ${number}: Wikiźródła zwróciły HTTP ${response.status}.`)
  }

  const html = await response.text()
  // Only the psalm itself: the page ends with the footnote list.
  const referencesStart = html.indexOf('class="refsection"')
  return parsePsalm(number, referencesStart >= 0 ? html.slice(0, referencesStart) : html)
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function readExistingPsalms() {
  try {
    const raw = await readFile(outputFile, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
}

const { from, to } = parseRange(process.argv.slice(2))
const imported = []

for (let number = from; number <= to; number += 1) {
  if (number > from) await wait(requestDelayMs)
  imported.push(await fetchPsalm(number))
  console.log(`[psalms] Pobrano Psalm ${number} (${imported.at(-1).verses.length} wersetów).`)
}

const existing = await readExistingPsalms()
const merged = new Map(existing.map((psalm) => [psalm.number, psalm]))
for (const psalm of imported) merged.set(psalm.number, psalm)

const psalms = [...merged.values()].sort((first, second) => first.number - second.number)
await mkdir(path.dirname(outputFile), { recursive: true })
await writeFile(outputFile, `${JSON.stringify(psalms, null, 2)}\n`, 'utf8')

console.log(`[psalms] Zapisano ${psalms.length} Psalmów w ${path.relative(projectRoot, outputFile)}.`)
