import type { IconKey } from '../../content/types'
import { IconBadge } from './IconBadge'

type ContactCardProps = {
  title: string
  value: string
  href?: string
  icon: IconKey
  className?: string
}

export const ContactCard = ({
  title,
  value,
  href,
  icon,
  className = '',
}: ContactCardProps) => {
  const content = (
    <>
      <IconBadge icon={icon} />
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{title}</p>
        <p className="mt-1 font-semibold text-text">{value}</p>
      </div>
    </>
  )

  const classes = [
    'flex items-center gap-4 rounded-card-md border border-border bg-surface p-5 shadow-card-sm transition-colors',
    href ? 'hover:border-accent' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
      >
        {content}
      </a>
    )
  }

  return <div className={classes}>{content}</div>
}
