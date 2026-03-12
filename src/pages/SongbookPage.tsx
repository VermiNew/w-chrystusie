import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Markdown from 'react-markdown'
import { songs, type Song } from '../data/songs'

const categoryOrder = [
  'Pieśni uwielbienia',
  'Pieśni maryjne',
  'Pieśni pokutne',
]

export default function SongbookPage() {
  const location = useLocation()
  const initialId = (location.state as { selectedId?: string })?.selectedId
  const initial = initialId ? songs.find((s) => s.id === initialId) ?? null : null
  const [selected, setSelected] = useState<Song | null>(initial)

  const grouped = useMemo(() => {
    const map = new Map<string, Song[]>()
    for (const song of songs) {
      const cat = song.category ?? 'Bez kategorii'
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(song)
    }
    return categoryOrder
      .filter((cat) => map.has(cat))
      .map((cat) => ({ category: cat, items: map.get(cat)! }))
  }, [])

  if (selected) {
    return (
      <div className="page">
        <button className="back-button" onClick={() => setSelected(null)}>
          ← Powrót do listy
        </button>
        <h1>{selected.title}</h1>
        <div className="song-text">
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
      {grouped.map(({ category, items }) => (
        <section key={category} className="prayer-category">
          <h2 className="prayer-category-title">{category}</h2>
          <ul className="song-list">
            {items.map((song) => (
              <li key={song.id}>
                <button className="song-item" onClick={() => setSelected(song)}>
                  {song.title}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
