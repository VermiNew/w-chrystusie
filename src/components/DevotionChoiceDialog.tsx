import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowRight, FaHandsPraying } from 'react-icons/fa6'

interface Props {
  open: boolean
  onClose: () => void
}

const CLOSE_DURATION_MS = 250

export default function DevotionChoiceDialog({ open, onClose }: Props) {
  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const firstChoiceRef = useRef<HTMLButtonElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const titleId = useId()
  const descriptionId = useId()
  const [closing, setClosing] = useState(false)

  const handleClose = useCallback((targetPath?: string) => {
    if (closing) return
    setClosing(true)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null
      dialogRef.current?.close()
      setClosing(false)
      onClose()
      if (targetPath) navigate(targetPath)
    }, reducedMotion ? 0 : CLOSE_DURATION_MS)
  }, [closing, navigate, onClose])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    let focusFrame: number | undefined
    let resetClosingFrame: number | undefined

    if (open) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
        resetClosingFrame = requestAnimationFrame(() => setClosing(false))
      }
      if (!dialog.open) dialog.showModal()
      focusFrame = requestAnimationFrame(() => firstChoiceRef.current?.focus())
    }

    return () => {
      if (focusFrame !== undefined) cancelAnimationFrame(focusFrame)
      if (resetClosingFrame !== undefined) cancelAnimationFrame(resetClosingFrame)
    }
  }, [open])

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleCancel = (event: Event) => {
      event.preventDefault()
      handleClose()
    }

    dialog.addEventListener('cancel', handleCancel)
    return () => dialog.removeEventListener('cancel', handleCancel)
  }, [handleClose])

  return (
    <dialog
      ref={dialogRef}
      className={`confirm-dialog devotion-choice-dialog${closing ? ' devotion-choice-dialog--closing' : ''}`}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClick={(event) => {
        if (event.target === dialogRef.current) handleClose()
      }}
    >
      <div className="confirm-dialog-inner">
        <h2 id={titleId}>Różaniec i koronka</h2>
        <p id={descriptionId}>Wybierz modlitwę, którą chcesz rozpocząć.</p>
        <div className="devotion-choice-options">
          <button ref={firstChoiceRef} type="button" onClick={() => handleClose('/rozaniec')}>
            <FaHandsPraying aria-hidden="true" />
            <span>Różaniec</span>
            <FaArrowRight aria-hidden="true" />
          </button>
          <button type="button" onClick={() => handleClose('/koronka')}>
            <FaHandsPraying aria-hidden="true" />
            <span>Koronka</span>
            <FaArrowRight aria-hidden="true" />
          </button>
        </div>
        <button type="button" className="devotion-choice-cancel" onClick={() => handleClose()}>Anuluj</button>
      </div>
    </dialog>
  )
}
