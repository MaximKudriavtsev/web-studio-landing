import { Check } from 'lucide-react'
import { Button } from '../components/Button'
import { SectionReveal } from '../components/SectionReveal'
import { Container } from '../components/layout/Container'
import { Section } from '../components/layout/Section'
import { Accordion } from '../components/ui/Accordion'
import { GradientCta } from '../components/ui/GradientCta'
import { IconBadge } from '../components/ui/IconBadge'
import { SectionHeading } from '../components/ui/SectionHeading'
import { ServiceCard } from '../components/ui/ServiceCard'
import { StepCard } from '../components/ui/StepCard'
import { DashboardPreview } from '../components/illustrations/DashboardPreview'
import { site } from '../content/site'
import { usePageSeo } from '../hooks/usePageSeo'

export const ServicesPage = () => {
  const { servicesPage, services, yandexKit, faq, seo } = site
  usePageSeo(seo.services, '/services')

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-10 h-72 w-72 rounded-full opacity-45 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(91,92,240,0.2) 0%, transparent 70%)',
          }}
        />

        <Container className="relative grid items-center gap-10 py-14 md:py-20 lg:grid-cols-2">
          <SectionReveal>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-text md:text-4xl">
              {servicesPage.heroTitle}
            </h1>
            <p className="mt-4 max-w-xl text-muted md:text-lg">{servicesPage.heroText}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button to={servicesPage.primaryCta.to}>
                {servicesPage.primaryCta.label}
              </Button>
              <Button to={servicesPage.secondaryCta.to} variant="secondary">
                {servicesPage.secondaryCta.label}
              </Button>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <div className="rounded-card-lg border border-border bg-surface p-4 shadow-card-md sm:p-6">
              <DashboardPreview />
            </div>
          </SectionReveal>
        </Container>
      </section>

      {/* 4 направления */}
      <Section reveal={false}>
        <ul className="grid gap-5 md:grid-cols-2">
          {services.map((service, index) => (
            <li key={service.id} className="h-full">
              <SectionReveal delay={index * 0.05} className="h-full">
                <ServiceCard service={service} detailed />
              </SectionReveal>
            </li>
          ))}
        </ul>
      </Section>

      {/* Яндекс КИТ */}
      <Section className="bg-surface-soft/70" reveal={false}>
        <SectionReveal>
          <div className="rounded-card-lg border border-border bg-surface p-6 shadow-card-sm md:p-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
              <div>
                <IconBadge icon="store" />
                <h2 className="mt-4 text-balance text-xl font-semibold tracking-tight text-text md:text-2xl">
                  {yandexKit.title}
                </h2>
                <p className="mt-3 text-muted">{yandexKit.longDescription}</p>
                <p className="mt-4 text-sm text-muted">{yandexKit.disclaimer}</p>
                <div className="mt-6">
                  <Button to={yandexKit.cta.to}>{yandexKit.cta.label}</Button>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold tracking-tight text-text">
                  Что можем взять на себя
                </p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {yandexKit.responsibilities.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-text/90">
                      <Check size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </SectionReveal>
      </Section>

      {/* Как мы работаем */}
      <Section reveal={false}>
        <SectionReveal>
          <SectionHeading title={servicesPage.processTitle} />
        </SectionReveal>

        <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {servicesPage.processSteps.map((step, index) => (
            <li key={step.number}>
              <SectionReveal delay={index * 0.05}>
                <StepCard number={step.number} title={step.title} text={step.text} />
              </SectionReveal>
            </li>
          ))}
        </ol>
      </Section>

      {/* FAQ */}
      <Section className="bg-surface-soft/70" reveal={false}>
        <SectionReveal>
          <SectionHeading title={servicesPage.faqTitle} />
          <Accordion items={faq} />
        </SectionReveal>
      </Section>

      <GradientCta title={servicesPage.ctaTitle} button={servicesPage.ctaButton} />
    </>
  )
}
