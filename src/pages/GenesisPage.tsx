import { FaArrowLeft, FaArrowRight, FaArrowUpRightFromSquare, FaGlobe } from 'react-icons/fa6'
import { Link, useParams } from 'react-router-dom'
import ReadingModeToggle from '../components/ReadingModeToggle'
import { genesis } from '../data/genesis'
import { useContentLibrary } from '../hooks/useContentLibrary'
import NotFoundPage from './NotFoundPage'

function GenesisReader({ chapterNumber }: { chapterNumber: number }) {
  const chapter = genesis.chapters.find((entry) => entry.number === chapterNumber)
  const { isFavorite, toggleFavorite } = useContentLibrary('scripture', `gen:${chapterNumber}`)

  if (!chapter) return <NotFoundPage />

  const previousChapter = genesis.chapters.find((entry) => entry.number === chapterNumber - 1)
  const nextChapter = genesis.chapters.find((entry) => entry.number === chapterNumber + 1)

  return (
    <article className="page psalm-reader content-detail-page">
      <Link className="back-button" to="/pismo-swiete/rodzaju">
        <FaArrowLeft aria-hidden="true" /> Księga Rodzaju
      </Link>

      <ReadingModeToggle
        contentKey={`scripture:gen:${chapterNumber}`}
        contentTitle={`${genesis.name}, rozdział ${chapterNumber}`}
        isFavorite={isFavorite}
        onToggleFavorite={() => toggleFavorite('scripture', `gen:${chapterNumber}`)}
      />

      <header className="psalm-reader-header">
        <p className="psalms-eyebrow">{genesis.name} · przekład Jakuba Wujka</p>
        <h1>Rozdział {chapter.number}</h1>
      </header>

      <div className="psalm-verses">
        {chapter.verses.map((verse) => (
          <p key={verse.number}>
            <sup>{verse.number}</sup>
            {verse.text}
          </p>
        ))}
      </div>

      <aside className="psalm-source-card" aria-labelledby="genesis-source-title">
        <FaGlobe aria-hidden="true" />
        <div>
          <h2 id="genesis-source-title">Tekst i źródło</h2>
          <p>
            <strong>{genesis.translation}</strong>
            <br />
            {genesis.sourceRights} · źródło cyfrowe: {genesis.sourceName}
          </p>
          <a href={chapter.sourceUrl} target="_blank" rel="noopener noreferrer">
            <span>URL źródła rozdziału</span>
            <FaArrowUpRightFromSquare aria-hidden="true" />
          </a>
        </div>
      </aside>

      <nav className="psalm-reader-navigation" aria-label="Nawigacja między rozdziałami">
        {previousChapter ? (
          <Link to={`/pismo-swiete/rodzaju/${previousChapter.number}`}>
            <FaArrowLeft aria-hidden="true" />
            <span>
              <small>Poprzedni</small>
              Rozdział {previousChapter.number}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {nextChapter && (
          <Link to={`/pismo-swiete/rodzaju/${nextChapter.number}`}>
            <span>
              <small>Następny</small>
              Rozdział {nextChapter.number}
            </span>
            <FaArrowRight aria-hidden="true" />
          </Link>
        )}
      </nav>
    </article>
  )
}

export default function GenesisPage() {
  const { chapter } = useParams()
  const chapterNumber = Number(chapter)

  if (!chapter) {
    return <GenesisReader chapterNumber={1} />
  }

  return Number.isInteger(chapterNumber) && chapterNumber > 0
    ? <GenesisReader chapterNumber={chapterNumber} />
    : <NotFoundPage />
}
