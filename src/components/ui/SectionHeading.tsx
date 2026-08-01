import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'

type SectionHeadingProps = {
  title: string
  text?: string
  link?: { label: string; to: string }
  align?: 'left' | 'center'
  children?: ReactNode
  className?: string
}

export const SectionHeading = ({
  title,
  text,
  link,
  align = 'left',
  children,
  className = '',
}: SectionHeadingProps) => {
  const isCenter = align === 'center'

  return (
    <div
      className={[
        'mb-10 flex flex-col gap-4',
        isCenter ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={isCenter ? 'max-w-2xl' : 'max-w-2xl'}>
        <h2 className="text-balance text-2xl font-semibold tracking-tight text-text md:text-3xl">
          {title}
        </h2>
        {text ? <p className="mt-3 text-muted">{text}</p> : null}
        {children}
      </div>

      {link ? (
        <Link
          to={link.to}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-accent transition-colors hover:text-accent-strong"
        >
          {link.label}
          <ArrowRight size={16} aria-hidden />
        </Link>
      ) : null}
    </div>
  )
}
