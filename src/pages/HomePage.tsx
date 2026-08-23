import { Link } from 'react-router-dom'
import { FaArrowRight, FaCross, FaBookBible, FaMusic, FaHandsPraying, FaBullhorn, FaMagnifyingGlass } from 'react-icons/fa6'
import { getPrayerOfDay, prayers } from '../data/prayers'
import { songs } from '../data/songs'
import { useContentLibrary } from '../hooks/useContentLibrary'

const sections = [
  { to: '/modlitwy', icon: <FaCross />, title: 'Modlitwy', description: 'Modlitwy codzienne i tradycyjne' },
  { to: '/pismo-swiete', icon: <FaBookBible />, title: 'Pismo Święte', description: 'Księga Psalmów w przekładzie Jakuba Wujka' },
  { to: '/spiewnik', icon: <FaMusic />, title: 'Śpiewnik', description: 'Pieśni i hymny kościelne' },
  { to: '/rozaniec', icon: <FaHandsPraying />, title: 'Różaniec', description: 'Interaktywny przewodnik krok po kroku' },
  { to: '/ogloszenia', icon: <FaBullhorn />, title: 'Ogłoszenia', description: 'Aktualności i inicjatywy parafialne' },
  { to: '/szukaj', icon: <FaMagnifyingGlass />, title: 'Szukaj', description: 'Wyszukiwarka modlitw i pieśni' },
]

export default function HomePage() {
  const { latestRecent } = useContentLibrary('prayer')
  const recentContent = latestRecent?.kind === 'prayer'
    ? prayers.find((prayer) => prayer.id === latestRecent.id)
    : songs.find((song) => song.id === latestRecent?.id)
  const savedPosition = latestRecent
    ? Number.parseInt(localStorage.getItem(`reading-position:${latestRecent.kind}:${latestRecent.id}`) ?? '', 10)
    : Number.NaN
  const continuePath = latestRecent
    ? `${latestRecent.kind === 'prayer' ? '/modlitwy' : '/spiewnik'}/${encodeURIComponent(latestRecent.id)}`
    : null
  const continueLabel = latestRecent?.kind === 'prayer'
    ? 'Kontynuuj modlitwę'
    : 'Kontynuuj śpiew'
  const prayerOfDay = getPrayerOfDay()

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
        {recentContent && continuePath && Number.isFinite(savedPosition) && savedPosition >= 40 && (
          <Link className="home-shortcut" to={continuePath}>
            <span>
              <small>{continueLabel}</small>
              <strong>{recentContent.title}</strong>
            </span>
            <FaArrowRight aria-hidden="true" />
          </Link>
        )}
      </section>
      <section className="section-tiles">
        {sections.map((s) => (
          <Link to={s.to} key={s.to} className="section-tile">
            <span className="section-tile-icon">{s.icon}</span>
            <h2 className="section-tile-title">{s.title}</h2>
            <p className="section-tile-desc">{s.description}</p>
          </Link>
        ))}
      </section>
    </div>
  )
}
