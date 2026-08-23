import { Link } from 'react-router-dom'
import { FaArrowRight, FaBookOpen } from 'react-icons/fa6'
import { psalms } from '../data/psalms'

export default function ScripturePage() {
  return (
    <div className="page">
      <h1>Pismo Święte</h1>

      <div className="scripture-notice">
        <p>
          Pismo Święte zostało wycofane ze strony. Wykorzystywana dotychczas wersja
          (Uwspółcześniona Biblia Gdańska) jest przekładem protestanckim i nie zawiera pełnego
          kanonu katolickiego.
        </p>
        <p>
          Sekcja zostanie przywrócona, gdy uda się pozyskać <strong>pełną katolicką wersję
          Pisma Świętego</strong> w formacie nadającym się do parsowania (XML, JSON lub innym),
          z licencją pozwalającą na wykorzystanie w projektach open-source (MIT).
        </p>
        <p>
          Jeśli posiadasz lub znasz taki zasób - napisz na{' '}
          <a href="mailto:werminew@protonmail.com">werminew@protonmail.com</a>.
        </p>
      </div>

      <section className="scripture-subsection">
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
    </div>
  )
}
