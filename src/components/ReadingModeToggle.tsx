import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { FaArrowRotateLeft, FaCompress, FaExpand, FaPause, FaPlay, FaRegStar, FaShareNodes, FaStar, FaTextHeight } from 'react-icons/fa6'
import { useScreenWakeLock } from '../hooks/useScreenWakeLock'
import { useReadingPosition } from '../hooks/useReadingPosition'

const AUTO_SCROLL_STEPS = [
  { intervalMs: 4200, distance: 120 },
  { intervalMs: 3200, distance: 160 },
  { intervalMs: 2400, distance: 210 },
]

const FONT_SIZE_KEY = 'content-font-size'
const DEFAULT_FONT_SIZE = 100

const readFontSize = () => {
  const stored = Number.parseInt(localStorage.getItem(FONT_SIZE_KEY) ?? '', 10)
  return Number.isFinite(stored) && stored >= 90 && stored <= 140 ? stored : DEFAULT_FONT_SIZE
}

interface Props {
  contentKey: string
  contentTitle: string
  isFavorite: boolean
  onToggleFavorite: () => void
}

export default function ReadingModeToggle({ contentKey, contentTitle, isFavorite, onToggleFavorite }: Props) {
  const [isActive, setIsActive] = useState(false)
  const [autoScrollActive, setAutoScrollActive] = useState(false)
  const [speedIndex, setSpeedIndex] = useState(1)
  const [fontSize, setFontSize] = useState(readFontSize)
  const [fontControlsOpen, setFontControlsOpen] = useState(false)
  const [shareStatus, setShareStatus] = useState('')
  const animationFrameRef = useRef<number | null>(null)
  const stepStartedAtRef = useRef<number | null>(null)
  const pendingReadingProgressRef = useRef<number | null>(null)
  const fontControlsRef = useRef<HTMLDivElement>(null)
  const { wasRestored, restart } = useReadingPosition(contentKey)
  useScreenWakeLock(isActive)

  useEffect(() => {
    const scale = fontSize / 100
    localStorage.setItem(FONT_SIZE_KEY, String(fontSize))
    document.documentElement.style.setProperty('--content-reading-font-size', `${1.1 * scale}rem`)
    document.documentElement.style.setProperty('--content-focus-font-size', `${1.8 * scale}rem`)

    return () => {
      document.documentElement.style.removeProperty('--content-reading-font-size')
      document.documentElement.style.removeProperty('--content-focus-font-size')
    }
  }, [fontSize])

  useEffect(() => {
    if (!shareStatus) return
    const timer = window.setTimeout(() => setShareStatus(''), 2500)
    return () => window.clearTimeout(timer)
  }, [shareStatus])

  useEffect(() => {
    if (!fontControlsOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!fontControlsRef.current?.contains(event.target as Node)) setFontControlsOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFontControlsOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [fontControlsOpen])

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

  useEffect(() => {
    const readingProgress = pendingReadingProgressRef.current
    if (readingProgress === null) return

    let innerFrame: number | null = null
    const outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => {
        const scrollRoot = document.scrollingElement ?? document.documentElement
        const maxScroll = Math.max(0, scrollRoot.scrollHeight - window.innerHeight)
        window.scrollTo(0, readingProgress * maxScroll)
        pendingReadingProgressRef.current = null
      })
    })

    return () => {
      cancelAnimationFrame(outerFrame)
      if (innerFrame !== null) cancelAnimationFrame(innerFrame)
    }
  }, [isActive])

  const toggleReadingMode = () => {
    const scrollRoot = document.scrollingElement ?? document.documentElement
    const maxScroll = Math.max(1, scrollRoot.scrollHeight - window.innerHeight)
    pendingReadingProgressRef.current = scrollRoot.scrollTop / maxScroll

    if (isActive) setAutoScrollActive(false)
    setFontControlsOpen(false)
    setIsActive(!isActive)
  }

  const shareContent = async () => {
    const shareData = { title: contentTitle, url: window.location.href }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        return
      }

      await navigator.clipboard.writeText(shareData.url)
      setShareStatus('Skopiowano')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setShareStatus('Błąd')
    }
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

      <button
        className="content-reading-toggle content-reading-toggle--secondary content-reading-toggle--share"
        type="button"
        title="Udostępnij bezpośredni link"
        onClick={() => void shareContent()}
      >
        <FaShareNodes aria-hidden="true" />
        <span>{shareStatus || 'Udostępnij'}</span>
      </button>

      <div ref={fontControlsRef} className="content-font-size-menu content-reading-secondary">
        <button
          className="content-reading-toggle content-font-size-trigger"
          type="button"
          aria-expanded={fontControlsOpen}
          aria-controls="content-font-size-panel"
          title="Ustaw wielkość tekstu"
          onClick={() => setFontControlsOpen((open) => !open)}
        >
          <FaTextHeight aria-hidden="true" />
          <span>Tekst</span>
          <small>{fontSize}%</small>
        </button>
        {fontControlsOpen && (
          <div id="content-font-size-panel" className="content-font-size-popover">
            <label className="content-font-size-control">
              <span className="sr-only">Wielkość tekstu</span>
              <input
                type="range"
                min="90"
                max="140"
                step="10"
                value={fontSize}
                style={{ '--range-progress': `${((fontSize - 90) / 50) * 100}%` } as CSSProperties}
                aria-label="Wielkość tekstu"
                onChange={(event) => setFontSize(Number(event.target.value))}
              />
              <output>{fontSize}%</output>
            </label>
            <button
              className="content-font-size-reset"
              type="button"
              title="Przywróć wielkość tekstu do 100%"
              aria-label="Przywróć wielkość tekstu do 100%"
              disabled={fontSize === DEFAULT_FONT_SIZE}
              onClick={() => setFontSize(DEFAULT_FONT_SIZE)}
            >
              <FaArrowRotateLeft aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <button
        className="content-reading-toggle content-reading-toggle--secondary"
        type="button"
        aria-pressed={isFavorite}
        title={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
        onClick={onToggleFavorite}
      >
        {isFavorite ? <FaStar aria-hidden="true" /> : <FaRegStar aria-hidden="true" />}
        <span>{isFavorite ? 'W ulubionych' : 'Do ulubionych'}</span>
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
