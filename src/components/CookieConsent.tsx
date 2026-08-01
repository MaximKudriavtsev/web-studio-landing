import { useEffect, useState } from 'react'
import {
  isAnalyticsConfigured,
  loadYandexMetrica,
  onOpenCookieSettings,
  readCookiePreferences,
  writeCookiePreferences,
  type CookiePreferences,
} from '../lib/analytics'
import { Container } from './layout/Container'

type PanelMode = 'banner' | 'settings' | 'hidden'

export const CookieConsent = () => {
  const [mode, setMode] = useState<PanelMode>('hidden')
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false)

  useEffect(() => {
    if (!isAnalyticsConfigured()) {
      setMode('hidden')
      return
    }

    const stored = readCookiePreferences()
    if (!stored) {
      setMode('banner')
      return
    }

    setAnalyticsEnabled(stored.analytics)
    if (stored.analytics) loadYandexMetrica()
    setMode('hidden')
  }, [])

  useEffect(() => {
    return onOpenCookieSettings(() => {
      if (!isAnalyticsConfigured()) return
      const stored = readCookiePreferences()
      setAnalyticsEnabled(stored?.analytics ?? false)
      setMode('settings')
    })
  }, [])

  const persist = (prefs: CookiePreferences) => {
    writeCookiePreferences(prefs)
    setAnalyticsEnabled(prefs.analytics)
    if (prefs.analytics) loadYandexMetrica()
    setMode('hidden')
  }

  const handleAccept = () => persist({ analytics: true })
  const handleDecline = () => persist({ analytics: false })
  const handleSaveSettings = () => persist({ analytics: analyticsEnabled })

  if (mode === 'hidden' || !isAnalyticsConfigured()) return null

  return (
    <div
      role="dialog"
      aria-label="Настройки cookie"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 p-4 shadow-card-md backdrop-blur-md"
    >
      <Container>
        {mode === 'banner' ? (
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-text">Мы используем cookie</p>
              <p className="mt-1 text-sm text-muted">
                Аналитические cookie помогают понять, как используют сайт. Они
                включаются только после вашего согласия. Обязательные cookie для
                работы сайта не требуют разрешения.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleDecline}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent"
              >
                Отклонить
              </button>
              <button
                type="button"
                onClick={() => setMode('settings')}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent"
              >
                Настроить
              </button>
              <button
                type="button"
                onClick={handleAccept}
                className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Принять
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold text-text">Настройки cookie</p>
              <p className="mt-1 text-sm text-muted">
                Выберите категории cookie, которые хотите разрешить.
              </p>
            </div>
            <label className="flex items-start gap-3 rounded-card-md border border-border bg-surface-soft px-4 py-3">
              <input
                type="checkbox"
                checked
                disabled
                className="mt-1"
                aria-describedby="cookie-necessary-desc"
              />
              <span>
                <span className="block text-sm font-medium text-text">Необходимые</span>
                <span id="cookie-necessary-desc" className="text-xs text-muted">
                  Нужны для базовой работы сайта. Всегда включены.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-card-md border border-border bg-surface-soft px-4 py-3">
              <input
                type="checkbox"
                checked={analyticsEnabled}
                onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                className="mt-1 accent-[var(--color-accent)]"
                aria-describedby="cookie-analytics-desc"
              />
              <span>
                <span className="block text-sm font-medium text-text">Аналитика</span>
                <span id="cookie-analytics-desc" className="text-xs text-muted">
                  Яндекс Метрика без вебвизора. Помогает улучшать сайт.
                </span>
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleDecline}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent"
              >
                Отклонить всё
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Сохранить
              </button>
            </div>
          </div>
        )}
      </Container>
    </div>
  )
}
