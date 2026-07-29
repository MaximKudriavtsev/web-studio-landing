import { ArrowRight } from 'lucide-react'
import { Button } from '../components/Button'
import { SectionReveal } from '../components/SectionReveal'
import { work } from '../content/site'

export const WorkPage = () => {
  return (
    <div className="page-shell py-14 md:py-20">
      <SectionReveal>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          Портфолио
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          {work.title}
        </h1>
        <p className="mt-4 max-w-2xl text-muted md:text-lg">{work.intro}</p>
      </SectionReveal>

      <ul className="mt-14 flex flex-col">
        {work.cases.map((item, index) => (
          <SectionReveal key={item.title} delay={index * 0.05}>
            <li className="border-t border-border/70 py-9 md:py-11">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                <span className="text-accent">{item.category}</span>
                <span aria-hidden className="text-border">
                  /
                </span>
                <span>{item.year}</span>
              </div>
              <h2 className="mt-3 font-display text-2xl font-medium tracking-tight md:text-3xl">
                {item.title}
              </h2>
              <p className="mt-3 max-w-2xl text-muted">{item.text}</p>
            </li>
          </SectionReveal>
        ))}
      </ul>

      <SectionReveal className="border-t border-border/70 pt-10">
        <Button to="/contact">
          Хочу похожий результат
          <ArrowRight size={16} />
        </Button>
      </SectionReveal>
    </div>
  )
}
