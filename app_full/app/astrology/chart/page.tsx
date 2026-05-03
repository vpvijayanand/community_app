"use client"

import { useState } from "react"
import Link from "next/link"
import { UserLayout } from "@/components/user-layout"
import { AstrologyChartForm, type FormValues } from "@/components/astrology/astrology-chart-form"
import { AstrologyChartResult } from "@/components/astrology/astrology-chart-result"
import { calcJyotishChart, type JyotishResult } from "@/lib/jyotish-calc"
import { saveChart } from "@/lib/astrology-api"
import { Sparkles, History, CheckCircle } from "lucide-react"

export default function AstrologyChartPage() {
  const [result, setResult] = useState<JyotishResult | null>(null)
  const [submittedName, setSubmittedName] = useState("")
  const [submittedDob, setSubmittedDob] = useState("")
  const [isCalculating, setIsCalculating] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

  const handleCalculate = async (values: FormValues) => {
    if (!values.city) return
    setIsCalculating(true)
    setSavedId(null)
    setSaveStatus("idle")
    await new Promise((r) => setTimeout(r, 400))
    try {
      const chartResult = calcJyotishChart({
        name: values.name,
        gender: values.gender,
        dob: values.dob,
        timeOfBirth: values.timeOfBirth,
        latitude: values.city.latitude,
        longitude: values.city.longitude,
        utcOffset: values.city.utcOffset,
      })
      setResult(chartResult)
      setSubmittedName(values.name)
      setSubmittedDob(values.dob)

      // Save to DB (silently, only if logged in)
      setSaveStatus("saving")
      const saved = await saveChart({
        name: values.name,
        gender: values.gender,
        dob: values.dob,
        timeOfBirth: values.timeOfBirth,
        placeName: values.city.name,
        latitude: values.city.latitude,
        longitude: values.city.longitude,
        resultJson: chartResult,
      })
      if (saved?.id) {
        setSavedId(saved.id)
        setSaveStatus("saved")
      } else {
        setSaveStatus("error")
      }
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <UserLayout>
      <div className="flex-1">
        {/* ── Page Header ── */}
        <section className="border-b border-border/60 bg-secondary/30">
          <div className="mx-auto w-full max-w-7xl px-6 py-10">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <p className="font-tamil text-sm uppercase tracking-[0.18em] text-primary/80">ஜாதக கட்டம்</p>
              </div>
              <Link
                href="/astrology/history"
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <History className="h-3.5 w-3.5" />
                My Chart History
              </Link>
            </div>
            <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground md:text-5xl">
              Astrology Chart
              <span className="text-muted-foreground"> / </span>
              <span className="font-tamil">ஜாதகம்</span>
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Generate your Rasi (ராசி) and Navamsa (நவாம்சம்) horoscope chart in the
              traditional Tamil Nadu South-Indian style. Includes Nakshatra (நட்சத்திரம்),
              Lagnam (லக்னம்), and all planetary positions.
            </p>
          </div>
        </section>

        {/* ── Content ── */}
        <section className="mx-auto w-full max-w-7xl px-6 py-10">
          <div className="grid gap-8 lg:grid-cols-[380px_1fr] lg:items-start">
            {/* Form */}
            <div className="lg:sticky lg:top-24">
              <AstrologyChartForm onCalculate={handleCalculate} isCalculating={isCalculating} />
            </div>

            {/* Results */}
            <div>
              {!result && !isCalculating && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 py-24 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-foreground">Your chart will appear here</h3>
                  <p className="font-tamil mt-1 text-sm text-muted-foreground">உங்கள் ஜாதகம் இங்கே தெரியும்</p>
                  <p className="mt-3 text-sm text-muted-foreground max-w-sm">
                    Fill in the birth details on the left and click "Calculate Chart" to generate
                    your Rasi and Navamsa horoscope.
                  </p>
                </div>
              )}
              {isCalculating && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-24 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <span className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                  <p className="font-tamil text-base text-muted-foreground">கணக்கிடுகிறது... Calculating...</p>
                </div>
              )}
              {result && !isCalculating && (
                <div className="space-y-4">
                  {/* Save status banner */}
                  {saveStatus === "saved" && savedId && (
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900/30 dark:bg-green-900/10">
                      <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-300">
                        <CheckCircle className="h-4 w-4" />
                        Chart saved to your history.
                      </div>
                      <div className="flex gap-3">
                        <Link
                          href={`/astrology/history/${savedId}`}
                          className="text-xs font-medium text-green-700 dark:text-green-400 hover:underline"
                        >
                          View Detail →
                        </Link>
                        <Link
                          href="/astrology/history"
                          className="text-xs font-medium text-green-700 dark:text-green-400 hover:underline"
                        >
                          View All →
                        </Link>
                      </div>
                    </div>
                  )}
                  {saveStatus === "error" && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-300">
                      Chart could not be saved (login required). Results shown below.
                    </div>
                  )}
                  <AstrologyChartResult
                    result={result}
                    name={submittedName}
                    dob={submittedDob}
                    chartId={savedId ?? undefined}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </UserLayout>
  )
}
