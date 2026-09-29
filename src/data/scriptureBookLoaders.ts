import type { ScriptureBook } from './genesis'

// Every book is a separate chunk, so opening one chapter downloads only that book.
// The service worker still precaches all chunks, so the whole Bible stays available offline.
const loaders: Record<string, () => Promise<ScriptureBook>> = {
  rodzaju: () => import('./genesis').then((module) => module.genesis),
  wyjscia: () => import('./exodus').then((module) => module.exodus),
  liczb: () => import('./numbers').then((module) => module.numbers),
  'powtorzonego-prawa': () => import('./deuteronomyVerified').then((module) => module.deuteronomyVerified),
  sedziow: () => import('./judges').then((module) => module.judges),
  '1-krolewska': () => import('./firstKings').then((module) => module.firstKings),
  '1-kronik': () => import('./firstChronicles').then((module) => module.firstChronicles),
  ezdrasza: () => import('./ezra').then((module) => module.ezra),
  izajasza: () => import('./isaiah').then((module) => module.isaiah),
  lamentacje: () => import('./lamentations').then((module) => module.lamentations),
  'do-galatow': () => import('./galatians').then((module) => module.galatians),
  'do-efezjan': () => import('./ephesians').then((module) => module.ephesians),
  'do-rzymian': () => import('./romans').then((module) => module.romans),
  'do-tytusa': () => import('./titus').then((module) => module.titus),
  '2-do-tesaloniczan': () => import('./secondThessalonians').then((module) => module.secondThessalonians),
  '1-do-tesaloniczan': () => import('./firstThessalonians').then((module) => module.firstThessalonians),
  '2-do-tymoteusza': () => import('./secondTimothy').then((module) => module.secondTimothy),
  '2-piotra': () => import('./secondPeter').then((module) => module.secondPeter),
  marka: () => import('./mark').then((module) => module.mark),
  mateusza: () => import('./matthew').then((module) => module.matthew),
  lukasza: () => import('./luke').then((module) => module.luke),
  jana: () => import('./john').then((module) => module.john),
  jakuba: () => import('./james').then((module) => module.james),
  '1-piotra': () => import('./firstPeter').then((module) => module.firstPeter),
  '1-jana': () => import('./firstJohn').then((module) => module.firstJohn),
  '2-jana': () => import('./secondJohn').then((module) => module.secondJohn),
  '3-jana': () => import('./thirdJohn').then((module) => module.thirdJohn),
  judy: () => import('./jude').then((module) => module.jude),
  'do-filemona': () => import('./philemon').then((module) => module.philemon),
  apokalipsa: () => import('./revelation').then((module) => module.revelation),
  'do-filipian': () => import('./philippians').then((module) => module.philippians),
  '2-do-koryntian': () => import('./secondCorinthians').then((module) => module.secondCorinthians),
  '1-do-koryntian': () => import('./firstCorinthians').then((module) => module.firstCorinthians),
  '1-do-tymoteusza': () => import('./firstTimothy').then((module) => module.firstTimothy),
  'do-hebrajczykow': () => import('./hebrews').then((module) => module.hebrews),
  'dzieje-apostolskie': () => import('./acts').then((module) => module.acts),
  'do-kolosan': () => import('./colossians').then((module) => module.colossians),
  kaplanska: () => import('./leviticus').then((module) => module.leviticus),
  jozuego: () => import('./joshua').then((module) => module.joshua),
  rut: () => import('./ruth').then((module) => module.ruth),
  '2-krolewska': () => import('./secondKings').then((module) => module.secondKings),
  '1-samuela': () => import('./firstSamuel').then((module) => module.firstSamuel),
  '2-samuela': () => import('./secondSamuel').then((module) => module.secondSamuel),
  '2-kronik': () => import('./secondChronicles').then((module) => module.secondChronicles),
  nehemiasza: () => import('./nehemiah').then((module) => module.nehemiah),
  hioba: () => import('./job').then((module) => module.job),
  przyslow: () => import('./proverbs').then((module) => module.proverbs),
  koheleta: () => import('./ecclesiastes').then((module) => module.ecclesiastes),
  'piesn-nad-piesniami': () => import('./songOfSongs').then((module) => module.songOfSongs),
  jeremiasza: () => import('./jeremiah').then((module) => module.jeremiah),
  abdiasza: () => import('./obadiah').then((module) => module.obadiah),
  aggeusza: () => import('./haggai').then((module) => module.haggai),
  nahuma: () => import('./nahum').then((module) => module.nahum),
  habakuka: () => import('./habakkuk').then((module) => module.habakkuk),
  sofoniasza: () => import('./zephaniah').then((module) => module.zephaniah),
  malachiasza: () => import('./malachi').then((module) => module.malachi),
  jonasza: () => import('./jonah').then((module) => module.jonah),
  micheasza: () => import('./micah').then((module) => module.micah),
  amosa: () => import('./amos').then((module) => module.amos),
  ozeasza: () => import('./hosea').then((module) => module.hosea),
  zachariasza: () => import('./zechariah').then((module) => module.zechariah),
  ezechiela: () => import('./ezekiel').then((module) => module.ezekiel),
  joela: () => import('./joel').then((module) => module.joel),
}

const cache = new Map<string, Promise<ScriptureBook>>()

export const scriptureBookSlugs = Object.keys(loaders)

// Object.hasOwn keeps inherited keys such as "constructor" from counting as books.
export function hasScriptureBook(slug: string): boolean {
  return Object.hasOwn(loaders, slug)
}

// Returns the same promise for repeated calls, as React's use() requires.
export function loadScriptureBook(slug: string): Promise<ScriptureBook> {
  let promise = cache.get(slug)
  if (!promise) {
    promise = loaders[slug]()
    // A failed chunk load (e.g. offline before precaching finished) can be retried later.
    promise.catch(() => cache.delete(slug))
    cache.set(slug, promise)
  }
  return promise
}
