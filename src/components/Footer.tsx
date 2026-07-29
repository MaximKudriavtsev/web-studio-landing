import { Link } from 'react-router-dom'
import { footer, nav, site } from '../content/site'

export const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border/60 bg-bg-elevated">
      <div className="page-shell grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-xl font-semibold tracking-tight">{site.brand}</p>
          <p className="mt-3 max-w-sm text-sm text-muted">{footer.note}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Навигация
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            <li>
              <Link to="/" className="text-sm text-text/90 transition-colors hover:text-accent">
                Главная
              </Link>
            </li>
            {nav.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-sm text-text/90 transition-colors hover:text-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Связь
          </p>
          <ul className="mt-4 flex flex-col gap-2 text-sm">
            <li>
              <a
                href={`mailto:${site.email}`}
                className="transition-colors hover:text-accent"
              >
                {site.email}
              </a>
            </li>
            <li>
              <a href={`tel:${site.phone.replace(/[^\d+]/g, '')}`} className="transition-colors hover:text-accent">
                {site.phone}
              </a>
            </li>
            <li className="text-muted">{site.city}</li>
            {site.socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-accent"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border/50">
        <div className="page-shell flex flex-col gap-2 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {year} {site.brand}. {footer.rights}
          </span>
          <span>Placeholder-контент · замените в content/site.ts</span>
        </div>
      </div>
    </footer>
  )
}
