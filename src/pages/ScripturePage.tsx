import { Link } from 'react-router-dom'
import { FaArrowRight, FaBookOpen } from 'react-icons/fa6'
import { psalms } from '../data/psalms'

export default function ScripturePage() {
  return (
    <div className="page">
      <h1>Pismo Święte</h1>

      <section className="scripture-subsection">
        <p className="scripture-availability">Dostępne teraz</p>
        <FaBookOpen className="scripture-subsection-icon" aria-hidden="true" />
        <h2>Księga Psalmów</h2>
        <p>
          Pełne teksty wszystkich {psalms.length} Psalmów w historycznym przekładzie
          Jakuba Wujka z 1599 roku, z podanym źródłem i dokładnym URL-em.
        </p>
        <Link to="/pismo-swiete/psalmy" className="subsection-link">
          <span>Przejdź do Psalmów</span>
          <FaArrowRight aria-hidden="true" />
        </Link>
      </section>

      <section className="scripture-notice" aria-labelledby="scripture-preparation-title">
        <h2 id="scripture-preparation-title">Pozostałe księgi — w przygotowaniu</h2>
        <p>
          Pracuję nad przywróceniem pełnego <strong>katolickiego wydania Pisma Świętego</strong>
          {' '}w formacie nadającym się do wykorzystania w aplikacji i na warunkach pozwalających
          na jego udostępnienie.
        </p>
        <p>
          Poprzednio używana Uwspółcześniona Biblia Gdańska została wycofana, ponieważ jest
          przekładem protestanckim i nie zawiera pełnego kanonu katolickiego.
        </p>
        <p>
          Jeśli posiadasz lub znasz odpowiedni zasób, napisz na{' '}
          <a href="mailto:werminew@protonmail.com">werminew@protonmail.com</a>.
        </p>
      </section>
    </div>
  )
}
