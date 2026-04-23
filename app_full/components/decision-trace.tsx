"use client"

import { CheckCircle2, CircleX, Crown, MinusCircle } from "lucide-react"
import type { DecisionTrace, DecisionTraceEntry } from "@/lib/navigation-priority"
import { cn } from "@/lib/utils"

const REASON_COPY: Record<
  DecisionTraceEntry["reason"],
  { label: string; tone: "winner" | "included" | "excluded" }
> = {
  winner: { label: "Selected", tone: "winner" },
  "runner-up": { label: "Eligible", tone: "included" },
  "missing-priority": { label: "Eligible · priority defaulted to 0", tone: "included" },
  unavailable: { label: "Not yet available", tone: "excluded" },
  "already-complete": { label: "Already complete", tone: "excluded" },
  "predicate-error": { label: "Predicate error (skipped)", tone: "excluded" },
}

function ToneIcon({ tone }: { tone: "winner" | "included" | "excluded" }) {
  if (tone === "winner") return <Crown className="h-4 w-4 text-primary" aria-hidden />
  if (tone === "included")
    return <CheckCircle2 className="h-4 w-4 text-accent" aria-hidden />
  return <MinusCircle className="h-4 w-4 text-muted-foreground" aria-hidden />
}

export function DecisionTraceView({ trace }: { trace: DecisionTrace }) {
  // Order entries by included-first, then by priority desc — matches the
  // sort order the resolver used, making the decision easy to follow.
  const ordered = [...trace.entries].sort((a, b) => {
    if (a.included !== b.included) return a.included ? -1 : 1
    return b.normalizedPriority - a.normalizedPriority
  })

  return (
    <section
      aria-label="Decision trace"
      className="rounded-3xl border border-border bg-card p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-lg font-medium text-foreground">
            Decision trace
          </h2>
          <p className="mt-1 max-w-prose text-sm text-muted-foreground">
            {trace.explanation}
          </p>
        </div>
        {trace.isFallback && (
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            <CircleX className="h-3 w-3" aria-hidden />
            Fallback route used
          </span>
        )}
      </div>

      <ul className="mt-5 flex flex-col divide-y divide-border/70">
        {ordered.map((entry) => {
          const copy = REASON_COPY[entry.reason]
          return (
            <li
              key={entry.task.id}
              className={cn(
                "flex items-center justify-between gap-4 py-3",
                copy.tone === "excluded" && "opacity-60",
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <ToneIcon tone={copy.tone} />
                <div className="min-w-0">
                  <p
                    className={cn(
                      "truncate text-sm font-medium text-foreground",
                      copy.tone === "winner" && "text-primary",
                    )}
                  >
                    {entry.task.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {copy.label} · {entry.task.category}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-serif text-lg tabular-nums text-foreground">
                  {entry.normalizedPriority}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  priority
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
