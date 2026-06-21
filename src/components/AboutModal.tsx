import { useEffect, useRef, useState, useCallback } from 'react'
import { FaXmark, FaGithub, FaCross, FaMusic } from 'react-icons/fa6'
import { prayers } from '../data/prayers'
import { songs } from '../data/songs'

interface Props {
  open: boolean
  onClose: () => void
}

const CLOSE_DURATION_MS = 250

export default function AboutModal({ open, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [closing, setClosing] = useState(false)

  const handleClose = useCallback(() => {
    if (closing) return
    setClosing(true)
    closeTimerRef.current = setTimeout(() => {
      dialogRef.current?.close()
      setClosing(false)
      onClose()
    }, CLOSE_DURATION_MS)
  }, [closing, onClose])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
        setClosing(false)
      }
      if (!dialog.open) dialog.showModal()
    }
  }, [open])

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) handleClose()
  }

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handle = (e: Event) => {
      e.preventDefault()
      handleClose()
    }
    dialog.addEventListener('cancel', handle)
    return () => dialog.removeEventListener('cancel', handle)
  }, [handleClose])

  return (
    <dialog
      ref={dialogRef}
      className={`about-dialog${closing ? ' about-dialog--closing' : ''}`}
      onClick={handleDialogClick}
    >
      <div className="about-dialog-inner">
        <button className="about-dialog-close" onClick={handleClose} aria-label="Zamknij">
          <FaXmark />
        </button>

        <div className="about-hero">
          <span className="about-hero-cross">✝</span>
          <h2 className="about-hero-title">W Chrystusie</h2>
        </div>

        <p className="about-desc">
          Polska katolicka aplikacja webowa — modlitwy, pieśni kościelne
          i interaktywny różaniec w jednym miejscu.
        </p>

        <blockquote className="about-quote">
          <p>„Proście, a będzie wam dane; szukajcie, a znajdziecie; kołaczcie, a otworzą wam."</p>
          <cite>Mt 7,7–8</cite>
        </blockquote>

        <div className="about-stats">
          <div className="about-stat">
            <FaCross className="about-stat-icon" />
            <span className="about-stat-value">{prayers.length}</span>
            <span className="about-stat-label">modlitw</span>
          </div>
          <div className="about-stat">
            <FaMusic className="about-stat-icon" />
            <span className="about-stat-value">{songs.length}</span>
            <span className="about-stat-label">pieśni</span>
          </div>
        </div>

        <div className="about-footer">
          <a
            className="about-github"
            href="https://github.com/verminew/w-chrystusie"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub /> GitHub
          </a>
          <span className="about-tech">React · TypeScript · Vite</span>
          <span className="about-license">MIT</span>
        </div>
      </div>
    </dialog>
  )
}
