import { useState, useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { FaThumbtack, FaChevronUp, FaChevronDown } from 'react-icons/fa6'
import { announcements } from '../data/announcements'
import { markAsRead, markAsUnread, useIsRead } from '../data/useReadAnnouncements'

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

  useEffect(() => {
    if (announcement) markAsRead(id)
  }, [id, announcement])

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

function AnnouncementCard({ id }: { id: string }) {
  const announcement = announcements.find((a) => a.id === id)!
  const [expanded, setExpanded] = useState(false)
  const isRead = useIsRead(id)

  const handleToggle = () => {
    if (!expanded) markAsRead(id)
    setExpanded(!expanded)
  }

  return (
    <article
      className={
        'announcement-card'
        + (announcement.pinned ? ' announcement-card--pinned' : '')
        + (!isRead ? ' announcement-card--unread' : '')
      }
    >
      <button
        className="announcement-card-header"
        onClick={handleToggle}
        aria-expanded={expanded}
      >
        <div className="announcement-card-meta">
          {announcement.pinned && (
            <span className="announcement-pin">
              <FaThumbtack size={12} /> Przypięte
            </span>
          )}
          {!isRead && <span className="announcement-unread-dot" />}
          <span className="announcement-card-date">{formatDate(announcement.date)}</span>
        </div>
        <h2 className="announcement-card-title">{announcement.title}</h2>
        <span className="announcement-card-toggle">
          {expanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
        </span>
      </button>
      {expanded && (
        <div className="announcement-card-body">
          <ReactMarkdown>{announcement.body}</ReactMarkdown>
          {isRead && (
            <button
              className="announcement-mark-unread"
              onClick={() => { markAsUnread(id); setExpanded(false) }}
            >
              Oznacz jako nieprzeczytane
            </button>
          )}
        </div>
      )}
    </article>
  )
}

function AnnouncementList() {
  const sorted = [...announcements].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  return (
    <div className="page">
      <h1>Ogłoszenia</h1>
      <div className="announcement-list">
        {sorted.map((a) => (
          <AnnouncementCard key={a.id} id={a.id} />
        ))}
      </div>
    </div>
  )
}

export default function AnnouncementsPage() {
  const { id } = useParams()
  if (id) return <AnnouncementDetail id={id} />
  return <AnnouncementList />
}
