/**
 * Astrology Model — Horoscope data (Step 7 of wizard)
 *
 * Table: astrology_details
 */
export interface AstrologyDetails {
  id: string
  profileId: string                 // FK → profiles.id, unique
  dateOfBirth: string               // YYYY-MM-DD
  birthTime: string                 // HH:MM (24h)
  birthAmPm: "AM" | "PM"
  birthPlace: string
  birthLat?: number                 // latitude
  birthLng?: number                 // longitude

  // Auto-calculated by backend (Swiss Ephemeris)
  lagnaHouse: number                // 1–12
  lagnaRasi: number                 // 1–12
  rasiNumber: number                // 1–12 (Moon sign)
  rasiName?: string                 // Tamil name, e.g. "மேஷம்"
  natchathiram?: string             // e.g. "அஸ்வினி"
  natchathiramIndex?: number        // 0–26
  padam?: number                    // 1–4

  createdAt: string
  updatedAt: string
}

/**
 * Table: planet_positions
 * One row per planet per horoscope
 */
export interface PlanetPosition {
  id: string
  astrologyId: string               // FK → astrology_details.id
  planet: PlanetCode
  house: number                     // 1–12
  degree?: number                   // 0–360
  isRetrograde: boolean
  chartType: "rasi" | "navamsa"     // same planet can have different navamsa house
}

export type PlanetCode =
  | "Su"   // Sun / சூரியன்
  | "Mo"   // Moon / சந்திரன்
  | "Ma"   // Mars / செவ்வாய்
  | "Me"   // Mercury / புதன்
  | "Ju"   // Jupiter / குரு
  | "Ve"   // Venus / சுக்கிரன்
  | "Sa"   // Saturn / சனி
  | "Ra"   // Rahu / ராகு
  | "Ke"   // Ketu / கேது
  | "La"   // Lagna / லக்னம்

/**
 * Table: compatibility_results
 * Cached compatibility between two profiles
 */
export interface CompatibilityResult {
  id: string
  profileId1: string                // FK → profiles.id
  profileId2: string                // FK → profiles.id
  totalScore: number                // 0–10
  poruthams: PoruthamResult[]       // JSON column or separate table
  calculatedAt: string
}

/**
 * Embedded in compatibility_results.poruthams (JSON) or Table: porutham_results
 */
export interface PoruthamResult {
  name: PoruthamName
  nameTamil: string
  passed: boolean
  points: number                    // 0, 1, or 2
  explanation?: string
  explanationTamil?: string
}

export type PoruthamName =
  | "dinam"
  | "ganam"
  | "mahendram"
  | "stree_deergham"
  | "yoni"
  | "rasi"
  | "rasiyathipathi"
  | "vashya"
  | "rajju"
  | "vedha"
