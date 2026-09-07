type CatLogoProps = {
  className?: string
  /** Pixel size; omit to size via CSS (`.cat-logo`) */
  size?: number
  /** Accessible title when used alone (not inside a labelled link) */
  title?: string
}

/**
 * Brand mark: cat silhouette (ears + body + tail) with the letter «К» inside.
 * Colors via CSS — `.cat-logo` sets body color; `.cat-logo__letter` sets the stroke.
 */
export const CatLogo = ({ className = '', size, title }: CatLogoProps) => {
  return (
    <svg
      className={['cat-logo', className].filter(Boolean).join(' ')}
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}

      <path className="cat-logo__body" fill="currentColor" d={BODY_PATH} />

      <path
        className="cat-logo__body"
        fill="none"
        stroke="currentColor"
        strokeWidth="6.5"
        strokeLinecap="round"
        d={TAIL_PATH}
      />

      <g
        className="cat-logo__letter"
        fill="none"
        strokeWidth="5.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M24.5 27 V48" />
        <path d="M24.5 36.5 L39 27.5" />
        <path d="M24.5 36.5 L40 48" />
      </g>
    </svg>
  )
}

const BODY_PATH =
  'M18.5 7.5 L27.8 18 Q32 20 36.2 18 L45.5 7.5 L49.8 18 ' +
  'C52.4 20.2 53.8 23.6 53.8 27.8 V40.8 C53.8 50.6 46.2 56.8 36.5 56.8 H27.5 ' +
  'C17.8 56.8 10.2 50.6 10.2 40.8 V27.8 C10.2 23.6 11.6 20.2 14.2 18 Z'

const TAIL_PATH =
  'M46.5 48.5 C52 52.5 57.5 49.5 58.2 44 C58.6 40.8 56.2 38 52.8 37.5'
