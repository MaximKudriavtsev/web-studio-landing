import { SectionReveal } from '../components/SectionReveal'
import { Container } from '../components/layout/Container'
import { site } from '../content/site'
import { usePageSeo } from '../hooks/usePageSeo'

export const PersonalDataPage = () => {
  const { legal, seo } = site
  usePageSeo(seo.personalData, '/personal-data')

  return (
    <section className="py-14 md:py-20">
      <Container>
        <SectionReveal>
          <h1 className="text-3xl font-semibold tracking-tight text-text md:text-4xl">
            {seo.personalData.title}
          </h1>
          <p className="mt-6 max-w-3xl whitespace-pre-line text-muted md:text-lg">
            {legal.personalDataPlaceholder}
          </p>
          <p className="mt-8 rounded-card-md border border-border bg-surface-soft px-5 py-4 text-sm text-muted">
            {legal.footerNote}
          </p>
        </SectionReveal>
      </Container>
    </section>
  )
}
