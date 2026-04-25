"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AstrologyChartResult } from "@/components/astrology/astrology-chart-result"
import { AstrologyChartPrintView } from "@/components/astrology/astrology-print-view"
import { getChart, type ChartDetail } from "@/lib/astrology-api"
import { ArrowLeft, Printer, History } from "lucide-react"

export default function AstrologyChartDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [chart, setChart] = useState<ChartDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPrintMode, setIsPrintMode] = useState(false)

  useEffect(() => {
    getChart(id).then((data) => {
      if (data) setChart(data)
      else setError("Chart not found or you don't have access to it.")
      setIsLoading(false)
    })
  }, [id])

  const handlePrint = () => {
    setIsPrintMode(true)
    setTimeout(() => {
      window.print()
      setTimeout(() => setIsPrintMode(false), 500)
    }, 200)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading chart...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  if (error || !chart) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-sm">
            <h2 className="font-serif text-xl font-medium text-foreground">Chart not found</h2>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <Link href="/astrology/history" className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to History
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <>
      {/* ── Screen View (hidden on print) ── */}
      <div className="flex min-h-screen flex-col bg-background print:hidden">
        <SiteHeader />
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
                <div className="flex items-center gap-3">
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

              {/* Birth details summary */}
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>📅 DOB: {new Date(chart.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</span>
                <span>⏰ Time: {chart.time_of_birth} IST</span>
                <span>📍 Place: {chart.place_name}</span>
                <span>👤 Gender: {chart.gender}</span>
                <span>🕒 Created: {new Date(chart.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-6 py-10">
            <AstrologyChartResult
              result={chart.result_json}
              name={chart.name}
              dob={chart.dob}
            />
          </section>
        </main>
        <SiteFooter />
      </div>

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
