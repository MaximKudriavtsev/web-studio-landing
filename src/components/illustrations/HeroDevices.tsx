type IllustrationProps = {
  className?: string
}

/** Laptop + phone mock composition for hero */
export const HeroDevices = ({ className = '' }: IllustrationProps) => {
  return (
    <div
      className={['relative aspect-[3/2] w-full', className].filter(Boolean).join(' ')}
      aria-hidden
    >
      {/* Laptop — inset so phone can sit over the right edge without clipping */}
      <div className="absolute inset-y-[6%] left-0 right-[12%] rounded-[1.15rem] border border-border bg-surface shadow-card-md">
        <div className="flex h-6 items-center gap-1.5 border-b border-border px-3">
          <span className="size-1.5 rounded-full bg-border" />
          <span className="size-1.5 rounded-full bg-border" />
          <span className="size-1.5 rounded-full bg-border" />
        </div>
        <div className="grid h-[calc(100%-1.5rem)] grid-cols-[0.95fr_1.05fr] gap-2.5 p-3">
          <div className="flex flex-col justify-between rounded-card-sm bg-surface-soft p-2.5">
            <div>
              <div className="h-2 w-14 rounded-full bg-accent/30" />
              <div className="mt-2.5 h-2.5 w-20 rounded-full bg-text/15" />
              <div className="mt-2 h-1.5 w-full rounded-full bg-border" />
              <div className="mt-1.5 h-1.5 w-4/5 rounded-full bg-border" />
            </div>
            <div className="h-7 w-20 rounded-full bg-accent" />
          </div>
          <div className="grid grid-rows-2 gap-2.5">
            <div className="rounded-card-sm bg-gradient-to-br from-accent-soft to-surface-soft p-2.5">
              <div className="mx-auto mt-1 h-12 w-10 rounded-full bg-accent/20" />
              <div className="mx-auto mt-2.5 h-1.5 w-14 rounded-full bg-border" />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-card-sm bg-surface-soft p-2">
                <div className="h-8 rounded-md bg-accent/15" />
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-border" />
              </div>
              <div className="rounded-card-sm bg-surface-soft p-2">
                <div className="h-8 rounded-md bg-accent/10" />
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-border" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phone — anchored inside the composition, overlapping laptop */}
      <div className="absolute bottom-[2%] right-0 h-[68%] w-[28%] rounded-[1.2rem] border border-border bg-surface shadow-card-md">
        <div className="mx-auto mt-1.5 h-1 w-8 rounded-full bg-border" />
        <div className="mt-2.5 space-y-1.5 px-2">
          <div className="h-14 rounded-lg bg-gradient-to-b from-accent-soft to-surface-soft" />
          <div className="h-1.5 w-3/4 rounded-full bg-border" />
          <div className="h-1.5 w-1/2 rounded-full bg-border" />
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <div className="aspect-square rounded-md bg-accent/15" />
            <div className="aspect-square rounded-md bg-accent/10" />
          </div>
        </div>
      </div>
    </div>
  )
}
