import { Link } from 'react-router-dom'
import { FaCross, FaBookBible, FaMusic } from 'react-icons/fa6'

const sections = [
  { to: '/modlitwy', icon: <FaCross />, title: 'Modlitwy', description: 'Modlitwy codzienne i tradycyjne' },
  { to: '/pismo-swiete', icon: <FaBookBible />, title: 'Pismo Święte', description: 'Uwspółcześniona Biblia Gdańska' },
  { to: '/spiewnik', icon: <FaMusic />, title: 'Śpiewnik', description: 'Pieśni i hymny kościelne' },
]

export default function HomePage() {
  return (
    <div className="home">
      <section className="hero">
        <h1 className="hero-title">✝ Słowo Życia</h1>
        <p className="hero-subtitle">Modlitwa, Pismo Święte i pieśni - wszystko w jednym miejscu.</p>
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
