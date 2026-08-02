import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { SectionReveal } from '../components/SectionReveal'
import { site } from '../content/site'
import type { CaseCard, ServiceCard } from '../content/types'
import { usePageSeo } from '../hooks/usePageSeo'

const serviceClass = (variant: ServiceCard['variant']) => {
  if (variant === 'featured') return 'service-card service-featured'
  if (variant === 'coral') return 'service-card service-coral'
  if (variant === 'ink') return 'service-card service-ink'
  return 'service-card service-blue'
}

const caseClass = (variant: CaseCard['variant']) => `case case-${variant}`

const ServiceArt = ({ art }: { art: ServiceCard['art'] }) => {
  if (art === 'browser') {
    return (
      <div className="service-art browser-art" aria-hidden="true">
        <div className="art-window">
          <span />
          <strong>
            Ваш продукт
            <br />
            на своём сайте
          </strong>
          <i />
          <i />
        </div>
      </div>
    )
  }

  if (art === 'phone') {
    return (
      <div className="service-art phone-art" aria-hidden="true">
        <div className="phone">
          <div className="phone-screen">
            <i />
            <strong>
              Удобно
              <br />
              с первого
              <br />
              касания
            </strong>
            <span />
          </div>
        </div>
      </div>
    )
  }

  if (art === 'type') {
    return (
      <div className="service-art type-art" aria-hidden="true">
        <small>Aa</small>
        <strong>
          Система,
          <br />
          а не набор
          <br />
          случайностей
        </strong>
      </div>
    )
  }

  return (
    <div className="service-art speed-art" aria-hidden="true">
      <div className="speed-ring">
        <b>98</b>
        <small>скорость</small>
      </div>
      <span />
      <span />
    </div>
  )
}

