export type NavItem = {
  label: string
  to: string
}

export type Brand = {
  name: string
  descriptor: string
  mark: string
}

export type Contacts = {
  email: string
  telegram: string
  telegramLabel: string
  availabilityTitle: string
  availabilityText: string
}

export type SeoPage = {
  title: string
  description: string
}

export type SeoContent = {
  home: SeoPage
  privacy: SeoPage
  consent: SeoPage
  notFound: SeoPage
}

export type HeroMeta = {
  number: string
  text: string
}

export type HomeHero = {
  eyebrow: string
  headline: string
  headlineEm: string
  lead: string
  primaryCta: { label: string; to: string }
  secondaryCta: { label: string; to: string }
  meta: HeroMeta[]
  trustLabel: string
  trustItems: string[]
}

export type ServiceArt = 'browser' | 'phone' | 'type' | 'speed'

export type ServiceCard = {
  id: string
  number: string
  icon: string
  title: string
  text: string
  features: string[]
  art: ServiceArt
  variant: 'featured' | 'coral' | 'ink' | 'blue'
}

export type CaseVisual = 'shop' | 'erp' | 'owl'

export type CaseCard = {
  id: string
  title: string
  text: string
  tags: string[]
  cta: { label: string; to: string }
  visual: CaseVisual
  variant: 'lime' | 'violet' | 'sand'
}

export type ProcessStep = {
  number: string
  icon: string
  title: string
  text: string
  result: string
}

export type TeamMember = {
  id: string
  name: string
  role: string
  initial: string
  avatar: 'd' | 'm' | 'o' | 'n'
}

export type ContactFormCopy = {
  nameLabel: string
  namePlaceholder: string
  contactLabel: string
  contactPlaceholder: string
  messageLabel: string
  messagePlaceholder: string
  consentBefore: string
  consentLink: string
  and: string
  privacyLink: string
  consentAfter: string
  submit: string
  statusIdle: string
  statusError: string
  statusSuccess: string
}

export type ContactSection = {
  eyebrow: string
  title: string
  titleEm: string
  text: string
  form: ContactFormCopy
  directLabel: string
}

export type SectionHeading = {
  number: string
  eyebrow: string
  title: string
  titleEm: string
  text: string
}

export type HomeContent = {
  hero: HomeHero
  servicesHeading: SectionHeading
  workHeading: SectionHeading
  processHeading: SectionHeading
  team: {
    number: string
    eyebrow: string
    title: string
    titleEm: string
    text: string
    noteTitle: string
    noteText: string
  }
  contact: ContactSection
}

export type LegalDocument = {
  eyebrow: string
  title: string
  warning: string
  html: string
  dateLabel: string
  dateValue: string
}

export type LegalContent = {
  privacy: LegalDocument
  consent: LegalDocument
  links: Array<{ label: string; to: string }>
  tagline: string
}

export type NotFoundContent = {
  eyebrow: string
  title: string
  cta: string
}

export type SiteContent = {
  brand: Brand
  seo: SeoContent
  contacts: Contacts
  navigation: NavItem[]
  headerCta: { label: string; to: string }
  home: HomeContent
  services: ServiceCard[]
  cases: CaseCard[]
  process: ProcessStep[]
  team: TeamMember[]
  legal: LegalContent
  notFound: NotFoundContent
}
