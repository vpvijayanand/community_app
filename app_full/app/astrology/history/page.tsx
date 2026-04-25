"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { listCharts, type ChartSummary } from "@/lib/astrology-api"
import { History, Sparkles, ChevronRight, CalendarDays, MapPin } from "lucide-react"

export default function AstrologyHistoryPage() {
  const [charts, setCharts] = useState<ChartSummary[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listCharts(1, 50).then((data) => {
      if (data) {
        setCharts(data.charts)
        setTotal(data.total)
      } else {
        setError("Could not load chart history. Please ensure you are logged in.")
      }
      setIsLoading(false)
    })
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-border/60 bg-secondary/30">
          <div className="mx-auto max-w-5xl px-6 py-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <History className="h-5 w-5 text-primary" />
                  <p className="font-tamil text-sm uppercase tracking-widest text-primary/80">ஜாதக வரலாறு</p>
                </div>
                <h1 className="font-serif text-4xl font-medium text-foreground">
                  My Chart History
                </h1>
                <p className="mt-2 text-muted-foreground text-sm">
                  {total > 0 ? `${total} chart${total > 1 ? "s" : ""} saved` : "Your saved astrology charts"}
                </p>
              </div>
              <Link
                href="/astrology/chart"
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
              >
                <Sparkles className="h-4 w-4" />
                New Chart
              </Link>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="mx-auto max-w-5xl px-6 py-10">
          {isLoading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-40 rounded-2xl border border-border bg-card animate-pulse" />
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-900/30 dark:bg-amber-900/10">
              <p className="font-serif text-lg font-medium text-amber-900 dark:text-amber-300">Login Required</p>
              <p className="mt-1 text-sm text-amber-800 dark:text-amber-400">{error}</p>
              <Link href="/login" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:underline">
                Go to Login →
              </Link>
            </div>
          )}

          {!isLoading && !error && charts.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <History className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-medium text-foreground">No charts yet</h3>
              <p className="font-tamil mt-1 text-sm text-muted-foreground">ஜாதகம் இல்லை</p>
              <p className="mt-3 text-sm text-muted-foreground max-w-sm">
                Create your first astrology chart by entering birth details.
              </p>
              <Link
                href="/astrology/chart"
                className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Sparkles className="h-4 w-4" /> Create Chart
              </Link>
            </div>
          )}

          {!isLoading && !error && charts.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {charts.map((chart) => (
                <Link
                  key={chart.id}
                  href={`/astrology/history/${chart.id}`}
                  className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md hover:border-primary/30"
                >
                  {/* Name + gender */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-serif text-base font-semibold text-foreground group-hover:text-primary transition">
                        {chart.name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{chart.gender}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary transition" />
                  </div>

                  {/* Rasi / Nakshatra / Lagnam badges */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 font-tamil text-[10px] font-semibold text-primary">
                      ராசி: {chart.moon_rasi_tamil}
                    </span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 font-tamil text-[10px] font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                      {chart.natchathiram_tamil} (பாதம் {chart.pada})
                    </span>
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 font-tamil text-[10px] font-semibold text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                      லக்னம்: {chart.lagnam_tamil}
                    </span>
                  </div>

                  {/* Date + place */}
                  <div className="mt-auto flex flex-col gap-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      DOB: {new Date(chart.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      {" · "}{chart.time_of_birth}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {chart.place_name}
                    </span>
                    <span className="text-[10px] mt-1">
                      Created: {new Date(chart.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
