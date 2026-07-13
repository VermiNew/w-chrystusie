import { useMemo, useEffect, useState, type CSSProperties } from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
import { FaArrowLeft, FaArrowUpRightFromSquare, FaChevronDown, FaChevronLeft, FaChevronRight, FaClock, FaStar } from 'react-icons/fa6'
import Markdown from 'react-markdown'
import { prayers, type Prayer } from '../data/prayers'
import ReadingModeToggle from '../components/ReadingModeToggle'
import { useContentLibrary } from '../hooks/useContentLibrary'

const SCROLL_KEY = 'prayers-scroll'
const CATEGORY_KEY = 'prayers-category'

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
const getCategoryAnchorId = (category: string) => `prayer-category-${encodeURIComponent(category)}`

const getSelectedId = (routeId: string | undefined, pathname: string) => {
  if (routeId) return decodeRouteId(routeId)
  if (!pathname.startsWith('/modlitwy/')) return null

  return decodeRouteId(pathname.slice('/modlitwy/'.length))
}

export default function PrayersPage() {
  const { id } = useParams()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [returnCategory] = useState(() => sessionStorage.getItem(CATEGORY_KEY))
  const selectedId = getSelectedId(id, location.pathname)
  const selected = selectedId ? prayers.find((p) => p.id === selectedId) ?? null : null
  const { favoriteIds, recentIds, isFavorite, toggleFavorite } = useContentLibrary('prayer', selected?.id)
  const favoritePrayers = favoriteIds
    .map((favoriteId) => prayers.find((prayer) => prayer.id === favoriteId))
    .filter((prayer): prayer is Prayer => Boolean(prayer))
  const recentPrayers = recentIds
    .filter(Boolean)
    .map((recentId) => prayers.find((prayer) => prayer.id === recentId))
    .filter((prayer): prayer is Prayer => Boolean(prayer))
  const detailCategory = selected?.category && categoryOrder.includes(selected.category)
    ? selected.category
    : fallbackCategory
  const siblingItems = selected
    ? prayers
      .filter((prayer) => {
        const category = prayer.category && categoryOrder.includes(prayer.category)
          ? prayer.category
          : fallbackCategory
        return category === detailCategory
      })
      .sort(byTitle)
    : []
  const detailIndex = selected ? siblingItems.findIndex((prayer) => prayer.id === selected.id) : -1
  const previousItem = detailIndex > 0 ? siblingItems[detailIndex - 1] : null
  const nextItem = detailIndex >= 0 && detailIndex < siblingItems.length - 1
    ? siblingItems[detailIndex + 1]
    : null
  // Restore the expanded category first, then the saved list position.
  useEffect(() => {
    if (selected) return

    const savedScroll = sessionStorage.getItem(SCROLL_KEY)
    if (!savedScroll && !returnCategory) return

    const frame = requestAnimationFrame(() => {
      const y = savedScroll ? Number.parseInt(savedScroll, 10) : Number.NaN
      if (Number.isFinite(y)) {
        window.scrollTo(0, y)
      } else if (returnCategory) {
        document.getElementById(getCategoryAnchorId(returnCategory))?.scrollIntoView({ block: 'start' })
      }
      sessionStorage.removeItem(SCROLL_KEY)
      sessionStorage.removeItem(CATEGORY_KEY)
    })

    return () => cancelAnimationFrame(frame)
  }, [selected, returnCategory])

  const saveListPosition = (category: string) => {
    sessionStorage.setItem(SCROLL_KEY, String(window.scrollY))
    sessionStorage.setItem(CATEGORY_KEY, category)
  }

  const prepareListReturn = () => {
    sessionStorage.setItem(CATEGORY_KEY, detailCategory)
  }

  const grouped = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const map = new Map<string, Prayer[]>()
    for (const prayer of prayers) {
      const category = prayer.category && categoryOrder.includes(prayer.category)
        ? prayer.category
        : fallbackCategory
      if (selectedCategory !== 'all' && category !== selectedCategory) continue

      const searchableText = `${prayer.title} ${prayer.category ?? ''} ${prayer.body}`.toLowerCase()
      if (normalizedQuery && !searchableText.includes(normalizedQuery)) continue

      if (!map.has(category)) map.set(category, [])
      map.get(category)!.push(prayer)
    }
    return [...categoryOrder, fallbackCategory]
      .filter((cat) => map.has(cat))
      .map((cat) => ({ category: cat, items: [...map.get(cat)!].sort(byTitle) }))
  }, [query, selectedCategory])

  const resultCount = grouped.reduce((sum, group) => sum + group.items.length, 0)
  const hasActiveFilters = query.trim().length > 0 || selectedCategory !== 'all'

  if (selected) {
    return (
      <div className="page content-detail-page">
        <Link to="/modlitwy" className="back-button" onClick={prepareListReturn}>
          <FaArrowLeft /> Powrót do listy
        </Link>
        <nav className="content-breadcrumb" aria-label="Okruszki">
          <Link to="/modlitwy" onClick={prepareListReturn}>Modlitwy</Link>
          <span aria-hidden="true">/</span>
          <Link to="/modlitwy" onClick={prepareListReturn}>{detailCategory}</Link>
        </nav>
        <ReadingModeToggle
          contentKey={`prayer:${selected.id}`}
          contentTitle={selected.title}
          isFavorite={isFavorite}
          onToggleFavorite={() => toggleFavorite('prayer', selected.id)}
        />
        <h1>{selected.title}</h1>
        <div className="prayer-text" lang="pl">
          <Markdown>{selected.body}</Markdown>
        </div>
        {selected.source && (
          <a className="source-link" href={selected.source} target="_blank" rel="noopener noreferrer">
            Źródło <FaArrowUpRightFromSquare aria-hidden="true" />
          </a>
        )}
        <nav className="content-sibling-nav" aria-label="Nawigacja między modlitwami">
          {previousItem ? (
            <Link to={`/modlitwy/${encodeRouteId(previousItem.id)}`}>
              <FaChevronLeft />
              <span className="content-sibling-copy">
                <small>Poprzednia</small>
                <span>{previousItem.title}</span>
              </span>
            </Link>
          ) : <span />}
          {nextItem && (
            <Link className="content-sibling-next" to={`/modlitwy/${encodeRouteId(nextItem.id)}`}>
              <span className="content-sibling-copy">
                <small>Następna</small>
                <span>{nextItem.title}</span>
              </span>
              <FaChevronRight />
            </Link>
          )}
        </nav>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>Modlitwy</h1>
      {favoritePrayers.length > 0 && (
        <details className="prayer-category saved-content-category">
          <summary className="prayer-category-title"><FaStar aria-hidden="true" /> Ulubione <span>({favoritePrayers.length})</span></summary>
          <ul className="prayer-list">
            {favoritePrayers.map((prayer) => (
              <li key={prayer.id}>
                <Link to={`/modlitwy/${encodeRouteId(prayer.id)}`} className="prayer-item">{prayer.title}</Link>
              </li>
            ))}
          </ul>
        </details>
      )}
      {recentPrayers.length > 0 && (
        <details className="prayer-category saved-content-category">
          <summary className="prayer-category-title"><FaClock className="saved-content-recent-icon" aria-hidden="true" /> Ostatnio otwierane <span>({recentPrayers.length})</span></summary>
          <ul className="prayer-list">
            {recentPrayers.map((prayer) => (
              <li key={prayer.id}>
                <Link to={`/modlitwy/${encodeRouteId(prayer.id)}`} className="prayer-item">{prayer.title}</Link>
              </li>
            ))}
          </ul>
        </details>
      )}
      <div className="list-filter-controls">
        <label>
          Szukaj
          <input
            className="list-filter-input"
            type="search"
            placeholder="Tytuł lub treść modlitwy..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          Kategoria
          <span className="list-filter-select">
            <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
              <option value="all">Wszystkie kategorie</option>
              {categoryOrder.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
              <option value={fallbackCategory}>{fallbackCategory}</option>
            </select>
            <FaChevronDown aria-hidden="true" />
          </span>
        </label>
      </div>
      {hasActiveFilters && (
        <p className="list-filter-count">
          Wyświetlono: {resultCount} {resultCount === 1 ? 'pozycję' : 'pozycji'}
        </p>
      )}
      {resultCount === 0 && <p className="list-filter-empty">Brak modlitw pasujących do wybranych filtrów.</p>}
      {grouped.map(({ category, items }) => (
        <details
          key={category}
          id={getCategoryAnchorId(category)}
          className="prayer-category"
          open={hasActiveFilters || returnCategory === category || undefined}
        >
          <summary className="prayer-category-title">{category} <span>({items.length})</span></summary>
          <ul className="prayer-list">
            {items.map((prayer, index) => (
              <li key={prayer.id} style={{ '--item-index': index } as CSSProperties}>
                <Link
                  to={`/modlitwy/${encodeRouteId(prayer.id)}`}
                  className="prayer-item"
                  onClick={() => saveListPosition(category)}
                >
                  {prayer.title}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  )
}
