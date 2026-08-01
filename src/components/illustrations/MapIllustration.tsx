type IllustrationProps = {
  className?: string
}

/** Abstract map / remote-work illustration for contact page */
export const MapIllustration = ({ className = '' }: IllustrationProps) => {
  return (
    <div
      className={[
        'relative aspect-[16/9] w-full overflow-hidden rounded-card-lg border border-border bg-surface-soft',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden
    >
      <svg viewBox="0 0 640 360" className="absolute inset-0 size-full" fill="none">
        <path
          d="M40 220C120 180 180 250 260 210C340 170 380 120 460 150C540 180 580 140 620 160"
          stroke="rgba(91,92,240,0.18)"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M20 280C110 240 170 300 250 270C330 240 400 200 480 230C560 260 600 220 640 240"
          stroke="rgba(91,92,240,0.12)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <circle cx="210" cy="150" r="48" fill="rgba(91,92,240,0.08)" />
        <circle cx="420" cy="190" r="36" fill="rgba(91,92,240,0.1)" />
        <circle cx="320" cy="175" r="10" fill="#5b5cf0" />
        <circle cx="320" cy="175" r="22" stroke="#5b5cf0" strokeOpacity="0.35" strokeWidth="3" />
        <circle cx="320" cy="175" r="34" stroke="#5b5cf0" strokeOpacity="0.18" strokeWidth="2" />
      </svg>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface/90 to-transparent px-6 py-5">
        <div className="h-2.5 w-40 rounded-full bg-border" />
        <div className="mt-2 h-2 w-56 max-w-[70%] rounded-full bg-border" />
      </div>
    </div>
  )
}
