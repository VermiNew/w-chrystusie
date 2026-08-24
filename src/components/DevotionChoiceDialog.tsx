import { useEffect, useId, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowRight, FaHandsPraying } from 'react-icons/fa6'

interface Props {
  open: boolean
  onClose: () => void
}

export default function DevotionChoiceDialog({ open, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const firstChoiceRef = useRef<HTMLAnchorElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    let focusFrame: number | undefined

    if (open && !dialog.open) {
      dialog.showModal()
      focusFrame = requestAnimationFrame(() => firstChoiceRef.current?.focus())
    }
    if (!open && dialog.open) dialog.close()

    return () => {
      if (focusFrame !== undefined) cancelAnimationFrame(focusFrame)
    }
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleCancel = (event: Event) => {
      event.preventDefault()
      onClose()
    }

    dialog.addEventListener('cancel', handleCancel)
    return () => dialog.removeEventListener('cancel', handleCancel)
  }, [onClose])

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog devotion-choice-dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      <div className="confirm-dialog-inner">
        <h2 id={titleId}>Różaniec i koronka</h2>
        <p id={descriptionId}>Wybierz modlitwę, którą chcesz rozpocząć.</p>
        <div className="devotion-choice-options">
          <Link ref={firstChoiceRef} to="/rozaniec" onClick={onClose}>
            <FaHandsPraying aria-hidden="true" />
            <span>Różaniec</span>
            <FaArrowRight aria-hidden="true" />
          </Link>
          <Link to="/koronka" onClick={onClose}>
            <FaHandsPraying aria-hidden="true" />
            <span>Koronka</span>
            <FaArrowRight aria-hidden="true" />
          </Link>
        </div>
        <button type="button" className="devotion-choice-cancel" onClick={onClose}>Anuluj</button>
      </div>
    </dialog>
  )
}
