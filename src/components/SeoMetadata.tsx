import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { announcements } from '../data/announcements'
import { prayers } from '../data/prayers'
import { songs } from '../data/songs'

const SITE_NAME = 'W Chrystusie'
const DEFAULT_DESCRIPTION = 'Polska katolicka aplikacja webowa — modlitwy, pieśni kościelne i interaktywny różaniec w jednym miejscu.'
const DEFAULT_IMAGE_PATH = '/og-image.jpg'

interface RouteMetadata {
  title: string
  description: string
  canonicalPath: string
  type?: 'website' | 'article'
  noIndex?: boolean
  publishedAt?: string
  section?: string
}

const staticRoutes: Record<string, RouteMetadata> = {
  '/': {
    title: 'W Chrystusie — modlitwy, pieśni i różaniec',
    description: DEFAULT_DESCRIPTION,
    canonicalPath: '/',
  },
  '/modlitwy': {
    title: 'Modlitwy katolickie | W Chrystusie',
    description: 'Modlitwy codzienne, litanie, nowenny, koronki i nabożeństwa uporządkowane tematycznie.',
    canonicalPath: '/modlitwy',
  },
  '/pismo-swiete': {
    title: 'Pismo Święte | W Chrystusie',
    description: 'Sekcja Pisma Świętego w aplikacji W Chrystusie.',
    canonicalPath: '/pismo-swiete',
    noIndex: true,
  },
  '/spiewnik': {
    title: 'Śpiewnik katolicki | W Chrystusie',
    description: 'Teksty polskich pieśni kościelnych, hymnów, kolęd oraz pieśni na okresy liturgiczne.',
    canonicalPath: '/spiewnik',
  },
  '/rozaniec': {
    title: 'Różaniec — tajemnice i modlitwy | W Chrystusie',
    description: 'Interaktywny przewodnik po Różańcu Świętym: tajemnice, pełne teksty modlitw i piętnaście obietnic.',
    canonicalPath: '/rozaniec',
  },
  '/koronka': {
    title: 'Koronka do Miłosierdzia Bożego | W Chrystusie',
    description: 'Interaktywny przewodnik krok po kroku po Koronce do Miłosierdzia Bożego.',
    canonicalPath: '/koronka',
  },
  '/ogloszenia': {
    title: 'Ogłoszenia | W Chrystusie',
    description: 'Aktualności, inicjatywy i najważniejsze informacje publikowane w aplikacji W Chrystusie.',
    canonicalPath: '/ogloszenia',
  },
  '/nabozenstwo-majowe': {
    title: 'Nabożeństwo majowe | W Chrystusie',
    description: 'Litania loretańska i materiały do osobistego przeżywania nabożeństwa majowego.',
    canonicalPath: '/nabozenstwo-majowe',
  },
  '/szukaj': {
    title: 'Szukaj | W Chrystusie',
    description: 'Wyszukiwarka modlitw, pieśni i pozostałych treści aplikacji W Chrystusie.',
    canonicalPath: '/szukaj',
    noIndex: true,
  },
  '/zrodla': {
    title: 'Źródła i polecane materiały | W Chrystusie',
    description: 'Źródła treści wykorzystywanych w aplikacji oraz polecane książki i materiały katolickie.',
    canonicalPath: '/zrodla',
  },
}

function decodeRouteId(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function normalizeText(value: string) {
  return value
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function createDescription(title: string, body: string, contentType: string) {
  const prefix = `${contentType} „${title}”. `
  const availableLength = Math.max(0, 160 - prefix.length)
  const excerpt = normalizeText(body).slice(0, availableLength).trimEnd()
  return `${prefix}${excerpt}${excerpt.length === availableLength ? '…' : ''}`
}

function findDetailMetadata(pathname: string): RouteMetadata | null {
  const detailRoutes = [
    {
      prefix: '/modlitwy/',
      entries: prayers,
      contentType: 'Tekst modlitwy',
      titleSuffix: 'modlitwa',
      section: 'Modlitwy',
    },
    {
      prefix: '/spiewnik/',
      entries: songs,
      contentType: 'Tekst pieśni',
      titleSuffix: 'pieśń kościelna',
      section: 'Śpiewnik',
    },
  ]

  for (const route of detailRoutes) {
    if (!pathname.startsWith(route.prefix)) continue

    const routeId = decodeRouteId(pathname.slice(route.prefix.length))
    const entry = route.entries.find((item) => item.id === routeId)
    if (!entry) return null

    return {
      title: `${entry.title} — ${route.titleSuffix} | ${SITE_NAME}`,
      description: createDescription(entry.title, entry.body, route.contentType),
      canonicalPath: `${route.prefix}${encodeURIComponent(entry.id)}`,
      type: 'article',
      section: entry.category ?? route.section,
    }
  }

  if (pathname.startsWith('/ogloszenia/')) {
    const routeId = decodeRouteId(pathname.slice('/ogloszenia/'.length))
    const announcement = announcements.find((item) => item.id === routeId)
    if (!announcement) return null

    return {
      title: `${announcement.title} | ${SITE_NAME}`,
      description: createDescription(announcement.title, announcement.body, 'Ogłoszenie'),
      canonicalPath: `/ogloszenia/${encodeURIComponent(announcement.id)}`,
      type: 'article',
      publishedAt: announcement.date,
      section: announcement.category,
    }
  }

  return null
}

function getRouteMetadata(pathname: string): RouteMetadata {
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  const detailMetadata = findDetailMetadata(normalizedPath)
  if (detailMetadata) return detailMetadata
  if (staticRoutes[normalizedPath]) return staticRoutes[normalizedPath]

  return {
    title: `Nie znaleziono strony | ${SITE_NAME}`,
    description: 'Podana strona nie istnieje lub została przeniesiona.',
    canonicalPath: normalizedPath,
    noIndex: true,
  }
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.append(element)
  }
  element.content = content
}

function setCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!element) {
    element = document.createElement('link')
    element.rel = 'canonical'
    document.head.append(element)
  }
  element.href = href
}

