export type LiturgicalSeasonId = 'advent' | 'christmas' | 'ordinary' | 'lent' | 'triduum' | 'easter'

export interface LiturgicalSeason {
  id: LiturgicalSeasonId
  name: string
  songCategory?: string
}

const DAY_MS = 86_400_000

const seasons: Record<LiturgicalSeasonId, LiturgicalSeason> = {
  advent: { id: 'advent', name: 'Adwent', songCategory: 'Pieśni adwentowe' },
  christmas: { id: 'christmas', name: 'Okres Narodzenia Pańskiego', songCategory: 'Kolędy' },
  ordinary: { id: 'ordinary', name: 'Okres zwykły' },
  lent: { id: 'lent', name: 'Wielki Post', songCategory: 'Pieśni wielkopostne' },
  triduum: { id: 'triduum', name: 'Triduum Paschalne', songCategory: 'Pieśni wielkopostne' },
  easter: { id: 'easter', name: 'Okres Wielkanocny', songCategory: 'Pieśni wielkanocne' },
}

const dateKey = (year: number, month: number, day: number) => Date.UTC(year, month, day)

const firstSundayOnOrAfter = (key: number) => {
  const weekday = new Date(key).getUTCDay()
  return key + ((7 - weekday) % 7) * DAY_MS
}

// Gregorian computus (Meeus/Jones/Butcher) gives Easter Sunday for any Gregorian year.
const getEasterKey = (year: number) => {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return dateKey(year, month - 1, day)
}

export function getLiturgicalSeason(date = new Date()): LiturgicalSeason {
  const year = date.getFullYear()
  const current = dateKey(year, date.getMonth(), date.getDate())
  const baptismOfTheLord = firstSundayOnOrAfter(dateKey(year, 0, 7))
  const easter = getEasterKey(year)
  const ashWednesday = easter - 46 * DAY_MS
  const holyThursday = easter - 3 * DAY_MS
  const pentecost = easter + 49 * DAY_MS
  const advent = firstSundayOnOrAfter(dateKey(year, 10, 27))
  const christmas = dateKey(year, 11, 25)

  if (current <= baptismOfTheLord) return seasons.christmas
  if (current >= christmas) return seasons.christmas
  if (current >= advent) return seasons.advent
  if (current >= easter && current <= pentecost) return seasons.easter
  if (current >= holyThursday && current < easter) return seasons.triduum
  if (current >= ashWednesday && current < holyThursday) return seasons.lent
  return seasons.ordinary
}
