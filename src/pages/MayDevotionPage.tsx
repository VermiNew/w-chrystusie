import { Link } from 'react-router-dom'
import Markdown from 'react-markdown'
import { FaChurch, FaHeart } from 'react-icons/fa6'
import { songs } from '../data/songs'

const SONG_ID = 'Najpiękniejszy Miesiąc Maj'

export default function MayDevotionPage() {
  const song = songs.find((s) => s.id === SONG_ID)

  return (
    <div className="page">
      <Link to="/" className="back-button">← Strona główna</Link>
      <h1>Nabożeństwo Majowe</h1>
      <p className="page-lead">
        Maj jest miesiącem szczególnie poświęconym <strong>Najświętszej Maryi Pannie</strong>.
        Codzienne nabożeństwa majowe są okazją, by oddać Matce Bożej cześć i razem
        z Nią uwielbiać Jej Syna — Jezusa Chrystusa.
      </p>

      <h2>Przebieg nabożeństwa</h2>
      <ol className="devotion-steps">
        <li>
          <Link to="/modlitwy/Litania%20Loreta%C5%84ska%20do%20Naj%C5%9Bwi%C4%99tszej%20Maryi%20Panny">
            Litania Loretańska do Najświętszej Maryi Panny
          </Link>
        </li>
        <li>
          <strong>Rozważanie</strong> — chwila refleksji nad własnym życiem.
          Możesz pomyśleć o tym, by poświęcić się Maryi, a wraz z Nią — Jezusowi.
        </li>
        <li>
          <Link to="/modlitwy/Litania%20do%20Naj%C5%9Bwi%C4%99tszego%20Serca%20Pana%20Jezusa">
            Litania do Najświętszego Serca Pana Jezusa
          </Link>
        </li>
        <li>
          <strong>Chwila ciszy</strong> — czas na osobiste przemyślenia, modlitwę serca,
          wsłuchanie się w głos Boga.
        </li>
        <li>
          Pieśń: <em>Najpiękniejszy Miesiąc Maj</em> — tekst poniżej.
        </li>
      </ol>

      <aside className="devotion-callout">
        <p className="devotion-callout-title">
          <FaChurch aria-hidden="true" /> Idź do Kościoła
        </p>
        <p>
          Nie ograniczaj się tylko do aplikacji — <strong>fizycznie pójdź do Kościoła</strong>,
          uklęknij, pomódl się, pozostań na <strong>Mszy Świętej</strong>. Jeśli możesz,
          przystąp do <strong>spowiedzi</strong> i przyjmij <strong>Komunię Świętą</strong> —
          to jest wysoce zalecane.
        </p>
      </aside>

      {song && (
        <section className="devotion-song">
          <h2>{song.title}</h2>
          <div className="song-text">
            <Markdown>{song.body}</Markdown>
          </div>
          <Link to={`/spiewnik/${song.id}`} className="source-link">
            Otwórz w śpiewniku
          </Link>
        </section>
      )}

      <figure className="devotion-image">
        <img
          src="/pictures/NMP_PIC_MAJ_0.png"
          alt="Najświętsza Maryja Panna — maj"
          loading="lazy"
        />
        <figcaption>
          <FaHeart aria-hidden="true" /> Maryjo, Matko nasza — módl się za nami.
        </figcaption>
      </figure>
    </div>
  )
}
