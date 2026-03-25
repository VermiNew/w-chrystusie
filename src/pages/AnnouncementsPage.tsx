import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { FaThumbtack, FaChevronUp, FaChevronDown } from 'react-icons/fa6'
import { announcements } from '../data/announcements'

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function AnnouncementDetail({ id }: { id: string }) {
  const announcement = announcements.find((a) => a.id === id)
  if (!announcement) return <Navigate to="/ogloszenia" replace />

  return (
    <div className="page">
      <Link to="/ogloszenia" className="back-button">← Ogłoszenia</Link>
      <h1>{announcement.title}</h1>
      <p className="announcement-date">{formatDate(announcement.date)}</p>
      <div className="announcement-body">
        <ReactMarkdown>{announcement.body}</ReactMarkdown>
      </div>
    </div>
  )
}

function AnnouncementList() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const sorted = [...announcements].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  return (
    <div className="page">
      <h1>Ogłoszenia</h1>
      <div className="announcement-list">
        {sorted.map((a) => {
          const isExpanded = expandedId === a.id
          return (
            <article
              key={a.id}
              className={`announcement-card${a.pinned ? ' announcement-card--pinned' : ''}`}
            >
              <button
                className="announcement-card-header"
                onClick={() => setExpandedId(isExpanded ? null : a.id)}
                aria-expanded={isExpanded}
              >
                <div className="announcement-card-meta">
                  {a.pinned && (
                    <span className="announcement-pin">
                      <FaThumbtack size={12} /> Przypięte
                    </span>
                  )}
                  <span className="announcement-card-date">{formatDate(a.date)}</span>
                </div>
                <h2 className="announcement-card-title">{a.title}</h2>
                <span className="announcement-card-toggle">
                  {isExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                </span>
              </button>
              {isExpanded && (
                <div className="announcement-card-body">
                  <ReactMarkdown>{a.body}</ReactMarkdown>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default function AnnouncementsPage() {
  const { id } = useParams()
  if (id) return <AnnouncementDetail id={id} />
  return <AnnouncementList />
}
