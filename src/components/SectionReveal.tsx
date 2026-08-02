import { useEffect, useRef, type ReactNode } from 'react'

type SectionRevealProps = {
  children: ReactNode
  className?: string
  delay?: boolean
}

export const SectionReveal = ({ children, className = '', delay = false }: SectionRevealProps) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-visible')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={['reveal', delay ? 'delay-1' : '', className].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  )
}
