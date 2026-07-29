import { ArrowRight } from 'lucide-react'
import { Button } from '../components/Button'
import { SectionReveal } from '../components/SectionReveal'
import { services } from '../content/site'

export const ServicesPage = () => {
  return (
    <div className="page-shell py-14 md:py-20">
      <SectionReveal>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          Что предлагаем
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          {services.title}
        </h1>
        <p className="mt-4 max-w-2xl text-muted md:text-lg">{services.intro}</p>
      </SectionReveal>

      <ul className="mt-14 grid gap-0">
        {services.items.map((item, index) => (
          <SectionReveal key={item.title} delay={index * 0.04}>
            <li className="grid gap-3 border-t border-border/70 py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-10">
              <h2 className="font-display text-xl font-medium tracking-tight md:text-2xl">
                {item.title}
              </h2>
              <p className="text-muted md:pt-1">{item.text}</p>
            </li>
          </SectionReveal>
        ))}
      </ul>

      <SectionReveal className="mt-6 border-t border-border/70 pt-10">
        <p className="max-w-xl text-muted">
          Не нашли нужный формат? Опишите задачу — подберём подход и оценим сроки.
        </p>
        <div className="mt-6">
          <Button to="/contact">
            Обсудить задачу
            <ArrowRight size={16} />
          </Button>
        </div>
      </SectionReveal>
    </div>
  )
}
