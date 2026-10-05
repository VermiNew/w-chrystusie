import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowRight, FaCross, FaBookBible, FaMusic, FaHandsPraying, FaBullhorn, FaMagnifyingGlass } from 'react-icons/fa6'
import DevotionChoiceDialog from '../components/DevotionChoiceDialog'
import LiturgyToday from '../components/LiturgyToday'
import { getCatalogPrayerOfDay, prayerCatalog, songCatalog } from '../data/contentCatalog'
import { scriptureCatalog } from '../data/scriptureCatalog'
import { useContentLibrary, type RecentContent } from '../hooks/useContentLibrary'

const sections = [
  { to: '/modlitwy', icon: <FaCross />, title: 'Modlitwy', description: 'Modlitwy codzienne i tradycyjne' },
  { to: '/pismo-swiete', icon: <FaBookBible />, title: 'Pismo Święte', description: 'Biblia w przekładzie Jakuba Wujka' },
  { to: '/spiewnik', icon: <FaMusic />, title: 'Śpiewnik', description: 'Pieśni i hymny kościelne' },
  { to: '/ogloszenia', icon: <FaBullhorn />, title: 'Ogłoszenia', description: 'Aktualności i inicjatywy parafialne' },
  { to: '/szukaj', icon: <FaMagnifyingGlass />, title: 'Szukaj', description: 'Wyszukiwarka modlitw, pieśni i Pisma' },
]

interface ContinueTarget {
  path: string
  label: string
  title: string
}

// Builds the "Kontynuuj" shortcut from lightweight catalogs only, so the home
// page does not have to download full prayer, psalm or Bible texts.
function getContinueTarget({ kind, id }: RecentContent): ContinueTarget | null {
  if (kind === 'prayer') {
    const prayer = prayerCatalog.find((entry) => entry.id === id)
    return prayer ? { path: `/modlitwy/${encodeURIComponent(id)}`, label: 'Kontynuuj modlitwę', title: prayer.title } : null
  }
  if (kind === 'song') {
    const song = songCatalog.find((entry) => entry.id === id)
    return song ? { path: `/spiewnik/${encodeURIComponent(id)}`, label: 'Kontynuuj śpiew', title: song.title } : null
  }
  if (kind === 'psalm') {
    const number = Number(id)
    return Number.isInteger(number) && number >= 1 && number <= 150
      ? { path: `/pismo-swiete/psalmy/${number}`, label: 'Kontynuuj Psalm', title: `Psalm ${number}` }
      : null
  }
  // Scripture chapters are stored as "<book id>:<chapter>", e.g. "jhn:3".
  const [bookId, chapter] = id.split(':')
  const book = scriptureCatalog.find((entry) => entry.id === bookId && entry.isAvailable)
  const chapterNumber = Number(chapter)
  if (!book || !Number.isInteger(chapterNumber) || chapterNumber < 1 || chapterNumber > book.chapterCount) return null
  return {
    path: `/pismo-swiete/${book.slug}/${chapterNumber}`,
    label: 'Kontynuuj czytanie',
    title: `${book.name}, rozdział ${chapterNumber}`,
  }
}

function readSavedPosition(storageKey: string): number {
  try {
    return Number.parseInt(localStorage.getItem(storageKey) ?? '', 10)
  } catch {
    return Number.NaN
  }
}

export default function HomePage() {
  const [devotionDialogOpen, setDevotionDialogOpen] = useState(false)
  const { latestRecent } = useContentLibrary('prayer')
  const continueTarget = latestRecent ? getContinueTarget(latestRecent) : null
  const savedPosition = latestRecent
    ? readSavedPosition(`reading-position:${latestRecent.kind}:${latestRecent.id}`)
    : Number.NaN
  const prayerOfDay = getCatalogPrayerOfDay()

  return (
    <div className="home">
      <section className="hero">
        <h1 className="hero-title">
          <FaCross className="hero-title-icon" aria-hidden="true" />
          <span>W Chrystusie</span>
        </h1>
        <p className="hero-subtitle">Modlitwa, Pismo Święte i pieśni - wszystko w jednym miejscu.</p>
      </section>
      <blockquote className="hero-quote">
        <p>„Proście, a będzie wam dane; szukajcie, a znajdziecie; kołaczcie, a otworzą wam. Albowiem każdy, kto prosi, otrzymuje; kto szuka, znajdzie; a kołaczącemu otworzą."</p>
        <cite>Mt 7,7–8</cite>
      </blockquote>
      <section className="home-shortcuts" aria-label="Skróty">
        <Link className="home-shortcut" to={`/modlitwy/${encodeURIComponent(prayerOfDay.id)}`}>
          <span>
            <small>Modlitwa dnia</small>
            <strong>{prayerOfDay.title}</strong>
          </span>
          <FaArrowRight aria-hidden="true" />
        </Link>
        {continueTarget && Number.isFinite(savedPosition) && savedPosition >= 40 && (
          <Link className="home-shortcut" to={continueTarget.path}>
            <span>
              <small>{continueTarget.label}</small>
              <strong>{continueTarget.title}</strong>
            </span>
            <FaArrowRight aria-hidden="true" />
          </Link>
        )}
      </section>
      <LiturgyToday />
      <section className="section-tiles">
        {sections.slice(0, 3).map((s) => (
          <Link to={s.to} key={s.to} className="section-tile">
            <span className="section-tile-icon">{s.icon}</span>
            <h2 className="section-tile-title">{s.title}</h2>
            <p className="section-tile-desc">{s.description}</p>
          </Link>
        ))}
        <button
          type="button"
          className="section-tile section-tile--choice"
          onClick={() => setDevotionDialogOpen(true)}
          aria-haspopup="dialog"
        >
          <span className="section-tile-icon"><FaHandsPraying /></span>
          <span className="section-tile-title">Różaniec i koronka</span>
          <p className="section-tile-desc">Wybierz modlitwę krok po kroku</p>
        </button>
        {sections.slice(3).map((s) => (
          <Link to={s.to} key={s.to} className="section-tile">
            <span className="section-tile-icon">{s.icon}</span>
            <h2 className="section-tile-title">{s.title}</h2>
            <p className="section-tile-desc">{s.description}</p>
          </Link>
        ))}
      </section>
      <DevotionChoiceDialog
        open={devotionDialogOpen}
        onClose={() => setDevotionDialogOpen(false)}
      />
    </div>
  )
}
