import { Link } from 'react-router-dom'
import type { CaseStudy } from '../../content/types'
import { StorePreview } from '../illustrations/StorePreview'
import { DashboardPreview } from '../illustrations/DashboardPreview'
import { ProductPreview } from '../illustrations/ProductPreview'

type CaseCardProps = {
  item: CaseStudy
  compact?: boolean
  className?: string
}

const Cover = ({ cover }: { cover: CaseStudy['cover'] }) => {
  if (cover === 'dashboard') return <DashboardPreview />
  if (cover === 'product') return <ProductPreview />
  return <StorePreview />
}

export const CaseCard = ({ item, compact = false, className = '' }: CaseCardProps) => {
  return (
    <article
      className={[
        'flex h-full flex-col overflow-hidden rounded-card-md border border-border bg-surface shadow-card-sm',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="border-b border-border bg-surface-soft p-4">
        <Cover cover={item.cover} />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
          {item.categoryLabel}
        </p>
        <h3 className="mt-2 text-lg font-semibold tracking-tight text-text">{item.title}</h3>

        {compact ? (
          <>
            <p className="mt-3 text-sm text-muted">
              <span className="font-medium text-text">Задача: </span>
              {item.task}
            </p>
            <p className="mt-2 text-sm text-muted">
              <span className="font-medium text-text">Решение: </span>
              {item.summary}
            </p>
          </>
        ) : (
          <div className="mt-4 flex flex-col gap-4 text-sm">
            <div>
              <p className="font-semibold text-text">Задача</p>
              <p className="mt-1 text-muted">{item.task}</p>
            </div>
            <div>
              <p className="font-semibold text-text">Что сделали</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-muted">
                {item.done.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-text">Особенности</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-muted">
                {item.features.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-text">Результат</p>
              <p className="mt-1 text-muted">{item.result}</p>
            </div>
          </div>
        )}

        {item.href ? (
          <a
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className="mt-5 text-sm font-semibold text-accent transition-colors hover:text-accent-strong"
          >
            Открыть проект →
          </a>
        ) : compact ? (
          <Link
            to="/work"
            className="mt-5 text-sm font-semibold text-accent transition-colors hover:text-accent-strong"
          >
            Подробнее →
          </Link>
        ) : null}
      </div>
    </article>
  )
}
