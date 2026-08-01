import { useEffect } from 'react'
import type { SeoPage } from '../content/types'

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ?? ''
const BASE = import.meta.env.BASE_URL

const upsertMeta = (attr: 'name' | 'property', key: string, content: string) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

const upsertLink = (rel: string, href: string) => {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

const buildCanonical = (path: string) => {
  const normalizedPath = path === '/' ? '' : path.replace(/\/$/, '')
  const basePath = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE
  const absolutePath = `${basePath}${normalizedPath || '/'}`

  if (SITE_URL) {
    return `${SITE_URL}${absolutePath === '/' ? '/' : absolutePath}`
  }

  return absolutePath || '/'
}

/** Sets document title and meta/OG tags for the current page. */
export const usePageSeo = (seo: SeoPage, path: string) => {
  useEffect(() => {
    document.title = seo.title
    upsertMeta('name', 'description', seo.description)
    upsertMeta('name', 'robots', 'index, follow')
    upsertMeta('property', 'og:title', seo.title)
    upsertMeta('property', 'og:description', seo.description)
    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:locale', 'ru_RU')

    const canonical = buildCanonical(path)
    upsertLink('canonical', canonical)
    upsertMeta('property', 'og:url', canonical)

    if (SITE_URL) {
      upsertMeta('property', 'og:image', `${SITE_URL}${BASE}favicon.svg`)
    }
  }, [seo.title, seo.description, path])
}
