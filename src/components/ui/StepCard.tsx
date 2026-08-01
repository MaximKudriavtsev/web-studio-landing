type StepCardProps = {
  number: string
  title: string
  text: string
  className?: string
}

export const StepCard = ({ number, title, text, className = '' }: StepCardProps) => {
  return (
    <article className={['relative', className].filter(Boolean).join(' ')}>
      <p className="text-sm font-semibold tracking-[0.08em] text-accent">{number}</p>
      <h3 className="mt-2 text-base font-semibold tracking-tight text-text">{title}</h3>
      <p className="mt-2 text-sm text-muted">{text}</p>
    </article>
  )
}
