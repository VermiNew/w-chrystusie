import countsData from './generated/content-counts.json'

/**
 * Numbers of prayers and songs, for places that need nothing else (the About
 * dialog, which is part of the entry bundle). Generated with the content catalog.
 */
export const contentCounts = countsData as { prayers: number; songs: number }
