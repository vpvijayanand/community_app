import { PlanetCode } from "./astrology-data"

export type Planet = PlanetCode

export interface PlanetPosition {
  planet: Planet
  house: number // 1–12
  isRetrograde?: boolean
}

/* ── Rasi names (Tamil) ── */
export const RASI_NAMES_TA: Record<number, string> = {
  1: "மேஷம்",
  2: "ரிஷபம்",
  3: "மிதுனம்",
  4: "கடகம்",
  5: "சிம்மம்",
  6: "கன்னி",
  7: "துலாம்",
  8: "விருச்சிகம்",
  9: "தனுசு",
  10: "மகரம்",
  11: "கும்பம்",
  12: "மீனம்",
}

/* ── Planet abbreviations (Tamil) ── */
export const PLANET_ABBR_TA: Record<string, string> = {
  sun: "சூ",
  moon: "ச",
  mars: "செ",
  mercury: "பு",
  jupiter: "கு",
  venus: "சு",
  saturn: "ச",
  rahu: "ரா",
  ketu: "கே",
  // Short codes used in existing data
  Su: "சூ",
  Mo: "ச",
  Ma: "செ",
  Me: "பு",
  Ju: "கு",
  Ve: "சு",
  Sa: "சனி",
  Ra: "ரா",
  Ke: "கே",
  La: "ல",
}

/* ── 27 Natchathirams (Tamil) ── */
export const NATCHATHIRAM_TA: string[] = [
  "அஸ்வினி", "பரணி", "கார்த்திகை", "ரோகிணி", "மிருகசீரிஷம்",
  "திருவாதிரை", "புனர்பூசம்", "பூசம்", "ஆயில்யம்", "மகம்",
  "பூரம்", "உத்திரம்", "ஹஸ்தம்", "சித்திரை", "சுவாதி",
  "விசாகம்", "அனுஷம்", "கேட்டை", "மூலம்", "பூராடம்",
  "உத்திராடம்", "திருவோணம்", "அவிட்டம்", "சதயம்",
  "பூரட்டாதி", "உத்திரட்டாதி", "ரேவதி",
]

/* ── Helpers ── */

export function getRasiName(rasiNumber: number): string {
  return RASI_NAMES_TA[rasiNumber] || ""
}

export function getPlanetTamilAbbr(planet: string): string {
  return PLANET_ABBR_TA[planet] || planet
}

export function getNatchathiramName(index: number): string {
  return NATCHATHIRAM_TA[index] || ""
}

/**
 * Group planet positions into a house → planets map.
 */
export function groupPlanetsByHouse(
  positions: Array<{ planet: string; house: number }>
): Record<number, string[]> {
  return positions.reduce((acc, { planet, house }) => {
    acc[house] = acc[house] ? [...acc[house], planet] : [planet]
    return acc
  }, {} as Record<number, string[]>)
}

/**
 * Determine which rasi occupies a given house based on lagna.
 * If lagnaRasi is not provided, lagnaHouse is used as the rasi number.
 */
export function rasiForHouse(house: number, lagnaHouse: number, lagnaRasi?: number): number {
  const rasi = lagnaRasi ?? lagnaHouse
  return ((rasi - 1 + house - lagnaHouse + 12) % 12) + 1
}

/**
 * Score-based porutham label & color.
 */
export function getPoruthamsLabel(score: number): { label: string; color: string } {
  if (score <= 4) return { label: "பொருத்தமில்லை", color: "#E24B4A" }
  if (score <= 6) return { label: "சராசரி பொருத்தம்", color: "#EF9F27" }
  if (score <= 8) return { label: "நல்ல பொருத்தம்", color: "#639922" }
  return { label: "சிறந்த பொருத்தம்", color: "#CD1C18" }
}

export function getHouseForPlanet(positions: PlanetPosition[], planet: Planet): number {
  const pos = positions.find((p) => p.planet === planet)
  return pos ? pos.house : -1
}

export function formatBirthTime(time: string): string {
  const [hStr, mStr] = time.split(":")
  if (!hStr || !mStr) return time
  const hh = parseInt(hStr, 10)
  const mm = parseInt(mStr, 10)
  const ampm = hh >= 12 ? "PM" : "AM"
  let h12 = hh % 12
  if (h12 === 0) h12 = 12
  return `${h12}:${mm.toString().padStart(2, "0")} ${ampm}`
}

const RASI_TO_HOUSE: Record<string, number> = {
  Mesham: 1, Rishabam: 2, Mithunam: 3, Kadagam: 4,
  Simmam: 5, Kanni: 6, Thulam: 7, Viruchigam: 8,
  Dhanusu: 9, Magaram: 10, Kumbam: 11, Meenam: 12,
}

export function convertChartToPositions(chart: any): PlanetPosition[] {
  const positions: PlanetPosition[] = []
  if (!chart) return positions
  for (const [rasiKey, planets] of Object.entries(chart)) {
    const house = RASI_TO_HOUSE[rasiKey]
    if (house && Array.isArray(planets)) {
      for (const planet of planets) {
        positions.push({ planet: planet as Planet, house })
      }
    }
  }
  return positions
}

