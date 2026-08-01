import { motion, useReducedMotion } from 'motion/react'
import { Check } from 'lucide-react'
import { Button } from '../components/Button'
import { SectionReveal } from '../components/SectionReveal'
import { Container } from '../components/layout/Container'
import { Section } from '../components/layout/Section'
import { CaseCard } from '../components/ui/CaseCard'
import { FeatureCard } from '../components/ui/FeatureCard'
import { GradientCta } from '../components/ui/GradientCta'
import { IconBadge } from '../components/ui/IconBadge'
import { SectionHeading } from '../components/ui/SectionHeading'
import { ServiceCard } from '../components/ui/ServiceCard'
import { StepCard } from '../components/ui/StepCard'
import { HeroDevices } from '../components/illustrations/HeroDevices'
import { site } from '../content/site'
import type { IconKey } from '../content/types'
import { usePageSeo } from '../hooks/usePageSeo'

const heroAdvantageIcons: IconKey[] = ['palette', 'smartphone', 'plug', 'life-buoy']

export const HomePage = () => {
  const prefersReducedMotion = useReducedMotion()
  const { home, services, yandexKit, cases, process, team, seo } = site
  usePageSeo(seo.home, '/')

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
      {/* Hero + Яндекс КИТ — одна композиция первого экрана */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-4 h-[22rem] w-[22rem] rounded-full opacity-55 blur-3xl md:top-10 md:h-[24rem] md:w-[24rem]"
          style={{
            background:
              'radial-gradient(circle, rgba(91,92,240,0.24) 0%, transparent 70%)',
          }}
        />

        <Container className="relative pt-10 pb-8 md:pt-12 md:pb-10">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8 xl:gap-10">
            <div className="min-w-0">
              <motion.h1
                className="max-w-xl text-balance text-3xl font-semibold tracking-tight text-text sm:text-4xl lg:text-[2.65rem] lg:leading-[1.18]"
                {...fadeUp(0)}
              >
                {home.hero.headline}
              </motion.h1>

              <motion.p
                className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-muted md:mt-5 md:text-base"
                {...fadeUp(0.1)}
              >
                {home.hero.support}
              </motion.p>

              <motion.div
                className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row sm:items-center sm:gap-3.5"
                {...fadeUp(0.2)}
              >
                <Button to={home.hero.primaryCta.to}>{home.hero.primaryCta.label}</Button>
                <Button to={home.hero.secondaryCta.to} variant="secondary">
                  {home.hero.secondaryCta.label}
                </Button>
              </motion.div>

              <motion.ul
                className="mt-8 grid grid-cols-1 gap-x-5 gap-y-3 xs:grid-cols-2 sm:mt-9 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4"
                {...fadeUp(0.3)}
              >
                {home.hero.advantages.map((label, index) => (
                  <li
                    key={label}
                    className="grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] items-center gap-2"
                  >
                    <IconBadge
                      icon={heroAdvantageIcons[index] ?? 'sparkles'}
                      className="size-8 rounded-lg"
                      size={15}
                    />
                    <span className="text-[0.8125rem] font-medium leading-[1.3] text-text/90">
                      {label}
                    </span>
                  </li>
                ))}
              </motion.ul>
            </div>

            <motion.div className="min-w-0 w-full" {...fadeUp(0.15)}>
              <HeroDevices className="w-full max-w-none" />
            </motion.div>
          </div>

          <SectionReveal className="mt-8 md:mt-10">
            <div className="rounded-card-lg border border-border bg-surface p-5 shadow-card-sm sm:p-6 md:p-7">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.2fr)] lg:items-center lg:gap-8">
                <div className="min-w-0">
                  <IconBadge
                    icon="store"
                    className="size-12 rounded-[0.85rem] bg-accent text-white"
                    size={22}
                  />
                  <h2 className="mt-3.5 text-balance text-xl font-semibold tracking-tight text-text md:text-[1.35rem] md:leading-snug">
                    {yandexKit.title}
                  </h2>
                  <p className="mt-2.5 max-w-md text-sm leading-relaxed text-muted md:text-[0.95rem]">
                    {yandexKit.description}
                  </p>
                </div>

                <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {yandexKit.features.map((feature) => (
                    <li key={feature.title}>
                      <FeatureCard
                        title={feature.title}
                        icon={feature.icon}
                        className="h-full items-center gap-2.5 p-3 shadow-none"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </SectionReveal>
        </Container>
      </section>

      {/* Услуги */}
      <Section reveal={false}>
        <SectionReveal>
          <SectionHeading
            title={home.servicesTitle}
            text={home.servicesText}
            link={home.servicesAllLink}
          />
        </SectionReveal>

        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {services.map((service, index) => (
            <li key={service.id} className="h-full">
              <SectionReveal delay={index * 0.05} className="h-full">
                <ServiceCard service={service} />
              </SectionReveal>
            </li>
          ))}
        </ul>
      </Section>

      {/* Кейсы */}
      <Section className="bg-surface-soft/70" reveal={false}>
        <SectionReveal>
          <SectionHeading
            title={home.casesTitle}
            text={home.casesText}
            link={home.casesAllLink}
          />
        </SectionReveal>

        <ul className="grid gap-5 md:grid-cols-3">
          {cases.map((item, index) => (
            <li key={item.id} className="h-full">
              <SectionReveal delay={index * 0.06} className="h-full">
                <CaseCard item={item} compact />
              </SectionReveal>
            </li>
          ))}
        </ul>
      </Section>

      {/* Процесс */}
      <Section id="process" reveal={false}>
        <SectionReveal>
          <SectionHeading title={home.processTitle} />
        </SectionReveal>

        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-3 hidden h-px border-t border-dashed border-accent/35 lg:block"
          />
          <ol className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {process.map((step, index) => (
              <li key={step.number} className="relative">
                <span
                  aria-hidden
                  className="absolute left-0 top-2.5 hidden size-2 -translate-y-1/2 rounded-full bg-accent lg:block"
                />
                <SectionReveal delay={index * 0.06}>
                  <StepCard
                    number={step.number}
                    title={step.title}
                    text={step.text}
                    className="lg:pt-4"
                  />
                </SectionReveal>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* Команда */}
      <Section className="bg-surface-soft/70" reveal={false}>
        <SectionReveal>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr_0.9fr] lg:items-start">
            <div>
              <h2 className="text-balance text-2xl font-semibold tracking-tight text-text md:text-3xl">
                {home.teamTitle}
              </h2>
              <p className="mt-4 text-muted">{home.teamText}</p>
            </div>

            <ul className="grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {team.map((member) => (
                <li key={member.id} className="text-center">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt=""
                      className="mx-auto size-16 rounded-full object-cover ring-2 ring-border"
                    />
                  ) : (
                    <span
                      className="mx-auto flex size-16 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent ring-2 ring-border"
                      aria-hidden
                    >
                      {member.initials}
                    </span>
                  )}
                  <p className="mt-3 text-sm font-semibold tracking-tight text-text">
                    {member.name}
                  </p>
                  <p className="mt-1 text-xs text-muted">{member.role}</p>
                </li>
              ))}
            </ul>

            <ul className="flex flex-col gap-3">
              {home.teamAdvantages.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 rounded-card-md border border-border bg-surface px-4 py-3 text-sm text-text shadow-card-sm"
                >
                  <Check size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </SectionReveal>
      </Section>

      <GradientCta title={home.ctaTitle} text={home.ctaText} button={home.ctaButton} />
    </>
  )
}
