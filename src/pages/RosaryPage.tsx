import { useState, useMemo, useEffect } from 'react'
import { mysterySets, buildRosarySteps, type MysterySet } from '../data/rosary'

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

  const goNext = () => {
    if (!isLast) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  const goPrev = () => {
    if (!isFirst) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  const reset = () => {
    setSelectedSet(null)
    setCurrentStep(0)
  }

  // Arrow keys to navigate between rosary steps
  useEffect(() => {
    if (!selectedSet) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
        window.scrollTo(0, 0)
      }
      if (e.key === 'ArrowLeft' && currentStep > 0) {
        setCurrentStep(currentStep - 1)
        window.scrollTo(0, 0)
      }
      if (e.key === 'Escape') reset()
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedSet, currentStep, steps.length])

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
        ← Powrót do wyboru tajemnic
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
          <button className="rosary-nav-button" onClick={goPrev}>
            ← Wstecz
          </button>
        ) : <span />}
        {!isLast ? (
          <button className="rosary-nav-button rosary-nav-button--next" onClick={goNext}>
            Dalej →
          </button>
        ) : (
          <button className="rosary-nav-button rosary-nav-button--next" onClick={reset}>
            Zakończ ✓
          </button>
        )}
      </div>
      <p className="rosary-keyboard-hint">← → klawiatura</p>
    </div>
  )
}
