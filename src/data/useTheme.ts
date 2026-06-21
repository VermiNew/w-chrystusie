import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'theme'
type Theme = 'light' | 'dark'

function getStoredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'dark' || stored === 'light') return stored
  // Respect OS preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

let listeners: (() => void)[] = []
let snapshot: Theme = getStoredTheme()

// Apply on load
applyTheme(snapshot)

// React to OS-level theme changes when the user hasn't set a manual preference
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (localStorage.getItem(STORAGE_KEY)) return
  snapshot = e.matches ? 'dark' : 'light'
  applyTheme(snapshot)
  listeners.forEach((l) => l())
})

function subscribe(listener: () => void) {
  listeners = [...listeners, listener]
  return () => { listeners = listeners.filter((l) => l !== listener) }
}

function getSnapshot() { return snapshot }

function notify() {
  listeners.forEach((l) => l())
}

export function toggleTheme() {
  snapshot = snapshot === 'light' ? 'dark' : 'light'
  localStorage.setItem(STORAGE_KEY, snapshot)
  applyTheme(snapshot)
  notify()
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getSnapshot)
}
