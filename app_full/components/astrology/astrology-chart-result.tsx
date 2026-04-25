"use client"

import { useState } from "react"
import Link from "next/link"
import { KoduGrid } from "@/components/kodu-grid"
import type { JyotishResult } from "@/lib/jyotish-calc"
import type { PlanetPosition } from "@/lib/astrology-utils"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Star, Sun, Moon as MoonIcon, Printer } from "lucide-react"

interface AstrologyChartResultProps {
  result: JyotishResult
  name: string
  dob: string
  /** If provided, shows a link to the detail/print page */
  chartId?: string
}

const PLANET_COLORS: Record<string, string> = {
  Su: "#E8760A",
  Mo: "#4A90D9",
  Ma: "#D92B3A",
  Me: "#2BAD5E",
  Ju: "#E8A02A",
  Ve: "#9B59B6",
  Sa: "#5B6EB0",
  Ra: "#7A3A3A",
  Ke: "#7A7A7A",
  La: "#CD1C18",
}

const PLANET_NAMES_EN: Record<string, string> = {
  Su: "Sun", Mo: "Moon", Ma: "Mars", Me: "Mercury",
  Ju: "Jupiter", Ve: "Venus", Sa: "Saturn", Ra: "Rahu", Ke: "Ketu", La: "Lagnam",
}

const PLANET_NAMES_TA: Record<string, string> = {
  Su: "சூரியன்", Mo: "சந்திரன்", Ma: "செவ்வாய்", Me: "புதன்",
  Ju: "குரு", Ve: "சுக்கிரன்", Sa: "சனி", Ra: "ராகு", Ke: "கேது", La: "லக்னம்",
}

const RASI_NAMES_EN: Record<number, string> = {
  1: "Mesham", 2: "Rishabam", 3: "Mithunam", 4: "Kadagam",
  5: "Simmam", 6: "Kanni", 7: "Thulam", 8: "Viruchigam",
  9: "Dhanusu", 10: "Magaram", 11: "Kumbam", 12: "Meenam",
}

