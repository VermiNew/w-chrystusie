import { useEffect } from 'react'

export function useScreenWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) return

    let disposed = false
    let requesting = false
    let sentinel: WakeLockSentinel | null = null

    const acquire = async () => {
      if (
        disposed
        || requesting
        || sentinel
        || document.visibilityState !== 'visible'
      ) return

      requesting = true

      try {
        const nextSentinel = await navigator.wakeLock.request('screen')

        if (disposed) {
          await nextSentinel.release()
          return
        }

        sentinel = nextSentinel
        nextSentinel.addEventListener('release', () => {
          if (sentinel === nextSentinel) sentinel = null
        }, { once: true })
      } catch {
        // Power-saving settings and browser policy may reject the request.
      } finally {
        requesting = false
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') void acquire()
    }

    void acquire()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      disposed = true
      document.removeEventListener('visibilitychange', handleVisibilityChange)

      const activeSentinel = sentinel
      sentinel = null
      if (activeSentinel && !activeSentinel.released) void activeSentinel.release()
    }
  }, [enabled])
}
