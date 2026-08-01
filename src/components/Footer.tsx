import { Link } from 'react-router-dom'
import { MessageCircle, Send } from 'lucide-react'
import { site } from '../content/site'
import { isAnalyticsConfigured, openCookieSettings } from '../lib/analytics'
import { Container } from './layout/Container'

export const Footer = () => {
  const year = new Date().getFullYear()
  const { contacts, brand, footer, navigation, legal, services } = site

  const contactItems = [
    contacts.email
      ? { label: contacts.email, href: `mailto:${contacts.email}` }
      : null,
    contacts.phone
      ? {
          label: contacts.phone,
          href: `tel:${contacts.phone.replace(/[^\d+]/g, '')}`,
        }
      : null,
    contacts.location ? { label: contacts.location, href: null } : null,
  ].filter((item): item is { label: string; href: string | null } => item !== null)

  const messengers = [
    contacts.telegram
      ? { label: 'Telegram', href: contacts.telegram, icon: Send }
      : null,
    contacts.whatsapp
      ? { label: 'WhatsApp', href: contacts.whatsapp, icon: MessageCircle }
      : null,
  ].filter(
    (item): item is { label: string; href: string; icon: typeof Send } => item !== null,
  )

  return (
    <footer className="mt-auto border-t border-border/60 bg-surface">
      <Container className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="text-xl font-semibold tracking-tight">{brand.name}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-muted">
            {brand.descriptor}
          </p>
          <p className="mt-3 max-w-sm text-sm text-muted">{footer.description}</p>
          <p className="mt-6 text-xs text-muted">
            © {year} {brand.name}. {footer.rights}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Навигация
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {navigation.map((item) => (
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
            Услуги
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {services.map((service) => (
              <li key={service.id}>
                <Link
                  to={`/services#${service.id}`}
                  className="text-sm text-text/90 transition-colors hover:text-accent"
                >
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Контакты
          </p>
          {contactItems.length > 0 ? (
            <ul className="mt-4 flex flex-col gap-2 text-sm">
              {contactItems.map((item) => (
                <li key={item.label}>
                  {item.href ? (
                    <a href={item.href} className="transition-colors hover:text-accent">
                      {item.label}
                    </a>
                  ) : (
                    <span className="text-muted">{item.label}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">
              Контакты появятся после заполнения в content/site.ts
            </p>
          )}

          {messengers.length > 0 ? (
            <ul className="mt-5 flex flex-wrap gap-2">
              {messengers.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="inline-flex size-10 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:text-accent"
                  >
                    <Icon size={16} />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Container>

      <div className="border-t border-border/50">
        <Container className="flex flex-col gap-3 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>{legal.footerNote}</span>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {legal.links.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="transition-colors hover:text-accent">
                  {item.label}
                </Link>
              </li>
            ))}
            {isAnalyticsConfigured() ? (
              <li>
                <button
                  type="button"
                  onClick={openCookieSettings}
                  className="transition-colors hover:text-accent"
                >
                  Настройки cookie
                </button>
              </li>
            ) : null}
          </ul>
        </Container>
      </div>
    </footer>
  )
}
