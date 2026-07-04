import { FaArrowLeft, FaArrowRotateRight, FaHandsPraying } from 'react-icons/fa6'

interface PrayerCompletionProps {
  message: string
  exitLabel: string
  onRepeat: () => void
  onExit: () => void
}

export default function PrayerCompletion({
  message,
  exitLabel,
  onRepeat,
  onExit,
}: PrayerCompletionProps) {
  return (
    <div className="page prayer-completion-page">
      <section className="prayer-completion" aria-labelledby="prayer-completion-title">
        <span className="prayer-completion-icon" aria-hidden="true">
          <FaHandsPraying />
        </span>
        <p className="prayer-completion-eyebrow">Modlitwa zakończona</p>
        <h1 id="prayer-completion-title">Amen</h1>
        <p className="prayer-completion-message">{message}</p>
        <p className="prayer-completion-silence">
          Zostań jeszcze przez chwilę w ciszy. Podziękuj Bogu i powierz Mu to,
          co pozostało w Twoim sercu.
        </p>
        <div className="prayer-completion-actions">
          <button className="prayer-completion-button prayer-completion-button--primary" onClick={onRepeat}>
            <FaArrowRotateRight aria-hidden="true" />
            <span>Odmów ponownie</span>
          </button>
          <button className="prayer-completion-button" onClick={onExit}>
            <FaArrowLeft aria-hidden="true" />
            <span>{exitLabel}</span>
          </button>
        </div>
      </section>
    </div>
  )
}
