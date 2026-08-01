import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { site } from '../content/site'
import { Button } from './Button'

type MobileNavProps = {
  isOpen: boolean
  onClose: () => void
}

const isNavActive = (to: string, pathname: string, hash: string) => {
  if (to === '/') return pathname === '/' && !hash
  if (to.startsWith('/#')) {
    return pathname === '/' && hash === to.slice(1)
  }
  return pathname === to || pathname.startsWith(`${to}/`)
}

export const MobileNav = ({ isOpen, onClose }: MobileNavProps) => {
  const prefersReducedMotion = useReducedMotion()
  const location = useLocation()
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setPortalTarget(document.body)
  }, [])

  if (!portalTarget) return null

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.button
            type="button"
            aria-label="Закрыть меню"
            className="absolute inset-0 bg-text/40 backdrop-blur-sm"
            onClick={onClose}
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.nav
            id="mobile-nav"
            aria-label="Мобильная навигация"
            className="absolute inset-y-0 right-0 flex w-[min(100%,20rem)] flex-col border-l border-border bg-white p-6 text-text shadow-card-md"
            initial={prefersReducedMotion ? false : { x: '100%' }}
            animate={{ x: 0 }}
            exit={prefersReducedMotion ? undefined : { x: '100%' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-10 flex items-center justify-between">
              <span className="text-lg font-semibold tracking-tight text-text">
                {site.brand.name}
              </span>
              <button
                type="button"
                aria-label="Закрыть меню"
                className="rounded-md p-2 text-muted transition-colors hover:bg-surface-soft hover:text-text"
                onClick={onClose}
              >
                <X size={22} />
              </button>
            </div>

            <ul className="flex flex-col gap-1">
              {site.navigation.map((item) => {
                const active = isNavActive(item.to, location.pathname, location.hash)
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={onClose}
                      className={[
                        'block rounded-md px-3 py-3 text-base font-medium transition-colors',
                        active
                          ? 'bg-accent-soft text-accent'
                          : 'text-text hover:bg-surface-soft',
                      ].join(' ')}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                )
              })}
            </ul>

            <div className="mt-auto pt-8">
              <Button to="/contact" className="w-full" onClick={onClose}>
                Обсудить проект
              </Button>
            </div>
          </motion.nav>
        </div>
      ) : null}
    </AnimatePresence>,
    portalTarget,
  )
}
