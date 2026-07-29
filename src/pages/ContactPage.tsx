import { useState, type FormEvent } from 'react'
import { SectionReveal } from '../components/SectionReveal'
import { Button } from '../components/Button'
import { contact, site } from '../content/site'

type FormState = {
  name: string
  email: string
  message: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const ContactPage = () => {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    message: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSuccess(false)

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError(contact.form.errorRequired)
      return
    }

    if (!emailPattern.test(form.email.trim())) {
      setError(contact.form.errorEmail)
      return
    }

    setError(null)

    const subject = encodeURIComponent(`Заявка с сайта — ${form.name.trim()}`)
    const body = encodeURIComponent(
      `Имя: ${form.name.trim()}\nEmail: ${form.email.trim()}\n\n${form.message.trim()}`,
    )
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`
    setSuccess(true)
  }

  return (
    <div className="page-shell py-14 md:py-20">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
        <SectionReveal>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            Связаться
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            {contact.title}
          </h1>
          <p className="mt-4 max-w-md text-muted md:text-lg">{contact.intro}</p>

          <dl className="mt-10 space-y-5 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                Email
              </dt>
              <dd className="mt-1">
                <a
                  href={`mailto:${site.email}`}
                  className="text-base transition-colors hover:text-accent"
                >
                  {site.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                Телефон
              </dt>
              <dd className="mt-1">
                <a
                  href={`tel:${site.phone.replace(/[^\d+]/g, '')}`}
                  className="text-base transition-colors hover:text-accent"
                >
                  {site.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                Город
              </dt>
              <dd className="mt-1 text-base">{site.city}</dd>
            </div>
          </dl>
        </SectionReveal>

        <SectionReveal delay={0.08}>
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-5 rounded-lg border border-border/80 bg-bg-elevated/60 p-6 md:p-8"
          >
            <div>
              <label htmlFor="name" className="text-sm font-medium">
                {contact.form.nameLabel}
              </label>
              <input
                id="name"
                name="name"
                autoComplete="name"
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder={contact.form.namePlaceholder}
                className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-3 text-sm text-text placeholder:text-muted/70 transition-colors focus:border-accent"
              />
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-medium">
                {contact.form.emailLabel}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder={contact.form.emailPlaceholder}
                className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-3 text-sm text-text placeholder:text-muted/70 transition-colors focus:border-accent"
              />
            </div>

            <div>
              <label htmlFor="message" className="text-sm font-medium">
                {contact.form.messageLabel}
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={form.message}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, message: event.target.value }))
                }
                placeholder={contact.form.messagePlaceholder}
                className="mt-2 w-full resize-y rounded-md border border-border bg-bg px-3 py-3 text-sm text-text placeholder:text-muted/70 transition-colors focus:border-accent"
              />
            </div>

            {error ? (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            ) : null}

            {success ? (
              <p role="status" className="text-sm text-accent">
                {contact.form.success}
              </p>
            ) : null}

            <Button type="submit" className="w-full sm:w-auto">
              {contact.form.submit}
            </Button>
          </form>
        </SectionReveal>
      </div>
    </div>
  )
}
