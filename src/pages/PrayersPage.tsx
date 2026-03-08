import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Markdown from 'react-markdown'
import { prayers, type Prayer } from '../data/prayers'

const categoryOrder = [
  'Modlitwy codzienne',
  'Litanie',
  'Modlitwy maryjne',
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
  'Katechizm',
]

export default function PrayersPage() {
  const location = useLocation()
  const initialId = (location.state as { selectedId?: string })?.selectedId
  const initial = initialId ? prayers.find((p) => p.id === initialId) ?? null : null
  const [selected, setSelected] = useState<Prayer | null>(initial)

  const grouped = useMemo(() => {
    const map = new Map<string, Prayer[]>()
    for (const prayer of prayers) {
      const cat = prayer.category ?? 'Bez kategorii'
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(prayer)
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
      {grouped.map(({ category, items }) => (
        <section key={category} className="prayer-category">
          <h2 className="prayer-category-title">{category}</h2>
          <ul className="prayer-list">
            {items.map((prayer) => (
              <li key={prayer.id}>
                <button className="prayer-item" onClick={() => setSelected(prayer)}>
                  {prayer.title}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
