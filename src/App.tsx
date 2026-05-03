import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import Header from './components/Header'
import ReminderToast from './components/ReminderToast'
import './App.css'

// Route-level code splitting — pages load on demand
const HomePage = lazy(() => import('./pages/HomePage'))
const PrayersPage = lazy(() => import('./pages/PrayersPage'))
const ScripturePage = lazy(() => import('./pages/ScripturePage'))
const SongbookPage = lazy(() => import('./pages/SongbookPage'))
const RosaryPage = lazy(() => import('./pages/RosaryPage'))
const ChapletPage = lazy(() => import('./pages/ChapletPage'))
const AnnouncementsPage = lazy(() => import('./pages/AnnouncementsPage'))
const MayDevotionPage = lazy(() => import('./pages/MayDevotionPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

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
      <Suspense fallback={<div className="page-loading" aria-hidden="true" />}>
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
          <Route path="/nabozenstwo-majowe" element={<MayDevotionPage />} />
          <Route path="/szukaj" element={<SearchPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
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
