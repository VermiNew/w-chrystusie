import { Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa6'

export default function NotFoundPage() {
  return (
    <div className="page not-found">
      <h1>404</h1>
      <p>Strona, której szukasz, nie została odnaleziona.</p>
      <Link to="/" className="not-found-link"><FaArrowLeft /> Wróć na stronę główną</Link>
    </div>
  )
}
