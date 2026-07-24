import { FaArrowUpRightFromSquare, FaCopyright } from 'react-icons/fa6'
import { psalmCatalog } from '../data/psalms'

export default function PsalmsPage() {
  return (
    <div className="page psalms-page">
      <header className="psalms-header">
        <p className="psalms-eyebrow">Katalog odsyłaczy</p>
        <h1>Psalmy</h1>
        <p>
          Pierwsza z czterech zweryfikowanych stron źródłowych — {psalmCatalog.length} pozycji.
        </p>
      </header>

      <aside className="psalms-rights-notice" aria-labelledby="psalms-rights-title">
        <FaCopyright aria-hidden="true" />
        <div>
          <h2 id="psalms-rights-title">Ochrona praw do tekstu</h2>
          <p>
            Pełne teksty pozostają w serwisie źródłowym, ponieważ nie potwierdzono jeszcze
            licencji pozwalającej na ich ponowne opublikowanie. Poniżej zachowujemy tytuł,
            nazwę źródła i dokładny URL każdej pozycji.
          </p>
        </div>
      </aside>

      <ul className="psalm-catalog-list">
        {psalmCatalog.map((psalm) => (
          <li key={psalm.id}>
            <a href={psalm.sourceUrl} target="_blank" rel="noopener noreferrer">
              <span className="psalm-catalog-copy">
                <small>Tekst i źródło · {psalm.sourceName}</small>
                <strong>{psalm.title}</strong>
                <span className="psalm-source-url">URL źródła: {psalm.sourceUrl}</span>
              </span>
              <FaArrowUpRightFromSquare aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
