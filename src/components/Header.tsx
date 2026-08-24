import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FaCross, FaBookBible, FaMusic, FaMagnifyingGlass, FaBars, FaXmark, FaHandsPraying, FaBullhorn, FaBell, FaCircleInfo, FaLink, FaMoon, FaSun } from 'react-icons/fa6'
import { announcements } from '../data/announcements'
import { useUnreadCount } from '../data/useReadAnnouncements'
import { useHasAnyReminder } from '../data/useReminders'
import { useTheme, toggleTheme } from '../data/useTheme'
import RemindersModal from './RemindersModal'
import AboutModal from './AboutModal'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [remindersOpen, setRemindersOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const menuToggleRef = useRef<HTMLButtonElement>(null)
  const restoreMenuFocusRef = useRef(false)
  const unread = useUnreadCount(announcements.map((a) => a.id))
  const hasReminders = useHasAnyReminder()
  const theme = useTheme()

  const closeMenu = () => setMenuOpen(false)

  const restoreMenuFocus = () => {
    if (!restoreMenuFocusRef.current) return
    restoreMenuFocusRef.current = false
    window.requestAnimationFrame(() => menuToggleRef.current?.focus())
  }

  const openReminders = () => {
    restoreMenuFocusRef.current = menuOpen
    setRemindersOpen(true)
    closeMenu()
  }

  const closeReminders = () => {
    setRemindersOpen(false)
    restoreMenuFocus()
  }

  const openAbout = () => {
    restoreMenuFocusRef.current = menuOpen
    setAboutOpen(true)
    closeMenu()
  }

  const closeAbout = () => {
    setAboutOpen(false)
    restoreMenuFocus()
  }

  useEffect(() => {
    if (menuOpen) {
      document.body.dataset.navMenu = 'open'
    } else {
      delete document.body.dataset.navMenu
    }

    return () => { delete document.body.dataset.navMenu }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return

    const mainContent = document.querySelector<HTMLElement>('.main')
    const menuToggle = menuToggleRef.current
    const focusableSelector = 'a[href], button:not([disabled])'
    const getFocusableElements = () => Array.from(
      navRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
    ).filter((element) => element.offsetParent !== null)

    mainContent?.setAttribute('inert', '')

    const focusFrame = window.requestAnimationFrame(() => {
      navRef.current
        ?.querySelector<HTMLElement>('.nav-links a, .nav-links button')
        ?.focus()
    })

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      const firstElement = focusableElements[0]
      const lastElement = focusableElements.at(-1)

      if (!firstElement || !lastElement) return

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKey)

    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', handleKey)
      mainContent?.removeAttribute('inert')
      window.requestAnimationFrame(() => menuToggle?.focus())
    }
  }, [menuOpen])

  return (
    <header className="header">
      {menuOpen && <div className="nav-overlay" onClick={closeMenu} />}
      <nav className="nav" aria-label="Główna nawigacja" ref={navRef}>
        <NavLink to="/" className="nav-brand" onClick={closeMenu}>
          <FaCross className="nav-brand-icon" aria-hidden="true" />
          <span>W Chrystusie</span>
        </NavLink>
        <button
          className="nav-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          ref={menuToggleRef}
          aria-label={menuOpen ? 'Zamknij menu' : 'Otwórz menu'}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
        >
          {menuOpen ? <FaXmark /> : <FaBars />}
        </button>
        <ul
          className={`nav-links${menuOpen ? ' nav-links--open' : ''}`}
          id="primary-navigation"
        >
          <li><NavLink to="/modlitwy" onClick={closeMenu}><FaCross /> Modlitwy</NavLink></li>
          <li><NavLink to="/pismo-swiete" onClick={closeMenu}><FaBookBible /> Pismo Święte</NavLink></li>
          <li><NavLink to="/spiewnik" onClick={closeMenu}><FaMusic /> Śpiewnik</NavLink></li>
          <li><NavLink to="/rozaniec" onClick={closeMenu}><FaHandsPraying /> Różaniec</NavLink></li>
          <li><NavLink to="/koronka" onClick={closeMenu}><FaHandsPraying /> Koronka</NavLink></li>
          <li>
            <NavLink
              to="/ogloszenia"
              onClick={closeMenu}
              className={({ isActive }) => isActive ? 'active nav-announcements' : 'nav-announcements'}
            >
              <FaBullhorn /> Ogłoszenia
              {unread > 0 && <span className="nav-badge" />}
            </NavLink>
          </li>
          <li><NavLink to="/szukaj" onClick={closeMenu}><FaMagnifyingGlass /> Szukaj</NavLink></li>
          <li><NavLink to="/zrodla" onClick={closeMenu}><FaLink /> Źródła</NavLink></li>
          <li className="nav-reminders-item">
            <button
              className={`nav-reminders-btn${hasReminders ? ' nav-reminders-btn--active' : ''}`}
              onClick={openReminders}
              title="Przypomnienia o modlitwie"
            >
              <span className="nav-reminders-icon-wrap">
                <FaBell />
                {hasReminders && <span className="nav-reminders-active-dot" />}
              </span>
              <span className="nav-reminders-label">Przypomnienia</span>
            </button>
          </li>
          <li className="nav-theme-item">
            <button
              className="nav-theme-btn"
              onClick={() => { toggleTheme(); closeMenu() }}
              title={theme === 'light' ? 'Tryb ciemny' : 'Tryb jasny'}
            >
              {theme === 'light' ? <FaMoon /> : <FaSun />}
              <span className="nav-theme-label">{theme === 'light' ? 'Tryb ciemny' : 'Tryb jasny'}</span>
            </button>
          </li>
          <li className="nav-about-item">
            <button
              className="nav-about-btn"
              onClick={openAbout}
              title="O projekcie"
            >
              <FaCircleInfo />
              <span className="nav-about-label">O projekcie</span>
            </button>
          </li>
        </ul>
      </nav>
      <RemindersModal open={remindersOpen} onClose={closeReminders} />
      <AboutModal open={aboutOpen} onClose={closeAbout} />
    </header>
  )
}
