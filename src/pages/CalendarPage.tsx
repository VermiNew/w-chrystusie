/**
 * Liturgical calendar: a month grid with the color and rank of every day, and the
 * details of the selected day. Everything is computed on the device
 * (src/data/liturgicalCalendar.ts), so it works offline.
 *
 * The selected day lives in the URL (`?d=2026-11-13`), so a day can be shared
 * and the back button returns to the previously viewed day.
 */
import { useSearchParams } from 'react-router-dom'
import { FaChevronLeft, FaChevronRight, FaCalendarDay } from 'react-icons/fa6'
import { colorNames, getLiturgicalDay, type LiturgicalDay } from '../data/liturgicalCalendar'

const WEEKDAY_LABELS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd']

const rankLabels: Record<LiturgicalDay['rank'], string> = {
  solemnity: 'uroczystość',
  feast: 'święto',
  commemoration: 'wspomnienie',
  sunday: 'niedziela',
  weekday: 'dzień powszedni',
}

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

const toParam = (date: Date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-')

/** Parses `YYYY-MM-DD` as a local date; anything invalid falls back to today. */
function parseParam(value: string | null): Date {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return startOfDay(new Date())
  const [year, month, day] = match.slice(1).map(Number)
  const date = new Date(year, month - 1, day)
  // Rejects dates like 2026-02-31, which Date would roll over to March.
  if (date.getMonth() !== month - 1 || year < 1970 || year > 2200) return startOfDay(new Date())
  return date
}

const isSameDay = (a: Date, b: Date) => toParam(a) === toParam(b)

const formatLong = (date: Date) => date.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const formatMonth = (date: Date) => date.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })
const formatListDay = (date: Date) => date.toLocaleDateString('pl-PL', { day: 'numeric', weekday: 'short' })

interface CalendarCell {
  date: Date
  day: LiturgicalDay
}

/** All days of the month containing `date`, plus leading blanks so weeks start on Monday. */
function buildMonth(date: Date): { leadingBlanks: number; cells: CalendarCell[] } {
  const first = new Date(date.getFullYear(), date.getMonth(), 1)
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const cells = Array.from({ length: daysInMonth }, (_, index) => {
    const cellDate = new Date(date.getFullYear(), date.getMonth(), index + 1)
    return { date: cellDate, day: getLiturgicalDay(cellDate) }
  })
  return { leadingBlanks: (first.getDay() + 6) % 7, cells }
}

