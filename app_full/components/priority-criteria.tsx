import { CATEGORY_WEIGHT } from "@/lib/navigation-priority"

const CRITERIA = [
  {
    rank: "1",
    title: "Higher priority wins",
    detail:
      "Each task has a priority from 1–100. Missing or non-finite priorities default to 0.",
  },
  {
    rank: "2",
    title: "Category weight breaks ties",
    detail: `account (${CATEGORY_WEIGHT.account}) › profile (${CATEGORY_WEIGHT.profile}) › preferences (${CATEGORY_WEIGHT.preferences}) › engagement (${CATEGORY_WEIGHT.engagement}).`,
  },
  {
    rank: "3",
    title: "Quicker tasks surface first",
    detail: "If priority and category are still tied, the shorter estimate wins.",
  },
  {
    rank: "4",
    title: "Deterministic fallback",
    detail: "Alphabetical task id breaks any remaining ties for stable ordering.",
  },
]

export function PriorityCriteria() {
  return (
    <section
      aria-label="Priority criteria"
      className="rounded-3xl border border-border bg-card p-6"
    >
      <h2 className="font-serif text-lg font-medium text-foreground">
        Decision criteria
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Applied in order. Tasks that fail availability or completion
        predicates are filtered out before sorting.
      </p>

      <ol className="mt-5 flex flex-col gap-4">
        {CRITERIA.map((c) => (
          <li key={c.rank} className="flex gap-3">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/5 font-serif text-sm text-primary"
              aria-hidden
            >
              {c.rank}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{c.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {c.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-xl border border-dashed border-border bg-background p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Error handling
        </p>
        <ul className="mt-2 flex flex-col gap-1.5 text-xs leading-relaxed text-foreground/75">
          <li>• Predicate throws → task skipped, logged, app keeps working.</li>
          <li>• Missing priority → normalized to 0, logged, still eligible.</li>
          <li>• Registry crash → resolver returns the safe fallback task.</li>
          <li>• No pending tasks → routes to /matches as the default.</li>
        </ul>
      </div>
    </section>
  )
}
