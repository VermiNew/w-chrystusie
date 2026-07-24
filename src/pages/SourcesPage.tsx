import { Link } from 'react-router-dom'
import {
  FaArrowLeft,
  FaArrowUpRightFromSquare,
  FaCartShopping,
} from 'react-icons/fa6'

const sources = [
  {
    name: 'Niedziela',
    url: 'https://www.niedziela.pl/',
    logo: '/sources/niedziela.png',
    description: 'Katolicki tygodnik i portal informacyjny.',
  },
  {
    name: 'Dolina Modlitwy',
    url: 'https://dolinamodlitwy.pl/',
    logo: '/sources/dolina-modlitwy.jpeg',
    description: 'Baza modlitw, litanii, nowenn i nabożeństw.',
  },
  {
    name: 'Modlitwa7',
    url: 'https://modlitwa7.pl/',
    logo: '/sources/modlitwa7.png',
    description: 'Modlitwy, pieśni, teksty i psalmy.',
  },
  {
    name: 'Katolicki.net',
    url: 'https://www.katolicki.net/index.php/modlitwa/modlitwa-spiewnik.html',
    logo: '/sources/katolicki-net.jpg',
    description: 'Śpiewnik z tekstami pieśni religijnych.',
    wideLogo: true,
  },
  {
    name: 'Romcal',
    url: 'https://romcal.js.org/',
    logo: '/sources/romcal.png',
    description: 'Planowane źródło danych kalendarza liturgicznego.',
    badge: 'planowane',
  },
] as const

const materials = [
  {
    title: 'Pismo Święte Starego i Nowego Testamentu',
    subtitle: 'Format 16 × 22 cm, twarda oprawa, paginatory',
    image: '/materials/pismo-swiete-standard.jpg',
    imageWidth: 700,
    imageHeight: 700,
    imageAlt: 'Okładka polecanego wydania Pisma Świętego',
    url: 'https://edycja.pl/pismo-swiete/format-duzy-2972/pismo-sw-st-i-nt-standard-format-twarda-oprawa-paginatory-1320200202.html',
    shop: 'Edycja Świętego Pawła',
  },
  {
    title: 'Słowo ma MOC',
    subtitle: 'ks. Łukasz Brus',
    image: '/materials/slowo-ma-moc.webp',
    imageWidth: 360,
    imageHeight: 540,
    imageAlt: 'Okładka książki Słowo ma MOC',
    url: 'https://www.esprit.com.pl/950/slowo-ma-moc.html',
    shop: 'Księgarnia Esprit',
  },
] as const

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
          {sources.map((source) => (
            <a
              className={`source-card${'wideLogo' in source ? ' source-card--wide-logo' : ''}`}
              href={source.url}
              key={source.name}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={source.logo} width="192" height="192" alt="" aria-hidden="true" />
              <span className="source-card-copy">
                <span className="source-card-title">
                  <strong>{source.name}</strong>
                  {'badge' in source && <small>{source.badge}</small>}
                </span>
                <span>{source.description}</span>
              </span>
              <FaArrowUpRightFromSquare aria-hidden="true" />
            </a>
          ))}
        </div>
      </section>

      <section className="sources-section materials-section" aria-labelledby="materials-title">
        <h2 id="materials-title">Polecane materiały</h2>
        <div className="material-cards">
          {materials.map((material) => (
            <article className="material-card" key={material.title}>
              <div className="material-card-image">
                <img
                  src={material.image}
                  width={material.imageWidth}
                  height={material.imageHeight}
                  alt={material.imageAlt}
                />
              </div>
              <div className="material-card-copy">
                <p className="material-card-label">
                  {material.title.startsWith('Pismo') ? 'Pismo Święte, które polecam' : 'Książka'}
                </p>
                <h3>{material.title}</h3>
                <p>{material.subtitle}</p>
                <a
                  className="material-buy-link"
                  href={material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaCartShopping aria-hidden="true" />
                  Kup w: {material.shop}
                  <FaArrowUpRightFromSquare aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>
        <p className="materials-note">Linki prowadzą do zewnętrznych stron sprzedawców.</p>
      </section>
    </div>
  )
}
