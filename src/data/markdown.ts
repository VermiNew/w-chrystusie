export interface MarkdownEntry {
  id: string
  title: string
  body: string
}

export function parseMarkdown(filename: string, raw: string): MarkdownEntry {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) return { id: filename, title: filename, body: raw.trim() }

  const attrs: Record<string, string> = {}
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':')
    if (idx > 0) attrs[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
  }

  return {
    id: filename,
    title: attrs['title'] ?? filename,
    body: match[2].trim(),
  }
}

export function loadMarkdownFiles(
  modules: Record<string, string>,
  prefix: string,
): MarkdownEntry[] {
  return Object.entries(modules).map(([path, raw]) => {
    const filename = path.replace(prefix, '').replace(/\.md$/, '')
    return parseMarkdown(filename, raw)
  })
}
