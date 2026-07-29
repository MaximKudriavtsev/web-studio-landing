import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { nav, site } from '../content/site'
import { Button } from './Button'

type MobileNavProps = {
  isOpen: boolean
  onClose: () => void
}

export const MobileNav = ({ isOpen, onClose }: MobileNavProps) => {
  const prefersReducedMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-40 md:hidden"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label="Закрыть меню"
            className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.nav
            aria-label="Мобильная навигация"
            className="absolute inset-y-0 right-0 flex w-[min(100%,20rem)] flex-col border-l border-border bg-bg-elevated p-6 shadow-2xl"
            initial={prefersReducedMotion ? false : { x: '100%' }}
            animate={{ x: 0 }}
            exit={prefersReducedMotion ? undefined : { x: '100%' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-10 flex items-center justify-between">
              <span className="font-display text-lg font-semibold tracking-tight">
                {site.brand}
              </span>
              <button
                type="button"
                aria-label="Закрыть меню"
                className="rounded-md p-2 text-muted transition-colors hover:bg-surface hover:text-text"
                onClick={onClose}
              >
                <X size={22} />
              </button>
            </div>

            <ul className="flex flex-col gap-1">
              {nav.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      [
                        'block rounded-md px-3 py-3 text-base font-medium transition-colors',
                        isActive
                          ? 'bg-accent-dim text-accent'
                          : 'text-text hover:bg-surface',
                      ].join(' ')
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-8">
              <Button to="/contact" className="w-full" onClick={onClose}>
                Обсудить проект
              </Button>
            </div>
          </motion.nav>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