export function AstrologyChartResult({ result, name, dob, chartId }: AstrologyChartResultProps) {
  const [chartTab, setChartTab] = useState<"rasi" | "navamsa">("rasi")

  // Convert to KoduGrid format
  const rasiPositions: PlanetPosition[] = result.rasiPositions.map((p) => ({
    planet: p.planet as any,
    house: p.house,
    isRetrograde: p.isRetrograde,
  }))

  const navamsaPositions: PlanetPosition[] = result.navamsaPositions.map((p) => ({
    planet: p.planet as any,
    house: p.house,
    isRetrograde: p.isRetrograde,
  }))

  const lagnaHouse = result.lagnamRasi

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Summary Badges ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border bg-primary/5 px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Star className="h-4 w-4 text-primary" />
            <div>
              <p className="font-tamil text-sm text-primary/80 uppercase tracking-widest">ஜாதக முடிவுகள்</p>
              <h3 className="font-serif text-lg font-semibold text-foreground">{name} — Horoscope Result</h3>
            </div>
          </div>
          {chartId && (
            <Link
              href={`/astrology/history/${chartId}`}
              className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition"
            >
              <Printer className="h-3 w-3" />
              View & Print
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
          {/* Rasi */}
          <div className="flex flex-col items-center justify-center gap-1 py-5 px-4 text-center">
            <MoonIcon className="h-5 w-5 text-primary mb-1" />
            <p className="font-tamil text-xs text-muted-foreground uppercase tracking-widest">ராசி</p>
            <p className="font-tamil text-2xl font-bold text-foreground">{result.moonRasiTamil}</p>
            <p className="text-xs text-muted-foreground">{result.moonRasiEnglish}</p>
          </div>

          {/* Natchathiram */}
          <div className="flex flex-col items-center justify-center gap-1 py-5 px-4 text-center">
            <Star className="h-5 w-5 text-amber-500 mb-1" />
            <p className="font-tamil text-xs text-muted-foreground uppercase tracking-widest">நட்சத்திரம்</p>
            <p className="font-tamil text-2xl font-bold text-foreground">{result.natchathiramTamil}</p>
            <p className="text-xs text-muted-foreground">
              {result.natchathiramEnglish}
              <span className="ml-2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-0.5 text-[10px] font-semibold">
                பாதம் {result.pada}
              </span>
            </p>
          </div>

          {/* Lagnam */}
          <div className="flex flex-col items-center justify-center gap-1 py-5 px-4 text-center">
            <Sun className="h-5 w-5 text-orange-500 mb-1" />
            <p className="font-tamil text-xs text-muted-foreground uppercase tracking-widest">லக்னம்</p>
            <p className="font-tamil text-2xl font-bold text-foreground">{result.lagnamTamil}</p>
            <p className="text-xs text-muted-foreground">{result.lagnamEnglish}</p>
          </div>
        </div>
      </div>

      {/* ── Charts ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border bg-primary/5 px-6 py-4">
          <p className="font-tamil text-sm text-primary/80 uppercase tracking-widest">ஜாதக கட்டம்</p>
          <h3 className="font-serif text-lg font-semibold text-foreground">South-Indian Horoscope Chart</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Tamil Nadu (Kodu) style — Lagna highlighted in red</p>
        </div>

        <div className="p-6">
          <Tabs value={chartTab} onValueChange={(v) => setChartTab(v as "rasi" | "navamsa")}>
            <TabsList className="w-full max-w-sm mx-auto bg-secondary/70 p-0.5 mb-6">
              <TabsTrigger value="rasi" className="flex-1 gap-1.5">
                <span>Rasi</span>
                <span className="font-tamil text-xs opacity-70">ராசி</span>
              </TabsTrigger>
              <TabsTrigger value="navamsa" className="flex-1 gap-1.5">
                <span>Navamsa</span>
                <span className="font-tamil text-xs opacity-70">நவாம்சம்</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rasi">
              <div className="flex justify-center">
                <KoduGrid
                  planetPositions={rasiPositions}
                  lagnaHouse={lagnaHouse}
                  mode="rasi"
                  personName={name}
                  dob={dob}
                  size="lg"
                  showToggle={false}
                />
              </div>
            </TabsContent>

            <TabsContent value="navamsa">
              <div className="flex justify-center">
                <KoduGrid
                  planetPositions={navamsaPositions}
                  lagnaHouse={lagnaHouse}
                  mode="navamsa"
                  personName={name}
                  dob={dob}
                  size="lg"
                  showToggle={false}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ── Planetary Positions Table ─────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border bg-primary/5 px-6 py-4">
          <p className="font-tamil text-sm text-primary/80 uppercase tracking-widest">கிரக நிலை</p>
          <h3 className="font-serif text-lg font-semibold text-foreground">Planetary Positions</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left font-medium text-foreground">Planet / கிரகம்</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Rasi / ராசி</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Longitude</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Navamsa</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {result.planets.map((p) => (
                <tr key={p.code} className="border-b border-border/50 hover:bg-secondary/20 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ backgroundColor: PLANET_COLORS[p.code] || "#7A3A3A" }}
                      >
                        {p.code}
                      </span>
                      <div>
                        <p className="font-medium text-foreground text-xs">{p.nameEnglish}</p>
                        <p className="font-tamil text-[10px] text-muted-foreground">{p.nameTamil}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-foreground text-xs font-medium">{RASI_NAMES_EN[p.rasi]}</p>
                    <p className="font-tamil text-[10px] text-muted-foreground">
                      {["", "மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்", "சிம்மம்", "கன்னி", "துலாம்", "விருச்சிகம்", "தனுசு", "மகரம்", "கும்பம்", "மீனம்"][p.rasi]}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {p.siderealLong.toFixed(2)}°
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-foreground text-xs">{RASI_NAMES_EN[p.navamsa]}</p>
                  </td>
                  <td className="px-4 py-3">
                    {p.isRetrograde ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                        ℞ Retrograde
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Direct
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {/* Lagnam row */}
              <tr className="border-b border-primary/20 bg-primary/5 hover:bg-primary/10 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white bg-primary">La</span>
                    <div>
                      <p className="font-medium text-foreground text-xs">Lagnam (Ascendant)</p>
                      <p className="font-tamil text-[10px] text-muted-foreground">லக்னம்</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-foreground text-xs font-medium">{RASI_NAMES_EN[result.lagnamRasi]}</p>
                  <p className="font-tamil text-[10px] text-muted-foreground">{result.lagnamTamil}</p>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">—</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">—</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    Ascendant
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
