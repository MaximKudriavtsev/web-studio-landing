import { Send } from 'lucide-react'
import { Button } from '../Button'
import { Container } from '../layout/Container'

type GradientCtaProps = {
  title: string
  text?: string
  button: { label: string; to: string }
  className?: string
}

export const GradientCta = ({ title, text, button, className = '' }: GradientCtaProps) => {
  return (
    <section className={['py-16 md:py-20', className].filter(Boolean).join(' ')}>
      <Container>
        <div className="relative overflow-hidden rounded-card-lg bg-gradient-to-br from-accent to-accent-strong px-6 py-10 text-white shadow-card-md md:px-10 md:py-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-white/10 blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 left-1/3 size-72 rounded-full bg-white/10 blur-3xl"
          />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex max-w-2xl items-start gap-4">
              <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Send size={20} aria-hidden />
              </span>
              <div>
                <h2 className="text-balance text-xl font-semibold tracking-tight md:text-2xl">
                  {title}
                </h2>
                {text ? <p className="mt-2 text-sm text-white/85 md:text-base">{text}</p> : null}
              </div>
            </div>

            <Button to={button.to} variant="onAccent" className="shrink-0 self-start md:self-center">
              {button.label}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}
