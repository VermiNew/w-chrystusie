// Kept apart from breviary.ts so the home page can show the current hour
// without loading the psalter tables.

export type HourId = 'invitatory' | 'readings' | 'lauds' | 'daytime' | 'vespers' | 'compline'

export const hourNames: Record<HourId, string> = {
  invitatory: 'Wezwanie',
  readings: 'Godzina czytań',
  lauds: 'Jutrznia',
  daytime: 'Modlitwa w ciągu dnia',
  vespers: 'Nieszpory',
  compline: 'Kompleta',
}

/** The hour that fits the current time of day. */
export function getHourForTime(date = new Date()): HourId {
  const hour = date.getHours()
  if (hour < 4) return 'compline'
  if (hour < 10) return 'lauds'
  if (hour < 16) return 'daytime'
  if (hour < 21) return 'vespers'
  return 'compline'
}
