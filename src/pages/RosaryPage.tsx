import { useState, useMemo, useEffect, useCallback } from 'react'
import { FaArrowLeft, FaArrowRight, FaArrowUpRightFromSquare, FaCheck, FaCircleInfo } from 'react-icons/fa6'
import Markdown from 'react-markdown'
import { mysterySets, buildRosarySteps, type MysterySet } from '../data/rosary'
import { prayers } from '../data/prayers'
import { hapticLight, hapticMedium } from '../data/haptics'
import { useScreenWakeLock } from '../hooks/useScreenWakeLock'
import { useHorizontalSwipe } from '../hooks/useHorizontalSwipe'
import PrayerCompletion from '../components/PrayerCompletion'

const DAY_NAMES = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota']
const ROSARY_PROGRESS_KEY = 'rosary-progress'
const loretoLitany = prayers.find((prayer) => prayer.id === 'Litania Loretańska do Najświętszej Maryi Panny')

interface RosaryProgress {
  selectedSet: MysterySet | null
  currentStep: number
}

function readRosaryProgress(): RosaryProgress {
  const emptyProgress = { selectedSet: null, currentStep: 0 }

  try {
    const storedProgress = sessionStorage.getItem(ROSARY_PROGRESS_KEY)
    if (!storedProgress) return emptyProgress

    const parsedProgress: unknown = JSON.parse(storedProgress)
    if (
      typeof parsedProgress !== 'object'
      || parsedProgress === null
      || !('mysterySetName' in parsedProgress)
      || !('currentStep' in parsedProgress)
      || typeof parsedProgress.mysterySetName !== 'string'
      || typeof parsedProgress.currentStep !== 'number'
      || !Number.isInteger(parsedProgress.currentStep)
    ) {
      return emptyProgress
    }

    const selectedSet = mysterySets.find((set) => set.name === parsedProgress.mysterySetName)
    if (
      !selectedSet
      || parsedProgress.currentStep < 0
      || parsedProgress.currentStep >= buildRosarySteps(selectedSet).length
    ) {
      return emptyProgress
    }

    return { selectedSet, currentStep: parsedProgress.currentStep }
  } catch {
    // Storage may be unavailable or contain malformed JSON; neither should block prayer.
    return emptyProgress
  }
}

function formatDays(days: number[]): string {
  return days.map((d) => DAY_NAMES[d]).join(', ')
}

