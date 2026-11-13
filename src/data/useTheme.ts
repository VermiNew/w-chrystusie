import { useSyncExternalStore } from 'react'
import { readStorage, writeStorage } from './storage'

const STORAGE_KEY = 'theme'
export type Theme = 'light' | 'dark' | 'sepia'

// The theme button cycles through the themes in this order.
const THEME_ORDER: Theme[] = ['light', 'dark', 'sepia']

export const themeLabels: Record<Theme, string> = {
  light: 'Tryb jasny',
  dark: 'Tryb ciemny',
  sepia: 'Tryb sepii',
}

// Browser UI color (address bar on Android) — matches --color-header-bg of each theme.
const themeColors: Record<Theme, string> = {
  light: '#1a3a5c',
  dark: '#1a3a5c',
  sepia: '#5a3a1e',
}

export const getNextTheme = (theme: Theme): Theme => THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length]

function getStoredTheme(): Theme {
  const stored = readStorage(STORAGE_KEY)
  if (stored === 'dark' || stored === 'light' || stored === 'sepia') return stored
  // Respect OS preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColors[theme])
}

let listeners: (() => void)[] = []
let snapshot: Theme = getStoredTheme()
let themeTransitionTimer: number | undefined

// Apply on load
applyTheme(snapshot)

// React to OS-level theme changes when the user hasn't set a manual preference
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (readStorage(STORAGE_KEY)) return
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

function applyThemeWithTransition(theme: Theme) {
  const root = document.documentElement
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    applyTheme(theme)
    return
  }

  window.clearTimeout(themeTransitionTimer)
  root.dataset.themeTransition = 'true'
  applyTheme(theme)
  themeTransitionTimer = window.setTimeout(() => {
    delete root.dataset.themeTransition
  }, 260)
}

/** Switches to the next theme: light → dark → sepia → light. */
export function toggleTheme() {
  snapshot = getNextTheme(snapshot)
  writeStorage(STORAGE_KEY, snapshot)
  applyThemeWithTransition(snapshot)
  notify()
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getSnapshot)
}
