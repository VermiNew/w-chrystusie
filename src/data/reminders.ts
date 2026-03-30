export interface Reminder {
  id: string
  /** Display name (Polish) */
  label: string
  /** Short description shown in the settings panel */
  description: string
  /** Times (HH:MM, 24-hour) at which the reminder fires */
  times: string[]
  /** Path to the prayer page used in the notification action */
  href?: string
}

export const REMINDERS: Reminder[] = [
  {
    id: 'aniol-panski',
    label: 'Anioł Pański',
    description: 'Modlitwa maryjna odmawiana trzy razy dziennie.',
    times: ['06:00', '12:00', '18:00'],
    href: '/modlitwy/aniol-panski',
  },
  {
    id: 'koronka',
    label: 'Koronka do Bożego Miłosierdzia',
    description: 'Modlitwa o godzinie miłosierdzia – godz. 15:00.',
    times: ['15:00'],
    href: '/modlitwy/koronka-do-bozego-milosierdzia',
  },
  {
    id: 'jutrznia',
    label: 'Jutrznia',
    description: 'Poranna modlitwa z Liturgii Godzin.',
    times: ['07:00'],
    href: '/modlitwy',
  },
  {
    id: 'nieszpory',
    label: 'Nieszpory',
    description: 'Wieczorna modlitwa z Liturgii Godzin.',
    times: ['19:00'],
    href: '/modlitwy',
  },
  {
    id: 'rozaniec',
    label: 'Różaniec',
    description: 'Codzienna modlitwa różańcowa.',
    times: ['20:00'],
    href: '/rozaniec',
  },
]
