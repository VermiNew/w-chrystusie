import {
  DAY_MS,
  dateKey,
  firstSundayOnOrAfter,
  getEasterKey,
  getLiturgicalSeason,
  type LiturgicalSeason,
} from './liturgicalSeason'

/*
 * Roman calendar for Poland, computed locally so it works offline.
 *
 * Covered: seasons and weeks, liturgical colour, moveable celebrations,
 * solemnities and feasts of the General Roman Calendar and the Polish proper
 * calendar, transfer of impeded solemnities and holy days of obligation.
 * Not covered (yet): memorials of saints, and the rare special decisions of the
 * Holy See that differ from the general norms (e.g. 2022, when the Nativity of
 * John the Baptist was anticipated because of the Sacred Heart).
 */

export type LiturgicalColor = 'white' | 'red' | 'green' | 'violet' | 'rose'
export type CelebrationRank = 'solemnity' | 'feast' | 'commemoration' | 'sunday' | 'weekday'

export interface LiturgicalDay {
  title: string
  rank: CelebrationRank
  color: LiturgicalColor
  season: LiturgicalSeason
  holyDayOfObligation: boolean
}

interface Celebration {
  title: string
  rank: 'solemnity' | 'feast' | 'commemoration'
  color: LiturgicalColor
  // Feasts of the Lord replace a Sunday in Ordinary Time / Christmas time; other feasts do not
  lordFeast?: boolean
  obligation?: boolean
  // Solemnities of the Polish proper calendar yield to those of the General Calendar
  proper?: boolean
}

export const colorNames: Record<LiturgicalColor, string> = {
  white: 'biały',
  red: 'czerwony',
  green: 'zielony',
  violet: 'fioletowy',
  rose: 'różowy',
}

