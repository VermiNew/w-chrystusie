import { useRef, useState, type ChangeEvent } from 'react'
import { FaDownload, FaUpload } from 'react-icons/fa6'
import { backupFileName, createBackup, parseBackup, restoreBackup, type BackupParseResult } from '../data/backup'
import { pluralPl } from '../data/plural'

type PendingRestore = Extract<BackupParseResult, { ok: true }>

const formatEntries = (count: number) => `${count} ${pluralPl(count, 'pozycja', 'pozycje', 'pozycji')}`

const formatExportDate = (iso: string) => {
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? 'nieznanej daty'
    : date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
}

/**
 * Saves and restores favorites, history, reading progress, reminders and
 * settings as a JSON file. Works offline: nothing leaves the device.
 */
export default function DataBackup() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState('')
  const [pending, setPending] = useState<PendingRestore | null>(null)

  const saveBackup = () => {
    const backup = createBackup()
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = backupFileName()
    link.click()
    URL.revokeObjectURL(url)
    setPending(null)
    setStatus(`Zapisano kopię: ${formatEntries(Object.keys(backup.data).length)}.`)
  }

  const chooseFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const result = parseBackup(await file.text())
    if (!result.ok) {
      setPending(null)
      setStatus(result.reason)
      return
    }
    setStatus('')
    setPending(result)
  }

  const confirmRestore = () => {
    if (!pending) return
    if (!restoreBackup(pending.backup)) {
      setPending(null)
      setStatus('Nie udało się zapisać danych — pamięć przeglądarki jest niedostępna.')
      return
    }
    // Every store reads its data on start, so a reload shows the restored state everywhere.
    window.location.reload()
  }

  return (
    <section className="about-data" aria-labelledby="about-data-title">
      <h3 id="about-data-title">Twoje dane</h3>
      <p>
        Ulubione, historia, postęp czytania, przypomnienia i ustawienia są zapisane tylko
        w tej przeglądarce. Zapisz kopię, aby przenieść je na inne urządzenie.
      </p>
      <div className="about-data-actions">
        <button type="button" className="about-sources-link" onClick={saveBackup}>
          <FaDownload aria-hidden="true" /> Zapisz kopię
        </button>
        <button type="button" className="about-sources-link" onClick={() => fileInputRef.current?.click()}>
          <FaUpload aria-hidden="true" /> Wczytaj kopię
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(event) => void chooseFile(event)}
        />
      </div>
      {pending && (
        <div className="about-data-confirm" role="alertdialog" aria-labelledby="about-data-confirm-text">
          <p id="about-data-confirm-text">
            Wczytać kopię z {formatExportDate(pending.backup.exportedAt)} ({formatEntries(pending.entryCount)})?
            Obecne dane w tej przeglądarce zostaną zastąpione.
          </p>
          <div className="about-data-actions">
            <button type="button" className="about-sources-link" onClick={confirmRestore}>Wczytaj</button>
            <button type="button" className="about-sources-link" onClick={() => setPending(null)}>Anuluj</button>
          </div>
        </div>
      )}
      {status && <p className="about-data-status" role="status">{status}</p>}
    </section>
  )
}
