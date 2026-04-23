"use client"

import { useState, useEffect } from "react"
import { KoduGrid } from "@/components/kodu-grid"
import { PoruthamsTable, type Porutham } from "@/components/astrology/poruthams-table"
import { convertChartToPositions } from "@/lib/astrology-utils"
import { GROOM, BRIDE, RASIS } from "@/lib/astrology-data" // standard mock
import { AlertCircle } from "lucide-react"

type CompatibilityViewProps = {
  viewerId: string
  profileId: string
}

// Simulates a backend service response
function simulateGetCompatibility(viewerId: string, profileId: string) {
  return new Promise<{
    viewerPositions: any[] // PlanetPosition[]
    viewerLagna: number
    viewerName: string
    profilePositions: any[]
    profileLagna: number
    profileName: string
    poruthams: Porutham[]
    totalScore: number
    hasData: boolean
  }>((resolve) => {
    setTimeout(() => {
      // Basic mock
      resolve({
        hasData: true,
        viewerPositions: convertChartToPositions(GROOM.rasiChart),
        viewerLagna: RASIS[GROOM.lagna].number,
        viewerName: "உங்கள் ஜாதகம்",
        profilePositions: convertChartToPositions(BRIDE.rasiChart),
        profileLagna: RASIS[BRIDE.lagna].number,
        profileName: "இவர் ஜாதகம்",
        totalScore: 8,
        poruthams: [
          { tamilName: "தினம்", englishName: "Dinam", result: true, points: 1, description: "Natchathiram compatibility. Represents health and well-being." },
          { tamilName: "கணம்", englishName: "Ganam", result: true, points: 1, description: "Temperament match. Represents harmony of character." },
          { tamilName: "மாகேந்திரம்", englishName: "Mahendram", result: false, points: 0, description: "Prosperity and offspring. Represents wealth and children." },
          { tamilName: "ஸ்திரீ தீர்க்கம்", englishName: "Stree-Deergham", result: true, points: 1, description: "Longevity of wife. Ensures a long, happy life together." },
          { tamilName: "யோனி", englishName: "Yoni", result: true, points: 1, description: "Natural compatibility. Represents physical harmony." },
          { tamilName: "ராசி", englishName: "Rasi", result: true, points: 1, description: "Zodiac compatibility. Represents lineage and family growth." },
          { tamilName: "ராசியாதிபதி", englishName: "Rasiyathipathi", result: true, points: 1, description: "Zodiac lord match. Represents mutual friendship." },
          { tamilName: "வஸ்யம்", englishName: "Vashya", result: true, points: 1, description: "Mutual attraction. Represents magnetism into marriage." },
          { tamilName: "ரஜ்ஜு", englishName: "Rajju", result: true, points: 1, description: "Marriage longevity. Extremely critical for husband's life." },
          { tamilName: "வேதம்", englishName: "Vedha", result: false, points: 0, description: "Obstacle-free union. Lack of afflictions between stars." }
        ]
      })
    }, 1500) // fake loading delay
  })
}

export function CompatibilityView({ viewerId, profileId }: CompatibilityViewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    setIsLoading(true)
    simulateGetCompatibility(viewerId, profileId).then((res) => {
      setData(res)
      setIsLoading(false)
    })
  }, [viewerId, profileId])

  if (!isLoading && data && !data.hasData) {
    return (
      <div className="flex w-full items-start gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-destructive">
        <AlertCircle className="h-6 w-6 mt-0.5 shrink-0" />
        <div>
          <h3 className="font-semibold text-lg">Not Enough Data</h3>
          <p className="opacity-80">Either your profile or the match lacks an exact birth time. Please update your profile to calculate compatibility.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Side by side grids */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 w-full">
        <div className="w-full lg:w-1/2 max-w-[340px]">
          <KoduGrid 
            isLoading={isLoading} 
            planetPositions={data?.viewerPositions}
            lagnaHouse={data?.viewerLagna}
            personName={data?.viewerName}
            hideToggle={true}
          />
        </div>
        
        {/* Desktop Divider */}
        <div className="hidden lg:flex w-[1px] self-stretch bg-border" />
        
        <div className="w-full lg:w-1/2 max-w-[340px]">
          <KoduGrid 
            isLoading={isLoading} 
            planetPositions={data?.profilePositions}
            lagnaHouse={data?.profileLagna}
            personName={data?.profileName}
            hideToggle={true}
          />
        </div>
      </div>

      {/* Poruthams Table */}
      <div className="w-full">
        <h3 className="mb-4 font-serif text-2xl font-medium text-foreground">
          Porutham Match <span className="font-tamil text-muted-foreground ml-2 text-lg">பொருத்தம்</span>
        </h3>
        {isLoading ? (
          <div className="w-full h-[400px] rounded-xl border border-border bg-muted animate-pulse" />
        ) : (
          <PoruthamsTable poruthams={data.poruthams} totalScore={data.totalScore} />
        )}
      </div>
    </div>
  )
}
