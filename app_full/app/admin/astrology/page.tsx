"use client"

import { useState } from "react"
import Link from "next/link"
import { AdminLayout } from "@/app/admin/admin-layout"
import { AstrologyChartForm, type FormValues } from "@/components/astrology/astrology-chart-form"
import { AstrologyChartResult } from "@/components/astrology/astrology-chart-result"
import { calcJyotishChart, type JyotishResult } from "@/lib/jyotish-calc"
import { saveChart } from "@/lib/astrology-api"
import { History, CheckCircle } from "lucide-react"

export default function AdminAstrologyPage() {
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

      // Save to DB
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
    <AdminLayout activeHref="/admin/astrology" title="Astrology Chart — ஜாதக கட்டம்">
      <div className="grid gap-8 lg:grid-cols-[380px_1fr] lg:items-start">
        {/* Form */}
        <div className="lg:sticky lg:top-8">
          <AstrologyChartForm onCalculate={handleCalculate} isCalculating={isCalculating} />
        </div>

        {/* Results */}
        <div>
          {!result && !isCalculating && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 py-24 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <span className="font-tamil text-2xl text-primary">✦</span>
              </div>
              <h3 className="font-serif text-xl font-medium text-foreground">Chart will appear here</h3>
              <p className="font-tamil mt-1 text-sm text-muted-foreground">ஜாதகம் இங்கே தெரியும்</p>
              <p className="mt-3 text-sm text-muted-foreground max-w-sm">
                Fill in the birth details on the left and click Calculate to generate
                the Rasi and Navamsa horoscope chart.
              </p>
            </div>
          )}
          {isCalculating && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-24 text-center">
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-4" />
              <p className="font-tamil text-base text-muted-foreground">கணக்கிடுகிறது...</p>
            </div>
          )}
          {result && !isCalculating && (
            <div className="space-y-4">
              {saveStatus === "saved" && savedId && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900/30 dark:bg-green-900/10">
                  <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-300">
                    <CheckCircle className="h-4 w-4" />
                    Chart saved to history.
                  </div>
                  <div className="flex gap-3">
                    <Link href={`/admin/astrology/${savedId}`} className="text-xs font-medium text-green-700 hover:underline">
                      View Detail →
                    </Link>
                    <Link href="/admin/astrology/history" className="text-xs font-medium text-green-700 hover:underline">
                      <History className="inline h-3 w-3 mr-0.5" /> All Charts →
                    </Link>
                  </div>
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
    </AdminLayout>
  )
}
