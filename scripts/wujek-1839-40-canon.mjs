const editions = {
  '1923': {
    sourceEdition: 'Biblia Jakuba Wujka (1599), wydanie 1923',
    sourceWikiPage: 'https://pl.wikisource.org/wiki/Biblia_Wujka_(1923)',
    sourceRoot: 'Biblia Wujka (1923)',
  },
  '1839-40': {
    sourceEdition: 'Biblia Jakuba Wujka (1599), wydanie 1839–1840',
    sourceWikiPage: 'https://pl.wikisource.org/wiki/Biblia_Wujka_(wyd._1839-40)',
    sourceRoot: 'Biblia Wujka (wyd. 1839-40)',
  },
}

function sourceUrl(title) {
  return `https://pl.wikisource.org/wiki/${encodeURIComponent(title.replaceAll(' ', '_'))}`
}

function book(id, name, testament, editionKey, sourcePath) {
  const edition = editions[editionKey]
  const sourceTitle = `${edition.sourceRoot}/${sourcePath}`

  return {
    id,
    name,
    testament,
    availability: 'available',
    sourceTitle,
    sourceUrl: sourceUrl(sourceTitle),
    sourceEdition: edition.sourceEdition,
    sourceName: 'Wikiźródła',
    sourceRights: 'Domena publiczna (wydanie); CC BY-SA 4.0 (transkrypcja Wikiźródeł)',
  }
}

function unavailableBook(id, name, testament) {
  return {
    id,
    name,
    testament,
    availability: 'unavailable',
    unavailableReason: 'Brak kompletnej, zweryfikowanej transkrypcji w wybranych źródłach.',
  }
}

function books(testament, editionKey, entries) {
  return entries.map(([id, name, sourcePath]) => book(id, name, testament, editionKey, sourcePath))
}

