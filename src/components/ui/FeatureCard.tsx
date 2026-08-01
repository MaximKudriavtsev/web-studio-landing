import type { IconKey } from '../../content/types'
import { IconBadge } from './IconBadge'

type FeatureCardProps = {
  title: string
  text?: string
  icon: IconKey
  className?: string
}

export const FeatureCard = ({ title, text, icon, className = '' }: FeatureCardProps) => {
  return (
    <article
      className={[
        'flex gap-3 rounded-card-md border border-border bg-surface p-5 shadow-card-sm',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <IconBadge icon={icon} className="size-10" size={18} />
      <div>
        <h3 className="font-semibold tracking-tight text-text">{title}</h3>
        {text ? <p className="mt-1 text-sm text-muted">{text}</p> : null}
      </div>
    </article>
  )
}