export default function RosaryPage() {
  const [restoredProgress] = useState(readRosaryProgress)
  const [selectedSet, setSelectedSet] = useState<MysterySet | null>(restoredProgress.selectedSet)
  const [currentStep, setCurrentStep] = useState(restoredProgress.currentStep)
  const [isComplete, setIsComplete] = useState(false)
  const [includeLitany, setIncludeLitany] = useState(false)
  const [showLitany, setShowLitany] = useState(false)
  const [showKeyboardHint, setShowKeyboardHint] = useState(
    () => window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  )
  useScreenWakeLock(selectedSet !== null && !isComplete)

  const steps = useMemo(
    () => (selectedSet ? buildRosarySteps(selectedSet) : []),
    [selectedSet],
  )

  const step = steps[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === steps.length - 1

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
      sessionStorage.removeItem(ROSARY_PROGRESS_KEY)
    } catch {
      // Reset must still work when browser storage is unavailable.
    }
    setSelectedSet(null)
    setCurrentStep(0)
    setIsComplete(false)
    setIncludeLitany(false)
    setShowLitany(false)
    window.scrollTo(0, 0)
  }, [])

  const repeat = useCallback(() => {
    hapticMedium()
    setCurrentStep(0)
    setIsComplete(false)
    setIncludeLitany(false)
    setShowLitany(false)
    window.scrollTo(0, 0)
  }, [])

  const complete = useCallback(() => {
    hapticMedium()
    try {
      sessionStorage.removeItem(ROSARY_PROGRESS_KEY)
    } catch {
      // Completion must still work when browser storage is unavailable.
    }
    setIsComplete(true)
    setShowLitany(false)
    window.scrollTo(0, 0)
  }, [])

  const finishRosary = useCallback(() => {
    if (includeLitany && loretoLitany) {
      setShowLitany(true)
      window.scrollTo(0, 0)
      return
    }
    complete()
  }, [complete, includeLitany])

  useEffect(() => {
    if (!selectedSet || isComplete || showLitany) return

    try {
      sessionStorage.setItem(ROSARY_PROGRESS_KEY, JSON.stringify({
        mysterySetName: selectedSet.name,
        currentStep,
      }))
    } catch {
      // Prayer navigation remains usable when browser storage is unavailable.
    }
  }, [selectedSet, currentStep, isComplete, showLitany])

  // Arrow keys to navigate between rosary steps
  useEffect(() => {
    if (!selectedSet || isComplete || showLitany) return

    const handleKey = (e: KeyboardEvent) => {
      setShowKeyboardHint(true)
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'Escape') reset()
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedSet, isComplete, showLitany, goNext, goPrev, reset])

  const today = new Date().getDay()

  if (isComplete && selectedSet) {
    return (
      <PrayerCompletion
        message={`Ukończono: ${selectedSet.name}.`}
        exitLabel="Wybierz inne tajemnice"
        onRepeat={repeat}
        onExit={reset}
      />
    )
  }

  if (!selectedSet) {
    return (
      <div className="page">
        <h1>Różaniec</h1>
        <p className="rosary-intro">Wybierz tajemnice, które chcesz odmówić:</p>
        <p className="rosary-choice-note" id="rosary-choice-note">
          <FaCircleInfo aria-hidden="true" />
          <span>
            Oznaczenie „dziś” wskazuje tradycyjny zestaw na dany dzień tygodnia.
            To podpowiedź — możesz wybrać dowolne tajemnice.
          </span>
        </p>
        <ul className="rosary-sets" aria-describedby="rosary-choice-note">
          {mysterySets.map((set) => {
            const isToday = set.days.includes(today)
            return (
              <li key={set.name}>
                <button
                  className={`rosary-set-button${isToday ? ' rosary-set-button--today' : ''}`}
                  onClick={() => {
                    setCurrentStep(0)
                    setIsComplete(false)
                    setIncludeLitany(false)
                    setShowLitany(false)
                    setSelectedSet(set)
                  }}
                >
                  {set.name}
                  <span className="rosary-set-days">
                    {formatDays(set.days)}
                    {isToday && <span className="rosary-set-today-badge">dziś</span>}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  if (showLitany && loretoLitany) {
    return (
      <div className="page content-detail-page optional-rosary-ending">
        <button className="back-button" onClick={() => setShowLitany(false)}>
          <FaArrowLeft aria-hidden="true" /> Wróć do ostatniego kroku
        </button>
        <p className="optional-rosary-ending-label">Opcjonalne zakończenie różańca</p>
        <h1>{loretoLitany.title}</h1>
        <div className="prayer-text" lang="pl">
          <Markdown>{loretoLitany.body}</Markdown>
        </div>
        {loretoLitany.source && (
          <a className="source-link" href={loretoLitany.source} target="_blank" rel="noopener noreferrer">
            Źródło <FaArrowUpRightFromSquare aria-hidden="true" />
          </a>
        )}
        <button className="optional-rosary-ending-complete" onClick={complete}>
          <FaCheck aria-hidden="true" /> Zakończ różaniec
        </button>
      </div>
    )
  }

  return (
    <div className="page prayer-sequence-page">
      <button className="back-button" onClick={reset}>
        <FaArrowLeft className="prayer-nav-icon" aria-hidden="true" />
        <span>Powrót do wyboru tajemnic</span>
      </button>

      <div className="rosary-progress">
        <span>{currentStep + 1} / {steps.length}</span>
        <div className="rosary-progress-bar">
          <div
            className="rosary-progress-fill"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="rosary-step" key={currentStep} {...swipeHandlers}>
        {step.mystery && (
          <p className="rosary-mystery">{step.mystery}</p>
        )}
        <h2 className="rosary-label">
          {step.label}
          {step.counter && <span className="rosary-counter"> ({step.counter})</span>}
        </h2>
        <p className="rosary-prayer">{step.prayer}</p>
      </div>

      {isLast && loretoLitany && (
        <label className="rosary-optional-ending">
          <input
            type="checkbox"
            checked={includeLitany}
            onChange={(event) => setIncludeLitany(event.target.checked)}
          />
          <span>
            <strong>Litania Loretańska</strong>
            <small>Dodaj jako opcjonalne zakończenie</small>
          </span>
        </label>
      )}

      <div className="prayer-sequence-controls">
        <div className="rosary-nav">
          {!isFirst ? (
            <button className="rosary-nav-button" onClick={goPrev} aria-label="Poprzedni krok różańca">
              <FaArrowLeft className="prayer-nav-icon" aria-hidden="true" />
              <span>Wstecz</span>
            </button>
          ) : <span />}
          {!isLast ? (
            <button className="rosary-nav-button rosary-nav-button--next" onClick={goNext} aria-label="Następny krok różańca">
              <span>Dalej</span>
              <FaArrowRight className="prayer-nav-icon" aria-hidden="true" />
            </button>
          ) : (
            <button className="rosary-nav-button rosary-nav-button--next" onClick={finishRosary} aria-label="Zakończ różaniec">
              <span>Zakończ</span>
              <FaCheck className="prayer-nav-icon" aria-hidden="true" />
            </button>
          )}
        </div>
        <p
          className={`rosary-keyboard-hint${showKeyboardHint ? '' : ' prayer-keyboard-hint--hidden'}`}
          aria-hidden={!showKeyboardHint}
        >
          ← → klawiatura
        </p>
      </div>
    </div>
  )
}
