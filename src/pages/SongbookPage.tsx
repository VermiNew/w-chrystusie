import { songCatalog } from '../data/contentCatalog'
import { loadAllSongs, loadSongEntry } from '../data/contentLoaders'
import { getLiturgicalSeason } from '../data/liturgicalSeason'
import ContentCollectionPage from '../components/ContentCollectionPage'

const categoryOrder = [
  'Pieśni adwentowe',
  'Kolędy',
  'Pieśni wielkopostne',
  'Pieśni wielkanocne',
  'Pieśni Maryjne',
  'Pieśni do Ducha Świętego',
  'Pieśni mszalne',
  'Pieśni uwielbienia',
  'Pieśni pokutne',
  'Pieśni patriotyczne',
  'Pieśni papieskie',
  'Pieśni okolicznościowe',
  'Pieśni za zmarłych',
]

const labels = {
  title: 'Śpiewnik',
  siblingNav: 'Nawigacja między pieśniami',
  filterPlaceholder: 'Tytuł lub treść pieśni...',
  emptyFilter: 'Brak pieśni pasujących do wybranych filtrów.',
}

export default function SongbookPage() {
  const liturgicalSeason = getLiturgicalSeason()

  return (
    <ContentCollectionPage
      items={songCatalog}
      loadEntry={loadSongEntry}
      loadAllEntries={loadAllSongs}
      kind="song"
      basePath="/spiewnik"
      scrollKey="songbook-scroll"
      categoryKey="songbook-category"
      anchorPrefix="song-category"
      categoryOrder={categoryOrder}
      textClassName="song-text"
      listClassName="song-list"
      itemClassName="song-item"
      labels={labels}
      listIntro={(
        <p className="liturgical-season-status">
          Aktualnie: <strong>{liturgicalSeason.name}</strong>
        </p>
      )}
      renderCategoryBadge={(category) => category === liturgicalSeason.songCategory && (
        <span className="liturgical-category-badge">Aktualny okres</span>
      )}
    />
  )
}
