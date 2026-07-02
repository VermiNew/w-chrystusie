import { Fragment, useEffect, useState, useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { FaKeyboard } from 'react-icons/fa6'
import { prayers, type Prayer } from '../data/prayers'
import { songs, type Song } from '../data/songs'
import { loadBible, type Book } from '../data/scripture'

type ResultType = 'prayer' | 'song' | 'verse'
type SearchSection = 'all' | ResultType
type SearchScope = 'all' | 'title' | 'content'

interface SearchResult {
  type: ResultType
  title: string
  snippet: string
  category?: string
  data: Prayer | Song | { book: string; chapter: number; verse: number }
}

interface SearchGroups {
  titleMatches: SearchResult[]
  contentMatches: SearchResult[]
}

const FALLBACK_CATEGORY = 'Bez kategorii'
const SNIPPET_LENGTH = 180

const normalize = (value: string) => value.toLocaleLowerCase('pl-PL')

function getContextSnippet(content: string, query: string): string {
  const compact = content.replace(/[#*_>`[\]]/g, '').replace(/\s+/g, ' ').trim()
  const matchIndex = normalize(compact).indexOf(normalize(query))

  if (compact.length <= SNIPPET_LENGTH) return compact
  if (matchIndex < 0) return `${compact.slice(0, SNIPPET_LENGTH).trim()}…`

  const contextBefore = Math.floor((SNIPPET_LENGTH - query.length) / 2)
  const start = Math.max(0, matchIndex - contextBefore)
  const end = Math.min(compact.length, start + SNIPPET_LENGTH)

  return `${start > 0 ? '…' : ''}${compact.slice(start, end).trim()}${end < compact.length ? '…' : ''}`
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
  books: Book[],
): SearchGroups {
  const normalizedQuery = normalize(query)
  const titleMatches: SearchResult[] = []
  const contentMatches: SearchResult[] = []

  const addResult = (result: SearchResult, content: string) => {
    if (category !== 'all' && (result.category ?? FALLBACK_CATEGORY) !== category) return

    const titleMatchesQuery = normalize(result.title).includes(normalizedQuery)
    if (scope !== 'content' && titleMatchesQuery) {
      titleMatches.push(result)
      return
    }

    if (scope !== 'title' && normalize(content).includes(normalizedQuery)) {
      contentMatches.push({ ...result, snippet: getContextSnippet(content, query) })
    }
  }

  if (section === 'all' || section === 'prayer') {
    for (const prayer of prayers) {
      addResult({
        type: 'prayer',
        title: prayer.title,
        snippet: getContextSnippet(prayer.body, query),
        category: prayer.category,
        data: prayer,
      }, prayer.body)
    }
  }

  if (section === 'all' || section === 'song') {
    for (const song of songs) {
      addResult({
        type: 'song',
        title: song.title,
        snippet: getContextSnippet(song.body, query),
        category: song.category,
        data: song,
      }, song.body)
    }
  }

  if (section === 'all' || section === 'verse') {
    for (const book of books) {
      for (const chapter of book.chapters) {
        for (const verse of chapter.verses) {
          addResult({
            type: 'verse',
            title: `${book.name} ${chapter.number}:${verse.number}`,
            snippet: getContextSnippet(verse.text, query),
            data: { book: book.name, chapter: chapter.number, verse: verse.number },
          }, verse.text)
        }
      }
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
  verse: 'Pismo Święte',
}

const encodeRouteId = (routeId: string) => encodeURIComponent(routeId)
const DEBOUNCE_MS = 200

function highlightQuery(text: string, query: string): ReactNode {
  if (!query) return text

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'))

  return parts.map((part, index) =>
    normalize(part) === normalize(query)
      ? <mark key={`${part}-${index}`} className="search-highlight">{part}</mark>
      : <Fragment key={`${part}-${index}`}>{part}</Fragment>,
  )
}

function SearchResultItem({ result, query }: { result: SearchResult; query: string }) {
  const content = (
    <>
      <span className="search-result-type">{typeLabels[result.type]}</span>
      {result.category && <span className="search-result-category">{result.category}</span>}
      <strong className="search-result-title">{highlightQuery(result.title, query)}</strong>
      {result.snippet && (
        <p className="search-result-snippet">{highlightQuery(result.snippet, query)}</p>
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

  return <article className="search-result">{content}</article>
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [section, setSection] = useState<SearchSection>('all')
  const [category, setCategory] = useState('all')
  const [scope, setScope] = useState<SearchScope>('all')
  const [books, setBooks] = useState<Book[]>([])
  const [bibleLoading, setBibleLoading] = useState(true)

  useEffect(() => {
    loadBible()
      .then((data) => {
        setBooks(data)
      })
      .catch(() => {
        setBooks([])
      })
      .finally(() => {
        setBibleLoading(false)
      })
  }, [])

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
      ? searchEntries(trimmed, section, category, scope, books)
      : { titleMatches: [], contentMatches: [] },
    [trimmed, section, category, scope, books],
  )
  const resultCount = groups.titleMatches.length + groups.contentMatches.length
  const showBibleLoading = bibleLoading && trimmed.length >= 2 && (section === 'all' || section === 'verse')

  return (
    <div className="page">
      <h1>Szukaj</h1>
      <input
        className="search-input"
        type="text"
        placeholder="Wpisz frazę…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
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
            }}
          >
            <option value="all">Wszystkie sekcje</option>
            <option value="prayer">Modlitwy</option>
            <option value="song">Pieśni</option>
            <option value="verse">Pismo Święte</option>
          </select>
        </label>
        <label>
          Kategoria
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            disabled={section === 'verse'}
          >
            <option value="all">Wszystkie kategorie</option>
            {categories.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label>
          Szukaj w
          <select value={scope} onChange={(event) => setScope(event.target.value as SearchScope)}>
            <option value="all">Tytułach i treści</option>
            <option value="title">Tylko w tytułach</option>
            <option value="content">Tylko w treści</option>
          </select>
        </label>
      </div>
      {!query.trim() && (
        <p className="search-hint"><FaKeyboard /> Naciśnij <kbd>/</kbd> z dowolnej strony, aby szybko przejść do wyszukiwania.</p>
      )}
      {showBibleLoading && (
        <p className="search-loading">Ładowanie Pisma Świętego…</p>
      )}
      {trimmed.length >= 2 && (
        <p className="search-count">
          Znaleziono: {resultCount} {resultCount === 1 ? 'wynik' : 'wyników'}
        </p>
      )}
      {trimmed.length >= 2 && resultCount === 0 && !showBibleLoading && (
        <p className="search-empty">Brak wyników dla wybranych filtrów.</p>
      )}
      {groups.titleMatches.length > 0 && (
        <section className="search-group">
          <h2>Tytuły <span>({groups.titleMatches.length})</span></h2>
          <ul className="search-results">
            {groups.titleMatches.map((result) => (
              <li key={result.type === 'verse' ? `verse-${result.title}` : `${result.type}-${(result.data as Prayer | Song).id}`}>
                <SearchResultItem result={result} query={trimmed} />
              </li>
            ))}
          </ul>
        </section>
      )}
      {groups.contentMatches.length > 0 && (
        <section className="search-group">
          <h2>Zawartość plików <span>({groups.contentMatches.length})</span></h2>
          <ul className="search-results">
            {groups.contentMatches.map((result) => (
              <li key={result.type === 'verse' ? `verse-${result.title}` : `${result.type}-${(result.data as Prayer | Song).id}`}>
                <SearchResultItem result={result} query={trimmed} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
