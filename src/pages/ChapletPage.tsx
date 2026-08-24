import { useState, useMemo, useEffect, useCallback } from 'react'
import { FaArrowLeft, FaArrowRight, FaCheck } from 'react-icons/fa6'
import { buildChapletSteps } from '../data/chaplet'
import { hapticLight, hapticMedium } from '../data/haptics'
import { useScreenWakeLock } from '../hooks/useScreenWakeLock'
import { useHorizontalSwipe } from '../hooks/useHorizontalSwipe'
import PrayerCompletion from '../components/PrayerCompletion'
import SourceAttributionLink from '../components/SourceAttributionLink'

type Screen = 'intro' | 'prayer' | 'complete'
const CHAPLET_PROGRESS_KEY = 'chaplet-progress'

interface ChapletProgress {
  screen: Screen
  currentStep: number
}

function readChapletProgress(): ChapletProgress {
  const emptyProgress: ChapletProgress = { screen: 'intro', currentStep: 0 }

  try {
    const storedProgress = sessionStorage.getItem(CHAPLET_PROGRESS_KEY)
    if (!storedProgress) return emptyProgress

    const parsedProgress: unknown = JSON.parse(storedProgress)
    if (
      typeof parsedProgress !== 'object'
      || parsedProgress === null
      || !('currentStep' in parsedProgress)
      || typeof parsedProgress.currentStep !== 'number'
      || !Number.isInteger(parsedProgress.currentStep)
      || parsedProgress.currentStep < 0
      || parsedProgress.currentStep >= buildChapletSteps().length
    ) {
      return emptyProgress
    }

    return { screen: 'prayer', currentStep: parsedProgress.currentStep }
  } catch {
    // Storage may be unavailable or contain malformed JSON; neither should block prayer.
    return emptyProgress
  }
}

