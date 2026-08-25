import genesisData from './generated/genesis-wujek.json'

export interface ScriptureVerse {
  number: number
  text: string
}

export interface ScriptureChapter {
  number: number
  sourceUrl: string
  verses: ScriptureVerse[]
}

export interface ScriptureBook {
  id: string
  name: string
  translation: string
  sourceName: string
  sourceBookUrl: string
  sourceRights: string
  chapters: ScriptureChapter[]
}

export const genesis = genesisData as ScriptureBook
