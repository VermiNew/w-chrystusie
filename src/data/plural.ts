/**
 * Polish plural form for a count, e.g. pluralPl(3, 'wynik', 'wyniki', 'wyników') → 'wyniki'.
 * one: 1 · few: 2–4, 22–24, … (but not 12–14) · many: everything else.
 */
export function pluralPl(count: number, one: string, few: string, many: string): string {
  if (count === 1) return one
  const lastDigit = count % 10
  const lastTwoDigits = count % 100
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) return few
  return many
}