export default function ChapletPage() {
  const [restoredProgress] = useState(readChapletProgress)
  const [screen, setScreen] = useState<Screen>(restoredProgress.screen)
  const [currentStep, setCurrentStep] = useState(restoredProgress.currentStep)
  const [showKeyboardHint, setShowKeyboardHint] = useState(
    () => window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  )
  useScreenWakeLock(screen === 'prayer')

  const steps = useMemo(() => buildChapletSteps(), [])

  const step = steps[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === steps.length - 1

  const start = useCallback(() => {
    hapticMedium()
    setCurrentStep(0)
    setScreen('prayer')
    window.scrollTo(0, 0)
  }, [])

  const goNext = useCallback(() => {
    if (isLast) return
    hapticLight()
    setCurrentStep((s) => s + 1)
    window.scrollTo(0, 0)
  }, [isLast])

  const goPrev = useCallback(() => {
    if (isFirst) return
    hapticLight()
    setCurrentStep((s) => s - 1)
    window.scrollTo(0, 0)
  }, [isFirst])
  const swipeHandlers = useHorizontalSwipe(goNext, goPrev)

  const reset = useCallback(() => {
    hapticMedium()
    try {
      sessionStorage.removeItem(CHAPLET_PROGRESS_KEY)
    } catch {
      // Reset must still work when browser storage is unavailable.
    }
    setScreen('intro')
    setCurrentStep(0)
    window.scrollTo(0, 0)
  }, [])

  const complete = useCallback(() => {
    hapticMedium()
    try {
      sessionStorage.removeItem(CHAPLET_PROGRESS_KEY)
    } catch {
      // Completion must still work when browser storage is unavailable.
    }
    setScreen('complete')
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (screen !== 'prayer') return

    try {
      sessionStorage.setItem(CHAPLET_PROGRESS_KEY, JSON.stringify({ currentStep }))
    } catch {
      // Prayer navigation remains usable when browser storage is unavailable.
    }
  }, [screen, currentStep])

  // Arrow keys during prayer
  useEffect(() => {
    if (screen !== 'prayer') return

    const handleKey = (e: KeyboardEvent) => {
      setShowKeyboardHint(true)
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'Escape') reset()
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [screen, goNext, goPrev, reset])

  // Intro screen
  if (screen === 'intro') {
    return (
      <div className="page">
        <h1>Koronka do Bożego Miłosierdzia</h1>
        <div className="chaplet-intro">
          <span className="chaplet-intro-icon">🕊️</span>
          <p className="chaplet-intro-lead">
            Zatrzymaj się na chwilę. Oddaj Panu Jezusowi wszystko, co nosisz w sercu —
            troski, lęki, radości i nadzieje. On czeka, by wylać na Ciebie
            zdroje łask i miłosierdzia. Trzeba tylko Mu na to pozwolić i uwierzyć.
          </p>
          <blockquote className="chaplet-intro-quote">
            „Przez odmawianie tej koronki podoba mi się dać wszystko, o co mnie prosić będą."
            <cite>— Pan Jezus do św. Faustyny (Dz. 1541)</cite>
          </blockquote>
          <button className="chaplet-intro-start" onClick={start}>
            Rozpocznij Koronkę ✝
          </button>
        </div>
      </div>
    )
  }

  if (screen === 'complete') {
    return (
      <PrayerCompletion
        message="Koronka do Bożego Miłosierdzia dobiegła końca."
        exitLabel="Wróć do początku"
        onRepeat={start}
        onExit={reset}
      />
    )
  }

  // Prayer screen
  return (
    <div className="page prayer-sequence-page">
      <button className="back-button" onClick={reset}>
        <FaArrowLeft className="prayer-nav-icon" aria-hidden="true" />
        <span>Powrót</span>
      </button>

      <div className="chaplet-progress">
        <span>{currentStep + 1} / {steps.length}</span>
        <div className="chaplet-progress-bar">
          <div
            className="chaplet-progress-fill"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="chaplet-step" key={currentStep} {...swipeHandlers}>
        <h2 className="chaplet-label">
          {step.label}
          {step.counter && <span className="chaplet-counter"> ({step.counter})</span>}
          {step.context && <span className="chaplet-context">{step.context}</span>}
        </h2>
        <p className="chaplet-prayer">{step.prayer}</p>
        {step.source && <SourceAttributionLink url={step.source} />}
      </div>

      <div className="prayer-sequence-controls">
        <div className="chaplet-nav">
          <button
            className={`chaplet-nav-button prayer-nav-button--previous${isFirst ? ' prayer-nav-button--hidden' : ''}`}
            onClick={goPrev}
            aria-label="Poprzedni krok koronki"
            aria-hidden={isFirst}
            disabled={isFirst}
            tabIndex={isFirst ? -1 : 0}
          >
            <FaArrowLeft className="prayer-nav-icon" aria-hidden="true" />
            <span>Wstecz</span>
          </button>
          <span className="prayer-nav-next-slot">
            <button
              className={`chaplet-nav-button chaplet-nav-button--next prayer-nav-button--next${isLast ? ' prayer-nav-button--hidden' : ''}`}
              onClick={goNext}
              aria-label="Następny krok koronki"
              aria-hidden={isLast}
              disabled={isLast}
              tabIndex={isLast ? -1 : 0}
            >
              <span>Dalej</span>
              <FaArrowRight className="prayer-nav-icon" aria-hidden="true" />
            </button>
            <button
              className={`chaplet-nav-button chaplet-nav-button--next prayer-nav-button--next${isLast ? '' : ' prayer-nav-button--hidden'}`}
              onClick={complete}
              aria-label="Zakończ koronkę"
              aria-hidden={!isLast}
              disabled={!isLast}
              tabIndex={isLast ? 0 : -1}
            >
              <span>Zakończ</span>
              <FaCheck className="prayer-nav-icon" aria-hidden="true" />
            </button>
          </span>
        </div>
        <p
          className={`chaplet-keyboard-hint${showKeyboardHint ? '' : ' prayer-keyboard-hint--hidden'}`}
          aria-hidden={!showKeyboardHint}
        >
          ← → klawiatura
        </p>
      </div>
    </div>
  )
}
