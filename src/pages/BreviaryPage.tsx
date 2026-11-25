import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FaArrowLeft, FaArrowRight, FaArrowUpRightFromSquare, FaBookOpen, FaCalendarDay } from 'react-icons/fa6'
import ContentFontSizeControl from '../components/ContentFontSizeControl'
import { useScreenWakeLock } from '../hooks/useScreenWakeLock'
import {
  fixedTexts,
  getDayContext,
  getHourForTime,
  getHourPlan,
  hourNames,
  invitatoryPsalm,
  weekRoman,
  weekdayNames,
  type DayContext,
  type HourId,
  type Passage,
} from '../data/breviary'
import { getLiturgicalDay } from '../data/liturgicalCalendar'
import { loadScriptureBook } from '../data/scriptureBookLoaders'

const HOURS: HourId[] = ['invitatory', 'readings', 'lauds', 'daytime', 'vespers', 'compline']
const BREVIARZ_URL = 'https://brewiarz.pl/'

// ---- Loading passage texts ----

interface Line {
  number: number
  text: string
}

type PassageState =
  | { status: 'loading' }
  | { status: 'ready'; lines: Line[] }
  | { status: 'missing' }
  | { status: 'error' }

async function loadChapterVerses(book: string, chapter: number) {
  if (book === 'psalmy') {
    const { psalms } = await import('../data/psalms')
    return psalms.find((psalm) => psalm.number === chapter)?.verses ?? []
  }
  const scriptureBook = await loadScriptureBook(book)
  return scriptureBook.chapters.find((entry) => entry.number === chapter)?.verses ?? []
}

async function loadPassage(passage: Passage): Promise<Line[]> {
  const lines: Line[] = []
  for (const segment of passage.segments) {
    const verses = await loadChapterVerses(passage.book!, segment.chapter)
    lines.push(...verses.filter((verse) => verse.number >= segment.from && verse.number <= segment.to))
  }
  return lines
}

// Keyed by label, so revisiting an hour does not load the same text again.
const passageCache = new Map<string, Promise<Line[]>>()

function usePassage(passage: Passage): PassageState {
  const [state, setState] = useState<{ label: string; value: PassageState }>({ label: '', value: { status: 'loading' } })

  useEffect(() => {
    if (!passage.book) return
    let cancelled = false
    let promise = passageCache.get(passage.label)
    if (!promise) {
      promise = loadPassage(passage)
      passageCache.set(passage.label, promise)
      promise.catch(() => passageCache.delete(passage.label))
    }
    promise
      .then((lines) => { if (!cancelled) setState({ label: passage.label, value: lines.length > 0 ? { status: 'ready', lines } : { status: 'error' } }) })
      .catch(() => { if (!cancelled) setState({ label: passage.label, value: { status: 'error' } }) })
    return () => { cancelled = true }
  }, [passage])

  if (!passage.book) return { status: 'missing' }
  return state.label === passage.label ? state.value : { status: 'loading' }
}

// ---- Building blocks ----

function Rubric({ children }: { children: React.ReactNode }) {
  return <p className="brev-rubric">{children}</p>
}

function Versicle({ versicle, response }: { versicle: string; response: string }) {
  return (
    <div className="brev-versicle">
      <p><span className="brev-sign" aria-label="Kapłan lub prowadzący">K.</span> {versicle}</p>
      <p><span className="brev-sign" aria-label="Wszyscy">W.</span> {response}</p>
    </div>
  )
}

function Gloria() {
  return <p className="brev-gloria">{fixedTexts.gloria}</p>
}

/** Splits a psalm verse at its half-verse colon, as psalms are prayed in two parts. */
function VerseText({ text }: { text: string }) {
  const parts = text.split(/(?<=:)\s+/)
  if (parts.length === 1) return <>{text}</>
  return (
    <>
      {parts.map((part, index) => (
        <span key={index} className={index === 0 ? undefined : 'brev-half'}>{part}</span>
      ))}
    </>
  )
}

