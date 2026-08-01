import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Header } from './Header'
import { Footer } from './Footer'
import { CookieConsent } from './CookieConsent'
import { ScrollToTop } from './layout/ScrollToTop'

export const Layout = () => {
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="soft-glow flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:shadow-card-md"
      >
        Перейти к содержанию
      </a>
      <ScrollToTop />
      <Header />
      <AnimatePresence mode="wait">
        <motion.main
          id="main-content"
          key={location.pathname}
          className="flex-1"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
      <CookieConsent />
    </div>
  )
}
