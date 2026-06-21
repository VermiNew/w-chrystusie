import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaBell } from 'react-icons/fa6'
import { REMINDERS } from '../data/reminders'
import { useEnabledReminders, useCustomTimes, getEffectiveTimes, sendBrowserNotification } from '../data/useReminders'

interface ActiveToast {
  reminderId: string
  label: string
  href?: string
}

/** Interval (ms) at which we check the current time. */
const CHECK_INTERVAL_MS = 10_000

function nowTimeKey(): { hhmm: string; date: string } {
  const now = new Date()
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return { hhmm, date }
}

export default function ReminderToast() {
  const enabledIds = useEnabledReminders()
  const customTimesMap = useCustomTimes()
  const navigate = useNavigate()
  const [toast, setToast] = useState<ActiveToast | null>(null)
  const [visible, setVisible] = useState(false)
  // Tracks fired reminders as "reminderId@YYYY-MM-DD@HH:MM" keys.
  // The date component ensures each reminder fires at most once per calendar day.
  const firedRef = useRef<Set<string>>(new Set())

  const dismiss = useCallback(() => {
    setVisible(false)
    setTimeout(() => setToast(null), 400)
  }, [])

  const goToPrayer = useCallback(
    (href: string) => {
      navigate(href)
      dismiss()
    },
    [navigate, dismiss],
  )

  useEffect(() => {
    if (enabledIds.length === 0) return

    const tick = () => {
      const { hhmm, date } = nowTimeKey()

      for (const reminder of REMINDERS) {
        if (!enabledIds.includes(reminder.id)) continue
        const times = getEffectiveTimes(reminder.id, customTimesMap)
        if (!times.includes(hhmm)) continue

        const fireKey = `${reminder.id}@${date}@${hhmm}`
        if (firedRef.current.has(fireKey)) continue

        firedRef.current.add(fireKey)
        setToast({ reminderId: reminder.id, label: reminder.label, href: reminder.href })
        setVisible(true)
        void sendBrowserNotification('Czas na modlitwę', reminder.label, reminder.href) // fire-and-forget
        break // show one toast at a time
      }
    }

    tick()
    const interval = setInterval(tick, CHECK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [enabledIds, customTimesMap])

  // Auto-dismiss after 30 s
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(dismiss, 30_000)
    return () => clearTimeout(timer)
  }, [visible, dismiss])

  if (!toast) return null

  return (
    <div className={`reminder-toast${visible ? ' reminder-toast--visible' : ''}`} role="alert">
      <div className="reminder-toast-icon"><FaBell /></div>
      <div className="reminder-toast-body">
        <p className="reminder-toast-title">Czas na modlitwę</p>
        <p className="reminder-toast-label">{toast.label}</p>
      </div>
      <div className="reminder-toast-actions">
        {toast.href && (
          <button
            className="reminder-toast-btn reminder-toast-btn--primary"
            onClick={() => { if (toast.href) goToPrayer(toast.href) }}
          >
            Otwórz
          </button>
        )}
        <button className="reminder-toast-btn" onClick={dismiss}>
          Zamknij
        </button>
      </div>
    </div>
  )
}
