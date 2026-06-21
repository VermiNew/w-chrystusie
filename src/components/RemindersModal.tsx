import { useEffect, useRef, useState, useCallback } from 'react'
import { FaBell, FaXmark, FaCircleInfo, FaPlus, FaTrash, FaArrowRotateLeft, FaGlobe } from 'react-icons/fa6'
import { REMINDERS } from '../data/reminders'
import {
  useEnabledReminders,
  useCustomTimes,
  getEffectiveTimes,
  getBrowserNotificationStatus,
  toggleReminder,
  enableAll,
  disableAll,
  resetAll,
  setCustomTimes,
  useBrowserNotifications,
  enableBrowserNotifications,
  disableBrowserNotifications,
  sendBrowserNotification,
  type BrowserNotificationStatus,
} from '../data/useReminders'

interface Props {
  open: boolean
  onClose: () => void
}

const CLOSE_DURATION_MS = 250

export default function RemindersModal({ open, onClose }: Props) {
  const enabledIds = useEnabledReminders()
  const customTimesMap = useCustomTimes()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [closing, setClosing] = useState(false)
  const [notificationStatus, setNotificationStatus] = useState<BrowserNotificationStatus | null>(null)
  const [testStatus, setTestStatus] = useState<string | null>(null)
  const [testingNotification, setTestingNotification] = useState(false)
  const notifTogglingRef = useRef(false)

  const allEnabled = REMINDERS.length > 0 && REMINDERS.every((r) => enabledIds.includes(r.id))
  const browserNotif = useBrowserNotifications()
  const notifSupported = 'Notification' in window

  const refreshNotificationStatus = useCallback(() => {
    void getBrowserNotificationStatus().then(setNotificationStatus)
  }, [])

  const handleClose = useCallback(() => {
    if (closing) return
    setClosing(true)
    closeTimerRef.current = setTimeout(() => {
      dialogRef.current?.close()
      setClosing(false)
      onClose()
    }, CLOSE_DURATION_MS)
  }, [closing, onClose])

  // Open dialog when `open` becomes true
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
        setClosing(false)
      }
      if (!dialog.open) dialog.showModal()
      refreshNotificationStatus()
      setTestStatus(null)
    }
  }, [open, refreshNotificationStatus])

  useEffect(() => {
    if (!open) return
    const refresh = () => refreshNotificationStatus()
    document.addEventListener('visibilitychange', refresh)
    navigator.serviceWorker?.addEventListener('controllerchange', refresh)
    return () => {
      document.removeEventListener('visibilitychange', refresh)
      navigator.serviceWorker?.removeEventListener('controllerchange', refresh)
    }
  }, [open, refreshNotificationStatus])

  // Close on backdrop click
  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) handleClose()
  }

  // Close on Escape — prevent native close, run animated close instead
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handle = (e: Event) => {
      e.preventDefault()
      handleClose()
    }
    dialog.addEventListener('cancel', handle)
    return () => dialog.removeEventListener('cancel', handle)
  }, [handleClose])

  const handleTimeChange = (id: string, index: number, value: string) => {
    const current = getEffectiveTimes(id, customTimesMap)
    const updated = [...current]
    updated[index] = value
    setCustomTimes(id, updated)
  }

  const handleAddTime = (id: string) => {
    const current = getEffectiveTimes(id, customTimesMap)
    setCustomTimes(id, [...current, '12:00'])
  }

  const handleRemoveTime = (id: string, index: number) => {
    const current = getEffectiveTimes(id, customTimesMap)
    if (current.length <= 1) return
    setCustomTimes(id, current.filter((_, i) => i !== index))
  }

  const handleBrowserNotificationsChange = async () => {
    if (notifTogglingRef.current) return
    notifTogglingRef.current = true
    setTestStatus(null)
    try {
      if (browserNotif) {
        disableBrowserNotifications()
        refreshNotificationStatus()
      } else {
        const granted = await enableBrowserNotifications()
        if (!granted) {
          setTestStatus('Brak zgody na powiadomienia.')
          refreshNotificationStatus()
          return
        }
        // Wait for the SW to become active before reading status — avoids a false
        // "inactive" state immediately after a fresh registration.
        const reg = await navigator.serviceWorker?.getRegistration()
        const worker = reg?.installing ?? reg?.waiting
        if (worker) {
          await new Promise<void>((resolve) => {
            const onStateChange = () => {
              if (worker.state === 'activated' || worker.state === 'redundant') {
                worker.removeEventListener('statechange', onStateChange)
                resolve()
              }
            }
            worker.addEventListener('statechange', onStateChange)
          })
        }
        refreshNotificationStatus()
      }
    } finally {
      notifTogglingRef.current = false
    }
  }

  const handleTestNotification = async () => {
    setTestingNotification(true)
    setTestStatus(null)
    const result = await sendBrowserNotification(
      'Test powiadomień',
      'Powiadomienia w aplikacji działają.',
      '/modlitwy',
    )
    setTestingNotification(false)
    setTestStatus(result.ok ? 'Wysłano testowe powiadomienie.' : 'Nie udało się wysłać powiadomienia.')
    refreshNotificationStatus()
  }

  const permissionLabel = !notificationStatus
    ? 'sprawdzanie…'
    : notificationStatus.permission === 'granted'
      ? 'zgoda'
      : notificationStatus.permission === 'denied'
        ? 'zablokowane'
        : notificationStatus.permission === 'default'
          ? 'nieustawione'
          : 'brak wsparcia'
  const serviceWorkerLabel = !notificationStatus
    ? 'sprawdzanie…'
    : notificationStatus.serviceWorkerReady ? 'aktywny' : 'nieaktywny'
  const pwaLabel = !notificationStatus ? 'sprawdzanie…' : notificationStatus.standalone ? 'tak' : 'nie'

  return (
    <dialog
      ref={dialogRef}
      className={`reminders-dialog${closing ? ' reminders-dialog--closing' : ''}`}
      onClick={handleDialogClick}
    >
      <div className="reminders-dialog-inner">
        <header className="reminders-dialog-header">
          <h2 className="reminders-dialog-title"><FaBell /> Przypomnienia o modlitwie</h2>
          <button className="reminders-dialog-close" onClick={handleClose} aria-label="Zamknij">
            <FaXmark />
          </button>
        </header>

        <p className="reminders-dialog-desc">
          Włącz przypomnienia, które pojawią się na ekranie gdy aplikacja jest otwarta.
        </p>

        <div className="reminders-bulk-actions">
          <button
            className="reminders-bulk-btn"
            onClick={allEnabled ? disableAll : enableAll}
          >
            {allEnabled ? 'Wyłącz wszystkie' : 'Włącz wszystkie'}
          </button>
          <button
            className="reminders-bulk-btn reminders-bulk-btn--reset"
            onClick={resetAll}
          >
            <FaArrowRotateLeft /> Resetuj
          </button>
        </div>

        {notifSupported && (
          <label className="reminders-notif-row" htmlFor="browser-notif-toggle">
            <div className="reminders-notif-info">
              <FaGlobe />
              <span>Powiadomienia przeglądarki</span>
            </div>
            <span className={`reminders-toggle${browserNotif ? ' reminders-toggle--on' : ''}`}>
              <span className="reminders-toggle-thumb" />
            </span>
            <input
              type="checkbox"
              id="browser-notif-toggle"
              className="reminders-item-checkbox"
              checked={browserNotif}
              disabled={notifTogglingRef.current}
              onChange={handleBrowserNotificationsChange}
            />
          </label>
        )}

        {notifSupported && (
          <div className="reminders-notif-diagnostics">
            <div className="reminders-notif-status-grid">
              <span>Zgoda: {permissionLabel}</span>
              <span>Service worker: {serviceWorkerLabel}</span>
              <span>PWA: {pwaLabel}</span>
            </div>
            <button
              className="reminders-test-btn"
              onClick={handleTestNotification}
              disabled={!browserNotif || testingNotification || notificationStatus?.permission !== 'granted'}
            >
              {testingNotification ? 'Wysyłanie…' : 'Wyślij test'}
            </button>
            {testStatus && <p className="reminders-test-status">{testStatus}</p>}
          </div>
        )}

        <ul className="reminders-list">
          {REMINDERS.map((reminder) => {
            const isEnabled = enabledIds.includes(reminder.id)
            const times = getEffectiveTimes(reminder.id, customTimesMap)
            return (
              <li key={reminder.id} className="reminders-item">
                <label className="reminders-item-label" htmlFor={`reminder-${reminder.id}`}>
                  <div className="reminders-item-info">
                    <span className="reminders-item-name">{reminder.label}</span>
                    <span className="reminders-item-desc">{reminder.description}</span>
                  </div>
                  <span className={`reminders-toggle${isEnabled ? ' reminders-toggle--on' : ''}`}>
                    <span className="reminders-toggle-thumb" />
                  </span>
                  <input
                    type="checkbox"
                    id={`reminder-${reminder.id}`}
                    className="reminders-item-checkbox"
                    checked={isEnabled}
                    onChange={() => toggleReminder(reminder.id)}
                  />
                </label>
                <div className="reminders-item-times-edit">
                  {times.map((time, i) => (
                    <div key={i} className="reminders-time-row">
                      <input
                        type="time"
                        className="reminders-time-input"
                        value={time}
                        onChange={(e) => handleTimeChange(reminder.id, i, e.target.value)}
                      />
                      {times.length > 1 && (
                        <button
                          className="reminders-time-remove"
                          onClick={() => handleRemoveTime(reminder.id, i)}
                          aria-label="Usuń godzinę"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    className="reminders-time-add"
                    onClick={() => handleAddTime(reminder.id)}
                  >
                    <FaPlus /> Dodaj godzinę
                  </button>
                </div>
              </li>
            )
          })}
        </ul>

        <p className="reminders-dialog-note">
          <FaCircleInfo /> Przypomnienia lokalne działają gdy aplikacja jest otwarta. Powiadomienia przeglądarki używają service workera w PWA, a gdy aplikacja jest całkowicie zamknięta, wymagają Web Push z serwerem.
        </p>
      </div>
    </dialog>
  )
}
