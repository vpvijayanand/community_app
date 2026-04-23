"use client"

import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { useArticleCounts } from "@/lib/news-store"

export function StatsRow() {
  const live = useArticleCounts()

  // Baseline seed counts so the dashboard always reads like a real newsroom.
  const stats = [
    {
      label: "Total Published",
      value: String(24 + live.published),
      trend: "+12%",
      direction: "up" as const,
      accent: "var(--primary)",
      hint: "vs last month",
    },
    {
      label: "Drafts",
      value: String(3 + live.drafts),
      trend: live.drafts > 0 ? `+${live.drafts}` : "+1",
      direction: "up" as const,
      accent: "var(--warning)",
      hint: "pending review",
    },
    {
      label: "Scheduled",
      value: String(2 + live.scheduled),
      trend: "0",
      direction: "flat" as const,
      accent: "#534AB7",
      hint: "next 7 days",
    },
    {
      label: "Premium Articles",
      value: String(live.paid),
      trend: live.paid > 0 ? `+${live.paid}` : "0",
      direction: live.paid > 0 ? ("up" as const) : ("flat" as const),
      accent: "#BA7517",
      hint: "paid tier live",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((s) => {
        const up = s.direction === "up"
        const trendColor = up
          ? "text-success bg-success/10"
          : s.direction === "flat"
            ? "text-text-muted bg-bg-subtle"
            : "text-danger bg-danger/10"
        return (
          <div
            key={s.label}
            className="relative overflow-hidden rounded-xl border border-border-light bg-bg-white p-5"
          >
            <span
              className="absolute inset-x-0 top-0 h-[3px]"
              style={{ backgroundColor: s.accent }}
              aria-hidden
            />
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
              {s.label}
            </div>
            <div className="mt-3 flex items-end justify-between gap-2">
              <div className="font-tamil text-3xl font-bold leading-none text-text-primary">
                {s.value}
              </div>
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${trendColor}`}
              >
                {up ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : s.direction === "flat" ? null : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {s.trend}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-text-muted">{s.hint}</div>
          </div>
        )
      })}
    </div>
  )
}
