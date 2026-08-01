import { Link, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import { site } from '../content/site'
import { Button } from './Button'
import { MobileNav } from './MobileNav'
import { Container } from './layout/Container'

const isNavActive = (to: string, pathname: string, hash: string) => {
  if (to === '/') return pathname === '/' && !hash
  if (to.startsWith('/#')) {
    return pathname === '/' && hash === to.slice(1)
  }
  return pathname === to || pathname.startsWith(`${to}/`)
}

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
    <header
      className={[
        'sticky top-0 z-30 border-b transition-[background-color,box-shadow,border-color] duration-200',
        isScrolled
          ? 'border-border/70 bg-bg/85 shadow-card-sm backdrop-blur-md'
          : 'border-transparent bg-bg/70 backdrop-blur-md',
      ].join(' ')}
    >
      <Container className="flex h-[4.25rem] items-center justify-between gap-4 md:h-[4.5rem]">
        <Link to="/" className="min-w-0 leading-none">
          <span className="block text-lg font-bold uppercase tracking-[0.04em] text-text transition-colors hover:text-accent md:text-[1.35rem]">
            {site.brand.name}
          </span>
          <span className="mt-0.5 block text-[0.625rem] font-medium lowercase tracking-[0.04em] text-muted">
            {site.brand.descriptor}
          </span>
        </Link>

        <nav aria-label="Основная навигация" className="hidden items-center gap-0.5 lg:flex">
          {site.navigation.map((item) => {
            const active = isNavActive(item.to, location.pathname, location.hash)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={[
                  'relative px-3.5 py-2 text-sm font-medium transition-colors',
                  active ? 'text-text' : 'text-muted hover:text-text',
                ].join(' ')}
              >
                {item.label}
                <span
                  aria-hidden
                  className={[
                    'absolute bottom-0.5 left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-accent transition-opacity',
                    active ? 'opacity-100' : 'opacity-0',
                  ].join(' ')}
                />
              </NavLink>
            )
          })}
        </nav>

        <div className="hidden lg:block">
          <Button to="/contact" className="!rounded-[0.65rem] !px-5 !py-2.5 text-sm">
            Обсудить проект
          </Button>
        </div>

        <button
          type="button"
          aria-label="Открыть меню"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav"
          className="rounded-md p-2 text-text transition-colors hover:bg-surface-soft lg:hidden"
          onClick={() => setIsMenuOpen(true)}
        >
          <Menu size={22} />
        </button>
      </Container>

      <MobileNav isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </header>
  )
}
