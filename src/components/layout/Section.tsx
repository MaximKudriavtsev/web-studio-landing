import type { ReactNode } from 'react'
import { Container } from './Container'
import { SectionReveal } from '../SectionReveal'

type SectionProps = {
  children: ReactNode
  id?: string
  className?: string
  containerClassName?: string
  reveal?: boolean
}

export const Section = ({
  children,
  id,
  className = '',
  containerClassName = '',
  reveal = true,
}: SectionProps) => {
  const content = (
    <Container className={containerClassName}>{children}</Container>
  )

  return (
    <section id={id} className={['py-16 md:py-20', className].filter(Boolean).join(' ')}>
      {reveal ? <SectionReveal>{content}</SectionReveal> : content}
    </section>
  )
}
