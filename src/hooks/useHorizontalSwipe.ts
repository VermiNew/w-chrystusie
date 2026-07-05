import { useCallback, useRef, type PointerEventHandler } from 'react'

const MIN_SWIPE_DISTANCE = 56
const DIRECTION_RATIO = 1.25

interface SwipeStart {
  pointerId: number
  x: number
  y: number
}

interface HorizontalSwipeHandlers {
  onPointerDown: PointerEventHandler<HTMLElement>
  onPointerUp: PointerEventHandler<HTMLElement>
  onPointerCancel: PointerEventHandler<HTMLElement>
}

export function useHorizontalSwipe(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
): HorizontalSwipeHandlers {
  const swipeStart = useRef<SwipeStart | null>(null)

  const handlePointerDown = useCallback<PointerEventHandler<HTMLElement>>((event) => {
    if (!event.isPrimary || event.pointerType === 'mouse') return

    swipeStart.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }, [])

  const handlePointerUp = useCallback<PointerEventHandler<HTMLElement>>((event) => {
    const start = swipeStart.current
    swipeStart.current = null
    if (!start || start.pointerId !== event.pointerId) return

    const horizontalDistance = event.clientX - start.x
    const verticalDistance = event.clientY - start.y
    const isHorizontalSwipe = (
      Math.abs(horizontalDistance) >= MIN_SWIPE_DISTANCE
      && Math.abs(horizontalDistance) > Math.abs(verticalDistance) * DIRECTION_RATIO
    )

    // A clear horizontal advantage keeps ordinary vertical prayer scrolling native.
    if (!isHorizontalSwipe) return
    if (horizontalDistance < 0) onSwipeLeft()
    else onSwipeRight()
  }, [onSwipeLeft, onSwipeRight])

  const handlePointerCancel = useCallback<PointerEventHandler<HTMLElement>>(() => {
    swipeStart.current = null
  }, [])

  return {
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerCancel,
  }
}
