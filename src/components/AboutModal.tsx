import { useEffect, useId, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FaXmark, FaGithub, FaCross, FaMusic, FaGlobe, FaBullhorn, FaLink, FaCircleInfo, FaCloudArrowDown, FaDatabase, FaHeart } from 'react-icons/fa6'
import { contentCounts } from '../data/contentCounts'
import { announcements } from '../data/announcements'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { useSwipeToClose } from '../hooks/useSwipeToClose'
import DataBackup from './DataBackup'
import OfflineStatus from './OfflineStatus'
import logoUrl from '../assets/logo-about.png'

interface Props {
  open: boolean
  onClose: () => void
}

const CLOSE_DURATION_MS = 250

type AboutTab = 'about' | 'offline' | 'data'

const formatContentDate = (date: string) => {
  const [year, month, day] = date.split('-')
  return year && month && day ? `${day}.${month}.${year}` : ''
}

export default function AboutModal({ open, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const titleId = useId()
  const [closing, setClosing] = useState(false)
  const [activeTab, setActiveTab] = useState<AboutTab>('about')
  const baseId = useId()

  useFocusTrap(dialogRef, open)

  const handleClose = useCallback(() => {
    if (closing) return
    setClosing(true)
    closeTimerRef.current = setTimeout(() => {
      dialogRef.current?.close()
      setClosing(false)
      setActiveTab('about')
      onClose()
    }, CLOSE_DURATION_MS)
  }, [closing, onClose])

  useSwipeToClose(dialogRef, open, handleClose)

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
      focusFrame = requestAnimationFrame(() => closeButtonRef.current?.focus())
    }

    return () => {
      if (focusFrame !== undefined) cancelAnimationFrame(focusFrame)
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
      // A file input inside the dialog fires its own bubbling "cancel"
      // (e.g. when the file picker is dismissed); only Escape on the dialog closes it.
      if (e.target !== dialog) return
      e.preventDefault()
      handleClose()
    }
    dialog.addEventListener('cancel', handle)
    return () => dialog.removeEventListener('cancel', handle)
  }, [handleClose])

  const tabs: { id: AboutTab; label: string; icon: React.ReactNode }[] = [
    { id: 'about', label: 'O aplikacji', icon: <FaCircleInfo aria-hidden="true" /> },
    { id: 'offline', label: 'Offline', icon: <FaCloudArrowDown aria-hidden="true" /> },
    { id: 'data', label: 'Dane', icon: <FaDatabase aria-hidden="true" /> },
  ]

  // Arrow keys move between tabs, as in a native tab list.
  const handleTabKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const index = tabs.findIndex((tab) => tab.id === activeTab)
    const next = tabs[(index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]
    setActiveTab(next.id)
    requestAnimationFrame(() => document.getElementById(`${baseId}-tab-${next.id}`)?.focus())
  }

  return (
    <dialog
      ref={dialogRef}
      className={`about-dialog${closing ? ' about-dialog--closing' : ''}`}
      onClick={handleDialogClick}
      aria-labelledby={titleId}
    >
      <div className="about-dialog-inner">
        <button ref={closeButtonRef} className="about-dialog-close" onClick={handleClose} aria-label="Zamknij">
          <FaXmark />
        </button>

        <div className="about-hero">
          <FaCross className="about-hero-cross" aria-hidden="true" />
          <h2 id={titleId} className="about-hero-title">W Chrystusie</h2>
          <p className="about-hero-tagline">Modlitwa, Słowo i pieśń — zawsze pod ręką</p>
        </div>

        <div className="about-tabs" role="tablist" aria-label="Sekcje" onKeyDown={handleTabKey}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`${baseId}-tab-${tab.id}`}
              type="button"
              role="tab"
              className="about-tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`${baseId}-panel`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div
          id={`${baseId}-panel`}
          className="about-tab-panel"
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${activeTab}`}
          key={activeTab}
        >
          {activeTab === 'about' && (
            <>
              <p className="about-desc">
                Polska katolicka aplikacja — modlitwy, Pismo Święte, Liturgia Godzin,
                pieśni kościelne, różaniec i koronka w jednym miejscu. Działa także bez internetu.
              </p>

              <section className="about-free" aria-labelledby={`${baseId}-free`}>
                <FaHeart className="about-free-icon" aria-hidden="true" />
                <div>
                  <h3 id={`${baseId}-free`}>Zawsze w pełni darmowa</h3>
                  <p>
                    Ta aplikacja jest i zawsze będzie bezpłatna — bez reklam, bez płatnych
                    funkcji, bez kont i bez śledzenia. Modlitwa nie ma ceny.
                  </p>
                </div>
              </section>

              <div className="about-stats">
                <div className="about-stat">
                  <FaCross className="about-stat-icon" aria-hidden="true" />
                  <span className="about-stat-value">{contentCounts.prayers}</span>
                  <span className="about-stat-label">modlitw</span>
                </div>
                <div className="about-stat">
                  <FaMusic className="about-stat-icon" aria-hidden="true" />
                  <span className="about-stat-value">{contentCounts.songs}</span>
                  <span className="about-stat-label">pieśni</span>
                </div>
                <div className="about-stat">
                  <FaBullhorn className="about-stat-icon" aria-hidden="true" />
                  <span className="about-stat-value">{announcements.length}</span>
                  <span className="about-stat-label">ogłoszeń</span>
                </div>
              </div>

              <blockquote className="about-quote">
                <p>„Proście, a będzie wam dane; szukajcie, a znajdziecie; kołaczcie, a otworzą wam.”</p>
                <cite>Mt 7,7–8</cite>
              </blockquote>

              <section className="about-greeting" aria-labelledby={`${baseId}-greeting`}>
                <h3 id={`${baseId}-greeting`}>Serdeczne pozdrowienia</h3>
                <p>
                  dla Duszpasterstwa Akademickiego <strong>Rotunda</strong> prowadzonego
                  przez Misjonarzy Saletynów w Rzeszowie. Szczęść Boże!
                </p>
              </section>

              <div className="about-author-row">
                <img className="about-author-logo" src={logoUrl} alt="" aria-hidden="true" />
                <div className="about-author-copy">
                  <span className="about-author-label">Autor</span>
                  <strong>Verminew</strong>
                </div>
                <a className="about-button" href="https://verminew.github.io" target="_blank" rel="noopener noreferrer">
                  <FaGlobe aria-hidden="true" /> Portfolio
                </a>
              </div>

              <Link className="about-button about-button--wide" to="/zrodla" onClick={handleClose}>
                <FaLink aria-hidden="true" /> Źródła i materiały
              </Link>
            </>
          )}

          {activeTab === 'offline' && <OfflineStatus />}
          {activeTab === 'data' && <DataBackup />}
        </div>

        <div className="about-footer">
          <a
            className="about-github"
            href="https://github.com/verminew/w-chrystusie"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub aria-hidden="true" /> GitHub
          </a>
          <span className="about-license">MIT</span>
          <span className="about-build">build {__APP_COMMIT__}</span>
          {__CONTENT_UPDATED_AT__ && (
            <span className="about-updated">Treść zaktualizowana: {formatContentDate(__CONTENT_UPDATED_AT__)}</span>
          )}
        </div>
      </div>
    </dialog>
  )
}
