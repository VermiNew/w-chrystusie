import { execFileSync } from 'node:child_process'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDirectory = path.join(projectRoot, 'dist')
const siteName = 'W Chrystusie'
const defaultDescription = 'Polska katolicka aplikacja webowa — modlitwy, pieśni kościelne i interaktywny różaniec w jednym miejscu.'
const configuredSiteUrl = process.env.VITE_SITE_URL?.trim()
const siteUrl = new URL(configuredSiteUrl || 'http://localhost:4173/')

if (!configuredSiteUrl) {
  console.warn('[seo] Brak VITE_SITE_URL. Wygenerowano lokalne adresy; ustaw zmienną przed wdrożeniem produkcyjnym.')
}

const staticPages = [
  {
    path: '/',
    title: 'W Chrystusie — modlitwy, pieśni i różaniec',
    description: defaultDescription,
  },
  {
    path: '/modlitwy',
    title: 'Modlitwy katolickie | W Chrystusie',
    description: 'Modlitwy codzienne, litanie, nowenny, koronki i nabożeństwa uporządkowane tematycznie.',
  },
  {
    path: '/pismo-swiete',
    title: 'Pismo Święte | W Chrystusie',
    description: 'Sekcja Pisma Świętego w aplikacji W Chrystusie.',
    noIndex: true,
  },
  {
    path: '/spiewnik',
    title: 'Śpiewnik katolicki | W Chrystusie',
    description: 'Teksty polskich pieśni kościelnych, hymnów, kolęd oraz pieśni na okresy liturgiczne.',
  },
  {
    path: '/rozaniec',
    title: 'Różaniec — tajemnice i modlitwy | W Chrystusie',
    description: 'Interaktywny przewodnik po Różańcu Świętym: tajemnice, pełne teksty modlitw i piętnaście obietnic.',
  },
  {
    path: '/koronka',
    title: 'Koronka do Miłosierdzia Bożego | W Chrystusie',
    description: 'Interaktywny przewodnik krok po kroku po Koronce do Miłosierdzia Bożego.',
  },
  {
    path: '/ogloszenia',
    title: 'Ogłoszenia | W Chrystusie',
    description: 'Aktualności, inicjatywy i najważniejsze informacje publikowane w aplikacji W Chrystusie.',
  },
  {
    path: '/nabozenstwo-majowe',
    title: 'Nabożeństwo majowe | W Chrystusie',
    description: 'Litania loretańska i materiały do osobistego przeżywania nabożeństwa majowego.',
  },
  {
    path: '/szukaj',
    title: 'Szukaj | W Chrystusie',
    description: 'Wyszukiwarka modlitw, pieśni i pozostałych treści aplikacji W Chrystusie.',
    noIndex: true,
  },
  {
    path: '/zrodla',
    title: 'Źródła i polecane materiały | W Chrystusie',
    description: 'Źródła treści wykorzystywanych w aplikacji oraz polecane książki i materiały katolickie.',
  },
]

function parseMarkdown(filename, raw) {
  const match = raw.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) return { id: filename, title: filename, body: raw.trim() }

  const attributes = {}
  for (const line of match[1].split('\n')) {
    const separatorIndex = line.indexOf(':')
    if (separatorIndex > 0) {
      attributes[line.slice(0, separatorIndex).trim()] = line.slice(separatorIndex + 1).trim()
    }
  }

  return {
    id: filename,
    title: attributes.title || filename,
    body: match[2].trim(),
    category: attributes.category,
    date: attributes.date,
  }
}

async function loadEntries(directoryName) {
  const directory = path.join(projectRoot, 'src', 'data', directoryName)
  const filenames = (await readdir(directory))
    .filter((filename) => filename.endsWith('.md'))
    .sort((first, second) => first.localeCompare(second, 'pl'))

  return Promise.all(
    filenames.map(async (filename) => {
      const raw = await readFile(path.join(directory, filename), 'utf8')
      return parseMarkdown(filename.replace(/\.md$/, ''), raw)
    }),
  )
}

