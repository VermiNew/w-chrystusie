import { DAY_MS, dateKey, firstSundayOnOrAfter, getEasterKey, getLiturgicalSeason } from './liturgicalSeason'

/*
 * Liturgy of the Hours (four-week psalter) built from public-domain texts.
 *
 * The distribution of psalms and canticles follows the Roman four-week psalter
 * (references below use the Hebrew numbering, as in Polish breviaries).
 * The texts themselves come from the Wujek Bible already in the app, which uses
 * the Vulgate numbering, so every reference is converted before loading.
 *
 * The official Polish texts of the breviary (hymns, antiphons, readings,
 * intercessions and collects) are copyrighted and are not included; the page
 * links to brewiarz.pl for them.
 */

import type { HourId } from './breviaryHours'

export { getHourForTime, hourNames, type HourId } from './breviaryHours'
export type PsalterWeek = 1 | 2 | 3 | 4
/** 0 = Sunday … 6 = Saturday, as in Date#getDay. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

/** A continuous run of verses in one chapter of a book in the app. */
export interface VerseSegment {
  chapter: number
  from: number
  to: number
}

export interface Passage {
  kind: 'psalm' | 'canticle' | 'reading'
  /** Reference shown to the user, e.g. "Ps 63 (62), 2-9" or "Łk 1,68-79". */
  label: string
  /** Optional heading, e.g. "Pieśń Zachariasza". */
  title?: string
  /** Slug used by loadScriptureBook, or 'psalmy' for the Psalms. Null when the book is not in the app. */
  book: string | null
  segments: VerseSegment[]
  /** "Chwała Ojcu…" after psalms and canticles (not after readings or Dn 3,57-88). */
  doxology: boolean
}

// ---- Psalm references (Hebrew numbering → Wujek/Vulgate) ----

/** Converts one Hebrew psalm verse to the Vulgate psalm and verse number. */
function toVulgate(psalm: number, verse: number): { psalm: number; verse: number } {
  if (psalm <= 8 || psalm >= 148 || psalm === 9) return { psalm, verse }
  if (psalm === 10) return { psalm: 9, verse: verse + 21 }
  if (psalm <= 113) return { psalm: psalm - 1, verse }
  if (psalm === 114) return { psalm: 113, verse }
  if (psalm === 115) return { psalm: 113, verse: verse + 8 }
  if (psalm === 116) return verse <= 9 ? { psalm: 114, verse } : { psalm: 115, verse: verse - 9 }
  if (psalm <= 146) return { psalm: psalm - 1, verse }
  // psalm === 147
  return verse <= 11 ? { psalm: 146, verse } : { psalm: 147, verse: verse - 11 }
}

/** Vulgate number shown in brackets, e.g. "63 (62)". Split psalms show the part they come from. */
function vulgateLabel(psalm: number, verses?: string): string {
  if (psalm <= 8 || psalm >= 148) return `${psalm}`
  if (psalm === 9 || psalm === 10) return `${psalm} (9)`
  if (psalm === 114 || psalm === 115) return `${psalm} (113)`
  if (psalm === 116) {
    const first = verses ? Number.parseInt(verses, 10) : 1
    return `${psalm} (${first >= 10 ? 115 : 114})`
  }
  if (psalm === 147) {
    const first = verses ? Number.parseInt(verses, 10) : 1
    return `${psalm} (${first >= 12 ? 147 : 146})`
  }
  return `${psalm} (${psalm - 1})`
}

// Last Hebrew verse of the psalms whose whole text has to be split or shifted.
const hebrewPsalmLength: Record<number, number> = { 10: 18, 114: 8, 115: 18, 116: 19, 147: 20 }
/** Larger than any verse number: clamped to the real end of the chapter when loading. */
const END = 999

function parseRanges(verses: string): [number, number][] {
  return verses.split('.').map((part) => {
    const [from, to] = part.split('-').map((value) => Number.parseInt(value, 10))
    return [from, to ?? from]
  })
}

