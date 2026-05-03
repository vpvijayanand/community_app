"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { UserLayout } from "@/components/user-layout"
import { AstrologyChartResult } from "@/components/astrology/astrology-chart-result"
import { DetailedPredictionView } from "@/components/astrology/detailed-prediction-view"
import { AstrologyChartPrintView } from "@/components/astrology/astrology-print-view"
import { getChart, deleteChart, type ChartDetail } from "@/lib/astrology-api"
import { ArrowLeft, Printer, History, Trash2, AlertTriangle, X } from "lucide-react"

// ── Delete Confirmation Dialog ────────────────────────────────────────────────
function DeleteDialog({
  chartName,
  isDeleting,
  onConfirm,
  onCancel,
}: {
  chartName: string
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

        <div className="flex flex-col items-center px-6 pt-8 pb-4 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="font-serif text-xl font-semibold text-foreground">Delete This Chart?</h2>
          <p className="mt-1 font-tamil text-sm text-muted-foreground">இந்த ஜாதகத்தை நீக்கவா?</p>
        </div>

        <div className="mx-6 mb-5 rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-center">
          <p className="font-semibold text-foreground">{chartName}&apos;s Horoscope</p>
          <p className="text-xs text-muted-foreground mt-0.5">This record will be permanently removed.</p>
        </div>

        <p className="px-6 pb-5 text-center text-sm text-muted-foreground">
          You will be redirected to your chart history after deletion.
          <br />
          <strong>This action cannot be undone.</strong>
        </p>

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

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AstrologyChartDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [chart, setChart] = useState<ChartDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"chart" | "prediction">("chart")

  // Delete state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    getChart(id).then((data) => {
      if (data) setChart(data)
      else setError("Chart not found or you don't have access to it.")
      setIsLoading(false)
    })
  }, [id])

  const handlePrint = () => {
    setTimeout(() => {
      window.print()
    }, 200)
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    setDeleteError(null)
    const result = await deleteChart(id)
    setIsDeleting(false)
    if (result.ok) {
      setShowDeleteDialog(false)
      router.refresh()
      router.push("/astrology/history")
    } else {
      setDeleteError(result.error || "Failed to delete chart")
      setShowDeleteDialog(false)
    }
  }

  if (isLoading) {
    return (
      <UserLayout>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading chart...</p>
          </div>
        </main>
      </UserLayout>
    )
  }

  if (error || !chart) {
    return (
      <UserLayout>
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-sm">
            <h2 className="font-serif text-xl font-medium text-foreground">Chart not found</h2>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <Link href="/astrology/history" className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to History
            </Link>
          </div>
        </main>
      </UserLayout>
    )
  }

  return (
    <>
      {/* Delete confirmation dialog */}
      {showDeleteDialog && (
        <DeleteDialog
          chartName={chart.name}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => { setShowDeleteDialog(false); setDeleteError(null) }}
        />
      )}

      {/* ── Screen View (hidden on print) ── */}
      <UserLayout>
        <main className="flex-1">
          <section className="border-b border-border/60 bg-secondary/30">
            <div className="mx-auto max-w-7xl px-6 py-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Link href="/astrology/history" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
                    <ArrowLeft className="h-4 w-4" /> History
                  </Link>
                  <span className="text-muted-foreground/40">/</span>
                  <span className="font-serif text-lg font-medium text-foreground">{chart.name} — Horoscope</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Delete button */}
                  <button
                    onClick={() => { setDeleteError(null); setShowDeleteDialog(true) }}
                    className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                  <Link
                    href="/astrology/history"
                    className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-secondary transition"
                  >
                    <History className="h-3.5 w-3.5" /> All Charts
                  </Link>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
                  >
                    <Printer className="h-4 w-4" /> Print / Save PDF
                  </button>
                </div>
              </div>

              {/* Delete error */}
              {deleteError && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-300">
                  {deleteError}
                </div>
              )}

              {/* Birth details summary */}
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>📅 DOB: {(() => {
                  const [y,m,d] = chart.dob.split("-")
                  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
                  return `${d} ${months[parseInt(m,10)-1]} ${y}`
                })()}</span>
                <span>⏰ Time: {chart.time_of_birth} IST</span>
                <span>📍 Place: {chart.place_name}</span>
                <span>👤 Gender: {chart.gender}</span>
                <span>🕒 Created: {new Date(chart.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-6 py-8">
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center rounded-lg border border-border bg-card p-1 shadow-sm">
                <button
                  onClick={() => setViewMode("chart")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    viewMode === "chart"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  Astrology Chart (ஜாதகம்)
                </button>
                <button
                  onClick={() => setViewMode("prediction")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    viewMode === "prediction"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  Detailed Prediction (விரிவான பலன்கள்)
                </button>
              </div>
            </div>

            {viewMode === "chart" ? (
              <AstrologyChartResult
                result={chart.result_json}
                name={chart.name}
                dob={chart.dob}
              />
            ) : chart.result_json.predictions ? (
              <DetailedPredictionView data={chart.result_json.predictions} />
            ) : (
              <div className="text-center p-12 bg-secondary/20 rounded-xl border border-dashed border-border">
                <p className="text-muted-foreground">Detailed predictions are not available for this legacy chart.</p>
              </div>
            )}
          </section>
        </main>
      </UserLayout>

      {/* ── Print View (only visible on print) ── */}
      <div className="hidden print:block">
        <AstrologyChartPrintView
          result={chart.result_json}
          name={chart.name}
          gender={chart.gender}
          dob={chart.dob}
          timeOfBirth={chart.time_of_birth}
          placeName={chart.place_name}
          createdAt={chart.created_at}
        />
      </div>
    </>
  )
}
