/**
 * Lower-cases and strips Polish diacritics so that e.g. "zdrowas" matches "Zdrowaś".
 * "ł" has no decomposed form, so it is mapped by hand. The result keeps the
 * input's length for precomposed text, which highlightQuery relies on.
 */
export const normalizeSearchText = (value: string) => value
  .toLocaleLowerCase('pl-PL')
  .normalize('NFD')
  .replace(/\p{M}/gu, '')
  .replace(/ł/g, 'l')
