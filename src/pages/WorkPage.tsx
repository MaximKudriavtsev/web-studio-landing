import { useState } from 'react'
import { Button } from '../components/Button'
import { SectionReveal } from '../components/SectionReveal'
import { Container } from '../components/layout/Container'
import { Section } from '../components/layout/Section'
import { CaseCard } from '../components/ui/CaseCard'
import { ProductPreview } from '../components/illustrations/ProductPreview'
import { site } from '../content/site'
import type { CaseCategoryId, CaseFilter } from '../content/types'
import { usePageSeo } from '../hooks/usePageSeo'

export const WorkPage = () => {
  const { workPage, cases, seo } = site
  usePageSeo(seo.work, '/work')
  const [activeFilter, setActiveFilter] = useState<CaseFilter['id']>('all')

  const filteredCases =
    activeFilter === 'all'
      ? cases
      : cases.filter((item) => item.categoryId === (activeFilter as CaseCategoryId))

  const handleFilterClick = (id: CaseFilter['id']) => {
    setActiveFilter(id)
  }

  return (
    <>
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
              {workPage.heroTitle}
            </h1>
            <p className="mt-4 max-w-xl text-muted md:text-lg">{workPage.heroText}</p>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <div className="rounded-card-lg border border-border bg-surface p-4 shadow-card-md sm:p-6">
              <ProductPreview />
            </div>
          </SectionReveal>
        </Container>
      </section>

      <Section reveal={false} className="pt-0">
        <SectionReveal>
          <div
            role="group"
            aria-label="Фильтр кейсов"
            className="flex flex-wrap gap-2"
          >
            {workPage.filters.map((filter) => {
              const isPressed = activeFilter === filter.id

              return (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={isPressed}
                  onClick={() => handleFilterClick(filter.id)}
                  className={[
                    'rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                    isPressed
                      ? 'border-accent bg-accent text-white'
                      : 'border-border bg-surface text-text hover:border-accent hover:text-accent',
                  ].join(' ')}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>
        </SectionReveal>

        {filteredCases.length === 0 ? (
          <SectionReveal className="mt-10">
            <p className="rounded-card-md border border-border bg-surface-soft px-5 py-8 text-center text-muted">
              {workPage.emptyFilterMessage}
            </p>
          </SectionReveal>
        ) : (
          <ul className="mt-10 flex flex-col gap-8">
            {filteredCases.map((item, index) => (
              <li key={item.id}>
                <SectionReveal delay={index * 0.05}>
                  <CaseCard item={item} />
                </SectionReveal>
              </li>
            ))}
          </ul>
        )}

        {workPage.additionalCases.length > 0 ? (
          <div className="mt-14">
            <SectionReveal>
              <h2 className="mb-6 text-xl font-semibold tracking-tight text-text">
                Ещё проекты
              </h2>
            </SectionReveal>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {workPage.additionalCases.map((item) => (
                <li key={item.title}>
                  <article className="flex h-full flex-col rounded-card-md border border-border bg-surface p-6 shadow-card-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
                      {item.categoryLabel}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold tracking-tight text-text">
                      {item.title}
                    </h3>
                    <p className="mt-3 flex-1 text-sm text-muted">{item.summary}</p>
                    {item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 text-sm font-semibold text-accent transition-colors hover:text-accent-strong"
                      >
                        Открыть проект →
                      </a>
                    ) : null}
                  </article>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Section>

      <Section reveal={false}>
        <SectionReveal>
          <div className="rounded-card-lg border border-border bg-surface-soft px-6 py-10 text-center md:px-10">
            <h2 className="text-balance text-xl font-semibold tracking-tight text-text md:text-2xl">
              {workPage.ctaTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">{workPage.ctaText}</p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button to={workPage.primaryCta.to}>{workPage.primaryCta.label}</Button>
              <Button to={workPage.secondaryCta.to} variant="secondary">
                {workPage.secondaryCta.label}
              </Button>
            </div>
          </div>
        </SectionReveal>
      </Section>
    </>
  )
}
