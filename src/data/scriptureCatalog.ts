export type Testament = 'Old' | 'New'

export interface ScriptureCatalogBook {
  id: string
  slug: string
  name: string
  testament: Testament
  chapterCount: number
  isAvailable: boolean
}

const oldTestament = [
  ['gen', 'rodzaju', 'Księga Rodzaju', 50], ['exo', 'wyjscia', 'Księga Wyjścia', 40],
  ['lev', 'kaplanska', 'Księga Kapłańska', 27], ['num', 'liczb', 'Księga Liczb', 36],
  ['deu', 'powtorzonego-prawa', 'Księga Powtórzonego Prawa', 34], ['jos', 'jozuego', 'Księga Jozuego', 24],
  ['jdg', 'sedziow', 'Księga Sędziów', 21], ['rut', 'rut', 'Księga Rut', 4],
  ['1sm', '1-samuela', '1 Księga Samuela', 31], ['2sm', '2-samuela', '2 Księga Samuela', 24],
  ['1ki', '1-krolewska', '1 Księga Królewska', 22], ['2ki', '2-krolewska', '2 Księga Królewska', 25],
  ['1ch', '1-kronik', '1 Księga Kronik', 29], ['2ch', '2-kronik', '2 Księga Kronik', 36],
  ['ezr', 'ezdrasza', 'Księga Ezdrasza', 10], ['neh', 'nehemiasza', 'Księga Nehemiasza', 13],
  ['tob', 'tobiasza', 'Księga Tobiasza', 14], ['jdt', 'judyty', 'Księga Judyty', 16],
  ['est', 'estery', 'Księga Estery', 16], ['job', 'hioba', 'Księga Hioba', 42],
  ['psa', 'psalmow', 'Księga Psalmów', 150], ['pro', 'przyslow', 'Księga Przysłów', 31],
  ['ecc', 'koheleta', 'Księga Koheleta', 12], ['sng', 'piesn-nad-piesniami', 'Pieśń nad Pieśniami', 8],
  ['wis', 'madrosci', 'Księga Mądrości', 19], ['sir', 'syracha', 'Mądrość Syracha', 51],
  ['isa', 'izajasza', 'Księga Izajasza', 66], ['jer', 'jeremiasza', 'Księga Jeremiasza', 52],
  ['lam', 'lamentacje', 'Lamentacje', 5], ['bar', 'barucha', 'Księga Barucha', 6],
  ['ezk', 'ezechiela', 'Księga Ezechiela', 48], ['dan', 'daniela', 'Księga Daniela', 14],
  ['hos', 'ozeasza', 'Księga Ozeasza', 14], ['jol', 'joela', 'Księga Joela', 4],
  ['amo', 'amosa', 'Księga Amosa', 9], ['oba', 'abdiasza', 'Księga Abdiasza', 1],
  ['jon', 'jonasza', 'Księga Jonasza', 4], ['mic', 'micheasza', 'Księga Micheasza', 7],
  ['nah', 'nahuma', 'Księga Nahuma', 3], ['hab', 'habakuka', 'Księga Habakuka', 3],
  ['zep', 'sofoniasza', 'Księga Sofoniasza', 3], ['hag', 'aggeusza', 'Księga Aggeusza', 2],
  ['zec', 'zachariasza', 'Księga Zachariasza', 14], ['mal', 'malachiasza', 'Księga Malachiasza', 3],
  ['1ma', '1-machabejska', '1 Księga Machabejska', 16], ['2ma', '2-machabejska', '2 Księga Machabejska', 15],
] as const

const newTestament = [
  ['mat', 'mateusza', 'Ewangelia według św. Mateusza', 28], ['mrk', 'marka', 'Ewangelia według św. Marka', 16],
  ['luk', 'lukasza', 'Ewangelia według św. Łukasza', 24], ['jhn', 'jana', 'Ewangelia według św. Jana', 21],
  ['act', 'dzieje-apostolskie', 'Dzieje Apostolskie', 28], ['rom', 'do-rzymian', 'List do Rzymian', 16],
  ['1co', '1-do-koryntian', '1 List do Koryntian', 16], ['2co', '2-do-koryntian', '2 List do Koryntian', 13],
  ['gal', 'do-galatow', 'List do Galatów', 6], ['eph', 'do-efezjan', 'List do Efezjan', 6],
  ['php', 'do-filipian', 'List do Filipian', 4], ['col', 'do-kolosan', 'List do Kolosan', 4],
  ['1th', '1-do-tesaloniczan', '1 List do Tesaloniczan', 5], ['2th', '2-do-tesaloniczan', '2 List do Tesaloniczan', 3],
  ['1ti', '1-do-tymoteusza', '1 List do Tymoteusza', 6], ['2ti', '2-do-tymoteusza', '2 List do Tymoteusza', 4],
  ['tit', 'do-tytusa', 'List do Tytusa', 3], ['phm', 'do-filemona', 'List do Filemona', 1],
  ['heb', 'do-hebrajczykow', 'List do Hebrajczyków', 13], ['jas', 'jakuba', 'List św. Jakuba', 5],
  ['1pe', '1-piotra', '1 List św. Piotra', 5], ['2pe', '2-piotra', '2 List św. Piotra', 3],
  ['1jn', '1-jana', '1 List św. Jana', 5], ['2jn', '2-jana', '2 List św. Jana', 1],
  ['3jn', '3-jana', '3 List św. Jana', 1], ['jud', 'judy', 'List św. Judy', 1], ['rev', 'apokalipsa', 'Apokalipsa św. Jana', 22],
] as const

const availableBookIds = new Set(['gen', 'exo', 'num', 'jdg', '1ki', '1ch', 'ezr', 'psa', 'isa', 'lam', 'mat', 'mrk', 'luk', 'rom', 'gal', 'eph', '1th', '2th', '2ti', 'tit', '2pe'])

function makeBooks(entries: readonly (readonly [string, string, string, number])[], testament: Testament) {
  return entries.map(([id, slug, name, chapterCount]) => ({
    id, slug, name, testament, chapterCount, isAvailable: availableBookIds.has(id),
  }))
}

export const scriptureCatalog: ScriptureCatalogBook[] = [
  ...makeBooks(oldTestament, 'Old'),
  ...makeBooks(newTestament, 'New'),
]

export const scriptureBooksBySlug = Object.fromEntries(
  scriptureCatalog.map((book) => [book.slug, book]),
) as Record<string, ScriptureCatalogBook>
