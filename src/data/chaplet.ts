export interface ChapletStep {
  label: string
  prayer: string
  counter?: string
  context?: string
}

const prayers = {
  signOfCross: 'W imię Ojca i Syna, i Ducha Świętego. Amen.',

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

  // Large bead — said once per decade
  eternalFather:
    'Ojcze Przedwieczny, ofiaruję Ci Ciało i Krew, Duszę i Bóstwo ' +
    'najmilszego Syna Twojego, a Pana naszego Jezusa Chrystusa, ' +
    'na przebłaganie za grzechy nasze i całego świata.',

  // Small beads — said ten times per decade
  forTheSakeOf:
    'Dla Jego bolesnej męki, miej miłosierdzie dla nas i całego świata.',

  // Closing x3
  holyGod:
    'Święty Boże, Święty Mocny, Święty Nieśmiertelny, zmiłuj się nad nami i nad całym światem.',

  // Closing x3
  bloodAndWater:
    'O Krwi i Wodo, któraś wytrysnęła z Najświętszego Serca Jezusowego jako zdrój miłosierdzia dla nas – ufamy Tobie.',

  // Closing x3
  jesusITrust: 'Jezu, ufam Tobie.',
} as const

export function buildChapletSteps(): ChapletStep[] {
  const steps: ChapletStep[] = []

  // Opening
  steps.push({ label: 'Znak Krzyża', prayer: prayers.signOfCross })
  steps.push({ label: 'Ojcze Nasz', prayer: prayers.ourFather })
  steps.push({ label: 'Zdrowaś Mario', prayer: prayers.hailMary })
  steps.push({ label: 'Wierzę w Boga', prayer: prayers.creed })

  // 5 decades
  for (let decade = 1; decade <= 5; decade++) {
    // Large bead
    steps.push({
      label: 'Ojcze Przedwieczny',
      prayer: prayers.eternalFather,
      counter: `dziesiątek ${decade}/5`,
    })
    // Small beads x10
    for (let i = 1; i <= 10; i++) {
      steps.push({
        label: 'Dla Jego bolesnej męki',
        prayer: prayers.forTheSakeOf,
        counter: `${i}/10`,
        context: `Dziesiątek ${decade} z 5`,
      })
    }
  }

  // Closing
  steps.push({ label: 'Święty Boże', prayer: prayers.holyGod, counter: '1/3' })
  steps.push({ label: 'Święty Boże', prayer: prayers.holyGod, counter: '2/3' })
  steps.push({ label: 'Święty Boże', prayer: prayers.holyGod, counter: '3/3' })

  steps.push({ label: 'O Krwi i Wodo', prayer: prayers.bloodAndWater, counter: '1/3' })
  steps.push({ label: 'O Krwi i Wodo', prayer: prayers.bloodAndWater, counter: '2/3' })
  steps.push({ label: 'O Krwi i Wodo', prayer: prayers.bloodAndWater, counter: '3/3' })

  steps.push({ label: 'Jezu, ufam Tobie', prayer: prayers.jesusITrust, counter: '1/3' })
  steps.push({ label: 'Jezu, ufam Tobie', prayer: prayers.jesusITrust, counter: '2/3' })
  steps.push({ label: 'Jezu, ufam Tobie', prayer: prayers.jesusITrust, counter: '3/3' })

  steps.push({ label: 'Znak Krzyża', prayer: prayers.signOfCross })

  return steps
}
