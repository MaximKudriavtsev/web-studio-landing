import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const HEADER_OFFSET = 80
const HASH_RETRY_MS = [0, 50, 150, 300, 600]

const scrollToHash = (hash: string) => {
  const id = hash.replace('#', '')
  if (!id) return false

  const el = document.getElementById(id)
  if (!el) return false

  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
  window.scrollTo({ top, behavior: 'smooth' })
  return true
}

/** Scrolls to top on route change; retries hash targets after lazy page mount. */
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }

    const timers: number[] = []
    let done = false

    for (const delay of HASH_RETRY_MS) {
      timers.push(
        window.setTimeout(() => {
          if (done) return
          if (scrollToHash(hash)) done = true
        }, delay),
      )
    }

    return () => {
      for (const id of timers) window.clearTimeout(id)
    }
  }, [pathname, hash])

  return null
}