// Fixed-date solemnities and feasts, keyed "MM-DD"
const fixedCelebrations: Record<string, Celebration> = {
  '01-01': { title: 'Uroczystość Świętej Bożej Rodzicielki Maryi', rank: 'solemnity', color: 'white', obligation: true },
  '01-06': { title: 'Uroczystość Objawienia Pańskiego', rank: 'solemnity', color: 'white', obligation: true },
  '01-25': { title: 'Święto Nawrócenia św. Pawła Apostoła', rank: 'feast', color: 'white' },
  '02-02': { title: 'Święto Ofiarowania Pańskiego', rank: 'feast', color: 'white', lordFeast: true },
  '02-14': { title: 'Święto św. Cyryla, mnicha, i Metodego, biskupa, patronów Europy', rank: 'feast', color: 'white' },
  '02-22': { title: 'Święto Katedry św. Piotra Apostoła', rank: 'feast', color: 'white' },
  '03-19': { title: 'Uroczystość św. Józefa, Oblubieńca Najświętszej Maryi Panny', rank: 'solemnity', color: 'white' },
  '03-25': { title: 'Uroczystość Zwiastowania Pańskiego', rank: 'solemnity', color: 'white' },
  '04-23': { title: 'Uroczystość św. Wojciecha, biskupa i męczennika, głównego patrona Polski', rank: 'solemnity', color: 'red', proper: true },
  '04-25': { title: 'Święto św. Marka Ewangelisty', rank: 'feast', color: 'red' },
  '04-29': { title: 'Święto św. Katarzyny Sieneńskiej, dziewicy i doktora Kościoła, patronki Europy', rank: 'feast', color: 'white' },
  '05-03': { title: 'Uroczystość Najświętszej Maryi Panny, Królowej Polski', rank: 'solemnity', color: 'white', proper: true },
  '05-06': { title: 'Święto św. Apostołów Filipa i Jakuba', rank: 'feast', color: 'red' },
  '05-08': { title: 'Uroczystość św. Stanisława, biskupa i męczennika, głównego patrona Polski', rank: 'solemnity', color: 'red', proper: true },
  '05-14': { title: 'Święto św. Macieja Apostoła', rank: 'feast', color: 'red' },
  '05-16': { title: 'Święto św. Andrzeja Boboli, prezbitera i męczennika, patrona Polski', rank: 'feast', color: 'red' },
  '05-31': { title: 'Święto Nawiedzenia Najświętszej Maryi Panny', rank: 'feast', color: 'white' },
  '06-24': { title: 'Uroczystość Narodzenia św. Jana Chrzciciela', rank: 'solemnity', color: 'white' },
  '06-29': { title: 'Uroczystość św. Apostołów Piotra i Pawła', rank: 'solemnity', color: 'red' },
  '07-03': { title: 'Święto św. Tomasza Apostoła', rank: 'feast', color: 'red' },
  '07-11': { title: 'Święto św. Benedykta, opata, patrona Europy', rank: 'feast', color: 'white' },
  '07-22': { title: 'Święto św. Marii Magdaleny', rank: 'feast', color: 'white' },
  '07-23': { title: 'Święto św. Brygidy, zakonnicy, patronki Europy', rank: 'feast', color: 'white' },
  '07-25': { title: 'Święto św. Jakuba Apostoła', rank: 'feast', color: 'red' },
  '08-06': { title: 'Święto Przemienienia Pańskiego', rank: 'feast', color: 'white', lordFeast: true },
  '08-09': { title: 'Święto św. Teresy Benedykty od Krzyża, dziewicy i męczennicy, patronki Europy', rank: 'feast', color: 'red' },
  '08-10': { title: 'Święto św. Wawrzyńca, diakona i męczennika', rank: 'feast', color: 'red' },
  '08-15': { title: 'Uroczystość Wniebowzięcia Najświętszej Maryi Panny', rank: 'solemnity', color: 'white', obligation: true },
  '08-24': { title: 'Święto św. Bartłomieja Apostoła', rank: 'feast', color: 'red' },
  '08-26': { title: 'Uroczystość Najświętszej Maryi Panny Częstochowskiej', rank: 'solemnity', color: 'white', proper: true },
  '09-08': { title: 'Święto Narodzenia Najświętszej Maryi Panny', rank: 'feast', color: 'white' },
  '09-14': { title: 'Święto Podwyższenia Krzyża Świętego', rank: 'feast', color: 'red', lordFeast: true },
  '09-21': { title: 'Święto św. Mateusza, Apostoła i Ewangelisty', rank: 'feast', color: 'red' },
  '09-29': { title: 'Święto św. Archaniołów Michała, Gabriela i Rafała', rank: 'feast', color: 'white' },
  '10-18': { title: 'Święto św. Łukasza Ewangelisty', rank: 'feast', color: 'red' },
  '10-28': { title: 'Święto św. Apostołów Szymona i Judy Tadeusza', rank: 'feast', color: 'red' },
  '11-01': { title: 'Uroczystość Wszystkich Świętych', rank: 'solemnity', color: 'white', obligation: true },
  '11-02': { title: 'Wspomnienie wszystkich wiernych zmarłych', rank: 'commemoration', color: 'violet' },
  '11-09': { title: 'Święto rocznicy poświęcenia Bazyliki Laterańskiej', rank: 'feast', color: 'white', lordFeast: true },
  '11-30': { title: 'Święto św. Andrzeja Apostoła', rank: 'feast', color: 'red' },
  '12-08': { title: 'Uroczystość Niepokalanego Poczęcia Najświętszej Maryi Panny', rank: 'solemnity', color: 'white' },
  '12-25': { title: 'Uroczystość Narodzenia Pańskiego', rank: 'solemnity', color: 'white', obligation: true },
  '12-26': { title: 'Święto św. Szczepana, pierwszego męczennika', rank: 'feast', color: 'red' },
  '12-27': { title: 'Święto św. Jana, Apostoła i Ewangelisty', rank: 'feast', color: 'white' },
  '12-28': { title: 'Święto świętych Młodzianków, męczenników', rank: 'feast', color: 'red' },
}

const WEEKDAYS = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota']
const OCTAVE_DAYS = ['', 'Drugi', 'Trzeci', 'Czwarty', 'Piąty', 'Szósty', 'Siódmy']

function roman(value: number): string {
  const numerals: [number, string][] = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]
  let rest = value
  let result = ''
  for (const [amount, numeral] of numerals) {
    while (rest >= amount) {
      result += numeral
      rest -= amount
    }
  }
  return result
}