function normalizeText(value) {
  return value
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function createDescription(title, body, contentType) {
  const prefix = `${contentType} „${title}”. `
  const excerptLength = Math.max(0, 160 - prefix.length)
  const normalizedBody = normalizeText(body)
  const excerpt = normalizedBody.slice(0, excerptLength).trimEnd()
  const suffix = normalizedBody.length > excerpt.length ? '…' : ''
  return `${prefix}${excerpt}${suffix}`
}

function createDetailPages(entries, options) {
  return entries.map((entry) => ({
    path: `${options.prefix}/${encodeURIComponent(entry.id)}`,
    outputSegments: [options.outputDirectory, entry.id],
    title: options.titleSuffix
      ? `${entry.title} — ${options.titleSuffix} | ${siteName}`
      : `${entry.title} | ${siteName}`,
    description: createDescription(entry.title, entry.body, options.contentType),
    type: 'article',
    section: entry.category || options.section,
    publishedAt: options.includeDate ? entry.date : undefined,
  }))
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function getPageUrl(pagePath) {
  return new URL(pagePath.replace(/^\/+/, ''), siteUrl).href
}

function renderSeoTags(page) {
  const canonicalUrl = getPageUrl(page.path)
  const imageUrl = new URL('og-image.jpg', siteUrl).href
  const pageType = page.type === 'article' ? 'Article' : 'WebPage'
  const structuredData = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': pageType,
    name: page.title,
    headline: page.type === 'article' ? page.title : undefined,
    description: page.description,
    url: canonicalUrl,
    image: imageUrl,
    inLanguage: 'pl-PL',
    isPartOf: {
      '@type': 'WebSite',
      name: siteName,
      url: siteUrl.href,
    },
    datePublished: page.publishedAt,
    articleSection: page.section,
  }).replaceAll('<', '\\u003c')

  const articleTags = [
    page.publishedAt
      ? `<meta property="article:published_time" content="${escapeHtml(page.publishedAt)}" />`
      : '',
    page.type === 'article' && page.section
      ? `<meta property="article:section" content="${escapeHtml(page.section)}" />`
      : '',
  ].filter(Boolean).join('\n    ')

  return `<!-- seo:start -->
    <meta name="description" content="${escapeHtml(page.description)}" />
    <meta name="robots" content="${page.noIndex ? 'noindex, follow' : 'index, follow'}" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    <meta property="og:title" content="${escapeHtml(page.title)}" />
    <meta property="og:description" content="${escapeHtml(page.description)}" />
    <meta property="og:type" content="${page.type || 'website'}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:image:alt" content="${escapeHtml(`W Chrystusie — ${page.title}`)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="pl_PL" />
    <meta property="og:site_name" content="${siteName}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(page.title)}" />
    <meta name="twitter:description" content="${escapeHtml(page.description)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
    <meta name="twitter:image:alt" content="${escapeHtml(`W Chrystusie — ${page.title}`)}" />
    ${articleTags}
    <script type="application/ld+json" data-seo-structured-data>${structuredData}</script>
    <title>${escapeHtml(page.title)}</title>
    <!-- seo:end -->`
}

function renderPage(template, page) {
  const withoutDescription = template.replace(/\s*<meta name="description"[^>]*>\s*/i, '\n    ')
  const withoutTitle = withoutDescription.replace(/\s*<title>[\s\S]*?<\/title>\s*/i, '\n    ')
  return withoutTitle.replace('</head>', `    ${renderSeoTags(page)}\n  </head>`)
}

function getOutputFile(page) {
  if (page.path === '/') return path.join(distDirectory, 'index.html')
  const segments = page.outputSegments || page.path.replace(/^\/+/, '').split('/')
  return path.join(distDirectory, ...segments, 'index.html')
}

function getContentUpdatedAt() {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cs', '--', 'src/data'], {
      cwd: projectRoot,
      encoding: 'utf8',
    }).trim()
  } catch {
    return ''
  }
}

const [template, prayers, songs, announcements] = await Promise.all([
  readFile(path.join(distDirectory, 'index.html'), 'utf8'),
  loadEntries('prayers'),
  loadEntries('songs'),
  loadEntries('announcements'),
])

const now = new Date()
const today = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0'),
].join('-')
const publishedAnnouncements = announcements.filter((announcement) => !announcement.date || announcement.date <= today)
const pages = [
  ...staticPages,
  ...createDetailPages(prayers, {
    prefix: '/modlitwy',
    outputDirectory: 'modlitwy',
    contentType: 'Tekst modlitwy',
    titleSuffix: 'modlitwa',
    section: 'Modlitwy',
  }),
  ...createDetailPages(songs, {
    prefix: '/spiewnik',
    outputDirectory: 'spiewnik',
    contentType: 'Tekst pieśni',
    titleSuffix: 'pieśń kościelna',
    section: 'Śpiewnik',
  }),
  ...createDetailPages(publishedAnnouncements, {
    prefix: '/ogloszenia',
    outputDirectory: 'ogloszenia',
    contentType: 'Ogłoszenie',
    section: 'Ogłoszenia',
    includeDate: true,
  }),
]

await Promise.all(
  pages.map(async (page) => {
    const outputFile = getOutputFile(page)
    await mkdir(path.dirname(outputFile), { recursive: true })
    await writeFile(outputFile, renderPage(template, page), 'utf8')
  }),
)

const lastModified = getContentUpdatedAt()
const sitemapPages = pages.filter((page) => !page.noIndex)
const sitemapEntries = sitemapPages.map((page) => {
  const lastModifiedTag = lastModified ? `\n    <lastmod>${lastModified}</lastmod>` : ''
  return `  <url>
    <loc>${escapeXml(getPageUrl(page.path))}</loc>${lastModifiedTag}
  </url>`
}).join('\n')
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</urlset>
`
const robots = `User-agent: *
Allow: /

Sitemap: ${new URL('sitemap.xml', siteUrl).href}
`

await Promise.all([
  writeFile(path.join(distDirectory, 'sitemap.xml'), sitemap, 'utf8'),
  writeFile(path.join(distDirectory, 'robots.txt'), robots, 'utf8'),
])

console.log(`[seo] Wygenerowano ${pages.length} stron HTML i ${sitemapPages.length} adresów w sitemap.xml.`)
