const STORAGE_KEY = 'nova-cookie-consent'
const OPEN_EVENT = 'nova:open-cookie-settings'

export type CookiePreferences = {
  analytics: boolean
}

export const getMetricaId = (): string =>
  (import.meta.env.VITE_YANDEX_METRICA_ID as string | undefined)?.trim() ?? ''

export const isAnalyticsConfigured = (): boolean => Boolean(getMetricaId())

export const readCookiePreferences = (): CookiePreferences | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CookiePreferences
    if (typeof parsed.analytics !== 'boolean') return null
    return parsed
  } catch {
    return null
  }
}

export const writeCookiePreferences = (prefs: CookiePreferences) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
}

export const openCookieSettings = () => {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT))
}

export const onOpenCookieSettings = (handler: () => void) => {
  window.addEventListener(OPEN_EVENT, handler)
  return () => window.removeEventListener(OPEN_EVENT, handler)
}

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void
  }
}

let metricaLoaded = false

export const loadYandexMetrica = () => {
  const id = getMetricaId()
  if (!id || metricaLoaded || typeof window === 'undefined') return

  const script = document.createElement('script')
  script.src = 'https://mc.yandex.ru/metrika/tag.js'
  script.async = true
  document.head.appendChild(script)

  window.ym =
    window.ym ||
    function (...args: unknown[]) {
      ;(window.ym as unknown as { a?: unknown[] }).a =
        (window.ym as unknown as { a?: unknown[] }).a || []
      ;((window.ym as unknown as { a: unknown[] }).a).push(args)
    }

  window.ym(Number(id), 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    // webvisor off by default — enable only via explicit config later
  })

  metricaLoaded = true
}