// 66 books from the fully transcribed 1923 edition.
const booksFrom1923 = [
  ...books('Old', '1923', [
    ['gen', 'Księga Rodzaju', 'Księga Rodzaju'],
    ['exo', 'Księga Wyjścia', 'Księga Wyjścia'],
    ['lev', 'Księga Kapłańska', 'Księga Kapłańska'],
    ['num', 'Księga Liczb', 'Księga Liczb'],
    ['deu', 'Księga Powtórzonego Prawa', 'Księga Powtórzonego Prawa'],
    ['jos', 'Księga Jozuego', 'Księga Jozuego'],
    ['jdg', 'Księga Sędziów', 'Księga Sędziów'],
    ['rut', 'Księga Rut', 'Księga Rut'],
    ['1sm', '1 Księga Samuela', 'Pierwsza Księga Samuela'],
    ['2sm', '2 Księga Samuela', 'Druga Księga Samuela'],
    ['1ki', '1 Księga Królewska', 'Pierwsza Księga Królewska'],
    ['2ki', '2 Księga Królewska', 'Druga Księga Królewska'],
    ['1ch', '1 Księga Kronik', 'Pierwsza Księga Kronik'],
    ['2ch', '2 Księga Kronik', 'Druga Księga Kronik'],
    ['ezr', 'Księga Ezdrasza', 'Księga Ezdrasza'],
    ['neh', 'Księga Nehemiasza', 'Księga Nehemiasza'],
    ['est', 'Księga Estery', 'Księga Estery'],
    ['job', 'Księga Hioba', 'Księga Hioba'],
    ['psa', 'Księga Psalmów', 'Księga Psalmów'],
    ['pro', 'Księga Przysłów', 'Księga Przysłów'],
    ['ecc', 'Księga Koheleta', 'Księga Koheleta'],
    ['sng', 'Pieśń nad Pieśniami', 'Pieśń nad Pieśniami'],
    ['isa', 'Księga Izajasza', 'Księga Izajasza'],
    ['jer', 'Księga Jeremiasza', 'Księga Jeremiasza'],
    ['lam', 'Lamentacje', 'Treny'],
    ['ezk', 'Księga Ezechiela', 'Księga Ezechiela'],
    ['dan', 'Księga Daniela', 'Księga Daniela'],
    ['hos', 'Księga Ozeasza', 'Księga Ozeasza'],
    ['jol', 'Księga Joela', 'Księga Joela'],
    ['amo', 'Księga Amosa', 'Księga Amosa'],
    ['oba', 'Księga Abdiasza', 'Księga Abdiasza'],
    ['jon', 'Księga Jonasza', 'Księga Jonasza'],
    ['mic', 'Księga Micheasza', 'Księga Micheasza'],
    ['nah', 'Księga Nahuma', 'Księga Nahuma'],
    ['hab', 'Księga Habakuka', 'Księga Habakuka'],
    ['zep', 'Księga Sofoniasza', 'Księga Sofoniasza'],
    ['hag', 'Księga Aggeusza', 'Księga Aggeusza'],
    ['zec', 'Księga Zachariasza', 'Księga Zachariasza'],
    ['mal', 'Księga Malachiasza', 'Księga Malachiasza'],
  ]),
  ...books('New', '1923', [
    ['mat', 'Ewangelia według św. Mateusza', 'Ewangelia wg św. Mateusza'],
    ['mrk', 'Ewangelia według św. Marka', 'Ewangelia wg św. Marka'],
    ['luk', 'Ewangelia według św. Łukasza', 'Ewangelia wg św. Łukasza'],
    ['jhn', 'Ewangelia według św. Jana', 'Ewangelia wg św. Jana'],
    ['act', 'Dzieje Apostolskie', 'Dzieje Apostolskie'],
    ['rom', 'List do Rzymian', 'List do Rzymian'],
    ['1co', '1 List do Koryntian', 'Pierwszy List do Koryntian'],
    ['2co', '2 List do Koryntian', 'Drugi List do Koryntian'],
    ['gal', 'List do Galatów', 'List do Galatów'],
    ['eph', 'List do Efezjan', 'List do Efezjan'],
    ['php', 'List do Filipian', 'List do Filipian'],
    ['col', 'List do Kolosan', 'List do Kolosan'],
    ['1th', '1 List do Tesaloniczan', 'Pierwszy List do Tesaloniczan'],
    ['2th', '2 List do Tesaloniczan', 'Drugi List do Tesaloniczan'],
    ['1ti', '1 List do Tymoteusza', 'Pierwszy List do Tymoteusza'],
    ['2ti', '2 List do Tymoteusza', 'Drugi List do Tymoteusza'],
    ['tit', 'List do Tytusa', 'List do Tytusa'],
    ['phm', 'List do Filemona', 'List do Filemona'],
    ['heb', 'List do Hebrajczyków', 'List do Hebrajczyków'],
    ['jas', 'List św. Jakuba', 'List św. Jakuba'],
    ['1pe', '1 List św. Piotra', 'Pierwszy List św. Piotra'],
    ['2pe', '2 List św. Piotra', 'Drugi List św. Piotra'],
    ['1jn', '1 List św. Jana', 'Pierwszy List św. Jana'],
    ['2jn', '2 List św. Jana', 'Drugi List św. Jana'],
    ['3jn', '3 List św. Jana', 'Trzeci List św. Jana'],
    ['jud', 'List św. Judy', 'List św. Judy'],
    ['rev', 'Apokalipsa św. Jana', 'Apokalipsa św. Jana'],
  ]),
]

// These three deuterocanonical books have complete transcribed pages in the 1839–1840 edition.
const deuterocanonicalBooks = books('Old', '1839-40', [
  ['tob', 'Księga Tobiasza', 'Księgi Tobiaszowe'],
  ['jdt', 'Księga Judyty', 'Księgi Judith'],
  ['wis', 'Księga Mądrości', 'Księgi Mądrości'],
])

const unavailableCanonicalBooks = [
  unavailableBook('bar', 'Księga Barucha', 'Old'),
  unavailableBook('sir', 'Mądrość Syracha', 'Old'),
  unavailableBook('1ma', '1 Księga Machabejska', 'Old'),
  unavailableBook('2ma', '2 Księga Machabejska', 'Old'),
]

export const canonicalBooks = [
  ...booksFrom1923.slice(0, 17),
  ...deuterocanonicalBooks.slice(0, 2),
  ...booksFrom1923.slice(17, 22),
  deuterocanonicalBooks[2],
  unavailableCanonicalBooks[1],
  ...booksFrom1923.slice(22, 25),
  unavailableCanonicalBooks[0],
  ...booksFrom1923.slice(25, 39),
  unavailableCanonicalBooks[2],
  unavailableCanonicalBooks[3],
  ...booksFrom1923.slice(39),
]

export const availableCanonicalBooks = canonicalBooks.filter(
  (book) => book.availability === 'available',
)
export { editions, unavailableCanonicalBooks }
