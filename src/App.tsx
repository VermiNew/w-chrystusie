import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import PrayersPage from './pages/PrayersPage'
import ScripturePage from './pages/ScripturePage'
import SongbookPage from './pages/SongbookPage'
import RosaryPage from './pages/RosaryPage'
import SearchPage from './pages/SearchPage'
import NotFoundPage from './pages/NotFoundPage'
import './App.css'

function AppRoutes() {
  const location = useLocation()

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
    </BrowserRouter>
  )
}

export default App
