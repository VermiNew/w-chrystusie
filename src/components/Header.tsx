import { NavLink } from 'react-router-dom'
import { FaCross, FaBookBible, FaMusic, FaMagnifyingGlass } from 'react-icons/fa6'

export default function Header() {
  return (
    <header className="header">
      <nav className="nav">
        <NavLink to="/" className="nav-brand">✝ Słowo Życia</NavLink>
        <ul className="nav-links">
          <li><NavLink to="/modlitwy"><FaCross /> Modlitwy</NavLink></li>
          <li><NavLink to="/pismo-swiete"><FaBookBible /> Pismo Święte</NavLink></li>
          <li><NavLink to="/spiewnik"><FaMusic /> Śpiewnik</NavLink></li>
          <li><NavLink to="/szukaj"><FaMagnifyingGlass /> Szukaj</NavLink></li>
        </ul>
      </nav>
    </header>
  )
}