/** Turns Hebrew verse ranges into Vulgate segments, splitting where a Hebrew psalm spans two. */
function psalmSegments(psalm: number, verses?: string): VerseSegment[] {
  const ranges = verses ? parseRanges(verses) : [[1, hebrewPsalmLength[psalm] ?? END] as [number, number]]
  const segments: VerseSegment[] = []
  for (const [from, to] of ranges) {
    if (to === END) {
      const start = toVulgate(psalm, from)
      segments.push({ chapter: start.psalm, from: start.verse, to: END })
      continue
    }
    for (let verse = from; verse <= to; verse += 1) {
      const target = toVulgate(psalm, verse)
      const last = segments.at(-1)
      if (last && last.chapter === target.psalm && last.to === target.verse - 1) {
        last.to = target.verse
      } else {
        segments.push({ chapter: target.psalm, from: target.verse, to: target.verse })
      }
    }
  }
  return segments
}

const psalm119Parts = [
  'Alef', 'Bet', 'Gimel', 'Dalet', 'He', 'Waw', 'Zain', 'Chet', 'Tet', 'Jod', 'Kaf',
  'Lamed', 'Mem', 'Nun', 'Samek', 'Ain', 'Pe', 'Sade', 'Kof', 'Resz', 'Szin', 'Taw',
]
const romanParts = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII']

/** Psalm in Hebrew numbering; `verses` like "2-10.12-13" (Polish notation). */
function P(psalm: number, verses?: string): Passage {
  let title: string | undefined
  if (psalm === 119 && verses) {
    const part = Math.floor((Number.parseInt(verses, 10) - 1) / 8)
    title = `${romanParts[part]} (${psalm119Parts[part]})`
  }
  return {
    kind: 'psalm',
    label: `Ps ${vulgateLabel(psalm, verses)}${verses ? `, ${verses}` : ''}`,
    title,
    book: 'psalmy',
    segments: psalmSegments(psalm, verses),
    doxology: true,
  }
}

// ---- Canticles and short readings ----

const bookAbbreviations: Record<string, { abbreviation: string; slug: string | null }> = {
  wj: { abbreviation: 'Wj', slug: 'wyjscia' },
  pwt: { abbreviation: 'Pwt', slug: 'powtorzonego-prawa' },
  '1sm': { abbreviation: '1 Sm', slug: '1-samuela' },
  '1krn': { abbreviation: '1 Krn', slug: '1-kronik' },
  tb: { abbreviation: 'Tb', slug: 'tobiasza' },
  jdt: { abbreviation: 'Jdt', slug: 'judyty' },
  mdr: { abbreviation: 'Mdr', slug: null },
  syr: { abbreviation: 'Syr', slug: null },
  iz: { abbreviation: 'Iz', slug: 'izajasza' },
  jr: { abbreviation: 'Jr', slug: 'jeremiasza' },
  ez: { abbreviation: 'Ez', slug: 'ezechiela' },
  dn: { abbreviation: 'Dn', slug: null },
  ha: { abbreviation: 'Ha', slug: 'habakuka' },
  lk: { abbreviation: 'Łk', slug: 'lukasza' },
  ef: { abbreviation: 'Ef', slug: 'do-efezjan' },
  flp: { abbreviation: 'Flp', slug: 'do-filipian' },
  kol: { abbreviation: 'Kol', slug: 'do-kolosan' },
  '1tes': { abbreviation: '1 Tes', slug: '1-do-tesaloniczan' },
  '1p': { abbreviation: '1 P', slug: '1-piotra' },
  ap: { abbreviation: 'Ap', slug: 'apokalipsa' },
}

/**
 * A canticle or reading. `reference` uses Polish notation, chapters separated by ";":
 * "15,1-4.8-13" or "4,11;5,9-10.12". Verse numbers are those of the Wujek text.
 */
function passage(kind: 'canticle' | 'reading', book: keyof typeof bookAbbreviations, reference: string, title?: string): Passage {
  const { abbreviation, slug } = bookAbbreviations[book]
  const segments = reference.split(';').flatMap((chapterPart) => {
    const [chapter, verses] = chapterPart.split(',')
    return parseRanges(verses).map(([from, to]) => ({ chapter: Number(chapter), from, to }))
  })
  return {
    kind,
    label: `${abbreviation} ${reference.replaceAll(';', '; ')}`,
    title,
    book: slug,
    segments,
    // The Song of the three young men ends with its own doxology.
    doxology: kind === 'canticle' && !(book === 'dn' && reference.startsWith('3,57')),
  }
}

const C = (book: keyof typeof bookAbbreviations, reference: string, title?: string) => passage('canticle', book, reference, title)
const R = (book: keyof typeof bookAbbreviations, reference: string) => passage('reading', book, reference)