function setStructuredData(metadata: RouteMetadata, canonicalUrl: string, imageUrl: string, siteUrl: string) {
  let element = document.head.querySelector<HTMLScriptElement>('script[data-seo-structured-data]')
  if (!element) {
    element = document.createElement('script')
    element.type = 'application/ld+json'
    element.dataset.seoStructuredData = ''
    document.head.append(element)
  }

  const pageType = metadata.type === 'article' ? 'Article' : 'WebPage'
  element.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': pageType,
    name: metadata.title,
    headline: metadata.type === 'article' ? metadata.title : undefined,
    description: metadata.description,
    url: canonicalUrl,
    image: imageUrl,
    inLanguage: 'pl-PL',
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: siteUrl,
    },
    datePublished: metadata.publishedAt,
    articleSection: metadata.section,
  })
}

export default function SeoMetadata() {
  const { pathname } = useLocation()
  const metadata = useMemo(() => getRouteMetadata(pathname), [pathname])

  useEffect(() => {
    const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.trim().replace(/\/+$/, '')
    const siteUrl = `${configuredSiteUrl || new URL(import.meta.env.BASE_URL, window.location.origin).href.replace(/\/+$/, '')}/`
    const canonicalPath = metadata.canonicalPath.replace(/^\/+/, '')
    const imagePath = DEFAULT_IMAGE_PATH.replace(/^\/+/, '')
    const canonicalUrl = new URL(canonicalPath, siteUrl).href
    const imageUrl = new URL(imagePath, siteUrl).href
    const robots = metadata.noIndex ? 'noindex, follow' : 'index, follow'

    document.documentElement.lang = 'pl'
    document.title = metadata.title
    setCanonical(canonicalUrl)
    setMeta('name', 'description', metadata.description)
    setMeta('name', 'robots', robots)
    setMeta('property', 'og:title', metadata.title)
    setMeta('property', 'og:description', metadata.description)
    setMeta('property', 'og:type', metadata.type ?? 'website')
    setMeta('property', 'og:url', canonicalUrl)
    setMeta('property', 'og:image', imageUrl)
    setMeta('property', 'og:image:alt', `W Chrystusie — ${metadata.title}`)
    setMeta('property', 'og:image:width', '1200')
    setMeta('property', 'og:image:height', '630')
    setMeta('property', 'og:locale', 'pl_PL')
    setMeta('property', 'og:site_name', SITE_NAME)
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', metadata.title)
    setMeta('name', 'twitter:description', metadata.description)
    setMeta('name', 'twitter:image', imageUrl)
    setMeta('name', 'twitter:image:alt', `W Chrystusie — ${metadata.title}`)

    const publishedMeta = document.head.querySelector<HTMLMetaElement>('meta[property="article:published_time"]')
    const sectionMeta = document.head.querySelector<HTMLMetaElement>('meta[property="article:section"]')
    if (metadata.publishedAt) {
      setMeta('property', 'article:published_time', metadata.publishedAt)
    } else {
      publishedMeta?.remove()
    }
    if (metadata.type === 'article' && metadata.section) {
      setMeta('property', 'article:section', metadata.section)
    } else {
      sectionMeta?.remove()
    }

    setStructuredData(metadata, canonicalUrl, imageUrl, siteUrl)
  }, [metadata])

  return null
}
