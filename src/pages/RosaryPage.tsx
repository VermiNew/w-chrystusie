import { useState, useMemo, useEffect, useCallback } from 'react'
import { FaArrowLeft, FaArrowRight, FaCheck } from 'react-icons/fa6'
import { mysterySets, buildRosarySteps, type MysterySet } from '../data/rosary'
import { hapticLight, hapticMedium } from '../data/haptics'

const DAY_NAMES = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota']

function formatDays(days: number[]): string {
  return days.map((d) => DAY_NAMES[d]).join(', ')
}

export default function RosaryPage() {
  const [selectedSet, setSelectedSet] = useState<MysterySet | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

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

  const reset = useCallback(() => {
    hapticMedium()
    setSelectedSet(null)
    setCurrentStep(0)
  }, [])

  // Arrow keys to navigate between rosary steps
  useEffect(() => {
    if (!selectedSet) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'Escape') reset()
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedSet, goNext, goPrev, reset])

  const today = new Date().getDay()

  if (!selectedSet) {
    return (
      <div className="page">
        <h1>Różaniec</h1>
        <p className="rosary-intro">Wybierz tajemnice, które chcesz odmówić:</p>
        <ul className="rosary-sets">
          {mysterySets.map((set) => {
            const isToday = set.days.includes(today)
            return (
              <li key={set.name}>
                <button
                  className={`rosary-set-button${isToday ? ' rosary-set-button--today' : ''}`}
                  onClick={() => setSelectedSet(set)}
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

  return (
    <div className="page">
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

      <div className="rosary-step" key={currentStep}>
        {step.mystery && (
          <p className="rosary-mystery">{step.mystery}</p>
        )}
        <h2 className="rosary-label">
          {step.label}
          {step.counter && <span className="rosary-counter"> ({step.counter})</span>}
        </h2>
        <p className="rosary-prayer">{step.prayer}</p>
      </div>

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
          <button className="rosary-nav-button rosary-nav-button--next" onClick={reset} aria-label="Zakończ różaniec">
            <span>Zakończ</span>
            <FaCheck className="prayer-nav-icon" aria-hidden="true" />
          </button>
        )}
      </div>
      <p className="rosary-keyboard-hint">← → klawiatura</p>
    </div>
  )
}
