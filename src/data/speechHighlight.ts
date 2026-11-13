/**
 * Highlights the fragment that is currently read aloud.
 *
 * Uses the CSS Custom Highlight API, so the rendered Markdown is not modified
 * (no <span> wrapping). Each spoken chunk is looked up in the visible text of
 * the content element and turned into a DOM Range. Browsers without the API
 * still get the auto-scroll to the spoken fragment.
 */

const HIGHLIGHT_NAME = 'speech-current'

interface TextPosition {
  node: Text
  offset: number
}

const supportsHighlights = () => typeof CSS !== 'undefined'
  && 'highlights' in CSS
  && typeof Highlight !== 'undefined'

export interface SpeechHighlighter {
  /** Marks the chunk (as passed to speech synthesis) and scrolls it into view. */
  show: (chunk: string) => void
  clear: () => void
}

export function createSpeechHighlighter(root: HTMLElement): SpeechHighlighter {
  // Flattened visible text with collapsed whitespace, and the DOM position of every character.
  const characters: string[] = []
  const positions: TextPosition[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    // Verse numbers (<sup>) are not read aloud, so they are not part of the searchable text.
    acceptNode: (node) => (node.parentElement?.closest('sup')
      ? NodeFilter.FILTER_REJECT
      : NodeFilter.FILTER_ACCEPT),
  })

  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    const value = node.data
    for (let offset = 0; offset < value.length; offset += 1) {
      const isSpace = /\s/.test(value[offset])
      if (isSpace && (characters.length === 0 || characters[characters.length - 1] === ' ')) continue
      characters.push(isSpace ? ' ' : value[offset])
      positions.push({ node, offset })
    }
  }

  const text = characters.join('')
  // Chunks are spoken in order, so each search continues after the previous match.
  let cursor = 0

  const findRange = (chunk: string) => {
    const needle = chunk.replace(/\s+/g, ' ').trim()
    if (!needle) return null

    let start = text.indexOf(needle, cursor)
    if (start < 0) start = text.indexOf(needle)
    if (start < 0) return null

    const end = start + needle.length - 1
    cursor = end + 1
    const range = document.createRange()
    range.setStart(positions[start].node, positions[start].offset)
    range.setEnd(positions[end].node, positions[end].offset + 1)
    return range
  }

  const scrollToRange = (range: Range) => {
    const rect = range.getBoundingClientRect()
    if (rect.height === 0) return
    const viewportHeight = window.innerHeight
    // Keep the spoken line in the upper-middle band; scroll only when it leaves it.
    if (rect.top >= viewportHeight * 0.2 && rect.bottom <= viewportHeight * 0.75) return

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    window.scrollBy({ top: rect.top - viewportHeight * 0.35, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  const clear = () => {
    if (supportsHighlights()) CSS.highlights.delete(HIGHLIGHT_NAME)
  }

  return {
    show: (chunk) => {
      const range = findRange(chunk)
      if (!range) {
        clear()
        return
      }
      if (supportsHighlights()) CSS.highlights.set(HIGHLIGHT_NAME, new Highlight(range))
      scrollToRange(range)
    },
    clear,
  }
}
