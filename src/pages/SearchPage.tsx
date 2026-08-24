import { Fragment, useEffect, useState, useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { FaKeyboard } from 'react-icons/fa6'
import { prayers, type Prayer } from '../data/prayers'
import { songs, type Song } from '../data/songs'
import { psalms, type Psalm } from '../data/psalms'

type ResultType = 'prayer' | 'song' | 'psalm'
type SearchSection = 'all' | ResultType
type SearchScope = 'all' | 'title' | 'content'

interface SearchResult {
  type: ResultType
  title: string
  category?: string
  content: string
  normalizedContent: string
  data: Prayer | Song | Psalm
}

interface SearchGroups {
  titleMatches: SearchResult[]
  contentMatches: SearchResult[]
}

interface SearchDocument {
  type: ResultType
  title: string
  category?: string
  content: string
  normalizedTitle: string
  normalizedContent: string
  data: Prayer | Song | Psalm
}

const FALLBACK_CATEGORY = 'Bez kategorii'
const SNIPPET_LENGTH = 180

const normalize = (value: string) => value
  .toLocaleLowerCase('pl-PL')
  .normalize('NFD')
  .replace(/\p{M}/gu, '')
  .replace(/ł/g, 'l')

const compactContent = (content: string) => content
  .replace(/[#*_>`[\]]/g, '')
  .replace(/\s+/g, ' ')
  .trim()

function createSearchDocument(
  type: ResultType,
  title: string,
  category: string | undefined,
  rawContent: string,
  data: Prayer | Song | Psalm,
): SearchDocument {
  const content = compactContent(rawContent)
  return {
    type,
    title,
    category,
    content,
    normalizedTitle: normalize(title),
    normalizedContent: normalize(content),
    data,
  }
}

const searchIndex: SearchDocument[] = [
  ...prayers.map((prayer) => createSearchDocument(
    'prayer', prayer.title, prayer.category, prayer.body, prayer,
  )),
  ...songs.map((song) => createSearchDocument(
    'song', song.title, song.category, song.body, song,
  )),
  ...psalms.flatMap((psalm) => psalm.verses.map((verse) => createSearchDocument(
    'psalm', `${psalm.title}:${verse.number}`, 'Psalmy', verse.text, psalm,
  ))),
]

function getContextSnippet(content: string, normalizedContent: string, normalizedQuery: string): string {
  const matchIndex = normalizedContent.indexOf(normalizedQuery)

  if (content.length <= SNIPPET_LENGTH) return content
  if (matchIndex < 0) return `${content.slice(0, SNIPPET_LENGTH).trim()}…`

  const contextBefore = Math.floor((SNIPPET_LENGTH - normalizedQuery.length) / 2)
  const start = Math.max(0, matchIndex - contextBefore)
  const end = Math.min(content.length, start + SNIPPET_LENGTH)

  return `${start > 0 ? '…' : ''}${content.slice(start, end).trim()}${end < content.length ? '…' : ''}`
}

function getTitleRank(title: string, query: string): number {
  const normalizedTitle = normalize(title)
  const normalizedQuery = normalize(query)
  if (normalizedTitle === normalizedQuery) return 0
  if (normalizedTitle.startsWith(normalizedQuery)) return 1
  return 2
}

function sortTitleMatches(results: SearchResult[], query: string): SearchResult[] {
  return results.sort((a, b) => {
    const rankDifference = getTitleRank(a.title, query) - getTitleRank(b.title, query)
    return rankDifference || a.title.localeCompare(b.title, 'pl')
  })
}

function searchEntries(
  query: string,
  section: SearchSection,
  category: string,
  scope: SearchScope,
): SearchGroups {
  const normalizedQuery = normalize(query)
  const titleMatches: SearchResult[] = []
  const contentMatches: SearchResult[] = []
  if (!normalizedQuery) return { titleMatches, contentMatches }

  for (const document of searchIndex) {
    if (section !== 'all' && document.type !== section) continue
    if (category !== 'all' && (document.category ?? FALLBACK_CATEGORY) !== category) continue

    const result = {
      type: document.type,
      title: document.title,
      category: document.category,
      content: document.content,
      normalizedContent: document.normalizedContent,
      data: document.data,
    }

    if (scope !== 'content' && document.normalizedTitle.includes(normalizedQuery)) {
      titleMatches.push(result)
      continue
    }

    if (scope !== 'title' && document.normalizedContent.includes(normalizedQuery)) {
      contentMatches.push(result)
    }
  }

  return {
    titleMatches: sortTitleMatches(titleMatches, query),
    contentMatches,
  }
}

const typeLabels: Record<ResultType, string> = {
  prayer: 'Modlitwa',
  song: 'Pieśń',
  psalm: 'Psalm',
}

const encodeRouteId = (routeId: string) => encodeURIComponent(routeId)
const DEBOUNCE_MS = 200
const RESULTS_PAGE_SIZE = 12

function highlightQuery(text: string, query: string): ReactNode {
  if (!query) return text

  const displayText = text.normalize('NFC')
  const normalizedText = normalize(displayText)
  const normalizedQuery = normalize(query)
  if (!normalizedQuery) return displayText
  const parts: ReactNode[] = []
  let cursor = 0
  let matchIndex = normalizedText.indexOf(normalizedQuery)

  while (matchIndex >= 0) {
    if (matchIndex > cursor) {
      parts.push(<Fragment key={`text-${cursor}`}>{displayText.slice(cursor, matchIndex)}</Fragment>)
    }

    const matchEnd = matchIndex + normalizedQuery.length
    parts.push(
      <mark key={`match-${matchIndex}`} className="search-highlight">
        {displayText.slice(matchIndex, matchEnd)}
      </mark>,
    )
    cursor = matchEnd
    matchIndex = normalizedText.indexOf(normalizedQuery, cursor)
  }

  if (cursor === 0) return displayText
  if (cursor < displayText.length) {
    parts.push(<Fragment key={`text-${cursor}`}>{displayText.slice(cursor)}</Fragment>)
  }

  return parts
}

function SearchResultItem({ result, query }: { result: SearchResult; query: string }) {
  const snippet = getContextSnippet(result.content, result.normalizedContent, normalize(query))
  const content = (
    <>
      <span className="search-result-type">{typeLabels[result.type]}</span>
      {result.category && <span className="search-result-category">{result.category}</span>}
      <strong className="search-result-title">{highlightQuery(result.title, query)}</strong>
      {snippet && (
        <p className="search-result-snippet">{highlightQuery(snippet, query)}</p>
      )}
    </>
  )

  if (result.type === 'prayer') {
    return (
      <Link className="search-result search-result-clickable" to={`/modlitwy/${encodeRouteId((result.data as Prayer).id)}`}>
        {content}
      </Link>
    )
  }

  if (result.type === 'song') {
    return (
      <Link className="search-result search-result-clickable" to={`/spiewnik/${encodeRouteId((result.data as Song).id)}`}>
        {content}
      </Link>
    )
  }

  return (
    <Link className="search-result search-result-clickable" to={`/pismo-swiete/psalmy/${(result.data as Psalm).number}`}>
      {content}
    </Link>
  )
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [section, setSection] = useState<SearchSection>('all')
  const [category, setCategory] = useState('all')
  const [scope, setScope] = useState<SearchScope>('all')
  const [visibleTitleCount, setVisibleTitleCount] = useState(RESULTS_PAGE_SIZE)
  const [visibleContentCount, setVisibleContentCount] = useState(RESULTS_PAGE_SIZE)

  const resetVisibleResults = () => {
    setVisibleTitleCount(RESULTS_PAGE_SIZE)
    setVisibleContentCount(RESULTS_PAGE_SIZE)
  }

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query])

  const categories = useMemo(() => {
    const values = new Set<string>()
    if (section === 'all' || section === 'prayer') {
      for (const prayer of prayers) values.add(prayer.category ?? FALLBACK_CATEGORY)
    }
    if (section === 'all' || section === 'song') {
      for (const song of songs) values.add(song.category ?? FALLBACK_CATEGORY)
    }
    return [...values].sort((a, b) => a.localeCompare(b, 'pl'))
  }, [section])

  const trimmed = debouncedQuery.trim()
  const groups = useMemo(
    () => trimmed.length >= 2
      ? searchEntries(trimmed, section, category, scope)
      : { titleMatches: [], contentMatches: [] },
    [trimmed, section, category, scope],
  )
  const resultCount = groups.titleMatches.length + groups.contentMatches.length
  const visibleTitleMatches = groups.titleMatches.slice(0, visibleTitleCount)
  const visibleContentMatches = groups.contentMatches.slice(0, visibleContentCount)

  return (
    <div className="page">
      <h1>Szukaj</h1>
      <input
        className="search-input"
        type="text"
        aria-label="Szukana fraza"
        placeholder="Wpisz frazę…"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          resetVisibleResults()
        }}
        autoFocus
      />
      <div className="search-filters" aria-label="Filtry wyszukiwania">
        <label>
          Sekcja
          <select
            value={section}
            onChange={(event) => {
              setSection(event.target.value as SearchSection)
              setCategory('all')
              resetVisibleResults()
            }}
          >
            <option value="all">Wszystkie sekcje</option>
            <option value="prayer">Modlitwy</option>
            <option value="song">Pieśni</option>
            <option value="psalm">Psalmy</option>
          </select>
        </label>
        <label>
          Kategoria
          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value)
              resetVisibleResults()
            }}
            disabled={section === 'psalm'}
          >
            <option value="all">Wszystkie kategorie</option>
            {categories.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label>
          Szukaj w
          <select
            value={scope}
            onChange={(event) => {
              setScope(event.target.value as SearchScope)
              resetVisibleResults()
            }}
          >
            <option value="all">Tytułach i treści</option>
            <option value="title">Tylko w tytułach</option>
            <option value="content">Tylko w treści</option>
          </select>
        </label>
      </div>
      {!query.trim() && (
        <p className="search-hint"><FaKeyboard /> Naciśnij <kbd>/</kbd> z dowolnej strony, aby szybko przejść do wyszukiwania.</p>
      )}
      {trimmed.length >= 2 && (
        <p className="search-count">
          Znaleziono: {resultCount} {resultCount === 1 ? 'wynik' : 'wyników'}
        </p>
      )}
      {trimmed.length >= 2 && resultCount === 0 && (
        <p className="search-empty">Brak wyników dla wybranych filtrów.</p>
      )}
      {groups.titleMatches.length > 0 && (
        <section className="search-group">
          <h2>Tytuły <span>({groups.titleMatches.length})</span></h2>
          <ul className="search-results">
            {visibleTitleMatches.map((result) => (
              <li key={result.type === 'psalm' ? `psalm-${result.title}` : `${result.type}-${(result.data as Prayer | Song).id}`}>
                <SearchResultItem result={result} query={trimmed} />
              </li>
            ))}
          </ul>
          {visibleTitleCount < groups.titleMatches.length && (
            <button
              type="button"
              className="search-show-more"
              onClick={() => setVisibleTitleCount((count) => count + RESULTS_PAGE_SIZE)}
            >
              Pokaż więcej tytułów
              <span>({groups.titleMatches.length - visibleTitleCount})</span>
            </button>
          )}
        </section>
      )}
      {groups.contentMatches.length > 0 && (
        <section className="search-group">
          <h2>Zawartość plików <span>({groups.contentMatches.length})</span></h2>
          <ul className="search-results">
            {visibleContentMatches.map((result) => (
              <li key={result.type === 'psalm' ? `psalm-${result.title}` : `${result.type}-${(result.data as Prayer | Song).id}`}>
                <SearchResultItem result={result} query={trimmed} />
              </li>
            ))}
          </ul>
          {visibleContentCount < groups.contentMatches.length && (
            <button
              type="button"
              className="search-show-more"
              onClick={() => setVisibleContentCount((count) => count + RESULTS_PAGE_SIZE)}
            >
              Pokaż więcej wyników z treści
              <span>({groups.contentMatches.length - visibleContentCount})</span>
            </button>
          )}
        </section>
      )}
    </div>
  )
}
