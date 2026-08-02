import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  isAnalyticsConfigured,
  loadYandexMetrica,
  readCookiePreferences,
  writeCookiePreferences,
} from '../lib/analytics'

const COOKIE_KEY = 'kotdela-cookie-consent-v1'

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    try {
      const accepted = localStorage.getItem(COOKIE_KEY)
      const prefs = readCookiePreferences()
      if (accepted || prefs) {
        if (prefs?.analytics || accepted) {
          if (isAnalyticsConfigured()) loadYandexMetrica()
        }
        return
      }
      setIsVisible(true)
    } catch {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_KEY, 'accepted')
      writeCookiePreferences({ analytics: true })
    } catch {
      /* ignore storage errors */
    }
    if (isAnalyticsConfigured()) loadYandexMetrica()
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="cookie-banner is-visible" role="dialog" aria-label="Использование файлов cookie">
      <div>
        <strong>Мы используем cookie</strong>
        <p>
          Они помогают сайту работать корректно. Продолжая пользоваться сайтом, вы соглашаетесь с
          использованием cookie.
        </p>
      </div>
      <div>
        <Link to="/privacy#cookies">Подробнее</Link>
        <button className="button button-dark button-small" type="button" onClick={handleAccept}>
          Хорошо
        </button>
      </div>
    </div>
  )
}
