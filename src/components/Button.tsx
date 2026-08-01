import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'onAccent'

type ButtonProps = {
  children: ReactNode
  to?: string
  href?: string
  type?: 'button' | 'submit'
  variant?: ButtonVariant
  className?: string
  onClick?: () => void
  disabled?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-strong shadow-card-sm',
  secondary:
    'bg-surface text-text border border-border hover:border-accent hover:text-accent',
  ghost: 'bg-transparent text-muted hover:text-text',
  onAccent: 'bg-white text-accent hover:bg-white/90 shadow-card-sm',
}

export const Button = ({
  children,
  to,
  href,
  type = 'button',
  variant = 'primary',
  className = '',
  onClick,
  disabled = false,
}: ButtonProps) => {
  const classes = [
    'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold tracking-wide transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50',
    variants[variant],
    className,
  ].join(' ')

  if (to) {
    return (
      <Link to={to} className={classes} onClick={onClick}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}
