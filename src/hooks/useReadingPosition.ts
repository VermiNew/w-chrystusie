import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_PREFIX = 'reading-position:'
const MIN_RESTORABLE_SCROLL = 120

export function useReadingPosition(contentKey: string) {
  const storageKey = `${STORAGE_PREFIX}${contentKey}`
  const frameRef = useRef<number | null>(null)
  const [wasRestored, setWasRestored] = useState(false)

  useEffect(() => {
    const savedPosition = Number.parseInt(localStorage.getItem(storageKey) ?? '', 10)
    let innerFrame: number | null = null

    const outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => {
        if (Number.isFinite(savedPosition) && savedPosition >= MIN_RESTORABLE_SCROLL) {
          window.scrollTo(0, savedPosition)
          setWasRestored(true)
        }
      })
    })

    return () => {
      cancelAnimationFrame(outerFrame)
      if (innerFrame !== null) cancelAnimationFrame(innerFrame)
    }
  }, [storageKey])

  useEffect(() => {
    const savePosition = () => {
      frameRef.current = null
      if (window.scrollY >= MIN_RESTORABLE_SCROLL) {
        localStorage.setItem(storageKey, String(Math.round(window.scrollY)))
      } else {
        localStorage.removeItem(storageKey)
      }
    }

    const handleScroll = () => {
      if (frameRef.current === null) frameRef.current = requestAnimationFrame(savePosition)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
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
