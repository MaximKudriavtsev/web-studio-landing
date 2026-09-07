import { Link } from 'react-router-dom'
import { site } from '../content/site'
import { CatLogo } from './CatLogo'

type BrandMarkProps = {
  className?: string
  to?: string
  footer?: boolean
}

export const BrandMark = ({ className = '', to = '/#top', footer = false }: BrandMarkProps) => {
  return (
    <Link
      className={['brand', footer ? 'brand-footer' : '', className].filter(Boolean).join(' ')}
      to={to}
      aria-label={`${site.brand.name} — на главную`}
    >
      <span className="brand-mark" aria-hidden="true">
        <CatLogo />
      </span>
      <span className="brand-text">
        <strong>{site.brand.name}</strong>
        <small>{site.brand.descriptor}</small>
      </span>
    </Link>
  )
}
