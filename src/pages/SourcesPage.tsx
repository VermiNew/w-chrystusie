import { Link } from 'react-router-dom'
import {
  FaArrowLeft,
  FaArrowUpRightFromSquare,
  FaCartShopping,
} from 'react-icons/fa6'
import {
  contentSources,
  recommendedMaterials,
  SOURCE_VERIFICATION_DATE,
} from '../data/sources'

const verificationDateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

function formatVerificationDate(date: string) {
  return verificationDateFormatter.format(new Date(`${date}T00:00:00Z`))
}

export default function SourcesPage() {
  return (
    <div className="page sources-page">
      <Link className="back-button" to="/">
        <FaArrowLeft aria-hidden="true" /> Strona główna
      </Link>

      <header className="sources-header">
        <p className="sources-eyebrow">Transparentność treści</p>
        <h1>Źródła i materiały</h1>
        <p>
          Miejsca, z których korzystam przy opracowywaniu treści, oraz publikacje,
          które polecam do osobistej modlitwy i lektury.
        </p>
      </header>

      <section className="sources-section" aria-labelledby="sources-title">
        <h2 id="sources-title">Źródła</h2>
        <div className="source-cards">
          {contentSources.map((source) => (
            <a
              className={`source-card${source.wideLogo ? ' source-card--wide-logo' : ''}`}
              href={source.url}
              key={source.id}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={source.logo} width="192" height="192" alt="" aria-hidden="true" />
              <span className="source-card-copy">
                <span className="source-card-title">
                  <strong>{source.name}</strong>
                  {source.status === 'planned' && <small>planowane</small>}
                </span>
                <span className="source-card-description">{source.description}</span>
                <span className="source-card-meta">
                  {source.contentKinds.join(' · ')} · sprawdzono{' '}
                  {formatVerificationDate(source.verifiedAt)}
                </span>
              </span>
              <FaArrowUpRightFromSquare aria-hidden="true" />
            </a>
          ))}
        </div>
        <p className="sources-note">
          Rejestr wskazuje pochodzenie informacji, ale nie oznacza zgody na kopiowanie
          pełnych tekstów. Przy każdej pozycji zachowuję dokładny adres, a przed importem
          sprawdzam licencję lub zgodę właściciela.
        </p>
      </section>

      <section className="sources-section materials-section" aria-labelledby="materials-title">
        <h2 id="materials-title">Polecane materiały</h2>
        <div className="material-cards">
          {recommendedMaterials.map((material) => (
            <article className="material-card" key={material.id}>
              <div className="material-card-image">
                <img
                  src={material.image}
                  width={material.imageWidth}
                  height={material.imageHeight}
                  alt={material.imageAlt}
                />
              </div>
              <div className="material-card-copy">
                <p className="material-card-label">{material.category}</p>
                <h3>{material.title}</h3>
                {material.author && <p className="material-card-author">{material.author}</p>}
                <p>{material.description}</p>
                <p className="material-card-publisher">{material.publisher}</p>
                <a
                  className="material-buy-link"
                  href={material.purchaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaCartShopping aria-hidden="true" />
                  Kup w: {material.retailer}
                  <FaArrowUpRightFromSquare aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>
        <p className="materials-note">
          Linki prowadzą do zewnętrznych stron sprzedawców, zostały sprawdzone{' '}
          {formatVerificationDate(SOURCE_VERIFICATION_DATE)} i nie są afiliacyjne.
          Aplikacja nie otrzymuje wynagrodzenia za zakupy.
        </p>
      </section>
    </div>
  )
}
