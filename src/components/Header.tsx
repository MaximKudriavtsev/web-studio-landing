import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BrandMark } from './BrandMark'
import { site } from '../content/site'

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }

    document.body.classList.add('menu-open')
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.classList.remove('menu-open')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  const handleToggleMenu = () => setIsMenuOpen((open) => !open)
  const handleCloseMenu = () => setIsMenuOpen(false)

  return (
    <header className={['site-header', isScrolled ? 'is-scrolled' : ''].filter(Boolean).join(' ')}>
      <div className="shell header-inner">
        <BrandMark />

        <nav className="desktop-nav" aria-label="Основная навигация">
          {site.navigation.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>

        <Link className="button button-small button-dark header-cta" to={site.headerCta.to}>
          {site.headerCta.label}
        </Link>

        <button
          className="menu-button"
          type="button"
          aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={isMenuOpen}
          onClick={handleToggleMenu}
        >
          <span />
          <span />
        </button>
      </div>

      <div className={['mobile-menu', isMenuOpen ? 'is-open' : ''].filter(Boolean).join(' ')}>
        <nav aria-label="Мобильная навигация">
          {site.navigation.map((item) => (
            <Link key={item.to} to={item.to} onClick={handleCloseMenu}>
              {item.label}
            </Link>
          ))}
          <Link className="button button-lime" to={site.headerCta.to} onClick={handleCloseMenu}>
            {site.headerCta.label}
          </Link>
        </nav>
      </div>
    </header>
  )
}
