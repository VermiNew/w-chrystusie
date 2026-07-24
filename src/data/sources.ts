export type ContentSourceStatus = 'active' | 'planned'

export interface SourceSection {
  label: string
  url: string
}

export interface ContentSource {
  id: string
  name: string
  url: string
  logo: string
  description: string
  contentKinds: readonly string[]
  sections: readonly SourceSection[]
  status: ContentSourceStatus
  verifiedAt: string
  usageNote: string
  wideLogo?: boolean
}

export interface RecommendedMaterial {
  id: string
  category: string
  title: string
  author?: string
  publisher: string
  description: string
  image: string
  imageWidth: number
  imageHeight: number
  imageAlt: string
  purchaseUrl: string
  retailer: string
  verifiedAt: string
  isAffiliate: false
  imageRightsStatus: 'verification-required'
}

export const SOURCE_VERIFICATION_DATE = '2026-07-24'
const importPermissionNote =
  'Dokładny adres należy zachować przy każdej pozycji; pełne treści można importować dopiero po potwierdzeniu licencji lub zgody.'

export const contentSources: readonly ContentSource[] = [
  {
    id: 'niedziela',
    name: 'Niedziela',
    url: 'https://www.niedziela.pl/',
    logo: '/sources/niedziela.png',
    description: 'Katolicki tygodnik, portal informacyjny i Niezbędnik Katolika.',
    contentKinds: ['modlitwy', 'pieśni', 'liturgia dnia'],
    sections: [
      {
        label: 'Niezbędnik Katolika',
        url: 'https://niezbednik.niedziela.pl/',
      },
    ],
    status: 'active',
    verifiedAt: SOURCE_VERIFICATION_DATE,
    usageNote: importPermissionNote,
  },
  {
    id: 'dolina-modlitwy',
    name: 'Dolina Modlitwy',
    url: 'https://dolinamodlitwy.pl/',
    logo: '/sources/dolina-modlitwy.jpeg',
    description: 'Baza modlitw, koronek, litanii, nowenn i nabożeństw.',
    contentKinds: ['modlitwy', 'koronki', 'litanie', 'nowenny', 'nabożeństwa'],
    sections: [],
    status: 'active',
    verifiedAt: SOURCE_VERIFICATION_DATE,
    usageNote: importPermissionNote,
  },
  {
    id: 'modlitwa7',
    name: 'Modlitwa7',
    url: 'https://modlitwa7.pl/',
    logo: '/sources/modlitwa7.png',
    description: 'Indeksy modlitw, pieśni, tekstów, psalmów i materiały różańcowe.',
    contentKinds: ['modlitwy', 'pieśni', 'teksty', 'psalmy', 'różaniec'],
    sections: [
      { label: 'Modlitwy', url: 'https://modlitwa7.pl/modlitwy/' },
      { label: 'Pieśni', url: 'https://modlitwa7.pl/piesni/' },
      { label: 'Teksty', url: 'https://modlitwa7.pl/teksty/' },
      { label: 'Psalmy', url: 'https://modlitwa7.pl/psalmy/' },
      { label: 'Różaniec', url: 'https://modlitwa7.pl/rozaniec/' },
    ],
    status: 'active',
    verifiedAt: SOURCE_VERIFICATION_DATE,
    usageNote: importPermissionNote,
  },
  {
    id: 'katolicki-net',
    name: 'Katolicki.net',
    url: 'https://www.katolicki.net/index.php/modlitwa/modlitwa-spiewnik.html',
    logo: '/sources/katolicki-net.jpg',
    description: 'Śpiewnik wykorzystywany jako indeks pieśni religijnych.',
    contentKinds: ['pieśni'],
    sections: [
      {
        label: 'Śpiewnik',
        url: 'https://www.katolicki.net/index.php/modlitwa/modlitwa-spiewnik.html',
      },
    ],
    status: 'active',
    verifiedAt: SOURCE_VERIFICATION_DATE,
    usageNote: importPermissionNote,
    wideLogo: true,
  },
  {
    id: 'romcal',
    name: 'Romcal',
    url: 'https://romcal.js.org/',
    logo: '/sources/romcal.png',
    description: 'Biblioteka generująca kalendarze liturgiczne obrządku rzymskiego.',
    contentKinds: ['kalendarz liturgiczny'],
    sections: [
      {
        label: 'Dokumentacja',
        url: 'https://romcal.js.org/',
      },
    ],
    status: 'planned',
    verifiedAt: SOURCE_VERIFICATION_DATE,
    usageNote:
      'Planowane źródło dat i obchodów liturgicznych; nie jest źródłem polskich tekstów czytań mszalnych.',
  },
]

export const recommendedMaterials: readonly RecommendedMaterial[] = [
  {
    id: 'pismo-swiete-standard',
    category: 'Pismo Święte, które polecam',
    title: 'Pismo Święte Starego i Nowego Testamentu',
    publisher: 'Edycja Świętego Pawła',
    description: 'Format 16 × 22 cm, twarda oprawa, paginatory.',
    image: '/materials/pismo-swiete-standard.jpg',
    imageWidth: 700,
    imageHeight: 700,
    imageAlt: 'Okładka polecanego wydania Pisma Świętego',
    purchaseUrl:
      'https://edycja.pl/pismo-swiete/format-duzy-2972/pismo-sw-st-i-nt-standard-format-twarda-oprawa-paginatory-1320200202.html',
    retailer: 'Edycja Świętego Pawła',
    verifiedAt: SOURCE_VERIFICATION_DATE,
    isAffiliate: false,
    imageRightsStatus: 'verification-required',
  },
  {
    id: 'slowo-ma-moc',
    category: 'Książka',
    title: 'Słowo ma MOC',
    author: 'ks. Łukasz Brus',
    publisher: 'Wydawnictwo Esprit',
    description: 'Pomoc w odkrywaniu mocy Słowa Bożego w codziennym życiu.',
    image: '/materials/slowo-ma-moc.webp',
    imageWidth: 360,
    imageHeight: 540,
    imageAlt: 'Okładka książki Słowo ma MOC',
    purchaseUrl: 'https://www.esprit.com.pl/950/slowo-ma-moc.html',
    retailer: 'Księgarnia Esprit',
    verifiedAt: SOURCE_VERIFICATION_DATE,
    isAffiliate: false,
    imageRightsStatus: 'verification-required',
  },
]