// Recurring canticles
const philippians = C('flp', '2,6-11', 'Chrystus, Sługa Boży')
const ephesians = C('ef', '1,3-10', 'Bóg Zbawiciel')
const colossians = C('kol', '1,12-20', 'Chrystus Pierworodny')
const revelation4 = C('ap', '4,11;5,9-10.12', 'Hymn odkupionych')
const revelation11 = C('ap', '11,17-18;12,10-12', 'Sąd Boży')
const revelation15 = C('ap', '15,3-4', 'Hymn uwielbienia')
const revelation19 = C('ap', '19,1-7', 'Gody Baranka')
const firstPeter = C('1p', '2,21-24', 'Dobrowolna męka Chrystusa')
const danielBlessing = C('dn', '3,57-88.56', 'Niech całe stworzenie chwali Pana')
const danielPraise = C('dn', '3,52-57', 'Niech całe stworzenie chwali Pana')

export const gospelCanticles = {
  benedictus: C('lk', '1,68-79', 'Pieśń Zachariasza'),
  magnificat: C('lk', '1,46-55', 'Pieśń Maryi'),
  nuncDimittis: C('lk', '2,29-32', 'Pieśń Symeona'),
}

export const invitatoryPsalm = P(95)

// ---- The four-week psalter ----

/** Psalmody of one day; Sunday also has First Vespers (sung on Saturday evening). */
interface PsalterDay {
  readings: Passage[]
  lauds: Passage[]
  daytime: Passage[]
  vespers: Passage[]
}

interface PsalterWeekData {
  firstVespers: Passage[]
  days: [PsalterDay, PsalterDay, PsalterDay, PsalterDay, PsalterDay, PsalterDay, PsalterDay]
}

const sundayDaytimeOdd = [P(118, '1-9'), P(118, '10-18'), P(118, '19-29')]
const sundayDaytimeEven = [P(23), P(76, '2-7'), P(76, '8-13')]

