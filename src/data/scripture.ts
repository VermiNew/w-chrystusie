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

export async function loadBible(): Promise<Book[]> {
  const response = await fetch('/bible.xml')
  const text = await response.text()
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
