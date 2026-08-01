import type { IconKey } from '../../content/types'
import { getIcon } from './iconMap'

type IconBadgeProps = {
  icon: IconKey
  className?: string
  size?: number
}

export const IconBadge = ({ icon, className = '', size = 20 }: IconBadgeProps) => {
  const Icon = getIcon(icon)

  return (
    <span
      className={[
        'inline-flex size-11 shrink-0 items-center justify-center rounded-card-sm bg-accent-soft text-accent',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Icon size={size} aria-hidden />
    </span>
  )
}