/** `asSection`: the passage is the only content of its section, so its title is already shown above. */
function PassageView({ passage, asSection = false }: { passage: Passage; asSection?: boolean }) {
  const state = usePassage(passage)
  const heading = passage.kind === 'psalm'
    ? passage.label.replace(/^Ps /, 'Psalm ')
    : asSection ? passage.label : passage.title ?? passage.label

  return (
    <section className={`brev-passage brev-passage--${passage.kind}`} aria-label={heading}>
      <header className="brev-passage-head">
        <h3>{heading}</h3>
        {passage.kind === 'psalm' || asSection
          ? passage.title && passage.kind === 'psalm' && <span>{passage.title}</span>
          : <span>{passage.label}</span>}
      </header>

      {state.status === 'loading' && <p className="brev-loading">Wczytywanie tekstu…</p>}
      {state.status === 'error' && <p className="brev-note">Nie udało się wczytać tekstu. Sprawdź połączenie lub pobierz aplikację do pracy offline (O projekcie → Offline).</p>}
      {state.status === 'missing' && (
        <p className="brev-note">
          Tej księgi nie ma jeszcze w aplikacji w przekładzie Wujka. Tekst pieśni ({passage.label}) znajdziesz
          w brewiarzu lub w Biblii.
        </p>
      )}
      {state.status === 'ready' && (
        <div className="brev-text" lang="pl">
          {state.lines.map((line, index) => (
            <p key={`${line.number}-${index}`} className="brev-verse">
              <sup>{line.number}</sup> <VerseText text={line.text} />
            </p>
          ))}
        </div>
      )}
      {passage.doxology && state.status === 'ready' && <Gloria />}
    </section>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="brev-section">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function ProperNote({ what }: { what: string }) {
  return (
    <p className="brev-note">
      {what} — teksty własne dnia znajdziesz w{' '}
      <a href={BREVIARZ_URL} target="_blank" rel="noopener noreferrer">brewiarz.pl <FaArrowUpRightFromSquare aria-hidden="true" /></a>.
      Możesz też chwilę pomodlić się własnymi słowami.
    </p>
  )
}

function Opening({ context, invitatory = false }: { context: DayContext; invitatory?: boolean }) {
  return (
    <Section title="Wprowadzenie">
      <Versicle {...(invitatory ? fixedTexts.invitatory : fixedTexts.opening)} />
      {!invitatory && <Gloria />}
      {!invitatory && !context.isLent && <p className="brev-alleluia">Alleluja.</p>}
    </Section>
  )
}

function Hymn() {
  return (
    <Section title="Hymn">
      <p className="brev-note">
        Można zaśpiewać pieśń odpowiednią do pory dnia lub okresu liturgicznego —
        np. ze <Link to="/spiewnik">Śpiewnika</Link>.
      </p>
    </Section>
  )
}

function Psalmody({ passages }: { passages: Passage[] }) {
  return (
    <Section title="Psalmodia">
      {passages.map((passage) => <PassageView key={passage.label} passage={passage} />)}
    </Section>
  )
}

function Conclusion({ blessing = true }: { blessing?: boolean }) {
  return (
    <Section title="Zakończenie">
      {blessing
        ? <p className="brev-prayer">{fixedTexts.blessing}</p>
        : <Versicle {...fixedTexts.dismissal} />}
    </Section>
  )
}

// ---- Hours ----

function HourView({ hour, context }: { hour: HourId; context: DayContext }) {
  const plan = getHourPlan(hour, context)

  if (hour === 'invitatory') {
    return (
      <>
        <Rubric>Wezwanie rozpoczyna pierwszą modlitwę dnia — Godzinę czytań albo Jutrznię.</Rubric>
        <Opening context={context} invitatory />
        <Section title="Psalm wezwania">
          <PassageView passage={invitatoryPsalm} />
        </Section>
      </>
    )
  }

  const gospel = plan.gospelCanticle && (
    <Section title={plan.gospelCanticle.title ?? 'Pieśń z Ewangelii'}>
      <PassageView passage={plan.gospelCanticle} asSection />
    </Section>
  )

  if (hour === 'readings') {
    const teDeum = context.weekday === 0 && !context.isLent
    return (
      <>
        <Opening context={context} />
        <Hymn />
        <Psalmody passages={plan.psalmody} />
        <Section title="Czytania">
          <ProperNote what="Czytanie biblijne i czytanie z Ojców Kościoła z responsoriami" />
        </Section>
        {teDeum && (
          <Section title="Hymn Ciebie, Boże, chwalimy">
            <p className="brev-note">
              W niedziele (poza Wielkim Postem) i uroczystości śpiewa się hymn{' '}
              <Link to={`/spiewnik/${encodeURIComponent('Te Deum – Ciebie Boga wysławiamy')}`}>Te Deum — Ciebie Boga wysławiamy</Link>.
            </p>
          </Section>
        )}
        <Section title="Modlitwa">
          <ProperNote what="Modlitwa (kolekta) dnia" />
        </Section>
        <Conclusion blessing={false} />
      </>
    )
  }

  if (hour === 'daytime') {
    return (
      <>
        <Opening context={context} />
        <Hymn />
        <Psalmody passages={plan.psalmody} />
        <Section title="Czytanie i modlitwa">
          <ProperNote what="Krótkie czytanie i modlitwa" />
        </Section>
        <Conclusion blessing={false} />
      </>
    )
  }

  if (hour === 'compline') {
    const antiphon = context.isEaster ? fixedTexts.marianAntiphons.reginaCaeli : fixedTexts.marianAntiphons.salveRegina
    return (
      <>
        <Opening context={context} />
        <Section title="Rachunek sumienia">
          <p className="brev-note">
            Chwila ciszy: przejrzyj miniony dzień, podziękuj Bogu za dobro i przeproś za grzechy —
            np. słowami <Link to={`/modlitwy/${encodeURIComponent('Akt Wiary, Nadziei, Miłości i Żalu')}`}>aktu żalu</Link>.
          </p>
        </Section>
        <Hymn />
        <Psalmody passages={plan.psalmody} />
        {plan.reading && (
          <Section title="Krótkie czytanie">
            <PassageView passage={plan.reading} asSection />
          </Section>
        )}
        <Section title="Responsorium krótkie">
          <p className="brev-prayer">{fixedTexts.complineResponsory}</p>
        </Section>
        {gospel}
        <Section title="Modlitwa">
          <ProperNote what="Modlitwa końcowa Komplety" />
        </Section>
        <Section title="Zakończenie">
          <p className="brev-prayer">{fixedTexts.complineBlessing}</p>
        </Section>
        <Section title="Antyfona do Najświętszej Maryi Panny">
          <p className="brev-prayer">{antiphon}</p>
          {!context.isEaster && (
            <>
              <Rubric>albo:</Rubric>
              <p className="brev-prayer">{fixedTexts.marianAntiphons.subTuum}</p>
            </>
          )}
        </Section>
      </>
    )
  }

  // Lauds and vespers share the same shape.
  return (
    <>
      {plan.firstVespersOfWeek && (
        <Rubric>I Nieszpory niedzieli — psalmy z {weekRoman[plan.firstVespersOfWeek]} tygodnia psałterza.</Rubric>
      )}
      {hour === 'lauds' && <Rubric>Jeśli Jutrznia jest pierwszą modlitwą dnia, zaczyna się od Wezwania.</Rubric>}
      <Opening context={context} />
      <Hymn />
      <Psalmody passages={plan.psalmody} />
      <Section title="Czytanie i responsorium">
        <ProperNote what="Krótkie czytanie i responsorium" />
      </Section>
      {gospel}
      <Section title="Prośby">
        <p className="brev-note">
          Przedstaw Bogu swoje prośby — za Kościół, za bliskich, za potrzebujących
          {hour === 'vespers' ? ' i za zmarłych' : ' i o uświęcenie tego dnia'}.
        </p>
      </Section>
      <Section title="Ojcze nasz">
        <p className="brev-prayer">{fixedTexts.ourFather}</p>
      </Section>
      <Section title="Modlitwa">
        <ProperNote what="Modlitwa (kolekta) dnia" />
      </Section>
      <Conclusion />
    </>
  )
}

// ---- Page ----

const DAY_MS = 86_400_000

const parseDateParam = (value: string | null) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day, 12)
  return Number.isNaN(date.getTime()) ? null : date
}

