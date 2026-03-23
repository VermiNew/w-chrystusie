import { useMemo, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Markdown from 'react-markdown'
import { prayers, type Prayer } from '../data/prayers'

const SCROLL_KEY = 'prayers-scroll'

const categoryOrder = [
  'Modlitwy codzienne',
  'Litanie',
  'Modlitwy maryjne',
  'Modlitwy do Ducha Świętego',
  'Modlitwy o zdrowie',
  'Modlitwy za zmarłych',
  'Modlitwy za rodzinę',
  'Modlitwy za wstawiennictwem świętych',
  'Modlitwy za bliźnich',
  'Modlitwy osobiste',
  'Modlitwy w podróży',
  'Akty i ofiarowania',
  'Nabożeństwa',
  'Katechizm',
]

export default function PrayersPage() {
  const { id } = useParams()
  const selected = id ? prayers.find((p) => p.id === id) ?? null : null
  // Restore scroll position when returning to list (runs after App's scrollTo(0,0))
  useEffect(() => {
    if (!selected) {
      const saved = sessionStorage.getItem(SCROLL_KEY)
      if (saved) {
        const y = parseInt(saved, 10)
        sessionStorage.removeItem(SCROLL_KEY)
        requestAnimationFrame(() => window.scrollTo(0, y))
      }
    }
  }, [selected])

  const saveScroll = () => {
    sessionStorage.setItem(SCROLL_KEY, String(window.scrollY))
  }

  const grouped = useMemo(() => {
    const map = new Map<string, Prayer[]>()
    for (const prayer of prayers) {
      const cat = prayer.category ?? 'Bez kategorii'
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(prayer)
    }
    return categoryOrder
      .filter((cat) => map.has(cat))
      .map((cat) => ({ category: cat, items: map.get(cat)! }))
  }, [])

  if (selected) {
    return (
      <div className="page">
        <Link to="/modlitwy" className="back-button">
          ← Powrót do listy
        </Link>
        <h1>{selected.title}</h1>
        <div className="prayer-text">
          <Markdown>{selected.body}</Markdown>
        </div>
        {selected.source && (
          <a className="source-link" href={selected.source} target="_blank" rel="noopener noreferrer">
            Źródło
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="page">
      <h1>Modlitwy</h1>
      {grouped.map(({ category, items }) => (
        <section key={category} className="prayer-category">
          <h2 className="prayer-category-title">{category}</h2>
          <ul className="prayer-list">
            {items.map((prayer) => (
              <li key={prayer.id}>
                <Link to={`/modlitwy/${prayer.id}`} className="prayer-item" onClick={saveScroll}>
                  {prayer.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
