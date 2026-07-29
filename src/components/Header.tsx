import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { nav, site } from '../content/site'
import { Button } from './Button'
import { MobileNav } from './MobileNav'

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isMenuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-bg/80 backdrop-blur-md">
      <div className="page-shell flex h-16 items-center justify-between gap-4 md:h-[4.25rem]">
        <Link
          to="/"
          className="font-display text-lg font-semibold tracking-tight text-text transition-colors hover:text-accent md:text-xl"
        >
          {site.brand}
        </Link>

        <nav aria-label="Основная навигация" className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-accent'
                    : 'text-muted hover:text-text',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button to="/contact" className="!px-4 !py-2.5 text-sm">
            Обсудить проект
          </Button>
        </div>

        <button
          type="button"
          aria-label="Открыть меню"
          aria-expanded={isMenuOpen}
          className="rounded-md p-2 text-text transition-colors hover:bg-surface md:hidden"
          onClick={() => setIsMenuOpen(true)}
        >
          <Menu size={22} />
        </button>
      </div>

      <MobileNav isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </header>
  )
}
