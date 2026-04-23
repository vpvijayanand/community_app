import { ChevronLeft, ChevronRight } from "lucide-react"

export function Pagination() {
  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex items-center justify-between rounded-xl border border-border-light bg-bg-white px-4 py-3"
    >
      <button
        type="button"
        className="inline-flex h-9 items-center gap-1 rounded-lg border border-border-light bg-bg-white px-3 text-[13px] font-medium text-text-secondary transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
        disabled
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>
      <div className="flex items-center gap-1">
        {[1, 2, 3, "...", 8].map((p, i) => {
          const active = p === 1
          return (
            <button
              key={i}
              type="button"
              className={
                active
                  ? "h-9 w-9 rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
                  : "h-9 w-9 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg-subtle"
              }
              aria-current={active ? "page" : undefined}
            >
              {p}
            </button>
          )
        })}
      </div>
      <button
        type="button"
        className="inline-flex h-9 items-center gap-1 rounded-lg border border-border-light bg-bg-white px-3 text-[13px] font-medium text-text-secondary transition-colors hover:border-primary hover:text-primary"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}
