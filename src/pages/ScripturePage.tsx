import { useEffect, useState } from 'react'
import { loadBible, type Book } from '../data/scripture'

export default function ScripturePage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null)

  useEffect(() => {
    loadBible().then((data) => {
      setBooks(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="page">
        <h1>Pismo Święte</h1>
        <p>Ładowanie...</p>
      </div>
    )
  }

  if (selectedBook && selectedChapter !== null) {
    const chapter = selectedBook.chapters.find((c) => c.number === selectedChapter)
    return (
      <div className="page">
        <button className="back-button" onClick={() => setSelectedChapter(null)}>
          ← {selectedBook.name}
        </button>
        <h1>Rozdział {selectedChapter}</h1>
        <div className="verses">
          {chapter?.verses.map((verse) => (
            <p key={verse.number} className="verse">
              <span className="verse-number">{verse.number}</span> {verse.text}
            </p>
          ))}
        </div>
      </div>
    )
  }

  if (selectedBook) {
    return (
      <div className="page">
        <button className="back-button" onClick={() => setSelectedBook(null)}>
          ← Powrót do ksiąg
        </button>
        <h1>{selectedBook.name}</h1>
        <div className="chapter-grid">
          {selectedBook.chapters.map((chapter) => (
            <button
              key={chapter.number}
              className="chapter-button"
              onClick={() => setSelectedChapter(chapter.number)}
            >
              {chapter.number}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const oldTestament = books.filter((b) => b.testament === 'Old')
  const newTestament = books.filter((b) => b.testament === 'New')

  return (
    <div className="page">
      <h1>Pismo Święte</h1>

      <h2 className="testament-heading">Stary Testament</h2>
      <ul className="book-list">
        {oldTestament.map((book) => (
          <li key={book.number}>
            <button className="book-item" onClick={() => setSelectedBook(book)}>
              {book.name}
            </button>
          </li>
        ))}
      </ul>

      <h2 className="testament-heading">Nowy Testament</h2>
      <ul className="book-list">
        {newTestament.map((book) => (
          <li key={book.number}>
            <button className="book-item" onClick={() => setSelectedBook(book)}>
              {book.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
