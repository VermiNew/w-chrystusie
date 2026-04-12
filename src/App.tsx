import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header'
import ReminderToast from './components/ReminderToast'
import HomePage from './pages/HomePage'
import PrayersPage from './pages/PrayersPage'
import ScripturePage from './pages/ScripturePage'
import SongbookPage from './pages/SongbookPage'
import RosaryPage from './pages/RosaryPage'
import ChapletPage from './pages/ChapletPage'
import AnnouncementsPage from './pages/AnnouncementsPage'
import SearchPage from './pages/SearchPage'
import NotFoundPage from './pages/NotFoundPage'
import './App.css'

function AppRoutes() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  // '/' key as a global shortcut to jump to search
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault()
        navigate('/szukaj')
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [navigate])

  return (
    <main className="main" key={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/modlitwy" element={<PrayersPage />} />
        <Route path="/modlitwy/:id" element={<PrayersPage />} />
        <Route path="/pismo-swiete" element={<ScripturePage />} />
        <Route path="/spiewnik" element={<SongbookPage />} />
        <Route path="/spiewnik/:id" element={<SongbookPage />} />
        <Route path="/rozaniec" element={<RosaryPage />} />
        <Route path="/koronka" element={<ChapletPage />} />
        <Route path="/ogloszenia" element={<AnnouncementsPage />} />
        <Route path="/ogloszenia/:id" element={<AnnouncementsPage />} />
        <Route path="/szukaj" element={<SearchPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Header />
      <AppRoutes />
      <ReminderToast />
    </BrowserRouter>
  )
}

export default App
