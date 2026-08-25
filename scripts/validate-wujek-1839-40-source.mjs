import {
  availableCanonicalBooks,
  canonicalBooks,
} from './wujek-1839-40-canon.mjs'

const apiUrl = 'https://pl.wikisource.org/w/api.php'
const userAgent = 'WChrystusieContentValidator/1.0 (https://w-chrystusie.pages.dev)'
const books = availableCanonicalBooks

function assertCanonicalCount() {
  const oldTestamentCount = canonicalBooks.filter((book) => book.testament === 'Old').length
  const newTestamentCount = canonicalBooks.filter((book) => book.testament === 'New').length

  if (oldTestamentCount !== 46 || newTestamentCount !== 27 || canonicalBooks.length !== 73) {
    throw new Error(
      `Manifest kanoniczny jest niepełny: ST ${oldTestamentCount}/46, NT ${newTestamentCount}/27.`,
    )
  }

  if (availableCanonicalBooks.length !== 69) {
    throw new Error(`Oczekiwano 69 dostępnych ksiąg, otrzymano ${availableCanonicalBooks.length}.`)
  }
}

async function validateBook(book) {
  const parameters = new URLSearchParams({
    action: 'parse',
    page: book.sourceTitle,
    prop: 'links',
    format: 'json',
    formatversion: '2',
  })
  const response = await fetch(`${apiUrl}?${parameters}`, {
    headers: { 'User-Agent': userAgent },
  })

  if (!response.ok) throw new Error(`${book.name}: HTTP ${response.status}`)

  const payload = await response.json()
  if (payload.error || !payload.parse?.title) {
    throw new Error(`${book.name}: nie odnaleziono strony źródłowej.`)
  }

  const chapterLinks = payload.parse.links.filter(
    (link) =>
      link.ns === 0 &&
      (link.title.startsWith(`${book.sourceTitle}/`) || link.title.startsWith(`${book.sourceTitle} `)),
  )
  if (chapterLinks.length > 0) return { ...book, chapterCount: chapterLinks.length }

  // Five single-chapter books and letters place verses directly on the book page.
  parameters.set('prop', 'text')
  const inlineResponse = await fetch(`${apiUrl}?${parameters}`, {
    headers: { 'User-Agent': userAgent },
  })
  const inlinePayload = await inlineResponse.json()
  if (!inlineResponse.ok || inlinePayload.error || !/id="\d+[:.]\d+/.test(inlinePayload.parse?.text ?? '')) {
    throw new Error(`${book.name}: nie znaleziono rozdziałów ani wersetów.`)
  }

  return { ...book, chapterCount: 1 }
}

assertCanonicalCount()
console.log('Walidacja 69 dostępnych ksiąg kanonu katolickiego')

const results = await Promise.allSettled(books.map(validateBook))
const failures = results.filter((result) => result.status === 'rejected')
const validBooks = results.filter((result) => result.status === 'fulfilled').map((result) => result.value)

for (const book of validBooks) {
  console.log(`OK  ${book.id.padEnd(4)} ${book.name} (${book.chapterCount} stron rozdziałów)`)
}

for (const failure of failures) console.error(`BŁĄD ${failure.reason.message}`)

console.log(`\nPoprawne strony: ${validBooks.length}/${books.length}`)
if (failures.length > 0) process.exitCode = 1
