import { useSyncExternalStore } from 'react'
import { REMINDERS } from './reminders'

const STORAGE_KEY = 'prayer-reminders'
const TIMES_STORAGE_KEY = 'prayer-reminders-times'
const NOTIF_KEY = 'prayer-reminders-notif'

// ---- Storage helpers ----

function getEnabledIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveEnabledIds(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

type CustomTimesMap = Record<string, string[]>

function getCustomTimesMap(): CustomTimesMap {
  try {
    return JSON.parse(localStorage.getItem(TIMES_STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveCustomTimesMap(map: CustomTimesMap) {
  localStorage.setItem(TIMES_STORAGE_KEY, JSON.stringify(map))
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
  if (times === null) {
    delete map[id]
  } else {
    map[id] = times
  }
  saveCustomTimesMap(map)
  notifyTimes()
}

// ---- Browser notifications ----

function getNotifEnabled(): boolean {
  return localStorage.getItem(NOTIF_KEY) === 'true'
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
  localStorage.setItem(NOTIF_KEY, String(granted))
  notifyNotifListeners()
  return granted
}

export function disableBrowserNotifications() {
  localStorage.setItem(NOTIF_KEY, 'false')
  notifyNotifListeners()
}

/** Send a native browser notification if enabled and permission granted. */
export function sendBrowserNotification(title: string, body: string) {
  if (!getNotifEnabled()) return
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  new Notification(title, { body, icon: '/cross.svg' })
}

// ---- Reset all ----

/** Reset everything to defaults: disable all reminders, clear custom times and browser notifications. */
export function resetAll() {
  saveEnabledIds([])
  saveCustomTimesMap({})
  localStorage.setItem(NOTIF_KEY, 'false')
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
