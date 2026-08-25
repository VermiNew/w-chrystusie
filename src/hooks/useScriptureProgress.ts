import { useEffect } from 'react'

const PROGRESS_KEY = 'scripture-progress'

type ProgressMap = Record<string, number>

function loadProgress(): ProgressMap {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}') as ProgressMap
  } catch {
    return {}
  }
}

function saveProgress(key: string, percent: number) {
  const progress = loadProgress()
  progress[key] = Math.max(progress[key] ?? 0, Math.round(percent))
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
}

export function getChapterProgress(bookId: string, chapter: number) {
  return loadProgress()[`${bookId}:${chapter}`] ?? 0
}

export function getBookProgress(bookId: string, chapterCount: number) {
  const total = Array.from({ length: chapterCount }, (_, index) => getChapterProgress(bookId, index + 1))
    .reduce((sum, progress) => sum + progress, 0)
  return Math.round(total / chapterCount)
}

export function useScriptureProgress(bookId: string, chapter: number) {
  useEffect(() => {
    const updateProgress = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
      const percent = scrollableHeight <= 0 ? 100 : Math.min(100, (window.scrollY / scrollableHeight) * 100)
      saveProgress(`${bookId}:${chapter}`, percent)
    }

    window.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress()
    return () => window.removeEventListener('scroll', updateProgress)
  }, [bookId, chapter])
}
