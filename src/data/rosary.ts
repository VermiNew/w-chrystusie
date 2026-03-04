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
} as const

export interface MysterySet {
  name: string
  mysteries: string[]
}

export const mysterySets: MysterySet[] = [
  {
    name: 'Tajemnice Radosne',
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

    steps.push({ label: `Tajemnica ${decade + 1}`, prayer: mystery, mystery })
    steps.push({ label: 'Ojcze Nasz', prayer: prayers.ourFather, mystery })

    for (let i = 1; i <= 10; i++) {
      steps.push({ label: 'Zdrowaś Mario', prayer: prayers.hailMary, counter: `${i}/10`, mystery })
    }

    steps.push({ label: 'Chwała Ojcu', prayer: prayers.gloryBe, mystery })
    steps.push({ label: 'Modlitwa Fatimska', prayer: prayers.fatima, mystery })
  }

  steps.push({ label: 'Pod Twoją Obronę', prayer: prayers.subTuumPraesidium })
  steps.push({ label: 'Znak Krzyża', prayer: prayers.signOfCross })

  return steps
}
