import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { Button } from '../components/Button'
import { SectionReveal } from '../components/SectionReveal'
import { home, services, site } from '../content/site'

export const HomePage = () => {
  const prefersReducedMotion = useReducedMotion()

  const fadeUp = (delay: number) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const, delay },
        }

  return (
    <>
      <section className="relative min-h-[calc(100dvh-4.25rem)] overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, transparent 40%, rgba(45,212,191,0.06) 100%), linear-gradient(to top, var(--color-bg) 0%, transparent 45%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-1/4 h-[28rem] w-[28rem] rounded-full opacity-30 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(45,212,191,0.35) 0%, transparent 70%)',
          }}
        />

        <div className="page-shell relative flex min-h-[calc(100dvh-4.25rem)] flex-col justify-center py-16 md:py-24">
          <motion.p
            className="font-display text-4xl font-semibold tracking-tight text-accent sm:text-5xl md:text-6xl lg:text-7xl"
            {...fadeUp(0)}
          >
            {site.brand}
          </motion.p>

          <motion.h1
            className="mt-6 max-w-3xl font-display text-2xl font-medium leading-tight tracking-tight text-balance text-text sm:text-3xl md:text-4xl lg:text-[2.75rem]"
            {...fadeUp(0.12)}
          >
            {home.headline}
          </motion.h1>

          <motion.p
            className="mt-5 max-w-xl text-base text-muted md:text-lg"
            {...fadeUp(0.22)}
          >
            {home.support}
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
            {...fadeUp(0.32)}
          >
            <Button to={home.primaryCta.to}>
              {home.primaryCta.label}
              <ArrowRight size={16} />
            </Button>
            <Button to={home.secondaryCta.to} variant="secondary">
              {home.secondaryCta.label}
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-border/50 py-20 md:py-28">
        <div className="page-shell">
          <SectionReveal>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Услуги
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-2xl font-semibold tracking-tight md:text-3xl">
              {home.servicesTeaserTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-muted">{home.servicesTeaserText}</p>
          </SectionReveal>

          <ul className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-2">
            {services.items.slice(0, 4).map((item, index) => (
              <SectionReveal key={item.title} delay={index * 0.06}>
                <li className="border-t border-border/70 pt-5">
                  <h3 className="font-display text-lg font-medium tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted md:text-base">{item.text}</p>
                </li>
              </SectionReveal>
            ))}
          </ul>

          <SectionReveal className="mt-10">
            <Button to="/services" variant="secondary">
              Все услуги
              <ArrowRight size={16} />
            </Button>
          </SectionReveal>
        </div>
      </section>

      <section className="border-t border-border/50 py-20 md:py-28">
        <div className="page-shell">
          <SectionReveal>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Подход
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-2xl font-semibold tracking-tight md:text-3xl">
              {home.approachTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-muted">{home.approachText}</p>
          </SectionReveal>

          <ol className="mt-14 grid gap-10 md:grid-cols-3">
            {home.approachSteps.map((step, index) => (
              <SectionReveal key={step.title} delay={index * 0.08}>
                <li>
                  <span className="font-display text-sm font-semibold text-accent">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-medium tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted md:text-base">{step.text}</p>
                </li>
              </SectionReveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-border/50 py-20 md:py-28">
        <div className="page-shell">
          <SectionReveal>
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
                {home.finalCtaTitle}
              </h2>
              <p className="mt-4 text-muted">{home.finalCtaText}</p>
              <div className="mt-8">
                <Button to={home.finalCtaButton.to}>
                  {home.finalCtaButton.label}
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </>
  )
}
