import { useMemo, useEffect, useState, type CSSProperties } from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
import { FaArrowLeft, FaArrowUpRightFromSquare, FaChevronDown, FaChevronLeft, FaChevronRight, FaClock, FaStar, FaTrash, FaXmark } from 'react-icons/fa6'
import Markdown from 'react-markdown'
import { songs, type Song } from '../data/songs'
import ReadingModeToggle from '../components/ReadingModeToggle'
import { useContentLibrary } from '../hooks/useContentLibrary'
import ConfirmDialog from '../components/ConfirmDialog'
import { getLiturgicalSeason } from '../data/liturgicalSeason'

const SCROLL_KEY = 'songbook-scroll'
const CATEGORY_KEY = 'songbook-category'

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
const getCategoryAnchorId = (category: string) => `song-category-${encodeURIComponent(category)}`

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
  const [favoriteToRemove, setFavoriteToRemove] = useState<Song | null>(null)
  const [clearHistoryOpen, setClearHistoryOpen] = useState(false)
  const [returnCategory] = useState(() => sessionStorage.getItem(CATEGORY_KEY))
  const liturgicalSeason = getLiturgicalSeason()
  const selectedId = getSelectedId(id, location.pathname)
  const selected = selectedId ? songs.find((s) => s.id === selectedId) ?? null : null
  const { favoriteIds, recentIds, isFavorite, toggleFavorite, removeFavorite, clearRecent } = useContentLibrary('song', selected?.id)
  const favoriteSongs = favoriteIds
    .map((favoriteId) => songs.find((song) => song.id === favoriteId))
    .filter((song): song is Song => Boolean(song))
  const recentSongs = recentIds
    .filter(Boolean)
    .map((recentId) => songs.find((song) => song.id === recentId))
    .filter((song): song is Song => Boolean(song))
  const detailCategory = selected?.category && categoryOrder.includes(selected.category)
    ? selected.category
    : fallbackCategory
  const siblingItems = selected
    ? songs
      .filter((song) => {
        const category = song.category && categoryOrder.includes(song.category)
          ? song.category
          : fallbackCategory
        return category === detailCategory
      })
      .sort(byTitle)
    : []
  const detailIndex = selected ? siblingItems.findIndex((song) => song.id === selected.id) : -1
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
      <div className="page content-detail-page">
        <Link to="/spiewnik" className="back-button" onClick={prepareListReturn}>
          <FaArrowLeft /> Powrót do listy
        </Link>
        <nav className="content-breadcrumb" aria-label="Okruszki">
          <Link to="/spiewnik" onClick={prepareListReturn}>Śpiewnik</Link>
          <span aria-hidden="true">/</span>
          <Link to="/spiewnik" onClick={prepareListReturn}>{detailCategory}</Link>
        </nav>
        <ReadingModeToggle
          contentKey={`song:${selected.id}`}
          contentTitle={selected.title}
          isFavorite={isFavorite}
          onToggleFavorite={() => toggleFavorite('song', selected.id)}
        />
        <h1>{selected.title}</h1>
        <div className="song-text" lang="pl">
          <Markdown>{selected.body}</Markdown>
        </div>
        {selected.source && (
          <a className="source-link" href={selected.source} target="_blank" rel="noopener noreferrer">
            Źródło <FaArrowUpRightFromSquare aria-hidden="true" />
          </a>
        )}
        <nav className="content-sibling-nav" aria-label="Nawigacja między pieśniami">
          {previousItem ? (
            <Link to={`/spiewnik/${encodeRouteId(previousItem.id)}`}>
              <FaChevronLeft />
              <span className="content-sibling-copy">
                <small>Poprzednia</small>
                <span>{previousItem.title}</span>
              </span>
            </Link>
          ) : <span />}
          {nextItem && (
            <Link className="content-sibling-next" to={`/spiewnik/${encodeRouteId(nextItem.id)}`}>
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
      <h1>Śpiewnik</h1>
      <p className="liturgical-season-status">
        Aktualnie: <strong>{liturgicalSeason.name}</strong>
      </p>
      {favoriteSongs.length > 0 && (
        <details className="prayer-category saved-content-category">
          <summary className="prayer-category-title"><FaStar aria-hidden="true" /> Ulubione <span>({favoriteSongs.length})</span></summary>
          <ul className="song-list">
            {favoriteSongs.map((song) => (
              <li key={song.id} className="saved-content-item">
                <Link to={`/spiewnik/${encodeRouteId(song.id)}`} className="song-item">{song.title}</Link>
                <button
                  type="button"
                  className="saved-content-remove"
                  aria-label={`Usuń „${song.title}” z ulubionych`}
                  title="Usuń z ulubionych"
                  onClick={() => setFavoriteToRemove(song)}
                >
                  <FaXmark aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
      {recentSongs.length > 0 && (
        <details className="prayer-category saved-content-category">
          <summary className="prayer-category-title"><FaClock className="saved-content-recent-icon" aria-hidden="true" /> Ostatnio otwierane <span>({recentSongs.length})</span></summary>
          <ul className="song-list">
            {recentSongs.map((song) => (
              <li key={song.id}>
                <Link to={`/spiewnik/${encodeRouteId(song.id)}`} className="song-item">{song.title}</Link>
              </li>
            ))}
          </ul>
          <button type="button" className="saved-content-clear" onClick={() => setClearHistoryOpen(true)}>
            <FaTrash aria-hidden="true" /> Wyczyść historię
          </button>
        </details>
      )}
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
      {resultCount === 0 && <p className="list-filter-empty">Brak pieśni pasujących do wybranych filtrów.</p>}
      {grouped.map(({ category, items }) => (
        <details
          key={category}
          id={getCategoryAnchorId(category)}
          className="prayer-category"
          open={hasActiveFilters || returnCategory === category || undefined}
        >
          <summary className="prayer-category-title">
            {category}
            {category === liturgicalSeason.songCategory && (
              <span className="liturgical-category-badge">Aktualny okres</span>
            )}
            <span>({items.length})</span>
          </summary>
          <ul className="song-list">
            {items.map((song, index) => (
              <li key={song.id} style={{ '--item-index': index } as CSSProperties}>
                <Link
                  to={`/spiewnik/${encodeRouteId(song.id)}`}
                  className="song-item"
                  onClick={() => saveListPosition(category)}
                >
                  {song.title}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ))}
      <ConfirmDialog
        open={favoriteToRemove !== null}
        title="Usunąć z ulubionych?"
        description={favoriteToRemove ? `Pozycja „${favoriteToRemove.title}” zniknie z ulubionych.` : ''}
        confirmLabel="Usuń"
        onCancel={() => setFavoriteToRemove(null)}
        onConfirm={() => {
          if (favoriteToRemove) removeFavorite('song', favoriteToRemove.id)
          setFavoriteToRemove(null)
        }}
      />
      <ConfirmDialog
        open={clearHistoryOpen}
        title="Wyczyścić historię?"
        description="Usunięta zostanie historia ostatnio otwieranych modlitw i pieśni."
        confirmLabel="Wyczyść"
        onCancel={() => setClearHistoryOpen(false)}
        onConfirm={() => {
          clearRecent()
          setClearHistoryOpen(false)
        }}
      />
    </div>
  )
}
