import { useCallback, useEffect, useRef, useState } from 'react'

export type SpeechStatus = 'idle' | 'speaking' | 'paused'

const MAX_CHUNK_LENGTH = 220

/**
 * Chrome silently stops a single long utterance after roughly 15 seconds, so the
 * text is spoken as a queue of short pieces: one per line (litany invocations,
 * verses) or sentence. A piece that is still too long is cut at commas/spaces.
 */
export function splitForSpeech(text: string): string[] {
  const pieces = text
    .split(/\n+|(?<=[.!?;:])\s+/)
    .map((piece) => piece.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  return pieces.flatMap((piece) => {
    if (piece.length <= MAX_CHUNK_LENGTH) return [piece]
    const chunks: string[] = []
    let current = ''
    for (const word of piece.split(' ')) {
      if (current && `${current} ${word}`.length > MAX_CHUNK_LENGTH) {
        chunks.push(current)
        current = word
      } else {
        current = current ? `${current} ${word}` : word
      }
    }
    if (current) chunks.push(current)
    return chunks
  })
}

export function useSpeechSynthesis() {
  const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
  const [status, setStatus] = useState<SpeechStatus>('idle')
  // Identifies the current reading; events from cancelled utterances are ignored.
  const sessionRef = useRef(0)

  const stop = useCallback(() => {
    if (!supported) return
    sessionRef.current += 1
    window.speechSynthesis.cancel()
    setStatus('idle')
  }, [supported])

  const start = useCallback((text: string) => {
    if (!supported) return
    const chunks = splitForSpeech(text)
    if (chunks.length === 0) return

    window.speechSynthesis.cancel()
    const session = ++sessionRef.current
    const voices = window.speechSynthesis.getVoices()
    const voice = voices.find((entry) => entry.lang.toLowerCase() === 'pl-pl')
      ?? voices.find((entry) => entry.lang.toLowerCase().startsWith('pl'))
      ?? null
    const finish = () => {
      if (sessionRef.current !== session) return
      sessionRef.current += 1
      setStatus('idle')
    }

    chunks.forEach((chunk, index) => {
      const utterance = new SpeechSynthesisUtterance(chunk)
      utterance.lang = 'pl-PL'
      utterance.voice = voice
      utterance.onerror = finish
      if (index === chunks.length - 1) utterance.onend = finish
      window.speechSynthesis.speak(utterance)
    })
    setStatus('speaking')
  }, [supported])

  const pause = useCallback(() => {
    if (!supported || status !== 'speaking') return
    window.speechSynthesis.pause()
    setStatus('paused')
  }, [status, supported])

  const resume = useCallback(() => {
    if (!supported || status !== 'paused') return
    window.speechSynthesis.resume()
    setStatus('speaking')
  }, [status, supported])

  useEffect(() => () => {
    if (supported) window.speechSynthesis.cancel()
  }, [supported])

  return { supported, status, start, pause, resume, stop }
}
