import { Link } from 'react-router-dom'
import { scriptureCatalog } from '../data/scriptureCatalog'
import { getBookProgress } from '../hooks/useScriptureProgress'

function TestamentBooks({ testament, title }: { testament: 'Old' | 'New'; title: string }) {
  const books = scriptureCatalog.filter((book) => book.testament === testament)

  return (
    <section aria-labelledby={`${testament}-testament`}>
      <h2 id={`${testament}-testament`} className="testament-heading">{title}</h2>
      <ul className="book-list">
        {books.map((book) => {
          const progress = book.isAvailable ? getBookProgress(book.id, book.chapterCount) : 0
          const label = book.isAvailable ? `${book.name}, ${book.chapterCount} rozdziałów` : `${book.name} — tekst w przygotowaniu`

          return (
            <li key={book.id}>
              {book.isAvailable ? (
                <Link className="book-item" to={`/pismo-swiete/${book.slug}`} aria-label={label}>
                  <span>{book.name}</span>
                  <small>{book.chapterCount} rozdziałów</small>
                  {progress > 0 && <span className={`chapter-progress${progress >= 100 ? ' chapter-progress--full' : ''}`} style={{ width: `${progress}%` }} />}
                </Link>
              ) : (
                <span className="book-item book-item--pending" aria-label={label}>
                  <span>{book.name}</span>
                  <small>Tekst w przygotowaniu</small>
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default function ScripturePage() {
  const readyBooks = scriptureCatalog.filter((book) => book.isAvailable)

  return (
    <div className="page">
      <h1>Pismo Święte</h1>
      <p className="scripture-copyright">
        Katolicki kanon 73 ksiąg. Teksty udostępniane są kolejno w historycznym przekładzie Jakuba Wujka; zielony pasek pokazuje przeczytaną część rozdziału i całej księgi.
      </p>
      <p className="scripture-availability">Gotowe teksty: {readyBooks.length} z {scriptureCatalog.length} ksiąg</p>
      <TestamentBooks testament="Old" title="Stary Testament" />
      <TestamentBooks testament="New" title="Nowy Testament" />
    </div>
  )
}
