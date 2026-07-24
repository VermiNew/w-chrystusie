import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FaXmark, FaGithub, FaCross, FaMusic, FaGlobe, FaBullhorn, FaLink } from 'react-icons/fa6'
import { prayers } from '../data/prayers'
import { songs } from '../data/songs'
import { announcements } from '../data/announcements'
import logoUrl from '../assets/logo-about.png'

interface Props {
  open: boolean
  onClose: () => void
}

const CLOSE_DURATION_MS = 250

const formatContentDate = (date: string) => {
  const [year, month, day] = date.split('-')
  return year && month && day ? `${day}.${month}.${year}` : ''
}

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
    let resetClosingFrame: number | undefined

    if (open) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
        resetClosingFrame = requestAnimationFrame(() => setClosing(false))
      }
      if (!dialog.open) dialog.showModal()
    }

    return () => {
      if (resetClosingFrame !== undefined) cancelAnimationFrame(resetClosingFrame)
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
          <FaCross className="about-hero-cross" aria-hidden="true" />
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

        <section className="about-author" aria-label="Autor projektu">
          <img className="about-author-logo" src={logoUrl} alt="" aria-hidden="true" />
          <div className="about-author-copy">
            <span className="about-author-label">Autor</span>
            <strong>Verminew</strong>
            <a href="https://verminew.github.io" target="_blank" rel="noopener noreferrer">
              <FaGlobe /> Portfolio
            </a>
          </div>
        </section>

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
          <div className="about-stat">
            <FaBullhorn className="about-stat-icon" />
            <span className="about-stat-value">{announcements.length}</span>
            <span className="about-stat-label">ogłoszeń</span>
          </div>
        </div>

        <Link className="about-sources-link" to="/zrodla" onClick={handleClose}>
          <FaLink aria-hidden="true" /> Źródła i materiały
        </Link>

        <div className="about-footer">
          <a
            className="about-github"
            href="https://github.com/verminew/w-chrystusie"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub /> GitHub
          </a>
          {__CONTENT_UPDATED_AT__ && (
            <span className="about-updated">Treść zaktualizowana: {formatContentDate(__CONTENT_UPDATED_AT__)}</span>
          )}
          <span className="about-tech">React · TypeScript · Vite</span>
          <span className="about-license">MIT</span>
          <span className="about-build">build {__APP_COMMIT__}</span>
        </div>
      </div>
    </dialog>
  )
}
