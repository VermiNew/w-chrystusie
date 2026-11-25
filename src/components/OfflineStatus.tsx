import { useCallback, useEffect, useState } from 'react'
import { FaArrowsRotate, FaCircleCheck, FaTriangleExclamation, FaWifi } from 'react-icons/fa6'
import {
  formatBytes,
  getOfflineStatus,
  getStorageInfo,
  isOfflineSupported,
  refreshOfflineCopy,
  type OfflineStatus as Status,
  type StorageInfo,
} from '../data/offlineCache'

type Phase = 'checking' | 'ready' | 'refreshing' | 'unsupported'

/**
 * Settings panel for the offline copy: shows whether the whole app
 * (every prayer, song, Bible book and the breviary) is stored on the device
 * and lets the user download it again by hand.
 */
export default function OfflineStatus() {
  const [phase, setPhase] = useState<Phase>('checking')
  const [status, setStatus] = useState<Status | null>(null)
  const [storage, setStorage] = useState<StorageInfo | null>(null)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [message, setMessage] = useState('')
  const [online, setOnline] = useState(() => navigator.onLine)

  const check = useCallback(async () => {
    setMessage('')
    if (!(await isOfflineSupported())) {
      setPhase('unsupported')
      return
    }
    setPhase('checking')
    const [nextStatus, nextStorage] = await Promise.all([getOfflineStatus(), getStorageInfo()])
    setStatus(nextStatus)
    setStorage(nextStorage)
    setPhase('ready')
    if (!nextStatus) setMessage('Nie udało się sprawdzić pamięci. Spróbuj ponownie za chwilę.')
  }, [])

  useEffect(() => {
    // Deferred, so the dialog opens first and the check never blocks it.
    const frame = requestAnimationFrame(() => void check())
    const update = () => setOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [check])

  const refresh = async () => {
    setPhase('refreshing')
    setMessage('')
    setProgress({ done: 0, total: status?.total ?? 0 })
    const nextStatus = await refreshOfflineCopy((done, total) => setProgress({ done, total }))
    setProgress(null)
    setStorage(await getStorageInfo())
    setPhase('ready')
    if (!nextStatus) {
      setMessage('Odświeżanie nie powiodło się. Sprawdź połączenie z internetem.')
      return
    }
    setStatus(nextStatus)
    setMessage(
      nextStatus.cached === nextStatus.total
        ? 'Gotowe — cała aplikacja została pobrana ponownie.'
        : 'Części plików nie udało się pobrać. Spróbuj ponownie z internetem.',
    )
  }

  const complete = status !== null && status.cached === status.total
  const percent = status && status.total > 0 ? Math.round((status.cached / status.total) * 100) : 0
  const progressPercent = progress && progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0

  if (phase === 'unsupported') {
    return (
      <section className="about-panel" aria-labelledby="offline-title">
        <h3 id="offline-title">Praca bez internetu</h3>
        <p>
          Ta przeglądarka nie zapisała jeszcze aplikacji do pracy offline. Odśwież stronę
          z internetem — kopia zapisze się sama w tle.
        </p>
      </section>
    )
  }

  return (
    <section className="about-panel" aria-labelledby="offline-title">
      <h3 id="offline-title">Praca bez internetu</h3>
      <p>
        Po pierwszym wejściu cała aplikacja — modlitwy, pieśni, Pismo Święte i brewiarz —
        zapisuje się na tym urządzeniu i działa bez internetu.
      </p>

      <div className={`offline-card${complete ? ' offline-card--ok' : ''}`} aria-live="polite">
        <div className="offline-card-head">
          {phase === 'checking' && <span className="offline-card-title">Sprawdzam…</span>}
          {phase === 'refreshing' && (
            <span className="offline-card-title">
              <FaArrowsRotate className="offline-spin" aria-hidden="true" /> Pobieranie… {progressPercent}%
            </span>
          )}
          {phase === 'ready' && status && (
            <span className="offline-card-title">
              {complete
                ? <><FaCircleCheck aria-hidden="true" /> Gotowe do pracy offline</>
                : <><FaTriangleExclamation aria-hidden="true" /> Pobrano {percent}%</>}
            </span>
          )}
          <span className={`offline-net${online ? '' : ' offline-net--off'}`}>
            <FaWifi aria-hidden="true" /> {online ? 'Online' : 'Offline'}
          </span>
        </div>

        <div
          className="offline-bar"
          role="progressbar"
          aria-label="Zapisane pliki"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={phase === 'refreshing' ? progressPercent : percent}
        >
          <span style={{ width: `${phase === 'refreshing' ? progressPercent : percent}%` }} />
        </div>

        {status && (
          <dl className="offline-facts">
            <div><dt>Pliki</dt><dd>{status.cached} / {status.total}</dd></div>
            {storage?.usedBytes != null && <div><dt>Zajęte miejsce</dt><dd>{formatBytes(storage.usedBytes)}</dd></div>}
            {storage?.persisted != null && (
              <div><dt>Ochrona przed usunięciem</dt><dd>{storage.persisted ? 'włączona' : 'wyłączona'}</dd></div>
            )}
            <div><dt>Wersja</dt><dd>{status.version}</dd></div>
          </dl>
        )}
      </div>

      <div className="about-actions">
        <button type="button" className="about-button" onClick={() => void check()} disabled={phase !== 'ready'}>
          <FaCircleCheck aria-hidden="true" /> Sprawdź stan
        </button>
        <button
          type="button"
          className="about-button about-button--primary"
          onClick={() => void refresh()}
          disabled={phase !== 'ready' || !online}
          title={online ? undefined : 'Potrzebny jest internet'}
        >
          <FaArrowsRotate aria-hidden="true" /> Odśwież
        </button>
      </div>
      {message && <p className="about-status" role="status">{message}</p>}
    </section>
  )
}
