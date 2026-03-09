import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { prayers, type Prayer } from '../data/prayers'
import { songs, type Song } from '../data/songs'
import { loadBible, type Book } from '../data/scripture'

interface SearchResult {
  type: 'prayer' | 'song' | 'verse'
  title: string
  snippet: string
  category?: string
  data: Prayer | Song | { book: string; chapter: number; verse: number }
}

function searchPrayers(query: string): SearchResult[] {
  const q = query.toLowerCase()
  return (prayers as Prayer[])
    .filter((p) => p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q))
    .map((p) => ({
      type: 'prayer' as const,
      title: p.title,
      snippet: p.body.slice(0, 120) + (p.body.length > 120 ? '…' : ''),
      category: p.category,
      data: p,
    }))
}

function searchSongs(query: string): SearchResult[] {
  const q = query.toLowerCase()
  return (songs as Song[])
    .filter((s) => s.title.toLowerCase().includes(q) || s.body.toLowerCase().includes(q))
    .map((s) => ({
      type: 'song' as const,
      title: s.title,
      snippet: s.body.slice(0, 120) + (s.body.length > 120 ? '…' : ''),
      category: s.category,
      data: s,
    }))
}

function searchScripture(query: string, books: Book[]): SearchResult[] {
  const q = query.toLowerCase()
  const results: SearchResult[] = []

  for (const book of books) {
    for (const chapter of book.chapters) {
      for (const verse of chapter.verses) {
        if (verse.text.toLowerCase().includes(q)) {
          results.push({
            type: 'verse',
            title: `${book.name} ${chapter.number}:${verse.number}`,
            snippet: verse.text.slice(0, 120) + (verse.text.length > 120 ? '…' : ''),
            data: { book: book.name, chapter: chapter.number, verse: verse.number },
          })
        }
        if (results.length >= 50) return results
      }
    }
  }

  return results
}

const typeLabels: Record<string, string> = {
  prayer: 'Modlitwa',
  song: 'Pieśń',
  verse: 'Pismo Święte',
}

export default function SearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [books, setBooks] = useState<Book[]>([])
  const [bibleLoading, setBibleLoading] = useState(true)

  useEffect(() => {
    loadBible().then((data) => {
      setBooks(data)
      setBibleLoading(false)
    })
  }, [])

  const trimmed = query.trim()
  const results =
    trimmed.length >= 2
      ? [...searchPrayers(trimmed), ...searchSongs(trimmed), ...searchScripture(trimmed, books)]
      : []

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
      {bibleLoading && trimmed.length >= 2 && (
        <p className="search-loading">Ładowanie Pisma Świętego…</p>
      )}
      {trimmed.length >= 2 && (
        <p className="search-count">
          Znaleziono: {results.length}{results.length >= 50 ? '+' : ''} wyników
        </p>
      )}
      <ul className="search-results">
        {results.map((r, i) => (
          <li
            key={i}
            className="search-result search-result-clickable"
            onClick={() => {
              if (r.type === 'prayer') navigate('/modlitwy', { state: { selectedId: (r.data as Prayer).id } })
              else if (r.type === 'song') navigate('/spiewnik', { state: { selectedId: (r.data as Song).id } })
            }}
          >
            <span className="search-result-type">{typeLabels[r.type]}</span>
            {r.category && <span className="search-result-category">{r.category}</span>}
            <strong className="search-result-title">{r.title}</strong>
            <p className="search-result-snippet">{r.snippet}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