const CaseVisual = ({ visual }: { visual: CaseCard['visual'] }) => {
  if (visual === 'shop') {
    return (
      <div className="case-visual shop-visual" aria-label="Макет интернет-магазина">
        <div className="shop-browser">
          <div className="shop-bar">
            <i />
            <i />
            <i />
            <span>svet-71.ru</span>
          </div>
          <div className="shop-nav">
            <b>СВЕТ</b>
            <span>Каталог　Комнаты　Новинки</span>
            <button type="button">Корзина</button>
          </div>
          <div className="shop-hero">
            <div>
              <small>НОВАЯ КОЛЛЕКЦИЯ</small>
              <strong>
                Свет, который
                <br />
                создаёт атмосферу
              </strong>
              <i />
            </div>
            <div className="lamp">
              <span />
              <b />
              <i />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (visual === 'erp') {
    return (
      <div className="case-visual erp-visual" aria-label="Макет ERP-системы">
        <div className="erp-window">
          <aside>
            <b>К</b>
            <i />
            <i className="on" />
            <i />
            <i />
          </aside>
          <div className="erp-body">
            <div className="erp-head">
              <span>
                <small>Добрый день</small>
                <strong>Финансы</strong>
              </span>
              <button type="button">Синхронизировать</button>
            </div>
            <div className="erp-cards">
              <div>
                <small>Выручка</small>
                <strong>1 248 400 ₽</strong>
                <i>+12,4%</i>
              </div>
              <div>
                <small>Чистая прибыль</small>
                <strong>386 120 ₽</strong>
                <i>+8,1%</i>
              </div>
            </div>
            <div className="erp-chart">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="case-visual owl-visual" aria-label="Концепция детского продукта">
      <div className="owl-card">
        <div className="owl">
          <i className="ear e1" />
          <i className="ear e2" />
          <b className="eye x1" />
          <b className="eye x2" />
          <span />
        </div>
        <strong>Первый лепет</strong>
        <small>маленькие шаги к большим словам</small>
        <div className="owl-pills">
          <i />
          <i />
          <i />
        </div>
      </div>
    </div>
  )
}

const ContactForm = () => {
  const formCopy = site.home.contact.form
  const [hasError, setHasError] = useState(false)
  const [status, setStatus] = useState(formCopy.statusIdle)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') || '').trim()
    const contact = String(data.get('contact') || '').trim()
    const message = String(data.get('message') || '').trim()
    const consent = data.get('consent')

    if (!name || !contact || !message || !consent) {
      setHasError(true)
      setStatus(formCopy.statusError)
      return
    }

    setHasError(false)
    setStatus(formCopy.statusSuccess)
    const subject = encodeURIComponent(`Новая заявка с сайта — ${name}`)
    const body = encodeURIComponent(`Имя: ${name}\nКонтакт: ${contact}\n\nЗадача:\n${message}`)
    window.location.href = `mailto:${site.contacts.email}?subject=${subject}&body=${body}`
  }

  return (
    <form
      className={['contact-form', hasError ? 'has-error' : ''].filter(Boolean).join(' ')}
      onSubmit={handleSubmit}
      noValidate
    >
      <label>
        <span>{formCopy.nameLabel}</span>
        <input type="text" name="name" autoComplete="name" placeholder={formCopy.namePlaceholder} required />
      </label>
      <label>
        <span>{formCopy.contactLabel}</span>
        <input
          type="text"
          name="contact"
          autoComplete="email"
          placeholder={formCopy.contactPlaceholder}
          required
        />
      </label>
      <label className="full">
        <span>{formCopy.messageLabel}</span>
        <textarea name="message" rows={5} placeholder={formCopy.messagePlaceholder} required />
      </label>
      <label className="consent full">
        <input type="checkbox" name="consent" required />
        <span>
          {formCopy.consentBefore}
          <Link to="/consent">{formCopy.consentLink}</Link>
          {formCopy.and}
          <Link to="/privacy">{formCopy.privacyLink}</Link>
          {formCopy.consentAfter}
        </span>
      </label>
      <div className="form-footer full">
        <button className="button button-lime" type="submit">
          {formCopy.submit} <span>↗</span>
        </button>
        <small>{status}</small>
      </div>
    </form>
  )
}

export const HomePage = () => {
  const { home, services, cases, process, team, contacts } = site
  usePageSeo(site.seo.home, '/')

  return (
    <main id="main">
      <section className="hero section" id="top">
        <div className="shell hero-grid">
          <SectionReveal className="hero-copy">
            <div className="eyebrow">
              <span /> {home.hero.eyebrow}
            </div>
            <h1>
              {home.hero.headline}
              <br />
              <em>{home.hero.headlineEm}</em>
            </h1>
            <p className="hero-lead">{home.hero.lead}</p>
            <div className="hero-actions">
              <Link className="button button-lime" to={home.hero.primaryCta.to}>
                {home.hero.primaryCta.label} <span>↗</span>
              </Link>
              <Link className="text-link" to={home.hero.secondaryCta.to}>
                {home.hero.secondaryCta.label} <span>↓</span>
              </Link>
            </div>
            <div className="hero-meta">
              {home.hero.meta.map((item) => (
                <div key={item.number}>
                  <strong>{item.number}</strong>
                  <span>
                    {item.text.split('\n').map((line, index) => (
                      <span key={line}>
                        {index > 0 ? <br /> : null}
                        {line}
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </SectionReveal>

          <SectionReveal className="hero-stage" delay>
            <div className="stage-orbit orbit-one" />
            <div className="stage-orbit orbit-two" />
            <div className="floating-note note-one">UX / UI</div>
            <div className="floating-note note-two">Запуск ↗</div>
            <article className="product-window" aria-label="Пример цифрового продукта">
              <div className="window-top">
                <span className="window-dots">
                  <i />
                  <i />
                  <i />
                </span>
                <span>dashboard.kotdela</span>
                <span className="live-dot">online</span>
              </div>
              <div className="window-body">
                <aside className="mock-sidebar">
                  <div className="mock-logo">К</div>
                  <i className="active" />
                  <i />
                  <i />
                  <i />
                </aside>
                <div className="mock-content">
                  <div className="mock-head">
                    <div>
                      <small>Обзор проекта</small>
                      <strong>Всё под контролем</strong>
                    </div>
                    <button type="button" aria-label="Добавить">
                      +
                    </button>
                  </div>
                  <div className="metric-row">
                    <div className="metric metric-primary">
                      <span>Заявки</span>
                      <strong>128</strong>
                      <small>↗ в этом месяце</small>
                    </div>
                    <div className="metric">
                      <span>Конверсия</span>
                      <strong>4,8%</strong>
                      <small>стабильный рост</small>
                    </div>
                  </div>
                  <div className="chart-card">
                    <div className="chart-head">
                      <span>Динамика</span>
                      <small>30 дней</small>
                    </div>
                    <svg viewBox="0 0 520 170" role="img" aria-label="График роста">
                      <defs>
                        <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0" stopColor="#c9ff55" stopOpacity=".55" />
                          <stop offset="1" stopColor="#c9ff55" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path className="grid-line" d="M0 35H520M0 85H520M0 135H520" />
                      <path
                        className="area"
                        d="M0 145 C50 139 63 112 106 120 S177 109 212 92 S272 115 310 75 S374 79 410 49 S476 65 520 18 L520 170H0Z"
                      />
                      <path
                        className="line"
                        d="M0 145 C50 139 63 112 106 120 S177 109 212 92 S272 115 310 75 S374 79 410 49 S476 65 520 18"
                      />
                    </svg>
                  </div>
                  <div className="task-row">
                    <span>
                      <i /> Прототип согласован
                    </span>
                    <span>Сегодня</span>
                  </div>
                </div>
              </div>
            </article>
          </SectionReveal>
        </div>

        <SectionReveal className="shell trust-strip">
          <span>{home.hero.trustLabel}</span>
          {home.hero.trustItems.map((item, index) => (
            <span key={item} style={{ display: 'contents' }}>
              <strong>{item}</strong>
              {index < home.hero.trustItems.length - 1 ? <i>●</i> : null}
            </span>
          ))}
        </SectionReveal>
      </section>

      <section className="section services" id="services">
        <div className="shell">
          <SectionReveal className="section-heading">
            <div>
              <span className="section-number">{home.servicesHeading.number}</span>
              <span className="eyebrow eyebrow-dark">{home.servicesHeading.eyebrow}</span>
            </div>
            <h2>
              {home.servicesHeading.title}
              <br />
              <em>{home.servicesHeading.titleEm}</em>
            </h2>
            <p>{home.servicesHeading.text}</p>
          </SectionReveal>

          <div className="services-grid">
            {services.map((service, index) => (
              <SectionReveal
                key={service.id}
                className={serviceClass(service.variant)}
                delay={index % 2 === 1}
              >
                <div className="service-top">
                  <span>{service.number}</span>
                  <span className="service-icon">{service.icon}</span>
                </div>
                <ServiceArt art={service.art} />
                <div className="service-bottom">
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                  <ul>
                    {service.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section work" id="work">
        <div className="shell">
          <SectionReveal className="section-heading heading-light">
            <div>
              <span className="section-number">{home.workHeading.number}</span>
              <span className="eyebrow">{home.workHeading.eyebrow}</span>
            </div>
            <h2>
              {home.workHeading.title}
              <br />
              <em>{home.workHeading.titleEm}</em>
            </h2>
            <p>{home.workHeading.text}</p>
          </SectionReveal>

          <div className="case-list">
            {cases.map((item) => (
              <SectionReveal key={item.id} className={caseClass(item.variant)}>
                <div className="case-copy">
                  <div className="case-tags">
                    {item.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <Link to={item.cta.to}>{item.cta.label}</Link>
                </div>
                <CaseVisual visual={item.visual} />
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section process" id="process">
        <div className="shell">
          <SectionReveal className="section-heading">
            <div>
              <span className="section-number">{home.processHeading.number}</span>
              <span className="eyebrow eyebrow-dark">{home.processHeading.eyebrow}</span>
            </div>
            <h2>
              {home.processHeading.title}
              <br />
              <em>{home.processHeading.titleEm}</em>
            </h2>
            <p>{home.processHeading.text}</p>
          </SectionReveal>

          <SectionReveal className="process-board">
            <div className="process-line" aria-hidden="true">
              <i />
            </div>
            {process.map((step) => (
              <article key={step.number}>
                <span>{step.number}</span>
                <div className="process-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                <small>{step.result}</small>
              </article>
            ))}
          </SectionReveal>
        </div>
      </section>

      <section className="section team" id="team">
        <div className="shell team-grid">
          <SectionReveal className="team-copy">
            <span className="section-number">{home.team.number}</span>
            <span className="eyebrow eyebrow-dark">{home.team.eyebrow}</span>
            <h2>
              {home.team.title}
              <br />
              <em>{home.team.titleEm}</em>
            </h2>
            <p>{home.team.text}</p>
            <div className="team-note">
              <span>●</span>
              <p>
                <strong>{home.team.noteTitle}</strong>
                <br />
                {home.team.noteText}
              </p>
            </div>
          </SectionReveal>

          <div className="team-cards">
            {team.map((member, index) => (
              <SectionReveal
                key={member.id}
                className={`person-card person-${['one', 'two', 'three', 'four'][index]}`}
                delay={index % 2 === 1}
              >
                <div className={`avatar avatar-${member.avatar}`}>
                  <span>{member.initial}</span>
                  <i />
                </div>
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section contact" id="contact">
        <div className="shell contact-shell">
          <SectionReveal className="contact-head">
            <div className="eyebrow">
              <span /> {home.contact.eyebrow}
            </div>
            <h2>
              {home.contact.title}
              <br />
              <em>{home.contact.titleEm}</em>
            </h2>
            <p>{home.contact.text}</p>
          </SectionReveal>

          <div className="contact-grid">
            <SectionReveal>
              <ContactForm />
            </SectionReveal>

            <SectionReveal className="contact-card" delay>
              <div>
                <small>{home.contact.directLabel}</small>
                <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
                <a href={contacts.telegram} target="_blank" rel="noopener noreferrer">
                  {contacts.telegramLabel}
                </a>
              </div>
              <div className="availability">
                <i />
                <span>
                  <strong>{contacts.availabilityTitle}</strong>
                  <small>{contacts.availabilityText}</small>
                </span>
              </div>
              <div className="contact-cat" aria-hidden="true">
                <i />
                <i />
                <span>К</span>
                <b />
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>
    </main>
  )
}
