import { Link } from 'react-router-dom'
import { FaStar } from 'react-icons/fa6'
import { pluralPl } from '../data/plural'
import { scriptureCatalog } from '../data/scriptureCatalog'
import { useContentLibrary } from '../hooks/useContentLibrary'
import { getBookProgress } from '../hooks/useScriptureProgress'

const formatChapterCount = (count: number) => `${count} ${pluralPl(count, 'rozdział', 'rozdziały', 'rozdziałów')}`

interface FavoritePassage {
  key: string
  title: string
  path: string
}

// Favorite chapters are saved as "<book id>:<chapter>" (e.g. "jhn:3"), psalms by number.
function useFavoritePassages(): FavoritePassage[] {
  const { favoriteIds: chapterIds } = useContentLibrary('scripture', undefined, false)
  const { favoriteIds: psalmIds } = useContentLibrary('psalm', undefined, false)

  const chapters = chapterIds.flatMap((id) => {
    const [bookId, chapter] = id.split(':')
    const book = scriptureCatalog.find((entry) => entry.id === bookId && entry.isAvailable)
    const chapterNumber = Number(chapter)
    if (!book || !Number.isInteger(chapterNumber) || chapterNumber < 1 || chapterNumber > book.chapterCount) return []
    return [{ key: `scripture:${id}`, title: `${book.name}, rozdział ${chapterNumber}`, path: `/pismo-swiete/${book.slug}/${chapterNumber}` }]
  })
  const psalms = psalmIds.flatMap((id) => {
    const number = Number(id)
    if (!Number.isInteger(number) || number < 1 || number > 150) return []
    return [{ key: `psalm:${id}`, title: `Psalm ${number}`, path: `/pismo-swiete/psalmy/${number}` }]
  })
  return [...chapters, ...psalms]
}

function TestamentBooks({ testament, title }: { testament: 'Old' | 'New'; title: string }) {
  const books = scriptureCatalog.filter((book) => book.testament === testament)

  return (
    <section aria-labelledby={`${testament}-testament`}>
      <h2 id={`${testament}-testament`} className="testament-heading">{title}</h2>
      <ul className="book-list">
        {books.map((book) => {
          const progress = book.isAvailable ? getBookProgress(book.id, book.chapterCount) : 0
          const label = book.isAvailable ? `${book.name}, ${formatChapterCount(book.chapterCount)}` : `${book.name} — tekst w przygotowaniu`

          return (
            <li key={book.id}>
              {book.isAvailable ? (
                <Link className="book-item" to={book.id === 'psa' ? '/pismo-swiete/psalmy' : `/pismo-swiete/${book.slug}`} aria-label={label}>
                  <span>{book.name}</span>
                  <small>{formatChapterCount(book.chapterCount)}</small>
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
  const favorites = useFavoritePassages()

  return (
    <div className="page">
      <h1>Pismo Święte</h1>
      <p className="scripture-copyright">
        Katolicki kanon 73 ksiąg. Teksty udostępniane są kolejno w historycznym przekładzie Jakuba Wujka; zielony pasek pokazuje przeczytaną część rozdziału i całej księgi.
      </p>
      <p className="scripture-availability">Gotowe teksty: {readyBooks.length} z {scriptureCatalog.length} ksiąg</p>
      {favorites.length > 0 && (
        <details className="prayer-category saved-content-category" open>
          <summary className="prayer-category-title">
            <FaStar aria-hidden="true" /> Ulubione fragmenty <span>({favorites.length})</span>
          </summary>
          <ul className="prayer-list">
            {favorites.map((favorite) => (
              <li key={favorite.key}>
                <Link to={favorite.path} className="prayer-item">{favorite.title}</Link>
              </li>
            ))}
          </ul>
        </details>
      )}
      <TestamentBooks testament="Old" title="Stary Testament" />
      <TestamentBooks testament="New" title="Nowy Testament" />
    </div>
  )
}
