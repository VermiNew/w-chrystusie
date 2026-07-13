import { useEffect, useRef, useState } from 'react'
import { FaArrowRotateLeft, FaCompress, FaExpand, FaPause, FaPlay } from 'react-icons/fa6'
import { useScreenWakeLock } from '../hooks/useScreenWakeLock'
import { useReadingPosition } from '../hooks/useReadingPosition'

const AUTO_SCROLL_STEPS = [
  { intervalMs: 4200, distance: 120 },
  { intervalMs: 3200, distance: 160 },
  { intervalMs: 2400, distance: 210 },
]

interface Props {
  contentKey: string
}

export default function ReadingModeToggle({ contentKey }: Props) {
  const [isActive, setIsActive] = useState(false)
  const [autoScrollActive, setAutoScrollActive] = useState(false)
  const [speedIndex, setSpeedIndex] = useState(1)
  const animationFrameRef = useRef<number | null>(null)
  const stepStartedAtRef = useRef<number | null>(null)
  const { wasRestored, restart } = useReadingPosition(contentKey)
  useScreenWakeLock(isActive)

  useEffect(() => {
    if (!isActive) return

    // Root state lets reading mode adjust the shared layout without coupling Header to page state.
    document.documentElement.dataset.readingMode = 'true'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAutoScrollActive(false)
        setIsActive(false)
        return
      }

      if (event.key === ' ') {
        event.preventDefault()
        setAutoScrollActive((active) => !active)
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setSpeedIndex((index) => Math.min(index + 1, AUTO_SCROLL_STEPS.length - 1))
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setSpeedIndex((index) => Math.max(index - 1, 0))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      delete document.documentElement.dataset.readingMode
    }
  }, [isActive])

  useEffect(() => {
    if (!isActive || !autoScrollActive) {
      stepStartedAtRef.current = null
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      return
    }

    const scroll = (timestamp: number) => {
      const step = AUTO_SCROLL_STEPS[speedIndex]
      const startedAt = stepStartedAtRef.current ?? timestamp
      const elapsedMs = timestamp - startedAt
      const progress = Math.min(1, elapsedMs / step.intervalMs)
      stepStartedAtRef.current = startedAt

      const scrollRoot = document.scrollingElement ?? document.documentElement
      const maxScroll = scrollRoot.scrollHeight - window.innerHeight
      if (scrollRoot.scrollTop >= maxScroll - 1) {
        setAutoScrollActive(false)
        return
      }

      if (progress >= 1) {
        scrollRoot.scrollBy({ top: step.distance, behavior: 'smooth' })
        stepStartedAtRef.current = timestamp
      }

      animationFrameRef.current = requestAnimationFrame(scroll)
    }

    animationFrameRef.current = requestAnimationFrame(scroll)

    return () => {
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
      stepStartedAtRef.current = null
    }
  }, [autoScrollActive, isActive, speedIndex])

  const toggleReadingMode = () => {
    if (isActive) setAutoScrollActive(false)
    setIsActive(!isActive)
    window.scrollTo(0, 0)
  }

  return (
    <div className="content-reading-controls">
      <button
        className="content-reading-toggle"
        type="button"
        aria-pressed={isActive}
        title={isActive ? 'Wróć do zwykłego widoku' : 'Włącz tryb dużej czcionki'}
        onClick={toggleReadingMode}
      >
        {isActive ? <FaCompress aria-hidden="true" /> : <FaExpand aria-hidden="true" />}
        <span>{isActive ? 'Zakończ tryb' : 'Duża czcionka'}</span>
      </button>

      {isActive && (
        <button
          className="content-reading-toggle content-reading-toggle--auto"
          type="button"
          aria-pressed={autoScrollActive}
          title="Spacja pauzuje przewijanie, strzałki góra/dół zmieniają tempo"
          onClick={() => setAutoScrollActive((active) => !active)}
        >
          {autoScrollActive ? <FaPause aria-hidden="true" /> : <FaPlay aria-hidden="true" />}
          <span>{autoScrollActive ? 'Pauza' : 'Przewijaj'}</span>
          <small>{speedIndex + 1}x</small>
        </button>
      )}

      {wasRestored && !isActive && (
        <span className="content-reading-resume" role="status">
          Wrócono do miejsca czytania
          <button type="button" onClick={restart}>
            <FaArrowRotateLeft aria-hidden="true" /> Od początku
          </button>
        </span>
      )}
    </div>
  )
}