export default function CalendarPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selected = parseParam(searchParams.get('d'))
  const today = startOfDay(new Date())

  // ~31 calendar lookups per render — cheap enough without memoization.
  const month = buildMonth(selected)
  const selectedDay = getLiturgicalDay(selected)
  const celebrations = month.cells.filter(({ day }) => day.rank === 'solemnity' || day.rank === 'feast')

  const select = (date: Date) => {
    const params = new URLSearchParams(searchParams)
    if (isSameDay(date, today)) params.delete('d')
    else params.set('d', toParam(date))
    setSearchParams(params)
  }

  const shiftDays = (days: number) => select(new Date(selected.getFullYear(), selected.getMonth(), selected.getDate() + days))
  const shiftMonths = (months: number) => {
    const target = new Date(selected.getFullYear(), selected.getMonth() + months, 1)
    // Keep the day of month when it exists (31 Jan → 28/29 Feb).
    const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
    select(new Date(target.getFullYear(), target.getMonth(), Math.min(selected.getDate(), lastDay)))
  }

  return (
    <div className="page liturgical-calendar-page">
      <h1>Kalendarz liturgiczny</h1>

      <section className="calendar-day-card" aria-live="polite" aria-labelledby="calendar-day-title">
        <div className="calendar-day-nav">
          <button type="button" onClick={() => shiftDays(-1)} aria-label="Poprzedni dzień">
            <FaChevronLeft aria-hidden="true" />
          </button>
          <p className="calendar-day-date">
            {formatLong(selected)}
            {isSameDay(selected, today) && <span className="calendar-today-badge">dzisiaj</span>}
          </p>
          <button type="button" onClick={() => shiftDays(1)} aria-label="Następny dzień">
            <FaChevronRight aria-hidden="true" />
          </button>
        </div>
        <h2 id="calendar-day-title" className="calendar-day-title">
          <span className={`liturgy-color liturgy-color--${selectedDay.color}`} aria-hidden="true" />
          {selectedDay.title}
        </h2>
        <p className="liturgy-today-meta">
          <span>{rankLabels[selectedDay.rank]}</span>
          <span>{selectedDay.season.name}</span>
          <span>kolor szat: {colorNames[selectedDay.color]}</span>
          {selectedDay.holyDayOfObligation && <span className="liturgy-today-obligation">dzień święty nakazany</span>}
        </p>
        {!isSameDay(selected, today) && (
          <button type="button" className="calendar-today-button" onClick={() => select(today)}>
            <FaCalendarDay aria-hidden="true" /> Wróć do dzisiaj
          </button>
        )}
      </section>

      <section className="calendar-month" aria-labelledby="calendar-month-title">
        <div className="calendar-month-header">
          <button type="button" onClick={() => shiftMonths(-1)} aria-label="Poprzedni miesiąc">
            <FaChevronLeft aria-hidden="true" />
          </button>
          <h2 id="calendar-month-title">{formatMonth(selected)}</h2>
          <button type="button" onClick={() => shiftMonths(1)} aria-label="Następny miesiąc">
            <FaChevronRight aria-hidden="true" />
          </button>
        </div>
        {/* Plain buttons, not role="grid": every button names its full date, and a grid role
            would promise arrow-key navigation that this calendar does not have. */}
        <div className="calendar-grid">
          <div className="calendar-grid-row calendar-weekdays" aria-hidden="true">
            {WEEKDAY_LABELS.map((label) => (
              <span key={label} className={label === 'Nd' ? 'calendar-sunday' : undefined}>{label}</span>
            ))}
          </div>
          <div className="calendar-grid-days">
            {Array.from({ length: month.leadingBlanks }, (_, index) => (
              <span key={`blank-${index}`} className="calendar-cell calendar-cell--blank" aria-hidden="true" />
            ))}
            {month.cells.map(({ date, day }) => {
              const isSelected = isSameDay(date, selected)
              const isToday = isSameDay(date, today)
              const isCelebration = day.rank === 'solemnity' || day.rank === 'feast'
              return (
                <button
                  key={toParam(date)}
                  type="button"
                  aria-pressed={isSelected}
                  aria-current={isToday ? 'date' : undefined}
                  aria-label={`${formatLong(date)}: ${day.title}`}
                  className={[
                    'calendar-cell',
                    `calendar-cell--${day.rank}`,
                    date.getDay() === 0 ? 'calendar-sunday' : '',
                    isSelected ? 'calendar-cell--selected' : '',
                    isToday ? 'calendar-cell--today' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => select(date)}
                >
                  <span className="calendar-cell-number">
                    {date.getDate()}
                    {isCelebration && <span className="calendar-cell-mark" aria-hidden="true">{day.rank === 'solemnity' ? 'U' : 'Ś'}</span>}
                  </span>
                  <span className={`liturgy-color liturgy-color--${day.color}`} aria-hidden="true" />
                </button>
              )
            })}
          </div>
        </div>
        <p className="calendar-legend">
          <span><strong>U</strong> uroczystość</span>
          <span><strong>Ś</strong> święto</span>
          <span>Kropka — kolor szat liturgicznych</span>
        </p>
      </section>

      {celebrations.length > 0 && (
        <section className="calendar-celebrations" aria-labelledby="calendar-celebrations-title">
          <h2 id="calendar-celebrations-title">Uroczystości i święta w tym miesiącu</h2>
          <ul>
            {celebrations.map(({ date, day }) => (
              <li key={toParam(date)}>
                <button type="button" onClick={() => select(date)} aria-current={isSameDay(date, selected) ? 'true' : undefined}>
                  <span className="calendar-celebration-date">{formatListDay(date)}</span>
                  <span className={`liturgy-color liturgy-color--${day.color}`} aria-hidden="true" />
                  <span className="calendar-celebration-title">{day.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="calendar-note">
        Kalendarz obejmuje okresy liturgiczne, niedziele, uroczystości i święta (ogólne i polskie).
        Wspomnienia świętych zostaną dodane po sprawdzeniu źródła.
      </p>
    </div>
  )
}