// Wujek's Tobit and Judith follow the Vulgate, whose verse numbers differ from the
// Nova Vulgata used by the breviary; the ranges below are the matching Vulgate verses.
const psalter: Record<PsalterWeek, PsalterWeekData> = {
  1: {
    firstVespers: [P(141, '1-9'), P(142), philippians],
    days: [
      {
        readings: [P(1), P(2), P(3)],
        lauds: [P(63, '2-9'), danielBlessing, P(149)],
        daytime: sundayDaytimeOdd,
        vespers: [P(110, '1-5.7'), P(114), revelation19],
      },
      {
        readings: [P(6), P(9, '2-11'), P(9, '12-21')],
        lauds: [P(5, '2-10.12-13'), C('1krn', '29,10-13', 'Chwała należy tylko Bogu'), P(29)],
        daytime: [P(19, '8-15'), P(7, '2-10'), P(7, '11-18')],
        vespers: [P(11), P(15), ephesians],
      },
      {
        readings: [P(10, '1-11'), P(10, '12-18'), P(12)],
        lauds: [P(24), C('tb', '13,1-9', 'Bóg karze i ratuje'), P(33)],
        daytime: [P(119, '1-8'), P(13), P(14)],
        vespers: [P(20), P(21, '2-8.14'), revelation4],
      },
      {
        readings: [P(18, '2-7'), P(18, '8-20'), P(18, '21-30')],
        lauds: [P(36), C('jdt', '16,2-3.15-17', 'Bóg Stwórca ocala swój lud'), P(47)],
        daytime: [P(119, '9-16'), P(17, '1-8'), P(17, '9-15')],
        vespers: [P(27, '1-6'), P(27, '7-14'), colossians],
      },
      {
        readings: [P(18, '31-35'), P(18, '36-46'), P(18, '47-51')],
        lauds: [P(57), C('jr', '31,10-14', 'Szczęście ludu odkupionego'), P(48)],
        daytime: [P(119, '17-24'), P(25, '1-11'), P(25, '12-22')],
        vespers: [P(30), P(32), revelation11],
      },
      {
        readings: [P(35, '1-2.3.9-12'), P(35, '13-16'), P(35, '17-19.22-23.27-28')],
        lauds: [P(51), C('iz', '45,15-25', 'Wszystkie narody nawrócą się do Pana'), P(100)],
        daytime: [P(119, '25-32'), P(26), P(28, '1-3.6-9')],
        vespers: [P(41), P(46), revelation15],
      },
      {
        readings: [P(105, '1-15'), P(105, '16-22'), P(105, '23-45')],
        lauds: [P(119, '145-152'), C('wj', '15,1-4.8-13.17-18', 'Pieśń zwycięstwa po przejściu przez Morze Czerwone'), P(117)],
        daytime: [P(119, '33-40'), P(34, '2-11'), P(34, '12-23')],
        vespers: [],
      },
    ],
  },
  2: {
    firstVespers: [P(119, '105-112'), P(16), philippians],
    days: [
      {
        readings: [P(104, '1-12'), P(104, '13-23'), P(104, '24-35')],
        lauds: [P(118), danielPraise, P(150)],
        daytime: sundayDaytimeEven,
        vespers: [P(110, '1-5.7'), P(115), revelation19],
      },
      {
        readings: [P(31, '2-9'), P(31, '10-17'), P(31, '20-25')],
        lauds: [P(42), C('syr', '36,1-5.10-13', 'Modlitwa za Święte Miasto'), P(19, '2-7')],
        daytime: [P(119, '41-48'), P(40, '2-9'), P(40, '10-14.17-18')],
        vespers: [P(45, '2-10'), P(45, '11-18'), ephesians],
      },
      {
        readings: [P(37, '1-11'), P(37, '12-29'), P(37, '30-40')],
        lauds: [P(43), C('iz', '38,10-14.17-20', 'Udręka i radość chorego, który wyzdrowiał'), P(65)],
        daytime: [P(119, '49-56'), P(53), P(54, '3-6.8-9')],
        vespers: [P(49, '2-13'), P(49, '14-21'), revelation4],
      },
      {
        readings: [P(39, '2-7'), P(39, '8-14'), P(52)],
        lauds: [P(77), C('1sm', '2,1-10', 'Radość pokornych w Bogu'), P(97)],
        daytime: [P(119, '57-64'), P(55, '2-12'), P(55, '13-15.17-24')],
        vespers: [P(62), P(67), colossians],
      },
      {
        readings: [P(44, '2-9'), P(44, '10-17'), P(44, '18-27')],
        lauds: [P(80), C('iz', '12,1-6', 'Dziękczynienie ludu odkupionego'), P(81)],
        daytime: [P(119, '65-72'), P(56, '2-7.9-14'), P(57)],
        vespers: [P(72, '2-11'), P(72, '12-19'), revelation11],
      },
      {
        readings: [P(38, '2-5'), P(38, '6-13'), P(38, '14-23')],
        lauds: [P(51), C('ha', '3,2-4.13.15-19', 'Bóg przychodzi na sąd'), P(147, '12-20')],
        daytime: [P(119, '73-80'), P(59, '2-5.10-11.17-18'), P(60)],
        vespers: [P(116, '1-9'), P(121), revelation15],
      },
      {
        readings: [P(106, '1-18'), P(106, '19-33'), P(106, '34-48')],
        lauds: [P(92), C('pwt', '32,1-12', 'Dobrodziejstwa Boga dla ludu'), P(8)],
        daytime: [P(119, '81-88'), P(61), P(64)],
        vespers: [],
      },
    ],
  },
  3: {
    firstVespers: [P(113), P(116, '10-19'), philippians],
    days: [
      {
        readings: [P(145, '1-9'), P(145, '10-13'), P(145, '14-21')],
        lauds: [P(93), danielBlessing, P(148)],
        daytime: sundayDaytimeOdd,
        vespers: [P(110, '1-5.7'), P(111), revelation19],
      },
      {
        readings: [P(50, '1-6'), P(50, '7-15'), P(50, '16-23')],
        lauds: [P(84), C('iz', '2,2-5', 'Góra domu Pańskiego'), P(96)],
        daytime: [P(119, '89-96'), P(71, '1-13'), P(71, '14-24')],
        vespers: [P(123), P(124), ephesians],
      },
      {
        readings: [P(68, '2-11'), P(68, '12-24'), P(68, '25-36')],
        lauds: [P(85), C('iz', '26,1-4.7-9.12', 'Hymn po zwycięstwie nad wrogiem'), P(67)],
        daytime: [P(119, '97-104'), P(74, '1-12'), P(74, '13-23')],
        vespers: [P(125), P(131), revelation4],
      },
      {
        readings: [P(89, '2-19'), P(89, '20-30'), P(89, '31-38')],
        lauds: [P(86), C('iz', '33,13-16', 'Sprawiedliwy sąd Boży'), P(98)],
        daytime: [P(119, '105-112'), P(70), P(75)],
        vespers: [P(126), P(127), colossians],
      },
      {
        readings: [P(89, '39-46'), P(89, '47-53'), P(90)],
        lauds: [P(87), C('iz', '40,10-17', 'Bóg — dobry Pasterz'), P(99)],
        daytime: [P(119, '113-120'), P(79, '1-5.8-11.13'), P(80)],
        vespers: [P(132, '1-10'), P(132, '11-18'), revelation11],
      },
      {
        readings: [P(69, '2-13'), P(69, '14-22'), P(69, '30-37')],
        lauds: [P(51), C('jr', '14,17-21', 'Lament ludu w czasie głodu i wojny'), P(100)],
        daytime: [P(22, '2-12'), P(22, '13-23'), P(22, '24-32')],
        vespers: [P(135, '1-12'), P(135, '13-21'), revelation15],
      },
      {
        readings: [P(107, '1-16'), P(107, '17-32'), P(107, '33-43')],
        lauds: [P(119, '145-152'), C('mdr', '9,1-6.9-11', 'Prośba o mądrość'), P(117)],
        daytime: [P(119, '121-128'), P(34, '2-11'), P(34, '12-23')],
        vespers: [],
      },
    ],
  },
  4: {
    firstVespers: [P(122), P(130), philippians],
    days: [
      {
        readings: [P(24), P(66, '2-12'), P(66, '13-20')],
        lauds: [P(118), danielPraise, P(150)],
        daytime: sundayDaytimeEven,
        vespers: [P(110, '1-5.7'), P(112), revelation19],
      },
      {
        readings: [P(73, '1-12'), P(73, '13-20'), P(73, '21-28')],
        lauds: [P(90), C('iz', '42,10-16', 'Nowa pieśń na cześć Boga zwycięzcy'), P(135, '1-12')],
        daytime: [P(119, '129-136'), P(82), P(120)],
        vespers: [P(136, '1-9'), P(136, '10-26'), ephesians],
      },
      {
        readings: [P(102, '2-12'), P(102, '13-23'), P(102, '24-29')],
        lauds: [P(101), C('dn', '3,26-27.29.34-41', 'Modlitwa Azariasza w piecu ognistym'), P(144, '1-10')],
        daytime: [P(119, '137-144'), P(88, '2-8'), P(88, '9-19')],
        vespers: [P(137, '1-6'), P(138), revelation4],
      },
      {
        readings: [P(103, '1-7'), P(103, '8-16'), P(103, '17-22')],
        lauds: [P(108), C('iz', '61,10-11;62,1-5', 'Radość proroka z nowego Jeruzalem'), P(146)],
        daytime: [P(119, '145-152'), P(94, '1-11'), P(94, '12-23')],
        vespers: [P(139, '1-12'), P(139, '13-18.23-24'), colossians],
      },
      {
        readings: [P(44, '2-9'), P(44, '10-17'), P(44, '18-27')],
        lauds: [P(143, '1-11'), C('iz', '66,10-14', 'Pocieszenie i radość Świętego Miasta'), P(147, '1-11')],
        daytime: [P(119, '153-160'), P(128), P(129)],
        vespers: [P(144, '1-8'), P(144, '9-15'), revelation11],
      },
      {
        readings: [P(78, '1-16'), P(78, '17-31'), P(78, '32-39')],
        lauds: [P(51), C('tb', '13,10-13.15-18', 'Szczęśliwa przyszłość Jeruzalem'), P(147, '12-20')],
        daytime: [P(119, '161-168'), P(133), P(140, '2-9.13-14')],
        vespers: [P(145, '1-13'), P(145, '14-21'), revelation15],
      },
      {
        readings: [P(78, '40-51'), P(78, '52-64'), P(78, '65-72')],
        lauds: [P(92), C('ez', '36,24-28', 'Bóg odnowi swój lud'), P(8)],
        daytime: [P(119, '169-176'), P(45, '2-10'), P(45, '11-18')],
        vespers: [],
      },
    ],
  },
}

