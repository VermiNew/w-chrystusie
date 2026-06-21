const canVibrate = () =>
  typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'

export function hapticLight() {
  if (canVibrate()) navigator.vibrate(10)
}

export function hapticMedium() {
  if (canVibrate()) navigator.vibrate(20)
}
