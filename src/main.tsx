import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register service worker for PWA offline cache + notifications.
// In dev it is enabled only for installed/standalone PWA sessions.
const isStandalonePwa = window.matchMedia?.('(display-mode: standalone)').matches
  || (navigator as Navigator & { standalone?: boolean }).standalone === true

if ('serviceWorker' in navigator && (import.meta.env.PROD || isStandalonePwa)) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`/sw.js?v=${encodeURIComponent(__APP_COMMIT__)}`)
      .then((registration) => {
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing
          if (!worker) return
          worker.addEventListener('statechange', () => {
            // On first install controller is null — only skip waiting on updates (existing SW in control)
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              worker.postMessage({ type: 'SKIP_WAITING' })
            }
          })
        })
      })
      .catch(() => {
        // SW registration failed — app falls back to network-only mode.
      })
  })
}
