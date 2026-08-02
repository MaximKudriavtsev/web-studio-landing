import { Link } from 'react-router-dom'
import { BrandMark } from './BrandMark'
import { site } from '../content/site'

export const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="shell footer-top">
        <BrandMark footer />
        <div className="footer-links">
          {site.navigation.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
        </div>
        <Link className="footer-up" to="/#top" aria-label="Наверх">
          ↑
        </Link>
      </div>
      <div className="shell footer-bottom">
        <span>
          © {year} {site.brand.name}
        </span>
        <div>
          {site.legal.links.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </div>
        <span>{site.legal.tagline}</span>
      </div>
    </footer>
  )
}
