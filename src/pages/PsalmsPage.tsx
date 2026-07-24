import {
  FaArrowLeft,
  FaArrowRight,
  FaArrowUpRightFromSquare,
  FaBookOpen,
  FaGlobe,
} from 'react-icons/fa6'
import { Link, useParams } from 'react-router-dom'
import { psalms, type Psalm } from '../data/psalms'
import NotFoundPage from './NotFoundPage'

function PsalmSource({ psalm }: { psalm: Psalm }) {
  return (
    <aside className="psalm-source-card" aria-labelledby="psalm-source-title">
      <FaGlobe aria-hidden="true" />
      <div>
        <h2 id="psalm-source-title">Tekst i źródło</h2>
        <p>
          <strong>{psalm.translation}</strong>
          <br />
          Domena publiczna · źródło cyfrowe: {psalm.sourceName}
        </p>
        <a href={psalm.sourceUrl} target="_blank" rel="noopener noreferrer">
          <span>URL źródła: {psalm.sourceUrl}</span>
          <FaArrowUpRightFromSquare aria-hidden="true" />
        </a>
      </div>
    </aside>
  )
}

function PsalmReader({ psalm }: { psalm: Psalm }) {
  const previous = psalms.find((entry) => entry.number === psalm.number - 1)
  const next = psalms.find((entry) => entry.number === psalm.number + 1)

  return (
    <article className="page psalm-reader">
      <Link className="back-button" to="/psalmy">
        <FaArrowLeft aria-hidden="true" /> Wszystkie Psalmy
      </Link>

      <header className="psalm-reader-header">
        <p className="psalms-eyebrow">Księga Psalmów · przekład Jakuba Wujka</p>
        <h1>{psalm.title}</h1>
        {psalm.summary && <p>{psalm.summary}</p>}
      </header>

      <div className="psalm-verses">
        {psalm.verses.map((verse) => (
          <p key={verse.number}>
            <sup>{verse.number}</sup>
            {verse.text}
          </p>
        ))}
      </div>

      <PsalmSource psalm={psalm} />

      <nav className="psalm-reader-navigation" aria-label="Nawigacja między Psalmami">
        {previous ? (
          <Link to={`/psalmy/${previous.number}`}>
            <FaArrowLeft aria-hidden="true" />
            <span>
              <small>Poprzedni</small>
              {previous.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/psalmy/${next.number}`}>
            <span>
              <small>Następny</small>
              {next.title}
            </span>
            <FaArrowRight aria-hidden="true" />
          </Link>
        )}
      </nav>
    </article>
  )
}

function PsalmsIndex() {
  return (
    <div className="page psalms-page">
      <header className="psalms-header">
        <p className="psalms-eyebrow">Pełne teksty · domena publiczna</p>
        <h1>Psalmy</h1>
        <p>
          {psalms.length} z 150 Psalmów w historycznym przekładzie Jakuba Wujka, z podanym
          źródłem i dokładnym URL-em.
        </p>
      </header>

      <aside className="psalms-rights-notice" aria-labelledby="psalms-rights-title">
        <FaBookOpen aria-hidden="true" />
        <div>
          <h2 id="psalms-rights-title">O przekładzie i numeracji</h2>
          <p>
            Tekst pochodzi z publicznodomenowego przekładu z 1599 roku, w wydaniu z 1923
            roku. Zachowuje historyczny język oraz numerację Wulgaty, która może różnić się
            od numeracji współczesnych wydań Biblii.
          </p>
        </div>
      </aside>

      <ol className="psalm-index-grid">
        {psalms.map((psalm) => (
          <li key={psalm.number}>
            <Link to={`/psalmy/${psalm.number}`}>
              <span>
                <small>{psalm.translation}</small>
                <strong>{psalm.title}</strong>
                {psalm.summary && <span>{psalm.summary}</span>}
              </span>
              <FaArrowRight aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function PsalmsPage() {
  const { id } = useParams()
  if (!id) return <PsalmsIndex />

  const psalmNumber = Number(id)
  const psalm = psalms.find((entry) => entry.number === psalmNumber)
  return psalm ? <PsalmReader psalm={psalm} /> : <NotFoundPage />
}
