export const prayers = {
  signOfCross: 'W imię Ojca i Syna, i Ducha Świętego. Amen.',

  creed:
    'Wierzę w Boga, Ojca Wszechmogącego, Stworzyciela nieba i ziemi. ' +
    'I w Jezusa Chrystusa, Syna Jego Jedynego, Pana naszego, ' +
    'który się począł z Ducha Świętego, narodził się z Maryi Panny, ' +
    'umęczon pod Poncjuszem Piłatem, ukrzyżowan, umarł i pogrzebion. ' +
    'Zstąpił do piekieł, trzeciego dnia zmartwychwstał. ' +
    'Wstąpił na niebiosa, siedzi po prawicy Boga Ojca Wszechmogącego. ' +
    'Stamtąd przyjdzie sądzić żywych i umarłych. ' +
    'Wierzę w Ducha Świętego, święty Kościół powszechny, ' +
    'Świętych obcowanie, grzechów odpuszczenie, ' +
    'ciała zmartwychwstanie, żywot wieczny. Amen.',

  ourFather:
    'Ojcze nasz, któryś jest w niebie, święć się imię Twoje; ' +
    'przyjdź królestwo Twoje; bądź wola Twoja jako w niebie tak i na ziemi. ' +
    'Chleba naszego powszedniego daj nam dzisiaj; ' +
    'i odpuść nam nasze winy, jako i my odpuszczamy naszym winowajcom; ' +
    'i nie wódź nas na pokuszenie, ale nas zbaw ode złego. Amen.',

  hailMary:
    'Zdrowaś Mario, łaski pełna, Pan z Tobą, ' +
    'błogosławionaś Ty między niewiastami ' +
    'i błogosławiony owoc żywota Twojego, Jezus. ' +
    'Święta Mario, Matko Boża, módl się za nami grzesznymi ' +
    'teraz i w godzinę śmierci naszej. Amen.',

  gloryBe:
    'Chwała Ojcu i Synowi, i Duchowi Świętemu, ' +
    'jak była na początku, teraz i zawsze, i na wieki wieków. Amen.',

  fatima:
    'O mój Jezu, przebacz nam nasze grzechy, ' +
    'zachowaj nas od ognia piekielnego, ' +
    'zaprowadź wszystkie dusze do nieba ' +
    'i dopomóż szczególnie tym, którzy najbardziej potrzebują Twojego miłosierdzia.',

  subTuumPraesidium:
    'Pod Twoją obronę uciekamy się, Święta Boża Rodzicielko, ' +
    'naszymi prośbami racz nie gardzić w potrzebach naszych, ' +
    'ale od wszelkich złych przygód racz nas zawsze wybawiać, ' +
    'Panno chwalebna i błogosławiona. ' +
    'O Pani nasza, Orędowniczko nasza, Pośredniczko nasza, Pocieszycielko nasza. ' +
    'Z Synem swoim nas pojednaj, Synowi swojemu nas polecaj, ' +
    'swojemu Synowi nas oddawaj.',

  eternalRest:
    'Wieczny odpoczynek racz im dać, Panie, a światłość wiekuista niechaj im świeci ' +
    'na wieki wieków. I niechaj ich dusze i wszystkie dusze wiernych zmarłych, ' +
    'z pomocą łaski Bożej odpoczywają w pokoju. Amen.',
} as const

export const rosaryPrayerGuide = [
  { name: 'Wierzę w Boga', text: prayers.creed },
  { name: 'Ojcze nasz', text: prayers.ourFather },
  { name: 'Zdrowaś Maryjo', text: prayers.hailMary },
  { name: 'Chwała Ojcu', text: prayers.gloryBe },
  { name: 'O mój Jezu', text: prayers.fatima },
  { name: 'Pod Twoją obronę', text: prayers.subTuumPraesidium },
  { name: 'Wieczny odpoczynek', text: prayers.eternalRest },
] as const

export const rosaryPromisesIntroduction = [
  'Różaniec w postaci wielokrotnego odmawiania Pozdrowienia Anielskiego upowszechniał św. Dominik, założyciel Zakonu Kaznodziejskiego (dominikanów), dlatego nazywa się go ojcem różańca do Najświętszej Maryi Panny.',
  'Obecna forma Różańca ustaliła się w XV wieku dzięki innemu dominikaninowi, bł. Alanowi de la Roche (1428–1475). Ustalił on nazwę „Psałterz Maryi” oraz liczbę 150 modlitw „Zdrowaś Maryjo”, podzielonych na dziesiątki i przeplatanych Modlitwą Pańską. Założył również pierwsze bractwo różańcowe w Douai w 1470 roku. Według przekazu przywołanego przez źródło Maryja powierzyła mu piętnaście obietnic dla osób odmawiających Różaniec:',
] as const