const weekdayOf = (key: number) => new Date(key).getUTCDay()
const toMonthDay = (key: number) => {
  const date = new Date(key)
  return `${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}

interface YearDates {
  baptism: number
  ashWednesday: number
  palmSunday: number
  easter: number
  pentecost: number
  christTheKing: number
  advent: number
  christmas: number
}

function getYearDates(year: number): YearDates {
  const easter = getEasterKey(year)
  const advent = firstSundayOnOrAfter(dateKey(year, 10, 27))
  return {
    // In Poland Epiphany is always 6 January, so the Baptism is the following Sunday
    baptism: firstSundayOnOrAfter(dateKey(year, 0, 7)),
    ashWednesday: easter - 46 * DAY_MS,
    palmSunday: easter - 7 * DAY_MS,
    easter,
    pentecost: easter + 49 * DAY_MS,
    christTheKing: advent - 7 * DAY_MS,
    advent,
    christmas: dateKey(year, 11, 25),
  }
}

/** Days no solemnity may displace: they are transferred instead (and feasts are omitted). */
function isPrivileged(key: number, dates: YearDates): boolean {
  const isSunday = weekdayOf(key) === 0
  if (key === dates.ashWednesday) return true
  // Holy Week, the Triduum and the Easter octave up to Divine Mercy Sunday
  if (key >= dates.palmSunday && key <= dates.easter + 7 * DAY_MS) return true
  if (!isSunday) return false
  // Sundays of Advent, Lent and Easter (up to and including Pentecost)
  return (key >= dates.advent && key < dates.christmas)
    || (key > dates.ashWednesday && key < dates.palmSunday)
    || (key > dates.easter && key <= dates.pentecost)
}

const celebrationCache = new Map<number, Map<number, Celebration>>()

function getCelebrations(year: number): Map<number, Celebration> {
  const cached = celebrationCache.get(year)
  if (cached) return cached

  const dates = getYearDates(year)
  const map = new Map<number, Celebration>()

  // Moveable celebrations keep their date
  const christmasWeekday = weekdayOf(dates.christmas)
  const holyFamily = christmasWeekday === 0
    ? dateKey(year, 11, 30)
    : dates.christmas + (7 - christmasWeekday) * DAY_MS
  map.set(dates.baptism, { title: 'Święto Chrztu Pańskiego', rank: 'feast', color: 'white', lordFeast: true })
  map.set(dates.pentecost + DAY_MS, { title: 'Święto Najświętszej Maryi Panny, Matki Kościoła', rank: 'feast', color: 'white' })
  map.set(dates.pentecost + 4 * DAY_MS, { title: 'Święto Jezusa Chrystusa, Najwyższego i Wiecznego Kapłana', rank: 'feast', color: 'white' })
  map.set(dates.pentecost + 7 * DAY_MS, { title: 'Uroczystość Najświętszej Trójcy', rank: 'solemnity', color: 'white' })
  map.set(dates.pentecost + 11 * DAY_MS, { title: 'Uroczystość Najświętszego Ciała i Krwi Chrystusa', rank: 'solemnity', color: 'white', obligation: true })
  map.set(dates.pentecost + 19 * DAY_MS, { title: 'Uroczystość Najświętszego Serca Pana Jezusa', rank: 'solemnity', color: 'white' })
  map.set(dates.christTheKing, { title: 'Uroczystość Jezusa Chrystusa, Króla Wszechświata', rank: 'solemnity', color: 'white' })
  map.set(holyFamily, { title: 'Święto Świętej Rodziny: Jezusa, Maryi i Józefa', rank: 'feast', color: 'white', lordFeast: true })

  const fixed = Object.entries(fixedCelebrations).map(([monthDay, celebration]) => {
    const [month, day] = monthDay.split('-').map(Number)
    return { key: dateKey(year, month - 1, day), celebration }
  })

  // Solemnities: General Calendar first, then the Polish ones; an impeded solemnity
  // moves to the next day that is neither privileged nor taken by another solemnity.
  const solemnities = fixed
    .filter(({ celebration }) => celebration.rank === 'solemnity')
    .sort((a, b) => Number(Boolean(a.celebration.proper)) - Number(Boolean(b.celebration.proper)) || a.key - b.key)
  for (const { key, celebration } of solemnities) {
    let target = key
    // St Joseph falling in Holy Week is anticipated to the Saturday before Palm Sunday
    if (toMonthDay(key) === '03-19' && key >= dates.palmSunday && key < dates.easter) {
      target = dates.palmSunday - DAY_MS
    }
    while (isPrivileged(target, dates) || map.get(target)?.rank === 'solemnity') target += DAY_MS
    map.set(target, celebration)
  }

  // Feasts and All Souls stay on their date and only fill free days
  for (const { key, celebration } of fixed) {
    if (celebration.rank !== 'solemnity' && !map.has(key)) map.set(key, celebration)
  }

  celebrationCache.set(year, map)
  return map
}

interface TemporalDay {
  title: string
  rank: 'solemnity' | 'sunday' | 'weekday'
  color: LiturgicalColor
  obligation?: boolean
}

function getTemporalDay(key: number, dates: YearDates): TemporalDay {
  const weekday = weekdayOf(key)
  const isSunday = weekday === 0
  const weekdayName = WEEKDAYS[weekday]
  const daysAfter = (start: number) => Math.round((key - start) / DAY_MS)
  const date = new Date(key)

  // Advent
  if (key >= dates.advent && key < dates.christmas) {
    const week = Math.floor(daysAfter(dates.advent) / 7) + 1
    return isSunday
      ? { title: `${roman(week)} Niedziela Adwentu`, rank: 'sunday', color: week === 3 ? 'rose' : 'violet' }
      : { title: `${weekdayName} ${roman(week)} tygodnia Adwentu`, rank: 'weekday', color: 'violet' }
  }

  // Christmas time: the octave, then until the Baptism of the Lord
  if (key >= dates.christmas) {
    const day = daysAfter(dates.christmas)
    return { title: `${OCTAVE_DAYS[day]} dzień w oktawie Narodzenia Pańskiego`, rank: 'weekday', color: 'white' }
  }
  if (key <= dates.baptism) {
    if (isSunday) return { title: 'II Niedziela po Narodzeniu Pańskim', rank: 'sunday', color: 'white' }
    return date.getUTCDate() < 6
      ? { title: `${weekdayName} okresu Narodzenia Pańskiego`, rank: 'weekday', color: 'white' }
      : { title: `${weekdayName} po Objawieniu Pańskim`, rank: 'weekday', color: 'white' }
  }

  // Ordinary Time before Lent; week 1 starts the day after the Baptism
  if (key < dates.ashWednesday) {
    const week = Math.floor(daysAfter(dates.baptism) / 7) + 1
    return isSunday
      ? { title: `${roman(week)} Niedziela zwykła`, rank: 'sunday', color: 'green' }
      : { title: `${weekdayName} ${roman(week)} tygodnia zwykłego`, rank: 'weekday', color: 'green' }
  }

  // Lent
  const firstLentSunday = dates.ashWednesday + 4 * DAY_MS
  if (key === dates.ashWednesday) return { title: 'Środa Popielcowa', rank: 'weekday', color: 'violet' }
  if (key < firstLentSunday) return { title: `${weekdayName} po Popielcu`, rank: 'weekday', color: 'violet' }
  if (key < dates.palmSunday) {
    const week = Math.floor(daysAfter(firstLentSunday) / 7) + 1
    return isSunday
      ? { title: `${roman(week)} Niedziela Wielkiego Postu`, rank: 'sunday', color: week === 4 ? 'rose' : 'violet' }
      : { title: `${weekdayName} ${roman(week)} tygodnia Wielkiego Postu`, rank: 'weekday', color: 'violet' }
  }

  // Holy Week and the Triduum
  if (key < dates.easter) {
    const holyWeek: TemporalDay[] = [
      { title: 'Niedziela Palmowa, czyli Męki Pańskiej', rank: 'sunday', color: 'red' },
      { title: 'Wielki Poniedziałek', rank: 'weekday', color: 'violet' },
      { title: 'Wielki Wtorek', rank: 'weekday', color: 'violet' },
      { title: 'Wielka Środa', rank: 'weekday', color: 'violet' },
      { title: 'Wielki Czwartek', rank: 'weekday', color: 'white' },
      { title: 'Wielki Piątek Męki Pańskiej', rank: 'weekday', color: 'red' },
      { title: 'Wielka Sobota', rank: 'weekday', color: 'violet' },
    ]
    return holyWeek[daysAfter(dates.palmSunday)]
  }

  // Easter time
  if (key <= dates.pentecost) {
    const day = daysAfter(dates.easter)
    if (day === 0) return { title: 'Niedziela Zmartwychwstania Pańskiego', rank: 'solemnity', color: 'white', obligation: true }
    if (day < 7) return { title: `${weekdayName} w oktawie Wielkanocy`, rank: 'weekday', color: 'white' }
    if (day === 7) return { title: 'II Niedziela Wielkanocna, czyli Miłosierdzia Bożego', rank: 'sunday', color: 'white' }
    // In Poland the Ascension is celebrated on the Seventh Sunday of Easter
    if (day === 42) return { title: 'Uroczystość Wniebowstąpienia Pańskiego', rank: 'solemnity', color: 'white', obligation: true }
    if (day === 49) return { title: 'Uroczystość Zesłania Ducha Świętego', rank: 'solemnity', color: 'red', obligation: true }
    const week = Math.floor(day / 7) + 1
    return isSunday
      ? { title: `${roman(week)} Niedziela Wielkanocna`, rank: 'sunday', color: 'white' }
      : { title: `${weekdayName} ${roman(week)} tygodnia wielkanocnego`, rank: 'weekday', color: 'white' }
  }

  // Ordinary Time after Pentecost, counted back from Christ the King (34th Sunday)
  const sundayOnOrBefore = key - weekday * DAY_MS
  const week = 34 - Math.round((dates.christTheKing - sundayOnOrBefore) / (7 * DAY_MS))
  return isSunday
    ? { title: `${roman(week)} Niedziela zwykła`, rank: 'sunday', color: 'green' }
    : { title: `${weekdayName} ${roman(week)} tygodnia zwykłego`, rank: 'weekday', color: 'green' }
}

/** The liturgical day for a calendar date (in the user's local time zone). */
export function getLiturgicalDay(date = new Date()): LiturgicalDay {
  const year = date.getFullYear()
  const key = dateKey(year, date.getMonth(), date.getDate())
  const dates = getYearDates(year)
  const season = getLiturgicalSeason(date)
  const temporal = getTemporalDay(key, dates)
  const celebration = getCelebrations(year).get(key)
  const isSunday = weekdayOf(key) === 0

  const fromTemporal = (): LiturgicalDay => ({
    title: temporal.title,
    rank: temporal.rank,
    color: temporal.color,
    season,
    holyDayOfObligation: isSunday || Boolean(temporal.obligation),
  })
  const fromCelebration = (chosen: Celebration): LiturgicalDay => ({
    title: chosen.title,
    rank: chosen.rank,
    color: chosen.color,
    season,
    holyDayOfObligation: isSunday || Boolean(chosen.obligation),
  })

  if (!celebration || temporal.rank === 'solemnity') return fromTemporal()
  // Transfers already moved solemnities off privileged days
  if (celebration.rank === 'solemnity' || celebration.rank === 'commemoration') return fromCelebration(celebration)
  // Feasts: omitted on privileged days; on other Sundays only feasts of the Lord replace the Sunday
  if (isPrivileged(key, dates)) return fromTemporal()
  if (isSunday && !celebration.lordFeast) return fromTemporal()
  return fromCelebration(celebration)
}

export interface UpcomingCelebration {
  date: Date
  day: LiturgicalDay
}

/** The next solemnity or feast after the given date (within the coming ~two months). */
export function getNextCelebration(from = new Date(), maxDays = 60): UpcomingCelebration | null {
  for (let offset = 1; offset <= maxDays; offset++) {
    const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() + offset)
    const day = getLiturgicalDay(date)
    if (day.rank === 'solemnity' || day.rank === 'feast') return { date, day }
  }
  return null
}
