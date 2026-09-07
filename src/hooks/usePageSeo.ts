import { useEffect } from 'react'
import type { SeoPage } from '../content/types'

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ?? ''
const BASE = import.meta.env.BASE_URL
const DEFAULT_ORIGIN = 'https://kotdela.ru'
const OG_IMAGE_PATH = 'og-image.png'

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
  const origin = SITE_URL || DEFAULT_ORIGIN

  if (absolutePath === '/') {
    return `${origin}/`
  }

  return `${origin}${absolutePath}`
}

const buildOgImageUrl = () => {
  const origin = SITE_URL || DEFAULT_ORIGIN
  const base = BASE.endsWith('/') ? BASE : `${BASE}/`
  return `${origin}${base}${OG_IMAGE_PATH}`
}

type UsePageSeoOptions = {
  noIndex?: boolean
}

/** Sets document title and meta/OG tags for the current page. */
export const usePageSeo = (seo: SeoPage, path: string, options: UsePageSeoOptions = {}) => {
  const { noIndex = false } = options

  useEffect(() => {
    document.title = seo.title
    upsertMeta('name', 'description', seo.description)
    upsertMeta('name', 'robots', noIndex ? 'noindex' : 'index, follow')

    const canonical = buildCanonical(path)
    const ogImage = buildOgImageUrl()

    upsertLink('canonical', canonical)

    upsertMeta('property', 'og:title', seo.title)
    upsertMeta('property', 'og:description', seo.description)
    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:locale', 'ru_RU')
    upsertMeta('property', 'og:site_name', 'КОТ ДЕЛА')
    upsertMeta('property', 'og:url', canonical)
    upsertMeta('property', 'og:image', ogImage)
    upsertMeta('property', 'og:image:type', 'image/png')
    upsertMeta('property', 'og:image:width', '1200')
    upsertMeta('property', 'og:image:height', '630')
    upsertMeta('property', 'og:image:alt', seo.title)

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', seo.title)
    upsertMeta('name', 'twitter:description', seo.description)
    upsertMeta('name', 'twitter:image', ogImage)
    upsertMeta('name', 'twitter:image:alt', seo.title)
  }, [seo.title, seo.description, path, noIndex])
}
