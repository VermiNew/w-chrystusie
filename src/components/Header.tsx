import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { FaCross, FaBookBible, FaMusic, FaMagnifyingGlass, FaBars, FaXmark, FaHandsPraying, FaBullhorn, FaBell, FaCircleInfo, FaMoon, FaSun } from 'react-icons/fa6'
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
  const unread = useUnreadCount(announcements.map((a) => a.id))
  const hasReminders = useHasAnyReminder()
  const theme = useTheme()

  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) closeMenu()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [menuOpen])

  return (
    <header className="header">
      {menuOpen && <div className="nav-overlay" onClick={closeMenu} />}
      <nav className="nav">
        <NavLink to="/" className="nav-brand" onClick={closeMenu}>✝ W Chrystusie</NavLink>
        <button
          className="nav-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Zamknij menu' : 'Otwórz menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <FaXmark /> : <FaBars />}
        </button>
        <ul className={`nav-links${menuOpen ? ' nav-links--open' : ''}`}>
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
          <li className="nav-reminders-item">
            <button
              className={`nav-reminders-btn${hasReminders ? ' nav-reminders-btn--active' : ''}`}
              onClick={() => { setRemindersOpen(true); closeMenu() }}
              title="Przypomnienia o modlitwie"
            >
              <FaBell />
              <span className="nav-reminders-label">Przypomnienia</span>
              {hasReminders && <span className="nav-reminders-active-dot" />}
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
              onClick={() => { setAboutOpen(true); closeMenu() }}
              title="O projekcie"
            >
              <FaCircleInfo />
              <span className="nav-about-label">O projekcie</span>
            </button>
          </li>
        </ul>
      </nav>
      <RemindersModal open={remindersOpen} onClose={() => setRemindersOpen(false)} />
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </header>
  )
}
