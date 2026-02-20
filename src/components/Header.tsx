import { NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header className="header">
      <nav className="nav">
        <NavLink to="/" className="nav-brand">Słowo Życia</NavLink>
        <ul className="nav-links">
          <li><NavLink to="/modlitwy">Modlitwy</NavLink></li>
          <li><NavLink to="/pismo-swiete">Pismo Święte</NavLink></li>
          <li><NavLink to="/spiewnik">Śpiewnik</NavLink></li>
        </ul>
      </nav>
    </header>
  )
}
