export interface ChapletStep {
  label: string
  prayer: string
  counter?: string
  context?: string
  source?: string
}

const HUMANITY_CONSECRATION_SOURCE = 'http://parafia-linia.pl/292-akt-poswiecenia-rodzaju-ludzkiego-najswietszemu-sercu-pana-jezusa-artykul.html'

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

  humanityConsecration: [
    'O Jezu najsłodszy, Odkupicielu rodzaju ludzkiego, wejrzyj na nas, korzących się u stóp Twego ołtarza.',
    'Twoją jesteśmy własnością i do Ciebie należeć chcemy.',
    'Oto dzisiaj każdy z nas oddaje się dobrowolnie Najświętszemu Sercu Twemu, aby jeszcze ściślej zjednoczyć się z Tobą.',
    'Wielu nie zna cię wcale; wielu odwróciło się od Ciebie, wzgardziwszy przykazaniami Twymi.',
    'Zlituj się nad jednymi i drugimi, o Jezu Najłaskawszy, i pociągnij wszystkich do świętego Serca Swego.',
    'Królem bądź nam, o Panie, nie tylko wiernym, którzy nigdy nie odstąpili od Ciebie, ale i synom marnotrawnym, którzy Cię opuścili.',
    'Spraw, aby do domu rodzicielskiego wrócili co prędzej i nie zginęli z nędzy i głodu.',
    'Króluj tym, których albo błędne mniemania uwiodły, albo niezgoda rozdziela; przywiedź ich do przystani prawdy i jedności wiary, aby rychło nastała jedna owczarnia i jeden pasterz.',
    'Użycz Kościołowi Twemu bezpiecznej wolności.',
    'Udziel wszystkim narodom spokoju i ładu.',
    'Spraw, żeby ze wszystkiej ziemi, od końca do końca, jeden brzmiał głos: Chwała bądź Bożemu Sercu, przez które stało się nam zbawienie.',
    'Jemu cześć i chwała na wieki. Amen.',
  ].join(' '),
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

  steps.push({
    label: 'Akt poświęcenia rodzaju ludzkiego Najświętszemu Sercu Pana Jezusa',
    prayer: prayers.humanityConsecration,
    source: HUMANITY_CONSECRATION_SOURCE,
  })

  steps.push({ label: 'Znak Krzyża', prayer: prayers.signOfCross })

  return steps
}
