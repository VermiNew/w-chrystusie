import { useState } from 'react'
import Markdown from 'react-markdown'
import { songs, type Song } from '../data/songs'

export default function SongbookPage() {
  const [selected, setSelected] = useState<Song | null>(null)

  if (selected) {
    return (
      <div className="page">
        <button className="back-button" onClick={() => setSelected(null)}>
          ← Powrót do listy
        </button>
        <h1>{selected.title}</h1>
        <div className="song-text">
          <Markdown>{selected.body}</Markdown>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>Śpiewnik</h1>
      <ul className="song-list">
        {songs.map((song) => (
          <li key={song.id}>
            <button className="song-item" onClick={() => setSelected(song)}>
              {song.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
