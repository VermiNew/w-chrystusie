import { Link } from 'react-router-dom'
import { FaCalendarDay, FaHandsPraying, FaList } from 'react-icons/fa6'
import { getPrayerOfDay, prayers } from '../data/prayers'
import ContentCollectionPage from '../components/ContentCollectionPage'

const categoryOrder = [
  'Modlitwy codzienne',
  'Litanie',
  'Koronki',
  'Modlitwy maryjne',
  'Modlitwy do Matki Bożej Szkaplerznej',
  'Modlitwy do Ducha Świętego',
  'Modlitwy o zdrowie',
  'Modlitwy za zmarłych',
  'Modlitwy za rodzinę',
  'Modlitwy za wstawiennictwem świętych',
  'Modlitwy za bliźnich',
  'Modlitwy osobiste',
  'Modlitwy w podróży',
  'Akty i ofiarowania',
  'Nabożeństwa',
  'Sakramenty',
  'Katechizm',
]

const labels = {
  title: 'Modlitwy',
  siblingNav: 'Nawigacja między modlitwami',
  filterPlaceholder: 'Tytuł lub treść modlitwy...',
  emptyFilter: 'Brak modlitw pasujących do wybranych filtrów.',
}

export default function PrayersPage() {
  const prayerOfDay = getPrayerOfDay()

  return (
    <ContentCollectionPage
      items={prayers}
      kind="prayer"
      basePath="/modlitwy"
      scrollKey="prayers-scroll"
      categoryKey="prayers-category"
      anchorPrefix="prayer-category"
      categoryOrder={categoryOrder}
      textClassName="prayer-text"
      listClassName="prayer-list"
      itemClassName="prayer-item"
      labels={labels}
      renderDetailFooter={(selected, prepareListReturn) => (
        <nav className="content-next-actions" aria-labelledby="content-next-actions-title">
          <h2 id="content-next-actions-title">Co dalej?</h2>
          <div>
            <Link to="/modlitwy" onClick={prepareListReturn}>
              <FaList aria-hidden="true" /> Wróć do modlitw
            </Link>
            <Link to="/rozaniec">
              <FaHandsPraying aria-hidden="true" /> Różaniec
            </Link>
            <Link to="/koronka">
              <FaHandsPraying aria-hidden="true" /> Koronka
            </Link>
            {selected.id !== prayerOfDay.id && (
              <Link to={`/modlitwy/${encodeURIComponent(prayerOfDay.id)}`}>
                <FaCalendarDay aria-hidden="true" /> Modlitwa dnia
              </Link>
            )}
          </div>
        </nav>
      )}
    />
  )
}
