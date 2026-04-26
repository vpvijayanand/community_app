"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { listCharts, deleteChart, type ChartSummary } from "@/lib/astrology-api"
import { History, Sparkles, ChevronRight, CalendarDays, MapPin, Trash2, AlertTriangle, X } from "lucide-react"

// ── Delete confirmation dialog ────────────────────────────────────────────────
function DeleteDialog({
  chart,
  isDeleting,
  onConfirm,
  onCancel,
}: {
  chart: ChartSummary
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-secondary transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Warning icon */}
        <div className="flex flex-col items-center px-6 pt-8 pb-4 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="font-serif text-xl font-semibold text-foreground">Delete Chart?</h2>
          <p className="mt-1 font-tamil text-sm text-muted-foreground">இந்த ஜாதகத்தை நீக்கவா?</p>
        </div>

        {/* Chart info */}
        <div className="mx-6 mb-5 rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm">
          <p className="font-semibold text-foreground">{chart.name}</p>
          <p className="font-tamil text-xs text-muted-foreground mt-0.5">
            ராசி: {chart.moon_rasi_tamil} · {chart.natchathiram_tamil} · லக்னம்: {chart.lagnam_tamil}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{chart.place_name} · {chart.time_of_birth}</p>
        </div>

        <p className="px-6 pb-5 text-center text-sm text-muted-foreground">
          This chart will be <strong>permanently removed</strong> from your history. This action cannot be undone.
        </p>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 rounded-xl border border-border bg-background py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <><span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Deleting...</>
            ) : (
              <><Trash2 className="h-3.5 w-3.5" /> Delete Chart</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AstrologyHistoryPage() {
  const [charts, setCharts] = useState<ChartSummary[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Delete state
  const [pendingDelete, setPendingDelete] = useState<ChartSummary | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const fetchCharts = useCallback(() => {
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

  useEffect(() => {
    fetchCharts()
  }, [fetchCharts])

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return
    setIsDeleting(true)
    setDeleteError(null)
    const result = await deleteChart(pendingDelete.id)
    setIsDeleting(false)
    if (result.ok) {
      setCharts((prev) => prev.filter((c) => c.id !== pendingDelete.id))
      setTotal((t) => t - 1)
      setPendingDelete(null)
    } else {
      setDeleteError(result.error || "Failed to delete chart")
    }
  }

  // DOB safe display (avoid UTC offset: DOB is YYYY-MM-DD, parse manually)
  const formatDob = (dob: string) => {
    const [y, m, d] = dob.split("-")
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    return `${d} ${months[parseInt(m,10)-1]} ${y}`
  }

  return (
    <>
      {/* Delete confirmation dialog */}
      {pendingDelete && (
        <DeleteDialog
          chart={pendingDelete}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => { setPendingDelete(null); setDeleteError(null) }}
        />
      )}

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
                  <h1 className="font-serif text-4xl font-medium text-foreground">My Chart History</h1>
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
            {/* Delete error */}
            {deleteError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-300">
                {deleteError}
              </div>
            )}

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
                  <div
                    key={chart.id}
                    className="group relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md hover:border-primary/30"
                  >
                    {/* Delete button (top-right corner) */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        setDeleteError(null)
                        setPendingDelete(chart)
                      }}
                      className="absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition"
                      title="Delete chart"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    {/* Card content — clickable link */}
                    <Link href={`/astrology/history/${chart.id}`} className="flex flex-col gap-3 flex-1">
                      {/* Name + gender */}
                      <div className="flex items-start justify-between gap-2 pr-6">
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
                          DOB: {formatDob(chart.dob)} · {chart.time_of_birth}
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
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
        <SiteFooter />
      </div>
    </>
  )
}
