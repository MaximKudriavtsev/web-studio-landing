import { useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { SectionReveal } from '../components/SectionReveal'
import { Container } from '../components/layout/Container'
import { Section } from '../components/layout/Section'
import { ConsentCheckbox } from '../components/ui/ConsentCheckbox'
import { ContactCard } from '../components/ui/ContactCard'
import { FeatureCard } from '../components/ui/FeatureCard'
import { GradientCta } from '../components/ui/GradientCta'
import { IconBadge } from '../components/ui/IconBadge'
import { SectionHeading } from '../components/ui/SectionHeading'
import { StepCard } from '../components/ui/StepCard'
import { MapIllustration } from '../components/illustrations/MapIllustration'
import { site } from '../content/site'
import { usePageSeo } from '../hooks/usePageSeo'

type FormState = {
  name: string
  contact: string
  projectType: string
  message: string
  consent: boolean
}

type FieldErrors = Partial<Record<keyof FormState, string>>

const resolveProjectType = (service: string | null, intent: string | null, allowed: string[]) => {
  if (service && allowed.includes(service)) return service
  if (intent === 'estimate' && allowed.includes('undecided')) return 'undecided'
  if (intent === 'discuss' && allowed.includes('undecided')) return 'undecided'
  return ''
}

const inputClassName =
  'mt-2 w-full rounded-card-sm border border-border bg-bg px-3 py-3 text-sm text-text placeholder:text-muted/70 transition-colors focus:border-accent focus:outline-none'

export const ContactPage = () => {
  const { contactPage, contacts, seo } = site
  usePageSeo(seo.contact, '/contact')
  const formCopy = contactPage.form
  const [searchParams] = useSearchParams()

  const [form, setForm] = useState<FormState>({
    name: '',
    contact: '',
    projectType: '',
    message: '',
    consent: false,
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const allowed = formCopy.projectTypes.map((item) => item.value)
    const service = searchParams.get('service')
    const intent = searchParams.get('intent')
    const nextType = resolveProjectType(service, intent, allowed)

    if (!nextType) return

    setForm((prev) => (prev.projectType ? prev : { ...prev, projectType: nextType }))
  }, [searchParams, formCopy.projectTypes])

  const contactCards = [
    contacts.email
      ? { title: 'Email', value: contacts.email, href: `mailto:${contacts.email}`, icon: 'mail' as const }
      : null,
    contacts.phone
      ? {
          title: 'Телефон',
          value: contacts.phone,
          href: `tel:${contacts.phone.replace(/[^\d+]/g, '')}`,
          icon: 'phone' as const,
        }
      : null,
    contacts.telegram
      ? {
          title: 'Telegram',
          value: 'Написать в Telegram',
          href: contacts.telegram,
          icon: 'send' as const,
        }
      : null,
    contacts.whatsapp
      ? {
          title: 'WhatsApp',
          value: 'Написать в WhatsApp',
          href: contacts.whatsapp,
          icon: 'message-circle' as const,
        }
      : null,
    contacts.location
      ? { title: 'Локация', value: contacts.location, icon: 'map-pin' as const }
      : null,
    contacts.workHours
      ? { title: 'Часы работы', value: contacts.workHours, icon: 'clock' as const }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null)

  const validate = (): FieldErrors => {
    const next: FieldErrors = {}

    if (form.name.trim().length < 2) next.name = formCopy.errorName
    if (form.contact.trim().length < 4) next.contact = formCopy.errorContact
    if (!form.projectType) next.projectType = formCopy.errorProjectType
    if (form.message.trim().length < 10) next.message = formCopy.errorMessage
    if (!form.consent) next.consent = formCopy.errorConsent

    return next
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatusMessage(null)

    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const endpoint = import.meta.env.VITE_FORM_ENDPOINT as string | undefined

    if (!endpoint) {
      setStatusMessage(formCopy.demoSuccess)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          contact: form.contact.trim(),
          projectType: form.projectType,
          message: form.message.trim(),
          consent: form.consent,
          page: 'contact',
        }),
      })

      if (!response.ok) throw new Error('network')

      setStatusMessage(formCopy.success)
      setForm({
        name: '',
        contact: '',
        projectType: '',
        message: '',
        consent: false,
      })
    } catch {
      setStatusMessage(formCopy.errorNetwork)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <section className="relative overflow-hidden">
        <Container className="relative py-14 md:py-20">
          <SectionReveal>
            <h1 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight text-text md:text-4xl">
              {contactPage.heroTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-muted md:text-lg">{contactPage.heroText}</p>
            {contacts.responseTimeText ? (
              <p className="mt-3 text-sm text-muted">{contacts.responseTimeText}</p>
            ) : null}
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              {contactPage.advantages.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-text/90">
                  <IconBadge icon="sparkles" className="size-8" size={14} />
                  {item}
                </li>
              ))}
            </ul>
          </SectionReveal>
        </Container>
      </section>

      <Section className="pt-0" reveal={false}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
          <SectionReveal>
            {contactCards.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {contactCards.map((card) => (
                  <li key={card.title}>
                    <ContactCard
                      title={card.title}
                      value={card.value}
                      href={card.href}
                      icon={card.icon}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-card-md border border-border bg-surface-soft px-5 py-6 text-sm text-muted">
                Контактные данные появятся после заполнения в content/site.ts. Пока можно оставить
                заявку через форму.
              </p>
            )}
          </SectionReveal>

          <SectionReveal delay={0.08}>
            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col gap-5 rounded-card-md border border-border bg-surface p-6 shadow-card-sm md:p-8"
            >
              <div>
                <label htmlFor="name" className="text-sm font-medium text-text">
                  {formCopy.nameLabel}
                </label>
                <input
                  id="name"
                  name="name"
                  autoComplete="name"
                  value={form.name}
                  aria-invalid={Boolean(errors.name)}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder={formCopy.namePlaceholder}
                  className={inputClassName}
                />
                {errors.name ? (
                  <p role="alert" className="mt-2 text-sm text-danger">
                    {errors.name}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="contact" className="text-sm font-medium text-text">
                  {formCopy.contactLabel}
                </label>
                <input
                  id="contact"
                  name="contact"
                  autoComplete="email"
                  value={form.contact}
                  aria-invalid={Boolean(errors.contact)}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, contact: event.target.value }))
                  }
                  placeholder={formCopy.contactPlaceholder}
                  className={inputClassName}
                />
                {errors.contact ? (
                  <p role="alert" className="mt-2 text-sm text-danger">
                    {errors.contact}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="projectType" className="text-sm font-medium text-text">
                  {formCopy.projectTypeLabel}
                </label>
                <select
                  id="projectType"
                  name="projectType"
                  value={form.projectType}
                  aria-invalid={Boolean(errors.projectType)}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, projectType: event.target.value }))
                  }
                  className={inputClassName}
                >
                  <option value="">Выберите тип проекта</option>
                  {formCopy.projectTypes.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.projectType ? (
                  <p role="alert" className="mt-2 text-sm text-danger">
                    {errors.projectType}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="message" className="text-sm font-medium text-text">
                  {formCopy.messageLabel}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={form.message}
                  aria-invalid={Boolean(errors.message)}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, message: event.target.value }))
                  }
                  placeholder={formCopy.messagePlaceholder}
                  className={`${inputClassName} resize-y`}
                />
                {errors.message ? (
                  <p role="alert" className="mt-2 text-sm text-danger">
                    {errors.message}
                  </p>
                ) : null}
              </div>

              <ConsentCheckbox
                checked={form.consent}
                label={formCopy.consentLabel}
                error={errors.consent}
                onChange={(checked) => setForm((prev) => ({ ...prev, consent: checked }))}
              />

              {statusMessage ? (
                <p role="status" className="text-sm text-accent">
                  {statusMessage}
                </p>
              ) : null}

              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? formCopy.loading : formCopy.submit}
              </Button>
            </form>
          </SectionReveal>
        </div>
      </Section>

      <Section className="bg-surface-soft/70" reveal={false}>
        <SectionReveal>
          <SectionHeading title={contactPage.needsTitle} />
        </SectionReveal>
        <ul className="grid gap-4 sm:grid-cols-2">
          {contactPage.needs.map((need, index) => (
            <li key={need.title}>
              <SectionReveal delay={index * 0.05}>
                <FeatureCard title={need.title} text={need.text} icon={need.icon} />
              </SectionReveal>
            </li>
          ))}
        </ul>
      </Section>

      <Section reveal={false}>
        <SectionReveal>
          <SectionHeading title={contactPage.afterTitle} />
        </SectionReveal>
        <ol className="grid gap-8 sm:grid-cols-3">
          {contactPage.afterSteps.map((step, index) => (
            <li key={step.number}>
              <SectionReveal delay={index * 0.05}>
                <StepCard number={step.number} title={step.title} text={step.text} />
              </SectionReveal>
            </li>
          ))}
        </ol>
      </Section>

      <Section className="bg-surface-soft/70" reveal={false}>
        <SectionReveal>
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-text md:text-2xl">
                {contactPage.mapRemoteText}
              </h2>
              {contacts.location ? (
                <p className="mt-3 text-muted">{contacts.location}</p>
              ) : (
                <p className="mt-3 text-muted">
                  Готовы обсуждать проект из любого города — созвон и согласования онлайн.
                </p>
              )}
            </div>
            <MapIllustration />
          </div>
        </SectionReveal>
      </Section>

      <GradientCta
        title={contactPage.ctaTitle}
        text={contactPage.ctaText}
        button={contactPage.ctaButton}
      />
    </>
  )
}
