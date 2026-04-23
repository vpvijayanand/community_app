"use client"

import Link from "next/link"
import { KoduGrid } from "@/components/kodu-grid"
import { convertChartToPositions } from "@/lib/astrology-utils"
import { GROOM, RASIS } from "@/lib/astrology-data"
import { ArrowRight, Sparkles, AlertCircle } from "lucide-react"
import type { AdminUser } from "@/lib/admin-users"

/**
 * Compact astrology widget for the dashboard right column.
 * Shows the user's Rasi chart, key details, and a CTA to view full chart.
 */
export function DashboardAstroWidget({ user }: { user?: AdminUser }) {
  // Use user's chart or default to none
  const rasiChart = user?.rasiChart
  const lagnaRasi = user?.lagnaRasi

  const hasData = !!rasiChart && !!lagnaRasi

  const positions = hasData ? convertChartToPositions(rasiChart) : []
  const lagnaHouse = (hasData && lagnaRasi) ? RASIS[lagnaRasi].number : 1

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-serif text-sm font-medium text-foreground">
            Your Horoscope
          </h3>
          <span className="font-tamil text-xs text-muted-foreground">உங்கள் ஜாதகம்</span>
        </div>
      </div>

      {!hasData ? (
        <div className="p-8 text-center bg-secondary/10">
          <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <AlertCircle className="h-5 w-5 text-primary" />
          </div>
          <p className="font-serif text-sm font-medium text-foreground">No Astro details yet</p>
          <p className="font-tamil text-xs text-muted-foreground mt-1">ஜாதக விவரங்கள் இல்லை</p>
          <Link
            href="/profile/me/edit"
            className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Add Now · சேர்
          </Link>
        </div>
      ) : (
        <>
          {/* Mini chart */}
          <div className="px-5 pt-4 pb-2">
            <div className="mx-auto w-full max-w-[200px]">
              <KoduGrid
                planetPositions={positions}
                lagnaHouse={lagnaHouse}
                showToggle={false}
                size="sm"
                personName={user?.firstName || GROOM.tamilName}
              />
            </div>
          </div>

          {/* Key details */}
          <div className="grid grid-cols-2 gap-px bg-border mx-5 rounded-lg overflow-hidden mb-4">
            {[
              { label: "ராசி", value: user?.moonRasi ? (RASIS[user.moonRasi]?.tamil || "—") : (RASIS[GROOM.rasi].tamil) },
              { label: "லக்னம்", value: user?.lagnaRasi ? (RASIS[user.lagnaRasi]?.tamil || "—") : (RASIS[GROOM.lagna].tamil) },
              { label: "நட்சத்திரம்", value: user?.natchathiram || GROOM.star.tamil },
              { label: "பிறந்த நேரம்", value: user?.exactBirthTime || GROOM.birthDetails.time },
            ].map((item) => (
              <div key={item.label} className="bg-card px-3 py-2.5 text-center">
                <p className="font-tamil text-[10px] text-muted-foreground">{item.label}</p>
                <p className="font-tamil text-xs font-semibold text-foreground mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="border-t border-border px-5 py-3">
            <Link
              href="/astrology"
              className="flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              View full chart & matches
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
