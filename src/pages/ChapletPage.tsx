import { useState, useMemo, useEffect, useCallback } from 'react'
import { buildChapletSteps } from '../data/chaplet'
import { hapticLight, hapticMedium } from '../data/haptics'

type Screen = 'intro' | 'prayer'

export default function ChapletPage() {
  const [screen, setScreen] = useState<Screen>('intro')
  const [currentStep, setCurrentStep] = useState(0)

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

  const reset = useCallback(() => {
    hapticMedium()
    setScreen('intro')
    setCurrentStep(0)
    window.scrollTo(0, 0)
  }, [])

  // Arrow keys during prayer
  useEffect(() => {
    if (screen !== 'prayer') return

    const handleKey = (e: KeyboardEvent) => {
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

  // Prayer screen
  return (
    <div className="page">
      <button className="back-button" onClick={reset}>
        ← Powrót
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

      <div className="chaplet-step" key={currentStep}>
        <h2 className="chaplet-label">
          {step.label}
          {step.counter && <span className="chaplet-counter"> ({step.counter})</span>}
        </h2>
        <p className="chaplet-prayer">{step.prayer}</p>
      </div>

      <div className="chaplet-nav">
        {!isFirst ? (
          <button className="chaplet-nav-button" onClick={goPrev}>
            ← Wstecz
          </button>
        ) : <span />}
        {!isLast ? (
          <button className="chaplet-nav-button chaplet-nav-button--next" onClick={goNext}>
            Dalej →
          </button>
        ) : (
          <button className="chaplet-nav-button chaplet-nav-button--next" onClick={reset}>
            Zakończ ✓
          </button>
        )}
      </div>
      <p className="chaplet-keyboard-hint">← → klawiatura</p>
    </div>
  )
}