export const rosaryPromises = [
  'Ktokolwiek będzie mi służył przez odmawianie Różańca Świętego, otrzyma wyjątkowe łaski.',
  'Obiecuję moją specjalną obronę i największe łaski wszystkim tym, którzy będą odmawiać Różaniec.',
  'Różaniec stanie się bronią przeciw piekłu, zniszczy występki, pomniejszy grzechy i zwycięży herezje.',
  'Spowoduje on, że cnoty i dobre dzieła zakwitną; otrzyma od Boga obfite przebaczenie dla dusz; odciągnie serca ludzi od umiłowania świata i jego marności oraz podniesie je do pragnienia rzeczy wiecznych.',
  'Dusza, która poleci mi się przez odmawianie Różańca, nie zginie.',
  'Ktokolwiek będzie pobożnie odmawiać Różaniec Święty, rozważając równocześnie święte tajemnice, nie dozna nieszczęść, nie doświadczy gniewu Bożego ani nie umrze nagłą śmiercią; nawróci się, jeśli jest grzesznikiem, jeśli zaś jest sprawiedliwy — wytrwa w łasce i osiągnie życie wieczne.',
  'Ktokolwiek będzie miał prawdziwe nabożeństwo do Różańca, nie umrze bez sakramentów Kościoła.',
  'Wierni w odmawianiu Różańca będą mieli w życiu i przy śmierci światło Boże oraz pełnię Jego łaski.',
  'Uwolnię z czyśćca tych, którzy mieli nabożeństwo do Różańca Świętego.',
  'Wierne dzieci Różańca zasłużą na wysoki stopień chwały w niebie.',
  'Otrzymacie wszystko, o co prosicie przez odmawianie Różańca.',
  'Wszystkich, którzy rozpowszechniają Różaniec, będę wspomagała w ich potrzebach.',
  'Otrzymałam od mojego Boskiego Syna obietnicę, że wszyscy obrońcy Różańca będą mieli za wstawienników cały Dwór Niebieski w czasie życia i w godzinę śmierci.',
  'Wszyscy, którzy odmawiają Różaniec, są moimi synami i braćmi mojego Jedynego Syna Jezusa Chrystusa.',
  'Nabożeństwo do mojego Różańca jest wielkim znakiem przeznaczenia do nieba.',
] as const

export interface MysterySet {
  name: string
  /** Days of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday) */
  days: number[]
  mysteries: string[]
}

export const mysterySets: MysterySet[] = [
  {
    name: 'Tajemnice Radosne',
    days: [1, 6], // Monday, Saturday
    mysteries: [
      'Zwiastowanie Najświętszej Maryi Pannie',
      'Nawiedzenie Świętej Elżbiety',
      'Narodzenie Pana Jezusa',
      'Ofiarowanie Pana Jezusa w świątyni',
      'Odnalezienie Pana Jezusa w świątyni',
    ],
  },
  {
    name: 'Tajemnice Światła',
    days: [4], // Thursday
    mysteries: [
      'Chrzest Pana Jezusa w Jordanie',
      'Objawienie się Pana Jezusa na weselu w Kanie',
      'Głoszenie Królestwa Bożego i wzywanie do nawrócenia',
      'Przemienienie na Górze Tabor',
      'Ustanowienie Eucharystii',
    ],
  },
  {
    name: 'Tajemnice Bolesne',
    days: [2, 5], // Tuesday, Friday
    mysteries: [
      'Modlitwa Pana Jezusa w Ogrójcu',
      'Biczowanie Pana Jezusa',
      'Cierniem ukoronowanie Pana Jezusa',
      'Dźwiganie krzyża',
      'Ukrzyżowanie i śmierć Pana Jezusa',
    ],
  },
  {
    name: 'Tajemnice Chwalebne',
    days: [0, 3], // Sunday, Wednesday
    mysteries: [
      'Zmartwychwstanie Pana Jezusa',
      'Wniebowstąpienie Pana Jezusa',
      'Zesłanie Ducha Świętego',
      'Wniebowzięcie Najświętszej Maryi Panny',
      'Ukoronowanie Najświętszej Maryi Panny na Królową nieba i ziemi',
    ],
  },
]

export interface RosaryStep {
  label: string
  prayer: string
  counter?: string
  context?: string
  mystery?: string
}

export function buildRosarySteps(mysterySet: MysterySet): RosaryStep[] {
  const steps: RosaryStep[] = []

  steps.push({ label: 'Znak Krzyża', prayer: prayers.signOfCross })
  steps.push({ label: 'Wierzę w Boga', prayer: prayers.creed })
  steps.push({ label: 'Ojcze Nasz', prayer: prayers.ourFather })

  for (let i = 1; i <= 3; i++) {
    steps.push({ label: 'Zdrowaś Mario', prayer: prayers.hailMary, counter: `${i}/3` })
  }

  steps.push({ label: 'Chwała Ojcu', prayer: prayers.gloryBe })

  for (let decade = 0; decade < 5; decade++) {
    const mystery = mysterySet.mysteries[decade]
    const context = `Dziesiątek ${decade + 1} z 5`

    steps.push({ label: `Tajemnica ${decade + 1}`, prayer: mystery, mystery })
    steps.push({ label: 'Ojcze Nasz', prayer: prayers.ourFather, context, mystery })

    for (let i = 1; i <= 10; i++) {
      steps.push({
        label: 'Zdrowaś Mario',
        prayer: prayers.hailMary,
        counter: `${i}/10`,
        context,
        mystery,
      })
    }

    steps.push({ label: 'Chwała Ojcu', prayer: prayers.gloryBe, context, mystery })
    steps.push({ label: 'Modlitwa Fatimska', prayer: prayers.fatima, context, mystery })
  }

  steps.push({ label: 'Pod Twoją Obronę', prayer: prayers.subTuumPraesidium })
  steps.push({ label: 'Znak Krzyża', prayer: prayers.signOfCross })

  return steps
}
