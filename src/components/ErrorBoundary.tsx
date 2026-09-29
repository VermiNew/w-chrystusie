import { Component, type ErrorInfo, type ReactNode } from 'react'
import { FaArrowLeft, FaArrowRotateRight } from 'react-icons/fa6'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

// Browsers word a failed lazy chunk differently (Chrome, Safari, Firefox).
const CHUNK_ERROR_PATTERN = /dynamically imported module|Importing a module script failed|error loading dynamically imported module/i

/**
 * Keeps a rendering error on one page from blanking the whole app.
 * The header stays usable and the reader gets a way back.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Błąd renderowania strony:', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    const isChunkError = CHUNK_ERROR_PATTERN.test(error.message)

    return (
      <div className="page not-found" role="alert">
        <h1>Ups</h1>
        <p>
          {isChunkError
            ? 'Nie udało się wczytać tej części aplikacji. Sprawdź połączenie z internetem i odśwież stronę.'
            : 'Coś poszło nie tak podczas wyświetlania tej strony.'}
        </p>
        <p>
          {/* Plain links force a full reload, which also picks up a fresh app version. */}
          <a href={window.location.href} className="not-found-link"><FaArrowRotateRight /> Odśwież stronę</a>
        </p>
        <a href="/" className="not-found-link"><FaArrowLeft /> Wróć na stronę główną</a>
      </div>
    )
  }
}
