/** Lucide icon keys — mapped to components in UI layer */
export type IconKey =
  | 'store'
  | 'building-2'
  | 'layout-dashboard'
  | 'palette'
  | 'package'
  | 'shopping-cart'
  | 'credit-card'
  | 'truck'
  | 'chart-column'
  | 'circle-help'
  | 'mail'
  | 'phone'
  | 'send'
  | 'message-circle'
  | 'map-pin'
  | 'clock'
  | 'sparkles'
  | 'smartphone'
  | 'plug'
  | 'life-buoy'
  | 'search'
  | 'pen-line'
  | 'code-2'
  | 'rocket'
  | 'users'
  | 'eye'
  | 'shield-check'
  | 'layers'
  | 'refresh-cw'
  | 'zap'

export type NavItem = {
  label: string
  to: string
}

export type CtaLink = {
  label: string
  to: string
}

export type Brand = {
  /** TODO: временное название, заменить до публикации */
  name: string
  descriptor: string
  shortName: string
}

export type Contacts = {
  email: string
  phone: string
  telegram: string
  whatsapp: string
  location: string
  workHours: string
  /** Shown only when non-empty — e.g. «обычно отвечаем в течение дня» */
  responseTimeText: string
}

export type SeoPage = {
  title: string
  description: string
}

export type SeoContent = {
  home: SeoPage
  services: SeoPage
  work: SeoPage
  contact: SeoPage
  privacy: SeoPage
  personalData: SeoPage
}

export type ServiceId =
  | 'ecommerce'
  | 'business-site'
  | 'web-app'
  | 'design-support'

export type Service = {
  id: ServiceId
  title: string
  summary: string
  features: string[]
  icon: IconKey
  /** Prefills contact form via `?service=` */
  queryValue: string
}

export type YandexKitFeature = {
  title: string
  icon: IconKey
}

export type YandexKitContent = {
  title: string
  description: string
  features: YandexKitFeature[]
  note: string
  cta: CtaLink
  /** Extended copy for Services page */
  longDescription: string
  responsibilities: string[]
  disclaimer: string
}

export type CaseCategoryId =
  | 'ecommerce'
  | 'web-service'
  | 'digital-product'
  | 'ux-ui'

export type CaseCoverKey = 'store' | 'dashboard' | 'product'

export type CaseStudy = {
  id: string
  title: string
  categoryId: CaseCategoryId
  categoryLabel: string
  summary: string
  task: string
  done: string[]
  features: string[]
  result: string
  /** Real project URL; omit or leave empty to hide link */
  href: string
  cover: CaseCoverKey
}

export type CaseFilter = {
  id: 'all' | CaseCategoryId
  label: string
}

export type TeamMember = {
  id: string
  name: string
  role: string
  initials: string
  /** Optional photo path; empty → initials avatar */
  photo: string
}

export type ProcessStep = {
  number: string
  title: string
  text: string
}

export type FaqItem = {
  question: string
  answer: string
}

export type LegalLink = {
  label: string
  to: string
}

export type LegalContent = {
  footerNote: string
  links: LegalLink[]
  privacyPlaceholder: string
  personalDataPlaceholder: string
}

export type HomeHero = {
  headline: string
  support: string
  primaryCta: CtaLink
  secondaryCta: CtaLink
  advantages: string[]
}

export type HomeContent = {
  hero: HomeHero
  servicesTitle: string
  servicesText: string
  servicesAllLink: CtaLink
  casesTitle: string
  casesText: string
  casesAllLink: CtaLink
  processTitle: string
  teamTitle: string
  teamText: string
  teamAdvantages: string[]
  ctaTitle: string
  ctaText: string
  ctaButton: CtaLink
}

export type ServicesPageContent = {
  heroTitle: string
  heroText: string
  primaryCta: CtaLink
  secondaryCta: CtaLink
  processTitle: string
  processSteps: ProcessStep[]
  faqTitle: string
  ctaTitle: string
  ctaButton: CtaLink
}

export type WorkPageContent = {
  heroTitle: string
  heroText: string
  filters: CaseFilter[]
  emptyFilterMessage: string
  /**
   * Extra compact case cards under the main list.
   * Leave empty to hide the section entirely.
   * To add a case later: push an object with title, categoryLabel, summary, href?.
   */
  additionalCases: Array<{
    title: string
    categoryLabel: string
    summary: string
    href: string
  }>
  ctaTitle: string
  ctaText: string
  primaryCta: CtaLink
  secondaryCta: CtaLink
}

export type ProjectTypeOption = {
  value: string
  label: string
}

export type ContactNeed = {
  title: string
  text: string
  icon: IconKey
}

export type ContactAfterStep = {
  number: string
  title: string
  text: string
}

export type ContactFormContent = {
  nameLabel: string
  namePlaceholder: string
  contactLabel: string
  contactPlaceholder: string
  projectTypeLabel: string
  projectTypes: ProjectTypeOption[]
  messageLabel: string
  messagePlaceholder: string
  consentLabel: string
  submit: string
  success: string
  demoSuccess: string
  errorName: string
  errorContact: string
  errorProjectType: string
  errorMessage: string
  errorConsent: string
  errorNetwork: string
  loading: string
}

export type ContactPageContent = {
  heroTitle: string
  heroText: string
  advantages: string[]
  form: ContactFormContent
  needsTitle: string
  needs: ContactNeed[]
  afterTitle: string
  afterSteps: ContactAfterStep[]
  mapRemoteText: string
  ctaTitle: string
  ctaText: string
  ctaButton: CtaLink
}

export type FooterContent = {
  description: string
  rights: string
}

export type SiteContent = {
  brand: Brand
  seo: SeoContent
  contacts: Contacts
  navigation: NavItem[]
  footer: FooterContent
  home: HomeContent
  servicesPage: ServicesPageContent
  workPage: WorkPageContent
  contactPage: ContactPageContent
  services: Service[]
  yandexKit: YandexKitContent
  cases: CaseStudy[]
  team: TeamMember[]
  process: ProcessStep[]
  faq: FaqItem[]
  legal: LegalContent
}
