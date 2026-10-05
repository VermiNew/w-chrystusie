import { FaChurch } from 'react-icons/fa6'
import { colorNames, getLiturgicalDay, getNextCelebration } from '../data/liturgicalCalendar'

const formatDay = (date: Date) => date.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const formatShortDay = (date: Date) => date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', weekday: 'long' })

/** "Dzisiaj w liturgii" — computed on the device, so it works offline. */
export default function LiturgyToday() {
  const today = new Date()
  const day = getLiturgicalDay(today)
  const next = getNextCelebration(today)

  return (
    <section className="liturgy-today" aria-labelledby="liturgy-today-title">
      <div className="liturgy-today-heading">
        <FaChurch aria-hidden="true" />
        <h2 id="liturgy-today-title">Dzisiaj w liturgii</h2>
        <span className="liturgy-today-date">{formatDay(today)}</span>
      </div>
      <p className="liturgy-today-title">
        <span className={`liturgy-color liturgy-color--${day.color}`} aria-hidden="true" />
        {day.title}
      </p>
      <p className="liturgy-today-meta">
        <span>{day.season.name}</span>
        <span>kolor szat: {colorNames[day.color]}</span>
        {day.holyDayOfObligation && <span className="liturgy-today-obligation">dzień święty nakazany</span>}
      </p>
      {next && (
        <p className="liturgy-today-next">
          Najbliżej: <strong>{next.day.title}</strong> — {formatShortDay(next.date)}
        </p>
      )}
    </section>
  )
}
