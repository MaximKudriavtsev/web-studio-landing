import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import type { Service } from '../../content/types'
import { IconBadge } from './IconBadge'

type ServiceCardProps = {
  service: Service
  detailed?: boolean
  className?: string
}

export const ServiceCard = ({ service, detailed = false, className = '' }: ServiceCardProps) => {
  const features = detailed ? service.features : service.features.slice(0, 4)

  return (
    <article
      id={service.id}
      className={[
        'flex h-full flex-col rounded-card-md border border-border bg-surface p-6 shadow-card-sm',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <IconBadge icon={service.icon} />
      <h3 className="mt-4 text-lg font-semibold tracking-tight text-text">{service.title}</h3>
      <p className="mt-2 flex-1 text-sm text-muted">{service.summary}</p>

      <ul className="mt-5 flex flex-col gap-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-text/90">
            <Check size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {detailed ? (
        <Link
          to={`/contact?service=${service.queryValue}`}
          className="mt-6 inline-flex text-sm font-semibold text-accent transition-colors hover:text-accent-strong"
        >
          Обсудить эту услугу →
        </Link>
      ) : null}
    </article>
  )
}
