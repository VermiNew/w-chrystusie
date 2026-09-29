/**
 * Page-level shortcuts (← → Esc in the rosary and chaplet, Space/↑/↓/Esc in
 * reading mode) listen on window, so they must step aside when the key press
 * belongs to something else:
 * - modifier combinations, e.g. Alt+← is the browser's "back",
 * - typing in a form field or acting inside a dialog,
 * - while an open dialog, the mobile menu or a popover (font size) is
 *   waiting for its own Escape — otherwise closing it would also reset prayer progress.
 */
export function isPageShortcutBlocked(event: KeyboardEvent): boolean {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return true

  const target = event.target instanceof Element ? event.target : null
  if (target?.closest('input, textarea, select, [contenteditable="true"], dialog')) return true

  return document.querySelector('dialog[open], [aria-controls][aria-expanded="true"]') !== null
}
