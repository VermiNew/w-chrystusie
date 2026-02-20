import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import PrayersPage from './pages/PrayersPage'
import ScripturePage from './pages/ScripturePage'
import SongbookPage from './pages/SongbookPage'
import SearchPage from './pages/SearchPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/modlitwy" element={<PrayersPage />} />
          <Route path="/pismo-swiete" element={<ScripturePage />} />
          <Route path="/spiewnik" element={<SongbookPage />} />
          <Route path="/szukaj" element={<SearchPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