// Compline follows a one-week cycle. Saturday is the compline after First Vespers of Sunday.
const compline: Record<Weekday, { psalms: Passage[]; reading: Passage }> = {
  0: { psalms: [P(91)], reading: R('ap', '22,4-5') },
  1: { psalms: [P(86)], reading: R('1tes', '5,9-10') },
  2: { psalms: [P(143, '1-11')], reading: R('1p', '5,8-9') },
  3: { psalms: [P(31, '2-6'), P(130)], reading: R('ef', '4,26-27') },
  4: { psalms: [P(16)], reading: R('1tes', '5,23') },
  5: { psalms: [P(88)], reading: R('jr', '14,9') },
  6: { psalms: [P(4), P(134)], reading: R('pwt', '6,4-7') },
}

// ---- Calendar: which psalter week is today ----

const toKey = (date: Date) => dateKey(date.getFullYear(), date.getMonth(), date.getDate())
const cycle = (week: number) => ((((week - 1) % 4) + 4) % 4 + 1) as PsalterWeek

/**
 * Psalter week for a date, following the General Instruction: the cycle restarts
 * with week I on the First Sunday of Advent, the Sunday after Christmas (Holy Family),
 * the Monday after the Baptism of the Lord, the First Sunday of Lent (Ash Wednesday
 * and the days after it take week IV) and Easter Sunday; after Pentecost it follows
 * the number of the week in Ordinary Time.
 */
