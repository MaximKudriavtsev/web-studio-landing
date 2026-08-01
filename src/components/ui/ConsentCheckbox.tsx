import { useId } from 'react'
import { Link } from 'react-router-dom'

type ConsentCheckboxProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  error?: string
  className?: string
}

export const ConsentCheckbox = ({
  checked,
  onChange,
  label,
  error,
  className = '',
}: ConsentCheckboxProps) => {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className={className}>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm text-muted">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-1 size-4 shrink-0 rounded border-border accent-accent"
        />
        <span>
          {label}{' '}
          <Link to="/privacy" className="font-medium text-accent hover:text-accent-strong">
            Подробнее о политике
          </Link>
          {' · '}
          <Link to="/personal-data" className="font-medium text-accent hover:text-accent-strong">
            О согласии на ПД
          </Link>
        </span>
      </label>
      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}
