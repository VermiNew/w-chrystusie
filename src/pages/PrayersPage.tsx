import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Markdown from 'react-markdown'
import { prayers, type Prayer } from '../data/prayers'

export default function PrayersPage() {
  const location = useLocation()
  const initialId = (location.state as { selectedId?: string })?.selectedId
  const initial = initialId ? prayers.find((p) => p.id === initialId) ?? null : null
  const [selected, setSelected] = useState<Prayer | null>(initial)

  if (selected) {
    return (
      <div className="page">
        <button className="back-button" onClick={() => setSelected(null)}>
          ← Powrót do listy
        </button>
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
      <ul className="prayer-list">
        {prayers.map((prayer) => (
          <li key={prayer.id}>
            <button className="prayer-item" onClick={() => setSelected(prayer)}>
              {prayer.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
