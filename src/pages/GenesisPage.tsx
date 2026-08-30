import { FaArrowLeft, FaArrowRight, FaArrowUpRightFromSquare, FaGlobe } from 'react-icons/fa6'
import { Link, useParams } from 'react-router-dom'
import ReadingModeToggle from '../components/ReadingModeToggle'
import { exodus } from '../data/exodus'
import { ephesians } from '../data/ephesians'
import { ezra } from '../data/ezra'
import { firstKings } from '../data/firstKings'
import { firstChronicles } from '../data/firstChronicles'
import { genesis } from '../data/genesis'
import { galatians } from '../data/galatians'
import { isaiah } from '../data/isaiah'
import { firstThessalonians } from '../data/firstThessalonians'
import { firstPeter } from '../data/firstPeter'
import { firstJohn } from '../data/firstJohn'
import { secondJohn } from '../data/secondJohn'
import { thirdJohn } from '../data/thirdJohn'
import { jude } from '../data/jude'
import { philemon } from '../data/philemon'
import { revelation } from '../data/revelation'
import { philippians } from '../data/philippians'
import { secondCorinthians } from '../data/secondCorinthians'
import { firstCorinthians } from '../data/firstCorinthians'
import { firstTimothy } from '../data/firstTimothy'
import { hebrews } from '../data/hebrews'
import { acts } from '../data/acts'
import { colossians } from '../data/colossians'
import { leviticus } from '../data/leviticus'
import { joshua } from '../data/joshua'
import { ruth } from '../data/ruth'
import { secondKings } from '../data/secondKings'
import { firstSamuel } from '../data/firstSamuel'
import { secondSamuel } from '../data/secondSamuel'
import { secondChronicles } from '../data/secondChronicles'
import { nehemiah } from '../data/nehemiah'
import { job } from '../data/job'
import { proverbs } from '../data/proverbs'
import { ecclesiastes } from '../data/ecclesiastes'
import { songOfSongs } from '../data/songOfSongs'
import { jeremiah } from '../data/jeremiah'
import { obadiah } from '../data/obadiah'
import { haggai } from '../data/haggai'
import { nahum } from '../data/nahum'
import { habakkuk } from '../data/habakkuk'
import { zephaniah } from '../data/zephaniah'
import { malachi } from '../data/malachi'
import { judges } from '../data/judges'
import { john } from '../data/john'
import { james } from '../data/james'
import { lamentations } from '../data/lamentations'
import { mark } from '../data/mark'
import { matthew } from '../data/matthew'
import { luke } from '../data/luke'
import { numbers } from '../data/numbers'
import { romans } from '../data/romans'
import { secondThessalonians } from '../data/secondThessalonians'
import { secondTimothy } from '../data/secondTimothy'
import { secondPeter } from '../data/secondPeter'
import { scriptureBooksBySlug } from '../data/scriptureCatalog'
import { titus } from '../data/titus'
import { useContentLibrary } from '../hooks/useContentLibrary'
import { getChapterProgress, useScriptureProgress } from '../hooks/useScriptureProgress'
import NotFoundPage from './NotFoundPage'

const books = {
  rodzaju: genesis,
  wyjscia: exodus,
  liczb: numbers,
  sedziow: judges,
  '1-krolewska': firstKings,
  '1-kronik': firstChronicles,
  ezdrasza: ezra,
  izajasza: isaiah,
  lamentacje: lamentations,
  'do-galatow': galatians,
  'do-efezjan': ephesians,
  'do-rzymian': romans,
  'do-tytusa': titus,
  '2-do-tesaloniczan': secondThessalonians,
  '1-do-tesaloniczan': firstThessalonians,
  '2-do-tymoteusza': secondTimothy,
  '2-piotra': secondPeter,
  marka: mark,
  mateusza: matthew,
  lukasza: luke,
  jana: john,
  jakuba: james,
  '1-piotra': firstPeter,
  '1-jana': firstJohn,
  '2-jana': secondJohn,
  '3-jana': thirdJohn,
  judy: jude,
  'do-filemona': philemon,
  apokalipsa: revelation,
  'do-filipian': philippians,
  '2-do-koryntian': secondCorinthians,
  '1-do-koryntian': firstCorinthians,
  '1-do-tymoteusza': firstTimothy,
  'do-hebrajczykow': hebrews,
  'dzieje-apostolskie': acts,
  'do-kolosan': colossians,
  kaplanska: leviticus,
  jozuego: joshua,
  rut: ruth,
  '2-krolewska': secondKings,
  '1-samuela': firstSamuel,
  '2-samuela': secondSamuel,
  '2-kronik': secondChronicles,
  nehemiasza: nehemiah,
  hioba: job,
  przyslow: proverbs,
  koheleta: ecclesiastes,
  'piesn-nad-piesniami': songOfSongs,
  jeremiasza: jeremiah,
  abdiasza: obadiah,
  aggeusza: haggai,
  nahuma: nahum,
  habakuka: habakkuk,
  sofoniasza: zephaniah,
  malachiasza: malachi,
}

