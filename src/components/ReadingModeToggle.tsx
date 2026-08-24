import { useEffect, useRef, useState } from 'react'
import { FaArrowRotateLeft, FaCompress, FaExpand, FaPause, FaPlay, FaRegStar, FaShareNodes, FaStar, FaStop, FaVolumeHigh } from 'react-icons/fa6'
import { useScreenWakeLock } from '../hooks/useScreenWakeLock'
import { useReadingPosition } from '../hooks/useReadingPosition'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import ContentFontSizeControl from './ContentFontSizeControl'

const AUTO_SCROLL_STEPS = [
  { intervalMs: 4200, distance: 120 },
  { intervalMs: 3200, distance: 160 },
  { intervalMs: 2400, distance: 210 },
]

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
  const [shareStatus, setShareStatus] = useState('')
  const [resumeStatusHiddenFor, setResumeStatusHiddenFor] = useState('')
  const animationFrameRef = useRef<number | null>(null)
  const stepStartedAtRef = useRef<number | null>(null)
  const pendingReadingProgressRef = useRef<number | null>(null)
  const controlsRef = useRef<HTMLDivElement>(null)
  const { wasRestored, restart } = useReadingPosition(contentKey)
  const speech = useSpeechSynthesis()
  useScreenWakeLock(isActive || speech.status !== 'idle')

  useEffect(() => {
    if (!shareStatus) return
    const timer = window.setTimeout(() => setShareStatus(''), 2500)
    return () => window.clearTimeout(timer)
  }, [shareStatus])

  useEffect(() => {
    if (!wasRestored) return
    const timer = window.setTimeout(() => setResumeStatusHiddenFor(contentKey), 6000)
    return () => window.clearTimeout(timer)
  }, [contentKey, wasRestored])

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

  const toggleSpeech = () => {
    if (speech.status === 'speaking') {
      speech.pause()
      return
    }
    if (speech.status === 'paused') {
      speech.resume()
      return
    }

    const content = controlsRef.current
      ?.closest('.content-detail-page')
      ?.querySelector<HTMLElement>('.prayer-text, .song-text, .psalm-verses')
    speech.start(content?.innerText.trim() ?? '')
  }

  return (
    <div ref={controlsRef} className="content-reading-controls">
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

      <button
        className="content-reading-toggle content-reading-toggle--speech"
        type="button"
        aria-pressed={speech.status !== 'idle'}
        disabled={!speech.supported}
        title={speech.supported ? 'Czytaj treść na głos' : 'Czytanie na głos nie jest obsługiwane'}
        onClick={toggleSpeech}
      >
        {speech.status === 'speaking' && <FaPause aria-hidden="true" />}
        {speech.status === 'paused' && <FaPlay aria-hidden="true" />}
        {speech.status === 'idle' && <FaVolumeHigh aria-hidden="true" />}
        <span>{speech.status === 'speaking' ? 'Pauza' : speech.status === 'paused' ? 'Wznów' : 'Czytaj'}</span>
      </button>

      {speech.status !== 'idle' && (
        <button
          className="content-reading-toggle content-reading-toggle--speech-stop"
          type="button"
          title="Zatrzymaj czytanie"
          aria-label="Zatrzymaj czytanie"
          onClick={speech.stop}
        >
          <FaStop aria-hidden="true" />
        </button>
      )}

      {!isActive && <ContentFontSizeControl className="content-reading-secondary" />}

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

      {wasRestored && resumeStatusHiddenFor !== contentKey && !isActive && (
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