export function getPsalterWeek(date = new Date()): PsalterWeek {
  const key = toKey(date)
  const year = date.getFullYear()
  const weeksSince = (start: number) => Math.floor((key - start) / (7 * DAY_MS)) + 1

  const advent = firstSundayOnOrAfter(dateKey(year, 10, 27))
  const christmas = dateKey(year, 11, 25)
  if (key >= advent && key < christmas) return cycle(weeksSince(advent))

  // Christmas time: from the Sunday after Christmas (or 30 December when Christmas is a Sunday).
  const christmasStart = (christmasKey: number) => {
    const sunday = firstSundayOnOrAfter(christmasKey + DAY_MS)
    return sunday > christmasKey + 6 * DAY_MS ? christmasKey + 5 * DAY_MS : sunday
  }
  if (key >= christmas) return cycle(Math.max(1, weeksSince(christmasStart(christmas))))

  const baptism = firstSundayOnOrAfter(dateKey(year, 0, 7))
  if (key <= baptism) return cycle(Math.max(1, weeksSince(christmasStart(dateKey(year - 1, 11, 25)))))

  const easter = getEasterKey(year)
  const ashWednesday = easter - 46 * DAY_MS
  const firstLentSunday = ashWednesday + 4 * DAY_MS
  const pentecost = easter + 49 * DAY_MS

  // Ordinary Time before Lent: week 1 begins on the Monday after the Baptism.
  if (key < ashWednesday) return cycle(Math.floor((key - baptism - DAY_MS) / (7 * DAY_MS)) + 1)
  if (key < firstLentSunday) return 4
  if (key < easter) return cycle(weeksSince(firstLentSunday))
  if (key <= pentecost) return cycle(weeksSince(easter))

  // Ordinary Time after Pentecost: counted back from Christ the King (34th week).
  const christTheKing = advent - 7 * DAY_MS
  const sundayOnOrBefore = key - new Date(key).getUTCDay() * DAY_MS
  const week = 34 - Math.round((christTheKing - sundayOnOrBefore) / (7 * DAY_MS))
  return cycle(week)
}

export interface HourPlan {
  id: HourId
  psalmody: Passage[]
  /** Gospel canticle (lauds, vespers, compline). */
  gospelCanticle?: Passage
  /** Short reading — only compline has a fixed one. */
  reading?: Passage
  /** For Saturday vespers: these are First Vespers of the next Sunday. */
  firstVespersOfWeek?: PsalterWeek
}

export interface DayContext {
  week: PsalterWeek
  /** Psalter week of the next day — Saturday evening already belongs to Sunday. */
  nextDayWeek: PsalterWeek
  weekday: Weekday
  isLent: boolean
  isEaster: boolean
}

export function getDayContext(date: Date): DayContext {
  const season = getLiturgicalSeason(date).id
  return {
    week: getPsalterWeek(date),
    nextDayWeek: getPsalterWeek(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 12)),
    weekday: date.getDay() as Weekday,
    isLent: season === 'lent' || season === 'triduum',
    isEaster: season === 'easter',
  }
}

