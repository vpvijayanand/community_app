"use client"

import { useFormContext, useWatch } from "react-hook-form"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { KoduGrid } from "@/components/kodu-grid"
import { convertChartToPositions } from "@/lib/astrology-utils"
import { GROOM } from "@/lib/astrology-data"
import { useState, useEffect, useRef, useCallback } from "react"
import { AlertCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PlanetPosition } from "@/lib/astrology-utils"

// Simulated astrology calculation
async function mockCalculateChart(birthTime: string, birthPlace: string): Promise<{
  planetPositions: PlanetPosition[]
  lagnaHouse: number
  rasi: string
  lagna: string
  natchathiram: string
  padam: string
}> {
  await new Promise(r => setTimeout(r, 1200))
  return {
    planetPositions: convertChartToPositions(GROOM.rasiChart),
    lagnaHouse: 5,
    rasi: "மீனம்",
    lagna: "சிம்மம்",
    natchathiram: "உத்திரட்டாதி",
    padam: "2ம் பாதம்",
  }
}

export function AstrologyDetailsStep() {
  const { register, control, watch } = useFormContext()
  const dateOfBirth = useWatch({ control, name: "dateOfBirth" }) as string
  const exactBirthTime = useWatch({ control, name: "exactBirthTime" }) as string
  const birthAmPm = useWatch({ control, name: "birthAmPm" }) as "AM" | "PM"
  const birthPlace = useWatch({ control, name: "birthPlace" }) as string

  const [isCalcLoading, setIsCalcLoading] = useState(false)
  const [chartResult, setChartResult] = useState<{
    planetPositions: PlanetPosition[]
    lagnaHouse: number
    rasi: string; lagna: string; natchathiram: string; padam: string
  } | null>(null)

  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const { setValue } = useFormContext()

  const runCalc = useCallback(async (time: string, place: string) => {
    setIsCalcLoading(true)
    try {
      const result = await mockCalculateChart(time, place)
      setChartResult(result)
    } finally {
      setIsCalcLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!exactBirthTime || !birthPlace) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      runCalc(exactBirthTime, birthPlace)
    }, 800)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [exactBirthTime, birthPlace, birthAmPm, runCalc])

  const hasTime = !!exactBirthTime
  const hasPlace = !!birthPlace
  const isReady = hasTime && hasPlace

  return (
    <div className="space-y-8">
      {/* Read-only DOB */}
      <Field>
        <FieldLabel>பிறந்த தேதி <span className="text-muted-foreground text-xs ml-1">Date of Birth (from Step 1)</span></FieldLabel>
        <div className="flex h-11 items-center rounded-md border border-border bg-secondary/40 px-3 text-sm text-foreground/70">
          {dateOfBirth ? new Date(dateOfBirth + "T00:00").toLocaleDateString("ta-IN", { day: "numeric", month: "long", year: "numeric" }) : "–"}
        </div>
      </Field>

      {/* Exact Birth Time */}
      <Field>
        <FieldLabel>
          <Clock className="inline h-4 w-4 mr-1.5 text-primary" />
          சரியான பிறந்த நேரம் <span className="text-muted-foreground text-xs ml-1">Exact Birth Time</span>
        </FieldLabel>
        <div className="flex items-center gap-3">
          <input
            type="time"
            {...register("exactBirthTime")}
            className="flex h-11 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex rounded-xl border border-border bg-background overflow-hidden">
            {(["AM", "PM"] as const).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setValue("birthAmPm", period)}
                className={cn(
                  "px-4 py-2.5 text-sm font-semibold transition-colors",
                  birthAmPm === period
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary text-foreground/80"
                )}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        {!hasTime && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 mt-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700">
              சரியான பிறந்த நேரம் தர்வது உங்கள் சுயவிவர மதிப்பெண்ணை +10 அதிகரிக்கும், மேலும் துல்லியமான பொருத்தங்கள் கிடைக்கும்!
            </p>
          </div>
        )}
      </Field>

      {/* Birth Place */}
      <Field>
        <FieldLabel>பிறந்த இடம் <span className="text-muted-foreground text-xs ml-1">Birth Place</span></FieldLabel>
        <Input {...register("birthPlace")} placeholder="உ.ம்., Madurai" list="birthplace-suggestions" />
        <datalist id="birthplace-suggestions">
          {["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Thanjavur", "Erode", "Vellore"].map(c => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </Field>

      {/* Live Kodu Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-medium text-foreground">
            🌟 ஜாதக கட்டம் <span className="text-muted-foreground font-sans text-sm ml-1">Live Horoscope Preview</span>
          </h3>
          {isCalcLoading && (
            <span className="text-xs text-muted-foreground animate-pulse">கணக்கிடுகிறது…</span>
          )}
        </div>

        {!isReady && !chartResult && (
          <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-8 text-center">
            <p className="font-tamil text-muted-foreground text-sm">
              பிறந்த நேரம் மற்றும் இடம் உள்ளிட்டால் ஜாதக கட்டம் காட்டப்படும்
            </p>
          </div>
        )}

        {(isReady || chartResult) && (
          <div className="space-y-4">
            <div className="w-full max-w-sm mx-auto">
              <KoduGrid
                isLoading={isCalcLoading}
                planetPositions={chartResult?.planetPositions ?? []}
                lagnaHouse={chartResult?.lagnaHouse ?? -1}
                hideToggle={true}
                personName="உங்கள் ஜாதகம்"
              />
            </div>

            {chartResult && !isCalcLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in slide-in-from-bottom-2">
                {[
                  { label: "லக்னம்", value: chartResult.lagna },
                  { label: "ராசி", value: chartResult.rasi },
                  { label: "நட்சத்திரம்", value: chartResult.natchathiram },
                  { label: "பாதம்", value: chartResult.padam },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-primary/30 bg-primary/5 px-3 py-3 text-center">
                    <p className="font-tamil text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                    <p className="font-tamil font-bold text-primary mt-1">{item.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
