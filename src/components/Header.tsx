import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FaCross, FaBookBible, FaMusic, FaMagnifyingGlass, FaBars, FaXmark } from 'react-icons/fa6'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="header">
      <nav className="nav">
        <NavLink to="/" className="nav-brand" onClick={closeMenu}>✝ Słowo Życia</NavLink>
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
          <li><NavLink to="/szukaj" onClick={closeMenu}><FaMagnifyingGlass /> Szukaj</NavLink></li>
        </ul>
      </nav>
    </header>
  )
}
