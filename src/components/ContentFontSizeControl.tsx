import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { FaArrowRotateLeft, FaMinus, FaPlus } from 'react-icons/fa6'

const FONT_SIZE_KEY = 'content-font-size'
const DEFAULT_FONT_SIZE = 100
const MIN_FONT_SIZE = 90
const MAX_FONT_SIZE = 160
const FONT_SIZE_STEP = 10

const readFontSize = () => {
  const stored = Number.parseInt(localStorage.getItem(FONT_SIZE_KEY) ?? '', 10)
  return Number.isFinite(stored) && stored >= MIN_FONT_SIZE && stored <= MAX_FONT_SIZE
    ? stored
    : DEFAULT_FONT_SIZE
}

interface Props {
  className?: string
}

export default function ContentFontSizeControl({ className = '' }: Props) {
  const [fontSize, setFontSize] = useState(readFontSize)
  const [open, setOpen] = useState(false)
  const controlRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const titleId = useId()

  useEffect(() => {
    const scale = fontSize / 100
    localStorage.setItem(FONT_SIZE_KEY, String(fontSize))
    document.documentElement.style.setProperty('--content-reading-scale', String(scale))
    document.documentElement.style.setProperty('--content-reading-font-size', `${1.1 * scale}rem`)
    document.documentElement.style.setProperty('--content-focus-font-size', `${1.8 * scale}rem`)

    return () => {
      document.documentElement.style.removeProperty('--content-reading-scale')
      document.documentElement.style.removeProperty('--content-reading-font-size')
      document.documentElement.style.removeProperty('--content-focus-font-size')
    }
  }, [fontSize])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!controlRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={controlRef} className={`content-font-size-menu${className ? ` ${className}` : ''}`}>
      <button
        className="content-reading-toggle content-font-size-trigger"
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        title="Ustaw wielkość tekstu"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="content-font-size-symbol" aria-hidden="true">Aa</span>
        <span className="sr-only">Wielkość tekstu</span>
        <small>{fontSize}%</small>
      </button>
      {open && (
        <div
          id={panelId}
          className="content-font-size-popover"
          role="region"
          aria-labelledby={titleId}
        >
          <div className="content-font-size-header">
            <div>
              <strong id={titleId}>Wielkość tekstu</strong>
              <span>Dopasuj tekst modlitwy do swoich potrzeb</span>
            </div>
            <output aria-live="polite">{fontSize}%</output>
          </div>

          <div className="content-font-size-stepper">
            <button
              type="button"
              aria-label="Zmniejsz tekst"
              disabled={fontSize === MIN_FONT_SIZE}
              onClick={() => setFontSize((size) => Math.max(MIN_FONT_SIZE, size - FONT_SIZE_STEP))}
            >
              <FaMinus aria-hidden="true" />
            </button>
            <p style={{ fontSize: `${fontSize}%` }}>Przykładowy tekst modlitwy</p>
            <button
              type="button"
              aria-label="Powiększ tekst"
              disabled={fontSize === MAX_FONT_SIZE}
              onClick={() => setFontSize((size) => Math.min(MAX_FONT_SIZE, size + FONT_SIZE_STEP))}
            >
              <FaPlus aria-hidden="true" />
            </button>
          </div>

          <label className="content-font-size-control">
            <span className="sr-only">Wielkość tekstu od 90 do 160 procent</span>
            <input
              type="range"
              min={MIN_FONT_SIZE}
              max={MAX_FONT_SIZE}
              step={FONT_SIZE_STEP}
              value={fontSize}
              style={{ '--range-progress': `${((fontSize - MIN_FONT_SIZE) / (MAX_FONT_SIZE - MIN_FONT_SIZE)) * 100}%` } as CSSProperties}
              aria-label="Wielkość tekstu"
              onChange={(event) => setFontSize(Number(event.target.value))}
            />
          </label>
          <div className="content-font-size-footer">
            <span>{MIN_FONT_SIZE}%</span>
            <button
              className="content-font-size-reset"
              type="button"
              disabled={fontSize === DEFAULT_FONT_SIZE}
              onClick={() => setFontSize(DEFAULT_FONT_SIZE)}
            >
              <FaArrowRotateLeft aria-hidden="true" />
              Przywróć 100%
            </button>
            <span>{MAX_FONT_SIZE}%</span>
          </div>
        </div>
      )}
    </div>
  )
}
