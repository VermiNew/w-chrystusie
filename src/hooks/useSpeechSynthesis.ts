import { useCallback, useEffect, useRef, useState } from 'react'

export type SpeechStatus = 'idle' | 'speaking' | 'paused'

export function useSpeechSynthesis() {
  const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
  const [status, setStatus] = useState<SpeechStatus>('idle')
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const stop = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    utteranceRef.current = null
    setStatus('idle')
  }, [supported])

  const start = useCallback((text: string) => {
    if (!supported || !text) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const voices = window.speechSynthesis.getVoices()
    utterance.lang = 'pl-PL'
    utterance.voice = voices.find((voice) => voice.lang.toLowerCase() === 'pl-pl')
      ?? voices.find((voice) => voice.lang.toLowerCase().startsWith('pl'))
      ?? null
    utteranceRef.current = utterance

    utterance.onend = () => {
      if (utteranceRef.current !== utterance) return
      utteranceRef.current = null
      setStatus('idle')
    }
    utterance.onerror = () => {
      if (utteranceRef.current !== utterance) return
      utteranceRef.current = null
      setStatus('idle')
    }

    setStatus('speaking')
    window.speechSynthesis.speak(utterance)
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
