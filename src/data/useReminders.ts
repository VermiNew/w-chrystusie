import { useSyncExternalStore } from 'react'
import { REMINDERS } from './reminders'

const STORAGE_KEY = 'prayer-reminders'
const TIMES_STORAGE_KEY = 'prayer-reminders-times'
const NOTIF_KEY = 'prayer-reminders-notif'
const VALID_TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/
const reminderIds = new Set(REMINDERS.map((reminder) => reminder.id))
// How long to wait for the SW to become ready before falling back to
// navigator.serviceWorker.getRegistration(). 1.5 s is enough for a
// freshly installed worker to activate while not blocking the UI.
const SW_READY_TIMEOUT_MS = 1_500

export interface BrowserNotificationStatus {
  supported: boolean
  enabled: boolean
  permission: NotificationPermission | 'unsupported'
  serviceWorkerSupported: boolean
  serviceWorkerControlled: boolean
  serviceWorkerReady: boolean
  standalone: boolean
}

export interface BrowserNotificationResult {
  ok: boolean
  channel?: 'service-worker' | 'notification-api'
  reason?: string
}

// ---- Storage helpers ----

function getEnabledIds(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (!Array.isArray(value)) return []
    return [...new Set(
      value.filter((id): id is string => typeof id === 'string' && reminderIds.has(id)),
    )]
  } catch {
    return []
  }
}

function saveEnabledIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // Storage can be unavailable in private or restricted browsing contexts.
  }
}

type CustomTimesMap = Record<string, string[]>

function normalizeCustomTimesMap(value: unknown): CustomTimesMap {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  const map: CustomTimesMap = {}
  for (const [id, times] of Object.entries(value)) {
    if (!reminderIds.has(id) || !Array.isArray(times)) continue
    const validTimes = [...new Set(
      times.filter((time): time is string => typeof time === 'string' && VALID_TIME_PATTERN.test(time)),
    )]
    if (validTimes.length > 0) map[id] = validTimes
  }
  return map
}

function getCustomTimesMap(): CustomTimesMap {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(TIMES_STORAGE_KEY) || '{}')
    return normalizeCustomTimesMap(value)
  } catch {
    return {}
  }
}

function saveCustomTimesMap(map: CustomTimesMap) {
  try {
    localStorage.setItem(TIMES_STORAGE_KEY, JSON.stringify(normalizeCustomTimesMap(map)))
  } catch {
    // Keep defaults when persistent storage is unavailable.
  }
}

// ---- External store: enabled IDs ----

let enabledListeners: (() => void)[] = []
let enabledSnapshot: string[] = getEnabledIds()

function subscribeEnabled(listener: () => void) {
  enabledListeners = [...enabledListeners, listener]
  return () => {
    enabledListeners = enabledListeners.filter((l) => l !== listener)
  }
}

function getEnabledSnapshot() {
  return enabledSnapshot
}

function notifyEnabled() {
  enabledSnapshot = getEnabledIds()
  enabledListeners.forEach((l) => l())
}

// ---- External store: custom times ----

let timesListeners: (() => void)[] = []
let timesSnapshot: CustomTimesMap = getCustomTimesMap()

function subscribeTimes(listener: () => void) {
  timesListeners = [...timesListeners, listener]
  return () => {
    timesListeners = timesListeners.filter((l) => l !== listener)
  }
}

function getTimesSnapshot() {
  return timesSnapshot
}

function notifyTimes() {
  timesSnapshot = getCustomTimesMap()
  timesListeners.forEach((l) => l())
}

// ---- Public API: enabled ----

export function toggleReminder(id: string) {
  const ids = getEnabledIds()
  if (ids.includes(id)) {
    saveEnabledIds(ids.filter((i) => i !== id))
  } else {
    saveEnabledIds([...ids, id])
  }
  notifyEnabled()
}

export function enableAll() {
  saveEnabledIds(REMINDERS.map((r) => r.id))
  notifyEnabled()
}

export function disableAll() {
  saveEnabledIds([])
  notifyEnabled()
}

// ---- Public API: custom times ----

/** Set custom times for a single reminder. Pass `null` to reset to defaults. */
export function setCustomTimes(id: string, times: string[] | null) {
  const map = getCustomTimesMap()
  const validTimes = times?.filter((time) => VALID_TIME_PATTERN.test(time)) ?? []
  if (!reminderIds.has(id) || validTimes.length === 0) {
    delete map[id]
  } else {
    map[id] = [...new Set(validTimes)]
  }
  saveCustomTimesMap(map)
  notifyTimes()
}

// ---- Browser notifications ----

function getNotifEnabled(): boolean {
  try {
    return localStorage.getItem(NOTIF_KEY) === 'true'
  } catch {
    return false
  }
}

function saveNotifEnabled(enabled: boolean) {
  try {
    localStorage.setItem(NOTIF_KEY, String(enabled))
  } catch {
    // Notifications remain disabled when the preference cannot be persisted.
  }
}

let notifListeners: (() => void)[] = []
let notifSnapshot: boolean = getNotifEnabled()

function subscribeNotif(listener: () => void) {
  notifListeners = [...notifListeners, listener]
  return () => { notifListeners = notifListeners.filter((l) => l !== listener) }
}

function getNotifSnapshot() { return notifSnapshot }