const formatDateParam = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const isHour = (value: string | null): value is HourId => HOURS.includes(value as HourId)

export default function BreviaryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [now] = useState(() => new Date())
  const date = parseDateParam(searchParams.get('dzien')) ?? now
  const hourParam = searchParams.get('godzina')
  const hour: HourId = isHour(hourParam) ? hourParam : getHourForTime(now)
  const isToday = formatDateParam(date) === formatDateParam(now)

  const context = useMemo(() => getDayContext(date), [date])
  const liturgicalDay = useMemo(() => getLiturgicalDay(date), [date])

  useScreenWakeLock(true)

  const update = (next: { date?: Date; hour?: HourId }) => {
    const params = new URLSearchParams(searchParams)
    if (next.date) {
      if (formatDateParam(next.date) === formatDateParam(now)) params.delete('dzien')
      else params.set('dzien', formatDateParam(next.date))
    }
    if (next.hour) params.set('godzina', next.hour)
    setSearchParams(params, { replace: true })
  }

  const shiftDay = (days: number) => update({ date: new Date(date.getTime() + days * DAY_MS) })

  return (
    <div className="page brev-page">
      <Link to="/" className="back-button"><FaArrowLeft /> Strona główna</Link>

      <header className="brev-header">
        <p className="brev-eyebrow"><FaBookOpen aria-hidden="true" /> Brewiarz · psałterz czterotygodniowy</p>
        <h1>Liturgia Godzin</h1>
        <p className="page-lead">
          Codzienna modlitwa Kościoła: psalmy i pieśni biblijne na każdą porę dnia,
          w przekładzie ks. Jakuba Wujka. Działa także bez internetu.
        </p>
      </header>

      <section className="brev-day" aria-label="Wybrany dzień">
        <div className="brev-day-nav">
          <button type="button" className="brev-day-btn" onClick={() => shiftDay(-1)} aria-label="Poprzedni dzień">
            <FaArrowLeft aria-hidden="true" />
          </button>
          <div className="brev-day-info">
            <strong>
              {date.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </strong>
            <span>
              <span className={`liturgy-color liturgy-color--${liturgicalDay.color}`} aria-hidden="true" />
              {liturgicalDay.title}
            </span>
            <span className="brev-week">
              {weekdayNames[context.weekday]} {weekRoman[context.week]} tygodnia psałterza
            </span>
          </div>
          <button type="button" className="brev-day-btn" onClick={() => shiftDay(1)} aria-label="Następny dzień">
            <FaArrowRight aria-hidden="true" />
          </button>
        </div>
        {!isToday && (
          <button type="button" className="brev-today" onClick={() => update({ date: now })}>
            <FaCalendarDay aria-hidden="true" /> Wróć do dzisiaj
          </button>
        )}
      </section>

      <nav className="brev-hours" aria-label="Godziny modlitwy">
        {HOURS.map((id) => (
          <button
            key={id}
            type="button"
            className="brev-hour"
            aria-pressed={hour === id}
            onClick={() => update({ hour: id })}
          >
            {hourNames[id]}
          </button>
        ))}
      </nav>

      <div className="brev-toolbar">
        <h2 className="brev-hour-title">{hourNames[hour]}</h2>
        <ContentFontSizeControl />
      </div>

      <article className="brev-content" key={`${formatDateParam(date)}-${hour}`}>
        <HourView hour={hour} context={context} />
      </article>

      <aside className="brev-about">
        <h2>O tym brewiarzu</h2>
        <p>
          Układ psalmów i pieśni odpowiada czterotygodniowemu psałterzowi Liturgii Godzin; tydzień
          psałterza jest liczony na urządzeniu według kalendarza liturgicznego. Psalmy i pieśni biblijne pochodzą
          z Biblii ks. Jakuba Wujka (domena publiczna, transkrypcja Wikiźródeł) — ich brzmienie różni się więc
          od współczesnego przekładu w oficjalnym brewiarzu. Ten przekład stosuje numerację Wulgaty
          (w nawiasie przy numerze psalmu), dlatego numery wersetów mogą się nieznacznie różnić.
        </p>
        <p>
          Oficjalne polskie teksty własne (hymny, antyfony, czytania, prośby i modlitwy) są chronione
          prawem autorskim, dlatego aplikacja ich nie zawiera. W uroczystości, święta i okresy szczególne
          (np. oktawa Wielkanocy, Triduum) korzysta się z tekstów własnych —
          znajdziesz je w <a href={BREVIARZ_URL} target="_blank" rel="noopener noreferrer">brewiarz.pl</a>.
        </p>
      </aside>
    </div>
  )
}
