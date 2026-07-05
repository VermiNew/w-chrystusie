import { useEffect, useState } from 'react'
import { FaCompress, FaExpand } from 'react-icons/fa6'
import { useScreenWakeLock } from '../hooks/useScreenWakeLock'

export default function ReadingModeToggle() {
  const [isActive, setIsActive] = useState(false)
  useScreenWakeLock(isActive)

  useEffect(() => {
    if (!isActive) return

    // The root class lets reading mode adjust the shared layout without coupling Header to page state.
    document.documentElement.classList.add('content-reading-mode')

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsActive(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.documentElement.classList.remove('content-reading-mode')
    }
  }, [isActive])

  return (
    <button
      className="content-reading-toggle"
      type="button"
      aria-pressed={isActive}
      title={isActive ? 'Wróć do zwykłego widoku' : 'Włącz tryb dużej czcionki'}
      onClick={() => {
        setIsActive((active) => !active)
        window.scrollTo(0, 0)
      }}
    >
      {isActive ? <FaCompress aria-hidden="true" /> : <FaExpand aria-hidden="true" />}
      <span>{isActive ? 'Zakończ tryb' : 'Duża czcionka'}</span>
    </button>
  )
}
