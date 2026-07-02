import { useMemo, useEffect, useState } from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa6'
import Markdown from 'react-markdown'
import { songs, type Song } from '../data/songs'

const SCROLL_KEY = 'songbook-scroll'

const categoryOrder = [
  'Pieśni adwentowe',
  'Kolędy',
  'Pieśni wielkopostne',
  'Pieśni wielkanocne',
  'Pieśni Maryjne',
  'Pieśni do Ducha Świętego',
  'Pieśni mszalne',
  'Pieśni uwielbienia',
  'Pieśni pokutne',
  'Pieśni patriotyczne',
  'Pieśni papieskie',
  'Pieśni okolicznościowe',
  'Pieśni za zmarłych',
]

const fallbackCategory = 'Bez kategorii'

const byTitle = (a: Song, b: Song) => a.title.localeCompare(b.title, 'pl')

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
  if (!pathname.startsWith('/spiewnik/')) return null

  return decodeRouteId(pathname.slice('/spiewnik/'.length))
}

export default function SongbookPage() {
  const { id } = useParams()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const selectedId = getSelectedId(id, location.pathname)
  const selected = selectedId ? songs.find((s) => s.id === selectedId) ?? null : null
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
    const map = new Map<string, Song[]>()
    for (const song of songs) {
      const category = song.category && categoryOrder.includes(song.category)
        ? song.category
        : fallbackCategory
      if (selectedCategory !== 'all' && category !== selectedCategory) continue

      const searchableText = `${song.title} ${song.category ?? ''} ${song.body}`.toLowerCase()
      if (normalizedQuery && !searchableText.includes(normalizedQuery)) continue

      if (!map.has(category)) map.set(category, [])
      map.get(category)!.push(song)
    }
    return [...categoryOrder, fallbackCategory]
      .filter((cat) => map.has(cat))
      .map((cat) => ({ category: cat, items: [...map.get(cat)!].sort(byTitle) }))
  }, [query, selectedCategory])

  const resultCount = grouped.reduce((sum, group) => sum + group.items.length, 0)
  const hasActiveFilters = query.trim().length > 0 || selectedCategory !== 'all'

  if (selected) {
    return (
      <div className="page">
        <Link to="/spiewnik" className="back-button">
          <FaArrowLeft /> Powrót do listy
        </Link>
        <h1>{selected.title}</h1>
        <div className="song-text" lang="pl">
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
      <h1>Śpiewnik</h1>
      <div className="list-filter-controls">
        <label>
          Szukaj
          <input
            className="list-filter-input"
            type="search"
            placeholder="Tytuł lub treść pieśni..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          Kategoria
          <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
            <option value="all">Wszystkie kategorie</option>
            {categoryOrder.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
            <option value={fallbackCategory}>{fallbackCategory}</option>
          </select>
        </label>
      </div>
      {hasActiveFilters && (
        <p className="list-filter-count">
          Wyświetlono: {resultCount} {resultCount === 1 ? 'pozycję' : 'pozycji'}
        </p>
      )}
      {resultCount === 0 && <p className="list-filter-empty">Brak pieśni pasujących do wybranych filtrów.</p>}
      {grouped.map(({ category, items }) => (
        <details key={category} className="prayer-category" open={hasActiveFilters || undefined}>
          <summary className="prayer-category-title">{category} <span>({items.length})</span></summary>
          <ul className="song-list">
            {items.map((song) => (
              <li key={song.id}>
                <Link to={`/spiewnik/${encodeRouteId(song.id)}`} className="song-item" onClick={saveScroll}>
                  {song.title}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  )
}
