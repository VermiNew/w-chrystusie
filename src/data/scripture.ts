import { bookNames } from './bookNames'

export interface Verse {
  number: number
  text: string
}

export interface Chapter {
  number: number
  verses: Verse[]
}

export interface Book {
  number: number
  name: string
  testament: 'Old' | 'New'
  chapters: Chapter[]
}

const DB_NAME = 'slowo-zycia'
const STORE_NAME = 'cache'
const BIBLE_KEY = 'bible-xml'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function getCachedXML(): Promise<string | null> {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.get(BIBLE_KEY)
      request.onsuccess = () => resolve(request.result ?? null)
      request.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

async function setCachedXML(xml: string): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(xml, BIBLE_KEY)
  } catch {
    // silently fail — caching is best-effort
  }
}

async function clearCachedXML(): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(BIBLE_KEY)
  } catch {
    // silently fail
  }
}

function parseBibleXML(text: string): Book[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, 'text/xml')

  const books: Book[] = []

  const testaments = doc.querySelectorAll('testament')
  for (const testament of testaments) {
    const testamentName = testament.getAttribute('name') as 'Old' | 'New'

    const bookElements = testament.querySelectorAll('book')
    for (const bookEl of bookElements) {
      const bookNumber = Number(bookEl.getAttribute('number'))

      const chapters: Chapter[] = []
      const chapterElements = bookEl.querySelectorAll('chapter')
      for (const chapterEl of chapterElements) {
        const chapterNumber = Number(chapterEl.getAttribute('number'))

        const verses: Verse[] = []
        const verseElements = chapterEl.querySelectorAll('verse')
        for (const verseEl of verseElements) {
          verses.push({
            number: Number(verseEl.getAttribute('number')),
            text: verseEl.textContent ?? '',
          })
        }

        chapters.push({ number: chapterNumber, verses })
      }

      books.push({
        number: bookNumber,
        name: bookNames[bookNumber] ?? `Księga ${bookNumber}`,
        testament: testamentName,
        chapters,
      })
    }
  }

  return books
}

async function fetchAndCacheBibleXML(): Promise<string> {
  const response = await fetch('/bible.xml')
  const text = await response.text()
  await setCachedXML(text)
  return text
}

export async function loadBible(): Promise<Book[]> {
  const cached = await getCachedXML()
  const xml = cached ?? await fetchAndCacheBibleXML()
  return parseBibleXML(xml)
}

export async function refreshBible(): Promise<Book[]> {
  await clearCachedXML()
  const xml = await fetchAndCacheBibleXML()
  return parseBibleXML(xml)
}
