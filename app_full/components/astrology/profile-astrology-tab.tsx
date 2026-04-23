"use client"

import { useState, useEffect } from "react"
import { KoduGrid } from "@/components/kodu-grid"
import { convertChartToPositions, type PlanetPosition } from "@/lib/astrology-utils"
import { BRIDE, RASIS } from "@/lib/astrology-data"
import { Clock, MapPin, Star } from "lucide-react"

type ProfileAstrologyTabProps = {
  profileId: string
}

// Simulates fetching a profile's astrology data
async function fetchProfileAstrology(profileId: string) {
  await new Promise((r) => setTimeout(r, 800))
  // Mock: use BRIDE data for any profile
  return {
    hasData: true,
    positions: convertChartToPositions(BRIDE.rasiChart),
    lagnaHouse: RASIS[BRIDE.lagna].number,
    rasi: RASIS[BRIDE.rasi].tamil,
    lagna: RASIS[BRIDE.lagna].tamil,
    star: BRIDE.star.tamil,
    birthTime: BRIDE.birthDetails.time,
    birthPlace: BRIDE.birthDetails.place,
    birthDate: BRIDE.birthDetails.date,
    name: BRIDE.tamilName,
  }
}

/**
 * Full astrology tab for the public profile page (/profile/:id).
 * Shows the profile's Rasi chart, key details, and birth info.
 */
export function ProfileAstrologyTab({ profileId }: ProfileAstrologyTabProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<Awaited<ReturnType<typeof fetchProfileAstrology>> | null>(null)

  useEffect(() => {
    setIsLoading(true)
    fetchProfileAstrology(profileId).then((res) => {
      setData(res)
      setIsLoading(false)
    })
  }, [profileId])

  if (!isLoading && data && !data.hasData) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-10 text-center">
        <p className="font-tamil text-muted-foreground">
          இந்த சுயவிவரத்தில் ஜாதக விவரங்கள் இல்லை
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Horoscope details are not available for this profile.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Chart */}
      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:gap-10">
        <div className="w-full max-w-[320px] shrink-0">
          <KoduGrid
            isLoading={isLoading}
            planetPositions={data?.positions ?? []}
            lagnaHouse={data?.lagnaHouse ?? -1}
            showToggle={false}
            personName={data?.name ?? ""}
          />
        </div>

        {/* Details panel */}
        <div className="flex-1 space-y-5">
          <h3 className="font-serif text-lg font-medium text-foreground">
            ஜாதக விவரங்கள்
            <span className="ml-2 text-sm text-muted-foreground font-sans">Horoscope Details</span>
          </h3>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Badges */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "ராசி (Rasi)", value: data!.rasi },
                  { label: "லக்னம் (Lagna)", value: data!.lagna },
                  { label: "நட்சத்திரம் (Star)", value: data!.star },
                ].map((b) => (
                  <div
                    key={b.label}
                    className="flex flex-col items-center justify-center rounded-xl border border-primary/20 bg-primary/5 px-3 py-4 text-center"
                  >
                    <span className="text-[10px] text-muted-foreground leading-tight">{b.label}</span>
                    <span className="font-tamil text-sm font-semibold text-primary mt-1.5">{b.value}</span>
                  </div>
                ))}
              </div>

              {/* Birth info */}
              <div className="rounded-xl border border-border bg-secondary/30 p-6">
                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-4 text-sm">
                  <dt className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span className="font-medium text-foreground">Birth Time:</span>
                  </dt>
                  <dd className="text-foreground">{data!.birthTime}</dd>

                  <dt className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="font-medium text-foreground">Birth Place:</span>
                  </dt>
                  <dd className="text-foreground">{data!.birthPlace}</dd>

                  <dt className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
                    <Star className="h-4 w-4 shrink-0" />
                    <span className="font-medium text-foreground">Birth Date:</span>
                  </dt>
                  <dd className="text-foreground">{data!.birthDate}</dd>
                </dl>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
