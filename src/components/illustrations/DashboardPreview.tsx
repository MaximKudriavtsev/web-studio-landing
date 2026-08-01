type IllustrationProps = {
  className?: string
}

/** Dashboard / ERP UI mock for case covers */
export const DashboardPreview = ({ className = '' }: IllustrationProps) => {
  return (
    <div
      className={[
        'aspect-[16/10] w-full overflow-hidden rounded-card-sm bg-[#1a1d2e] text-white',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden
    >
      <div className="flex h-full">
        <div className="flex w-10 flex-col gap-2 border-r border-white/10 p-2">
          <div className="size-5 rounded-md bg-accent/80" />
          <div className="size-4 rounded bg-white/15" />
          <div className="size-4 rounded bg-white/10" />
          <div className="size-4 rounded bg-white/10" />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-3">
          <div className="flex gap-2">
            <div className="h-2 w-16 rounded-full bg-white/25" />
            <div className="h-2 w-10 rounded-full bg-white/10" />
          </div>
          <div className="grid flex-1 grid-cols-3 gap-2">
            <div className="rounded-md bg-white/10 p-2">
              <div className="h-1.5 w-8 rounded-full bg-white/25" />
              <div className="mt-2 h-4 w-12 rounded bg-accent/70" />
            </div>
            <div className="rounded-md bg-white/10 p-2">
              <div className="h-1.5 w-8 rounded-full bg-white/25" />
              <div className="mt-2 h-4 w-10 rounded bg-emerald-400/70" />
            </div>
            <div className="rounded-md bg-white/10 p-2">
              <div className="h-1.5 w-8 rounded-full bg-white/25" />
              <div className="mt-2 h-4 w-14 rounded bg-sky-400/60" />
            </div>
          </div>
          <div className="flex flex-1 items-end gap-1 rounded-md bg-white/5 px-2 pb-2 pt-4">
            {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm bg-accent/70"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
