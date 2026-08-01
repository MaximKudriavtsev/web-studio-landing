import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { FaqItem } from '../../content/types'

type AccordionProps = {
  items: FaqItem[]
  className?: string
}

export const Accordion = ({ items, className = '' }: AccordionProps) => {
  const baseId = useId()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const handleToggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index))
  }

  return (
    <div className={['flex flex-col gap-3', className].filter(Boolean).join(' ')}>
      {items.map((item, index) => {
        const isOpen = openIndex === index
        const panelId = `${baseId}-panel-${index}`
        const buttonId = `${baseId}-button-${index}`

        return (
          <div
            key={item.question}
            className="rounded-card-md border border-border bg-surface shadow-card-sm"
          >
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold tracking-tight text-text"
                onClick={() => handleToggle(index)}
              >
                {item.question}
                <ChevronDown
                  size={18}
                  aria-hidden
                  className={[
                    'shrink-0 text-muted transition-transform duration-200',
                    isOpen ? 'rotate-180' : '',
                  ].join(' ')}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="border-t border-border px-5 py-4 text-sm text-muted"
            >
              {item.answer}
            </div>
          </div>
        )
      })}
    </div>
  )
}
