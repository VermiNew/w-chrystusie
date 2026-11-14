/**
 * Shared list + detail page for Markdown collections (prayers, songs).
 *
 * PrayersPage and SongbookPage used to be two ~350-line copies of the same code,
 * so every fix had to be made twice. Each page now passes its configuration
 * (route, storage keys, categories, labels) and the few parts that really
 * differ (list intro, category badge, extra block below the detail view).
 *
 * The list and navigation use the light content catalog (titles, categories,
 * excerpts). The full text is loaded per entry when it is opened, and for the
 * whole collection only when somebody types in the list search.
 */
import { useMemo, useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
import { FaArrowLeft, FaChevronDown, FaChevronLeft, FaChevronRight, FaClock, FaCopyright, FaStar, FaTrash, FaXmark } from 'react-icons/fa6'
import Markdown from 'react-markdown'
import type { MarkdownEntry } from '../data/markdown'
import type { ContentCatalogEntry } from '../data/contentCatalog'
import ReadingModeToggle from './ReadingModeToggle'
import { useContentLibrary, type ContentKind } from '../hooks/useContentLibrary'
import ConfirmDialog from './ConfirmDialog'
import SourceAttributionLink from './SourceAttributionLink'
import { normalizeSearchText } from '../data/searchText'
import { pluralPl } from '../data/plural'
import NotFoundPage from '../pages/NotFoundPage'
import { readStorage, removeStorage, writeStorage } from '../data/storage'

export interface ContentCollectionConfig {
  /** Light list of all entries (no full text). */
  items: readonly ContentCatalogEntry[]
  /** Loads the full entry for the detail view. */
  loadEntry: (id: string) => Promise<MarkdownEntry | undefined>
  /** Loads the full text of every entry, for searching inside the texts. */
  loadAllEntries: () => Promise<readonly MarkdownEntry[]>
  /** Library kind used for favorites, recent items and reading position. */
  kind: Extract<ContentKind, 'prayer' | 'song'>
  /** Route of the list, e.g. `/modlitwy`; details live under `${basePath}/:id`. */
  basePath: string
  /** Session storage keys for restoring the list position. */
  scrollKey: string
  categoryKey: string
  /** Prefix of the category `<details>` element ids. */
  anchorPrefix: string
  categoryOrder: string[]
  /** CSS classes that differ between collections. */
  textClassName: string
  listClassName: string
  itemClassName: string
  labels: {
    title: string
    siblingNav: string
    filterPlaceholder: string
    emptyFilter: string
  }
  /**
   * Optional second filter by kind (e.g. litany, novena), shown as a row of chips.
   * `getType` returns one of `typeOrder` for every item.
   */
  types?: {
    label: string
    typeOrder: string[]
    getType: (item: ContentCatalogEntry) => string
  }
  /** Extra content shown under the list title. */
  listIntro?: ReactNode
  /** Extra content inside a category title, before the item count. */
  renderCategoryBadge?: (category: string) => ReactNode
  /** Extra content at the end of the detail view. */
  renderDetailFooter?: (selected: ContentCatalogEntry, prepareListReturn: () => void) => ReactNode
}

const fallbackCategory = 'Bez kategorii'

type ListEntry = ContentCatalogEntry

const byTitle = (a: ListEntry, b: ListEntry) => a.title.localeCompare(b.title, 'pl')

// Normalized once per collection (catalog, then full texts), not on every keystroke.
const searchableTextCache = new WeakMap<readonly object[], Map<string, string>>()
function getSearchableTexts(entries: readonly (ListEntry | MarkdownEntry)[]) {
  let texts = searchableTextCache.get(entries)
  if (!texts) {
    texts = new Map(entries.map((entry) => [
      entry.id,
      // Until the full texts arrive, the catalog excerpt stands in for the body.
      normalizeSearchText(`${entry.title} ${entry.category ?? ''} ${'body' in entry ? entry.body : entry.excerpt}`),
    ]))
    searchableTextCache.set(entries, texts)
  }
  return texts
}

const decodeRouteId = (routeId: string) => {
  try {
    return decodeURIComponent(routeId)
  } catch {
    return routeId
  }
}

const encodeRouteId = (routeId: string) => encodeURIComponent(routeId)

const getSelectedId = (routeId: string | undefined, pathname: string, basePath: string) => {
  if (routeId) return decodeRouteId(routeId)
  if (!pathname.startsWith(`${basePath}/`)) return null

  return decodeRouteId(pathname.slice(basePath.length + 1))
}

export default function ContentCollectionPage({
  items,
  loadEntry,
  loadAllEntries,
  kind,
  basePath,
  scrollKey,
  categoryKey,
  anchorPrefix,
  categoryOrder,
  textClassName,
  listClassName,
  itemClassName,
  labels,
  types,
  listIntro,
  renderCategoryBadge,
  renderDetailFooter,
}: ContentCollectionConfig) {
  const { id } = useParams()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [favoriteToRemove, setFavoriteToRemove] = useState<ListEntry | null>(null)
  const [loadedEntry, setLoadedEntry] = useState<MarkdownEntry | null>(null)
  const [entryFailed, setEntryFailed] = useState(false)
  const [fullEntries, setFullEntries] = useState<readonly MarkdownEntry[] | null>(null)
  const [clearHistoryOpen, setClearHistoryOpen] = useState(false)
  const [returnCategory] = useState(() => readStorage(categoryKey, 'session'))
  const selectedId = getSelectedId(id, location.pathname, basePath)
  const selected = selectedId ? items.find((item) => item.id === selectedId) ?? null : null
  const { favoriteIds, recentIds, isFavorite, toggleFavorite, removeFavorite, clearRecent } = useContentLibrary(kind, selected?.id)
  const favoriteItems = favoriteIds
    .map((favoriteId) => items.find((item) => item.id === favoriteId))
    .filter((item): item is ListEntry => Boolean(item))
  const recentItems = recentIds
    .filter(Boolean)
    .map((recentId) => items.find((item) => item.id === recentId))
    .filter((item): item is ListEntry => Boolean(item))

  const getCategory = (item: ListEntry) => (
    item.category && categoryOrder.includes(item.category) ? item.category : fallbackCategory
  )
  const getCategoryAnchorId = (category: string) => `${anchorPrefix}-${encodeURIComponent(category)}`
  const getItemPath = (item: ListEntry) => `${basePath}/${encodeRouteId(item.id)}`

  const detailCategory = selected ? getCategory(selected) : fallbackCategory
  const siblingItems = selected
    ? items.filter((item) => getCategory(item) === detailCategory).sort(byTitle)
    : []
  const detailIndex = selected ? siblingItems.findIndex((item) => item.id === selected.id) : -1
  const previousItem = detailIndex > 0 ? siblingItems[detailIndex - 1] : null
  const nextItem = detailIndex >= 0 && detailIndex < siblingItems.length - 1
    ? siblingItems[detailIndex + 1]
    : null

  // Full text of the opened entry (a small chunk of its own).
  useEffect(() => {
    if (!selected) return
    let cancelled = false
    loadEntry(selected.id).then(
      (entry) => {
        if (cancelled) return
        setEntryFailed(!entry)
        setLoadedEntry(entry ?? null)
      },
      () => { if (!cancelled) setEntryFailed(true) },
    )
    return () => { cancelled = true }
  }, [selected, loadEntry])

  // Searching inside the texts needs all of them; load them on the first search.
  const wantsFullText = query.trim().length > 0
  useEffect(() => {
    if (!wantsFullText || fullEntries) return
    let cancelled = false
    loadAllEntries().then(
      (entries) => { if (!cancelled) setFullEntries(entries) },
      // Offline without a cached copy: the list keeps searching titles and excerpts.
      () => undefined,
    )
    return () => { cancelled = true }
  }, [wantsFullText, fullEntries, loadAllEntries])

  // Restore the expanded category first, then the saved list position.
  useEffect(() => {
    if (selected) return

    const savedScroll = readStorage(scrollKey, 'session')
    if (!savedScroll && !returnCategory) return

    const frame = requestAnimationFrame(() => {
      const y = savedScroll ? Number.parseInt(savedScroll, 10) : Number.NaN
      if (Number.isFinite(y)) {
        window.scrollTo(0, y)
      } else if (returnCategory) {
        document.getElementById(`${anchorPrefix}-${encodeURIComponent(returnCategory)}`)?.scrollIntoView({ block: 'start' })
      }
      removeStorage(scrollKey, 'session')
      removeStorage(categoryKey, 'session')
    })

    return () => cancelAnimationFrame(frame)
  }, [selected, returnCategory, scrollKey, categoryKey, anchorPrefix])

  const saveListPosition = (category: string) => {
    writeStorage(scrollKey, String(window.scrollY), 'session')
    writeStorage(categoryKey, category, 'session')
  }

  const prepareListReturn = () => {
    writeStorage(categoryKey, detailCategory, 'session')
  }

  const grouped = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query.trim())
    const searchableTexts = normalizedQuery ? getSearchableTexts(fullEntries ?? items) : null
    const map = new Map<string, ListEntry[]>()
    for (const item of items) {
      const category = item.category && categoryOrder.includes(item.category)
        ? item.category
        : fallbackCategory
      if (selectedCategory !== 'all' && category !== selectedCategory) continue
      if (types && selectedType !== 'all' && types.getType(item) !== selectedType) continue

      if (searchableTexts && !searchableTexts.get(item.id)?.includes(normalizedQuery)) continue

      if (!map.has(category)) map.set(category, [])
      map.get(category)!.push(item)
    }
    return [...categoryOrder, fallbackCategory]
      .filter((cat) => map.has(cat))
      .map((cat) => ({ category: cat, items: [...map.get(cat)!].sort(byTitle) }))
  }, [items, categoryOrder, query, selectedCategory, types, selectedType, fullEntries])

  const typeCounts = useMemo(() => {
    const counts = new Map<string, number>()
    if (!types) return counts
    for (const item of items) {
      const type = types.getType(item)
      counts.set(type, (counts.get(type) ?? 0) + 1)
    }
    return counts
  }, [items, types])

  const resultCount = grouped.reduce((sum, group) => sum + group.items.length, 0)
  const hasActiveFilters = query.trim().length > 0 || selectedCategory !== 'all' || selectedType !== 'all'

  // An unknown id (e.g. an old link after a file rename) is a real 404, not the list.
  if (selectedId && !selected) return <NotFoundPage />

  if (selected) {
    const entry = loadedEntry?.id === selected.id ? loadedEntry : null
    if (!entry) {
      return (
        <div className="page content-detail-page content-detail-loading" aria-busy={!entryFailed}>
          <Link to={basePath} className="back-button" onClick={prepareListReturn}>
            <FaArrowLeft /> Powrót do listy
          </Link>
          <h1>{selected.title}</h1>
          <p className="content-detail-status" role="status">
            {entryFailed ? 'Nie udało się wczytać treści. Sprawdź połączenie i spróbuj ponownie.' : 'Wczytywanie…'}
          </p>
        </div>
      )
    }

    return (
      <div className="page content-detail-page">
        <Link to={basePath} className="back-button" onClick={prepareListReturn}>
          <FaArrowLeft /> Powrót do listy
        </Link>
        <nav className="content-breadcrumb" aria-label="Okruszki">
          <Link to={basePath} onClick={prepareListReturn}>{labels.title}</Link>
          <span aria-hidden="true">/</span>
          <Link to={basePath} onClick={prepareListReturn}>{detailCategory}</Link>
        </nav>
        <ReadingModeToggle
          contentKey={`${kind}:${selected.id}`}
          contentTitle={selected.title}
          isFavorite={isFavorite}
          onToggleFavorite={() => toggleFavorite(kind, selected.id)}
        />
        <h1>{selected.title}</h1>
        {entry.author && (
          <p className="content-rights-status">
            Autor: <strong>{entry.author}</strong>
            {entry.rightsStatus === 'original' && <> · opracowanie własne</>}
            {entry.rightsStatus === 'public-domain' && <> · domena publiczna</>}
          </p>
        )}
        {entry.rightsStatus === 'permission-required' ? (
          <aside className="psalms-rights-notice content-rights-notice">
            <FaCopyright aria-hidden="true" />
            <div>
              <h2>Tekst chroniony prawem autorskim</h2>
              <p>
                {entry.rightsNote ?? 'Pełny tekst wymaga zgody właściciela praw autorskich.'}
                {' '}Pozostawiamy tytuł, autora i dokładny adres źródłowy.
              </p>
            </div>
          </aside>
        ) : (
          <div className={textClassName} lang="pl">
            <Markdown>{entry.body}</Markdown>
          </div>
        )}
        {entry.source && (
          <SourceAttributionLink url={entry.source} />
        )}
        <nav className="content-sibling-nav" aria-label={labels.siblingNav}>
          {previousItem ? (
            <Link to={getItemPath(previousItem)}>
              <FaChevronLeft />
              <span className="content-sibling-copy">
                <small>Poprzednia</small>
                <span>{previousItem.title}</span>
              </span>
            </Link>
          ) : <span />}
          {nextItem && (
            <Link className="content-sibling-next" to={getItemPath(nextItem)}>
              <span className="content-sibling-copy">
                <small>Następna</small>
                <span>{nextItem.title}</span>
              </span>
              <FaChevronRight />
            </Link>
          )}
        </nav>
        {renderDetailFooter?.(selected, prepareListReturn)}
      </div>
    )
  }

  return (
    <div className="page">
      <h1>{labels.title}</h1>
      {listIntro}
      {favoriteItems.length > 0 && (
        <details className="prayer-category saved-content-category">
          <summary className="prayer-category-title"><FaStar aria-hidden="true" /> Ulubione <span>({favoriteItems.length})</span></summary>
          <ul className={listClassName}>
            {favoriteItems.map((item) => (
              <li key={item.id} className="saved-content-item">
                <Link to={getItemPath(item)} className={itemClassName}>{item.title}</Link>
                <button
                  type="button"
                  className="saved-content-remove"
                  aria-label={`Usuń „${item.title}” z ulubionych`}
                  title="Usuń z ulubionych"
                  onClick={() => setFavoriteToRemove(item)}
                >
                  <FaXmark aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
      {recentItems.length > 0 && (
        <details className="prayer-category saved-content-category">
          <summary className="prayer-category-title"><FaClock className="saved-content-recent-icon" aria-hidden="true" /> Ostatnio otwierane <span>({recentItems.length})</span></summary>
          <ul className={listClassName}>
            {recentItems.map((item) => (
              <li key={item.id}>
                <Link to={getItemPath(item)} className={itemClassName}>{item.title}</Link>
              </li>
            ))}
          </ul>
          <button type="button" className="saved-content-clear" onClick={() => setClearHistoryOpen(true)}>
            <FaTrash aria-hidden="true" /> Wyczyść historię
          </button>
        </details>
      )}
      {types && (
        <div className="list-type-filter" role="group" aria-label={types.label}>
          {['all', ...types.typeOrder].map((type) => {
            const count = type === 'all' ? items.length : typeCounts.get(type) ?? 0
            if (count === 0) return null
            return (
              <button
                key={type}
                type="button"
                className="list-type-chip"
                aria-pressed={selectedType === type}
                onClick={() => setSelectedType(type)}
              >
                {type === 'all' ? 'Wszystkie' : type}
                <span className="list-type-count">{count}</span>
              </button>
            )
          })}
        </div>
      )}
      <div className="list-filter-controls">
        <label>
          Szukaj
          <input
            className="list-filter-input"
            type="search"
            placeholder={labels.filterPlaceholder}
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
          Wyświetlono: {resultCount} {pluralPl(resultCount, 'pozycję', 'pozycje', 'pozycji')}
        </p>
      )}
      {resultCount === 0 && <p className="list-filter-empty">{labels.emptyFilter}</p>}
      {grouped.map(({ category, items: categoryItems }) => (
        <details
          key={category}
          id={getCategoryAnchorId(category)}
          className="prayer-category"
          open={hasActiveFilters || returnCategory === category || undefined}
        >
          <summary className="prayer-category-title">
            {category}
            {renderCategoryBadge?.(category)}
            <span>({categoryItems.length})</span>
          </summary>
          <ul className={listClassName}>
            {categoryItems.map((item, index) => (
              <li key={item.id} style={{ '--item-index': index } as CSSProperties}>
                <Link
                  to={getItemPath(item)}
                  className={itemClassName}
                  onClick={() => saveListPosition(category)}
                >
                  {item.title}
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
          if (favoriteToRemove) removeFavorite(kind, favoriteToRemove.id)
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
