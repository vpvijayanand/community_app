"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { AdminLayout } from "@/app/admin/admin-layout"
import { AstrologyChartResult } from "@/components/astrology/astrology-chart-result"
import { AstrologyChartPrintView } from "@/components/astrology/astrology-print-view"
import { getChart, type ChartDetail } from "@/lib/astrology-api"
import { ArrowLeft, Printer, History } from "lucide-react"

export default function AdminAstrologyChartDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [chart, setChart] = useState<ChartDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getChart(id).then((data) => {
      if (data) setChart(data)
      else setError("Chart not found.")
      setIsLoading(false)
    })
  }, [id])

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <AdminLayout activeHref="/admin/astrology" title="Astrology Chart Detail">
        <div className="flex items-center justify-center py-24">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AdminLayout>
    )
  }

  if (error || !chart) {
    return (
      <AdminLayout activeHref="/admin/astrology" title="Astrology Chart Detail">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <h2 className="font-serif text-xl font-medium text-foreground">Chart not found</h2>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Link href="/admin/astrology/history" className="mt-4 flex items-center gap-1 text-sm text-primary hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to History
          </Link>
        </div>
      </AdminLayout>
    )
  }

  return (
    <>
      {/* ── Screen View ── */}
      <div className="print:hidden">
        <AdminLayout
          activeHref="/admin/astrology"
          title={`${chart.name} — Horoscope Detail`}
        >
          {/* Top action bar */}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-3">
              <Link href="/admin/astrology/history" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
                <ArrowLeft className="h-4 w-4" /> Chart History
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/astrology/history"
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

          {/* Birth details summary bar */}
          <div className="mb-6 flex flex-wrap gap-4 text-xs text-muted-foreground rounded-xl border border-border bg-secondary/30 px-4 py-3">
            <span>📅 DOB: {new Date(chart.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</span>
            <span>⏰ Time: {chart.time_of_birth} IST</span>
            <span>📍 Place: {chart.place_name}</span>
            <span>👤 Gender: {chart.gender}</span>
            <span>🕒 Created: {new Date(chart.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
          </div>

          <AstrologyChartResult
            result={chart.result_json}
            name={chart.name}
            dob={chart.dob}
          />
        </AdminLayout>
      </div>

      {/* ── Print View ── */}
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