function ScriptureBookReader({ bookSlug, chapterNumber }: { bookSlug: keyof typeof books; chapterNumber: number }) {
  const book = books[bookSlug]
  const chapter = book.chapters.find((entry) => entry.number === chapterNumber)
  const contentId = `${book.id}:${chapterNumber}`
  const { isFavorite, toggleFavorite } = useContentLibrary('scripture', contentId)
  useScriptureProgress(book.id, chapterNumber)

  if (!chapter) return <NotFoundPage />

  const previousChapter = book.chapters.find((entry) => entry.number === chapterNumber - 1)
  const nextChapter = book.chapters.find((entry) => entry.number === chapterNumber + 1)

  return (
    <article className="page psalm-reader content-detail-page">
      <Link className="back-button" to={`/pismo-swiete/${bookSlug}`}>
        <FaArrowLeft aria-hidden="true" /> {book.name}
      </Link>

      <ReadingModeToggle
        contentKey={`scripture:${contentId}`}
        contentTitle={`${book.name}, rozdział ${chapterNumber}`}
        isFavorite={isFavorite}
        onToggleFavorite={() => toggleFavorite('scripture', contentId)}
      />

      <header className="psalm-reader-header">
        <p className="psalms-eyebrow">{book.name} · przekład Jakuba Wujka</p>
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

      <aside className="psalm-source-card" aria-labelledby="scripture-source-title">
        <FaGlobe aria-hidden="true" />
        <div>
          <h2 id="scripture-source-title">Tekst i źródło</h2>
          <p>
            <strong>{book.translation}</strong>
            <br />
            {book.sourceRights} · źródło cyfrowe: {book.sourceName}
          </p>
          <a href={chapter.sourceUrl} target="_blank" rel="noopener noreferrer">
            <span>URL źródła rozdziału</span>
            <FaArrowUpRightFromSquare aria-hidden="true" />
          </a>
        </div>
      </aside>

      <nav className="psalm-reader-navigation" aria-label="Nawigacja między rozdziałami">
        {previousChapter ? (
          <Link to={`/pismo-swiete/${bookSlug}/${previousChapter.number}`}>
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
          <Link to={`/pismo-swiete/${bookSlug}/${nextChapter.number}`}>
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
  const { book: bookSlug, chapter } = useParams()
  if (!bookSlug || !(bookSlug in books)) return <NotFoundPage />

  const validBookSlug = bookSlug as keyof typeof books
  const chapterNumber = Number(chapter)

  if (!chapter) {
    const book = scriptureBooksBySlug[bookSlug]
    if (!book?.isAvailable) return <NotFoundPage />

    return (
      <div className="page">
        <Link className="back-button" to="/pismo-swiete">
          <FaArrowLeft aria-hidden="true" /> Powrót do ksiąg
        </Link>
        <h1>{book.name}</h1>
        <p className="scripture-copyright">Wybierz rozdział. Pasek u dołu pokazuje zapisany postęp czytania.</p>
        <div className="chapter-grid" aria-label={`Rozdziały: ${book.name}`}>
          {Array.from({ length: book.chapterCount }, (_, index) => {
            const number = index + 1
            const progress = getChapterProgress(book.id, number)
            return (
              <Link key={number} className="chapter-button" to={`/pismo-swiete/${bookSlug}/${number}`} aria-label={`Rozdział ${number}`}>
                {number}
                {progress > 0 && <span className={`chapter-progress${progress >= 100 ? ' chapter-progress--full' : ''}`} style={{ width: `${progress}%` }} />}
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  return Number.isInteger(chapterNumber) && chapterNumber > 0
    ? <ScriptureBookReader bookSlug={validBookSlug} chapterNumber={chapterNumber} />
    : <NotFoundPage />
}
