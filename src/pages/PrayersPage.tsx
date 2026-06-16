import { useMemo, useEffect, useState } from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
import Markdown from 'react-markdown'
import { prayers, type Prayer } from '../data/prayers'

const SCROLL_KEY = 'prayers-scroll'

const categoryOrder = [
  'Modlitwy codzienne',
  'Litanie',
  'Koronki',
  'Modlitwy maryjne',
  'Modlitwy do Matki Bożej Szkaplerznej',
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
  'Sakramenty',
  'Katechizm',
]

const fallbackCategory = 'Bez kategorii'

const byTitle = (a: Prayer, b: Prayer) => a.title.localeCompare(b.title, 'pl')

const decodeRouteId = (routeId: string) => {
  try {
    return decodeURIComponent(routeId)
  } catch {
    return routeId
  }
}

const encodeRouteId = (routeId: string) => encodeURIComponent(routeId)

const getSelectedId = (routeId: string | undefined, pathname: string) => {
  if (routeId) return decodeRouteId(routeId)
  if (!pathname.startsWith('/modlitwy/')) return null

  return decodeRouteId(pathname.slice('/modlitwy/'.length))
}

export default function PrayersPage() {
  const { id } = useParams()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const selectedId = getSelectedId(id, location.pathname)
  const selected = selectedId ? prayers.find((p) => p.id === selectedId) ?? null : null
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
    const normalizedQuery = query.trim().toLowerCase()
    const map = new Map<string, Prayer[]>()
    for (const prayer of prayers) {
      const searchableText = `${prayer.title} ${prayer.category ?? ''} ${prayer.body}`.toLowerCase()
      if (normalizedQuery && !searchableText.includes(normalizedQuery)) continue

      const cat = prayer.category && categoryOrder.includes(prayer.category) ? prayer.category : fallbackCategory
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(prayer)
    }
    return [...categoryOrder, fallbackCategory]
      .filter((cat) => map.has(cat))
      .map((cat) => ({ category: cat, items: [...map.get(cat)!].sort(byTitle) }))
  }, [query])

  const resultCount = grouped.reduce((sum, group) => sum + group.items.length, 0)

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
      <input
        className="list-filter-input"
        type="text"
        placeholder="Szukaj w modlitwach..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query.trim() && (
        <p className="list-filter-count">
          Znaleziono: {resultCount} {resultCount === 1 ? 'pozycję' : 'pozycji'}
        </p>
      )}
      {resultCount === 0 && <p className="list-filter-empty">Brak modlitw pasujących do wyszukiwania.</p>}
      {grouped.map(({ category, items }) => (
        <section key={category} className="prayer-category">
          <h2 className="prayer-category-title">{category} ({items.length})</h2>
          <ul className="prayer-list">
            {items.map((prayer) => (
              <li key={prayer.id}>
                <Link to={`/modlitwy/${encodeRouteId(prayer.id)}`} className="prayer-item" onClick={saveScroll}>
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
