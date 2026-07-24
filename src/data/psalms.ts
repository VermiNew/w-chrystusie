import psalmData from './generated/psalms-wujek.json'

export interface PsalmVerse {
  number: number
  text: string
}

export interface Psalm {
  number: number
  title: string
  summary: string
  verses: PsalmVerse[]
  translation: string
  sourceName: string
  sourceUrl: string
  rightsStatus: 'public-domain'
}

export const psalms: readonly Psalm[] = psalmData.map((psalm) => ({
  ...psalm,
  rightsStatus: 'public-domain',
}))
