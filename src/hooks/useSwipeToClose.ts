import { useEffect, useRef, type RefObject } from 'react'

const CLOSE_DISTANCE_PX = 90
const CLOSE_VELOCITY_PX_PER_MS = 0.6
// Below this distance the gesture is still treated as a possible tap or scroll.
const DRAG_START_PX = 8

/** Nearest element between `target` and `root` that is scrolled down, if any. */
function findScrolledAncestor(target: Element, root: HTMLElement) {
  for (let element: Element | null = target; element && element !== root.parentElement; element = element.parentElement) {
    if (element.scrollTop > 0) return element
  }
  return null
}

/**
 * Lets the user close a modal on a phone by dragging it down with a finger.
 * The dialog follows the finger; released far or fast enough it closes,
 * otherwise it springs back. Content that is scrolled down keeps scrolling
 * instead, and sliders/text fields keep their own gestures.
 */
export function useSwipeToClose(dialogRef: RefObject<HTMLDialogElement | null>, open: boolean, onClose: () => void) {
  // A ref, so a new onClose (it changes while the closing animation runs) does not
  // re-attach the listeners and reset the dragged position mid-animation.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !open) return

    let startY = 0
    let startTime = 0
    let offset = 0
    let tracking = false
    let dragging = false

    const reset = () => {
      dialog.style.transition = 'transform 0.2s ease'
      dialog.style.transform = ''
    }

    const handleTouchStart = (event: TouchEvent) => {
      const target = event.target as Element
      tracking = event.touches.length === 1
        && !target.closest('input, textarea, select, [data-no-swipe]')
        && !findScrolledAncestor(target, dialog)
      dragging = false
      offset = 0
      startY = event.touches[0].clientY
      startTime = performance.now()
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (!tracking) return
      const distance = event.touches[0].clientY - startY
      if (!dragging) {
        // Moving up means scrolling the content, not closing.
        if (distance < -DRAG_START_PX) {
          tracking = false
          return
        }
        if (distance < DRAG_START_PX) return
        dragging = true
        dialog.style.transition = 'none'
      }
      offset = Math.max(0, distance - DRAG_START_PX)
      dialog.style.transform = `translateY(${offset}px)`
      // Stop the page behind (or the content) from scrolling while dragging.
      if (event.cancelable) event.preventDefault()
    }

    const handleTouchEnd = () => {
      if (!tracking || !dragging) {
        tracking = false
        return
      }
      tracking = false
      dragging = false
      const velocity = offset / Math.max(1, performance.now() - startTime)
      if (offset > CLOSE_DISTANCE_PX || velocity > CLOSE_VELOCITY_PX_PER_MS) {
        // Keep the dragged position; the closing animation fades it out from there.
        onCloseRef.current()
        return
      }
      reset()
    }

    dialog.addEventListener('touchstart', handleTouchStart, { passive: true })
    // Not passive: preventDefault stops scrolling while the dialog is dragged.
    dialog.addEventListener('touchmove', handleTouchMove, { passive: false })
    dialog.addEventListener('touchend', handleTouchEnd)
    dialog.addEventListener('touchcancel', handleTouchEnd)

    return () => {
      dialog.removeEventListener('touchstart', handleTouchStart)
      dialog.removeEventListener('touchmove', handleTouchMove)
      dialog.removeEventListener('touchend', handleTouchEnd)
      dialog.removeEventListener('touchcancel', handleTouchEnd)
      dialog.style.transition = ''
      dialog.style.transform = ''
    }
  }, [dialogRef, open])
}
