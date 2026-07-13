import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_PREFIX = 'reading-position:'
const MIN_RESTORABLE_SCROLL = 40

export function useReadingPosition(contentKey: string) {
  const storageKey = `${STORAGE_PREFIX}${contentKey}`
  const frameRef = useRef<number | null>(null)
  const [wasRestored, setWasRestored] = useState(false)

  useEffect(() => {
    const savedPosition = Number.parseInt(localStorage.getItem(storageKey) ?? '', 10)
    const shouldRestore = Number.isFinite(savedPosition) && savedPosition >= MIN_RESTORABLE_SCROLL
    let ready = false
    let innerFrame: number | null = null

    const savePosition = () => {
      frameRef.current = null
      if (!ready) return

      if (window.scrollY >= MIN_RESTORABLE_SCROLL) {
        localStorage.setItem(storageKey, String(Math.round(window.scrollY)))
      } else {
        localStorage.removeItem(storageKey)
      }
    }

    const handleScroll = () => {
      if (!ready || frameRef.current !== null) return
      frameRef.current = requestAnimationFrame(savePosition)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    const outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => {
        window.scrollTo(0, shouldRestore ? savedPosition : 0)
        ready = true
        setWasRestored(shouldRestore)
      })
    })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(outerFrame)
      if (innerFrame !== null) cancelAnimationFrame(innerFrame)
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      savePosition()
    }
  }, [storageKey])

  const restart = useCallback(() => {
    localStorage.removeItem(storageKey)
    setWasRestored(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [storageKey])

  return { wasRestored, restart }
}