function notifyNotifListeners() {
  notifSnapshot = getNotifEnabled()
  notifListeners.forEach((l) => l())
}

/** Request permission and enable browser notifications. Returns true if granted. */
export async function enableBrowserNotifications(): Promise<boolean> {
  if (!('Notification' in window)) return false
  const result = await Notification.requestPermission()
  const granted = result === 'granted'
  if (granted) {
    await ensureServiceWorkerRegistration()
  }
  saveNotifEnabled(granted)
  notifyNotifListeners()
  return granted
}

export function disableBrowserNotifications() {
  saveNotifEnabled(false)
  notifyNotifListeners()
}

export async function getBrowserNotificationStatus(): Promise<BrowserNotificationStatus> {
  const serviceWorkerSupported = 'serviceWorker' in navigator
  const registration = serviceWorkerSupported ? await getReadyServiceWorkerRegistration() : null

  return {
    supported: 'Notification' in window,
    enabled: getNotifEnabled(),
    permission: 'Notification' in window ? Notification.permission : 'unsupported',
    serviceWorkerSupported,
    serviceWorkerControlled: Boolean(serviceWorkerSupported && navigator.serviceWorker.controller),
    serviceWorkerReady: Boolean(registration?.active),
    standalone: isStandaloneDisplayMode(),
  }
}

export async function ensureServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null
  // Mirror the guard from main.tsx: avoid registering the SW in dev unless running as an installed PWA,
  // which would intercept Vite HMR fetches and serve stale cached assets.
  if (!import.meta.env.PROD && !isStandaloneDisplayMode()) return null
  try {
    const existing = await navigator.serviceWorker.getRegistration()
    if (existing) return existing
    return await navigator.serviceWorker.register('/sw.js')
  } catch {
    return null
  }
}

/** Send a native browser notification if enabled and permission granted.
 *  ServiceWorker.showNotification is preferred for installed PWAs; if no
 *  service worker becomes ready quickly, fall back to the Notification API.
 */
export async function sendBrowserNotification(
  title: string,
  body: string,
  href?: string,
): Promise<BrowserNotificationResult> {
  if (!getNotifEnabled()) return { ok: false, reason: 'disabled' }
  if (!('Notification' in window)) return { ok: false, reason: 'unsupported' }
  if (Notification.permission !== 'granted') return { ok: false, reason: Notification.permission }

  const notificationHref = href ? new URL(href, window.location.origin).href : window.location.origin
  const options: NotificationOptions = {
    body,
    icon: '/icon-192.png',
    badge: '/favicon-32x32.png',
    tag: href ? `prayer-reminder:${href}` : 'prayer-reminder',
    data: { href: notificationHref },
  }

  const registration = await getReadyServiceWorkerRegistration()
  if (registration?.active) {
    try {
      await registration.showNotification(title, options)
      return { ok: true, channel: 'service-worker' }
    } catch {
      // Fall through to Notification API.
    }
  }

  try {
    new Notification(title, options)
    return { ok: true, channel: 'notification-api' }
  } catch {
    return { ok: false, reason: 'blocked' }
  }
}

function isStandaloneDisplayMode(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia?.('(display-mode: standalone)').matches || nav.standalone === true
}

async function getReadyServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null

  try {
    let timerId: ReturnType<typeof window.setTimeout> | undefined
    // Race navigator.serviceWorker.ready (resolves when SW is active) against a
    // timeout. If the SW is not ready in time we fall back to getRegistration(),
    // which returns whatever is currently installed even if not yet activated.
    const ready = await Promise.race<ServiceWorkerRegistration | null>([
      navigator.serviceWorker.ready,
      new Promise((resolve) => {
        timerId = window.setTimeout(() => resolve(null), SW_READY_TIMEOUT_MS)
      }),
    ])
    window.clearTimeout(timerId)
    if (ready) return ready
    return (await navigator.serviceWorker.getRegistration()) ?? null
  } catch {
    return null
  }
}

// ---- Reset all ----

/** Reset everything to defaults: disable all reminders, clear custom times and browser notifications. */
export function resetAll() {
  saveEnabledIds([])
  saveCustomTimesMap({})
  saveNotifEnabled(false)
  notifyEnabled()
  notifyTimes()
  notifyNotifListeners()
}

// ---- Hooks ----

/** Returns the list of currently enabled reminder IDs. */
export function useEnabledReminders(): string[] {
  return useSyncExternalStore(subscribeEnabled, getEnabledSnapshot)
}

/** Returns true if at least one reminder is enabled. */
export function useHasAnyReminder(): boolean {
  const ids = useEnabledReminders()
  return ids.length > 0
}

/** Returns the custom times map (reminderId → string[]). */
export function useCustomTimes(): CustomTimesMap {
  return useSyncExternalStore(subscribeTimes, getTimesSnapshot)
}

/** Returns whether browser notifications are enabled. */
export function useBrowserNotifications(): boolean {
  return useSyncExternalStore(subscribeNotif, getNotifSnapshot)
}

/** Returns the effective times for a reminder (custom or default). */
export function getEffectiveTimes(id: string, customMap: CustomTimesMap): string[] {
  if (customMap[id] && customMap[id].length > 0) return customMap[id]
  const reminder = REMINDERS.find((r) => r.id === id)
  return reminder?.times ?? []
}
