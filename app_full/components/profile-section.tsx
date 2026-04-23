import type { ReactNode } from "react"

export function ProfileSection({
  title,
  tamil,
  children,
}: {
  title: string
  tamil: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <header className="mb-5 flex items-baseline justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="font-serif text-xl font-medium text-foreground md:text-2xl">{title}</h2>
          <p className="font-tamil text-sm text-muted-foreground">{tamil}</p>
        </div>
      </header>
      {children}
    </section>
  )
}

export function FactRow({
  label,
  tamil,
  value,
}: {
  label: string
  tamil?: string
  value: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/60 py-3 last:border-0 sm:flex-row sm:items-baseline sm:gap-4 sm:py-3.5">
      <dt className="flex items-baseline gap-2 text-sm text-muted-foreground sm:w-40 sm:shrink-0">
        <span>{label}</span>
        {tamil && <span className="font-tamil text-[11px] opacity-70">{tamil}</span>}
      </dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  )
}
