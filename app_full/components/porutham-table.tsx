import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { PORUTHAMS, TOTAL_SCORE, TOTAL_MAX } from "@/lib/astrology-data"

export function PoruthamTable() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-5 py-3">
        <div>
          <h3 className="font-serif text-lg font-medium text-foreground">
            The Ten Poruthams
          </h3>
          <p className="font-tamil mt-0.5 text-xs text-muted-foreground">
            பத்து பொருத்தம்
          </p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>
            Score{" "}
            <span className="font-medium text-foreground tabular-nums">
              {TOTAL_SCORE}
            </span>
            <span className="mx-0.5">/</span>
            <span className="tabular-nums">{TOTAL_MAX}</span>
          </p>
          <p className="font-tamil mt-0.5">
            {PORUTHAMS.filter((p) => p.passed).length} இல் 10 பொருத்தம்
          </p>
        </div>
      </div>

      <ul role="list" className="divide-y divide-border">
        {PORUTHAMS.map((p, idx) => {
          const ratio = p.score / p.max
          return (
            <li
              key={p.key}
              className="grid grid-cols-[auto_1fr_auto] items-start gap-4 px-5 py-4 md:grid-cols-[auto_1fr_160px_120px]"
            >
              <div className="flex items-center justify-center">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium tabular-nums",
                    p.passed
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-destructive/30 bg-destructive/10 text-destructive",
                  )}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                  <h4 className="font-serif text-base font-medium text-foreground">
                    {p.english}
                  </h4>
                  <span className="font-tamil text-sm text-muted-foreground">
                    {p.tamil}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {p.description}
                </p>
                <p className="mt-1 text-xs italic text-muted-foreground/80">
                  {p.detail}
                </p>
              </div>

              <div className="hidden md:block">
                <div className="flex items-center gap-2">
                  <div
                    className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-valuenow={p.score}
                    aria-valuemin={0}
                    aria-valuemax={p.max}
                  >
                    <div
                      className={cn(
                        "h-full rounded-full",
                        p.passed ? "bg-primary" : "bg-destructive/70",
                      )}
                      style={{ width: `${Math.max(2, ratio * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {p.score}/{p.max}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end">
                {p.passed ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    <Check className="h-3.5 w-3.5" aria-hidden />
                    Matched
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                    <X className="h-3.5 w-3.5" aria-hidden />
                    Dosha
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