export function getHourPlan(hour: HourId, { week, nextDayWeek, weekday, isLent }: DayContext): HourPlan {
  const day = psalter[week].days[weekday]
  switch (hour) {
    case 'invitatory':
      return { id: hour, psalmody: [invitatoryPsalm] }
    case 'readings':
      return { id: hour, psalmody: day.readings }
    case 'lauds':
      return { id: hour, psalmody: day.lauds, gospelCanticle: gospelCanticles.benedictus }
    case 'daytime':
      return { id: hour, psalmody: day.daytime }
    case 'vespers': {
      if (weekday === 6) {
        // First Vespers of Sunday: e.g. the Saturday before Advent leads into week I, not the next in the cycle.
        const nextWeek = nextDayWeek
        return {
          id: hour,
          psalmody: psalter[nextWeek].firstVespers,
          gospelCanticle: gospelCanticles.magnificat,
          firstVespersOfWeek: nextWeek,
        }
      }
      // On Sundays of Lent the canticle from 1 Peter replaces the Alleluia canticle.
      const psalmody = weekday === 0 && isLent
        ? day.vespers.map((entry) => (entry === revelation19 ? firstPeter : entry))
        : day.vespers
      return { id: hour, psalmody, gospelCanticle: gospelCanticles.magnificat }
    }
    case 'compline':
      return {
        id: hour,
        psalmody: compline[weekday].psalms,
        reading: compline[weekday].reading,
        gospelCanticle: gospelCanticles.nuncDimittis,
      }
  }
}

export const weekdayNames = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'] as const
export const weekRoman: Record<PsalterWeek, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' }

// ---- Fixed texts (traditional, public domain) ----

export const fixedTexts = {
  /** Ps 69(70),2 and Ps 50(51),17 in Wujek's wording. */
  opening: { versicle: 'Boże, wejrzyj ku wspomożeniu memu.', response: 'Panie, pośpiesz się ku ratunku memu.' },
  invitatory: { versicle: 'Panie, otworzysz wargi moje.', response: 'A usta moje opowiadać będą chwałę Twoję.' },
  gloria: 'Chwała Ojcu i Synowi, i Duchowi Świętemu. Jak była na początku, teraz i zawsze, i na wieki wieków. Amen.',
  ourFather:
    'Ojcze nasz, który jesteś w niebie, święć się imię Twoje, przyjdź królestwo Twoje, bądź wola Twoja jako w niebie, tak i na ziemi. '
    + 'Chleba naszego powszedniego daj nam dzisiaj; i odpuść nam nasze winy, jako i my odpuszczamy naszym winowajcom; '
    + 'i nie wódź nas na pokuszenie, ale nas zbaw ode złego. Amen.',
  blessing: 'Niech nas Pan błogosławi, od wszelkiego zła zachowa i doprowadzi do życia wiecznego. Amen.',
  dismissal: { versicle: 'Błogosławmy Panu.', response: 'Bogu niech będą dzięki.' },
  /** Ps 30(31),6 in Wujek's wording. */
  complineResponsory: 'W ręce Twoje polecam ducha mego: odkupiłeś nas, Panie, Boże prawdy.',
  complineBlessing: 'Noc spokojną i koniec szczęśliwy niech nam da Pan wszechmogący. Amen.',
  marianAntiphons: {
    subTuum:
      'Pod Twoją obronę uciekamy się, święta Boża Rodzicielko, naszymi prośbami racz nie gardzić w potrzebach naszych, '
      + 'ale od wszelakich złych przygód racz nas zawsze wybawiać, Panno chwalebna i błogosławiona. '
      + 'O Pani nasza, Orędowniczko nasza, Pośredniczko nasza, Pocieszycielko nasza. '
      + 'Z Synem swoim nas pojednaj, Synowi swojemu nas polecaj, swojemu Synowi nas oddawaj.',
    salveRegina:
      'Witaj, Królowo, Matko miłosierdzia, życie, słodyczy i nadziejo nasza, witaj! '
      + 'Do Ciebie wołamy wygnańcy, synowie Ewy; do Ciebie wzdychamy, jęcząc i płacząc na tym łez padole. '
      + 'Przeto, Orędowniczko nasza, one miłosierne oczy Twoje na nas zwróć, '
      + 'a Jezusa, błogosławiony owoc żywota Twojego, po tym wygnaniu nam okaż. '
      + 'O łaskawa, o litościwa, o słodka Panno Maryjo!',
    reginaCaeli:
      'Królowo nieba, wesel się, alleluja, bo Ten, któregoś nosić godna była, alleluja, '
      + 'zmartwychwstał, jak powiedział, alleluja. Módl się za nami do Boga, alleluja.',
  },
}
