import { FaArrowUpRightFromSquare } from 'react-icons/fa6'
import {
  findContentSourceByUrl,
  getSourceDisplayName,
} from '../data/sources'

interface SourceAttributionLinkProps {
  url: string
}

export default function SourceAttributionLink({ url }: SourceAttributionLinkProps) {
  const source = findContentSourceByUrl(url)
  const displayName = getSourceDisplayName(url)

  return (
    <a
      className="source-link content-source-link"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {source && (
        <img
          className={source.wideLogo ? 'content-source-logo content-source-logo--wide' : 'content-source-logo'}
          src={source.logo}
          width="32"
          height="32"
          alt=""
          aria-hidden="true"
        />
      )}
      <span className="content-source-copy">
        <small>Źródło</small>
        <strong>{displayName}</strong>
      </span>
      <FaArrowUpRightFromSquare aria-hidden="true" />
    </a>
  )
}
