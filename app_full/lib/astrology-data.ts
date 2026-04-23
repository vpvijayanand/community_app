// Mock astrology data for the Maratha compatibility showcase.
// All data is illustrative; a real implementation would compute these
// values from birth charts on the backend.

export type PlanetCode = "Su" | "Mo" | "Ma" | "Me" | "Ju" | "Ve" | "Sa" | "Ra" | "Ke" | "La"

export const PLANETS: Record<
  PlanetCode,
  { short: string; tamil: string; english: string }
> = {
  Su: { short: "Su", tamil: "சூ", english: "Sun" },
  Mo: { short: "Mo", tamil: "ச", english: "Moon" },
  Ma: { short: "Ma", tamil: "செ", english: "Mars" },
  Me: { short: "Me", tamil: "பு", english: "Mercury" },
  Ju: { short: "Ju", tamil: "கு", english: "Jupiter" },
  Ve: { short: "Ve", tamil: "சு", english: "Venus" },
  Sa: { short: "Sa", tamil: "சனி", english: "Saturn" },
  Ra: { short: "Ra", tamil: "ரா", english: "Rahu" },
  Ke: { short: "Ke", tamil: "கே", english: "Ketu" },
  La: { short: "La", tamil: "ல", english: "Lagnam" },
}

export type RasiKey =
  | "Mesham"
  | "Rishabam"
  | "Mithunam"
  | "Kadagam"
  | "Simmam"
  | "Kanni"
  | "Thulam"
  | "Viruchigam"
  | "Dhanusu"
  | "Magaram"
  | "Kumbam"
  | "Meenam"

export const RASIS: Record<
  RasiKey,
  { number: number; tamil: string; english: string; row: number; col: number }
> = {
  Meenam: { number: 12, tamil: "மீனம்", english: "Pisces", row: 0, col: 0 },
  Mesham: { number: 1, tamil: "மேஷம்", english: "Aries", row: 0, col: 1 },
  Rishabam: { number: 2, tamil: "ரிஷபம்", english: "Taurus", row: 0, col: 2 },
  Mithunam: { number: 3, tamil: "மிதுனம்", english: "Gemini", row: 0, col: 3 },
  Kumbam: { number: 11, tamil: "கும்பம்", english: "Aquarius", row: 1, col: 0 },
  Kadagam: { number: 4, tamil: "கடகம்", english: "Cancer", row: 1, col: 3 },
  Magaram: { number: 10, tamil: "மகரம்", english: "Capricorn", row: 2, col: 0 },
  Simmam: { number: 5, tamil: "சிம்மம்", english: "Leo", row: 2, col: 3 },
  Dhanusu: { number: 9, tamil: "தனுசு", english: "Sagittarius", row: 3, col: 0 },
  Viruchigam: { number: 8, tamil: "விருச்சிகம்", english: "Scorpio", row: 3, col: 1 },
  Thulam: { number: 7, tamil: "துலாம்", english: "Libra", row: 3, col: 2 },
  Kanni: { number: 6, tamil: "கன்னி", english: "Virgo", row: 3, col: 3 },
}

export const RASI_ORDER: RasiKey[] = [
  "Meenam",
  "Mesham",
  "Rishabam",
  "Mithunam",
  "Kumbam",
  "Kadagam",
  "Magaram",
  "Simmam",
  "Dhanusu",
  "Viruchigam",
  "Thulam",
  "Kanni",
]

export type Chart = Partial<Record<RasiKey, PlanetCode[]>>

export type Partner = {
  id: string
  name: string
  tamilName: string
  ageYears: number
  birthDetails: {
    date: string
    time: string
    place: string
  }
  star: { tamil: string; english: string }
  rasi: RasiKey
  lagna: RasiKey
  portrait?: string
  rasiChart: Chart
  navamsaChart: Chart
}

export const GROOM: Partner = {
  id: "groom",
  name: "Arun Velan",
  tamilName: "அருண் வேலன்",
  ageYears: 29,
  birthDetails: {
    date: "14 August 1996",
    time: "06:42 AM",
    place: "Madurai, Tamil Nadu",
  },
  star: { tamil: "உத்திரட்டாதி", english: "Uthrattathi (Pada 2)" },
  rasi: "Meenam",
  lagna: "Simmam",
  rasiChart: {
    Meenam: ["Mo", "Ke"],
    Mesham: ["Su", "Ve"],
    Rishabam: ["Me"],
    Kadagam: ["Ju"],
    Simmam: ["La"],
    Kanni: ["Ra"],
    Dhanusu: ["Ma", "Sa"],
  },
  navamsaChart: {
    Mesham: ["Ma"],
    Mithunam: ["Me", "Ke"],
    Simmam: ["Su"],
    Thulam: ["Ve", "La"],
    Viruchigam: ["Mo"],
    Magaram: ["Sa"],
    Kumbam: ["Ra"],
    Meenam: ["Ju"],
  },
}

export const BRIDE: Partner = {
  id: "bride",
  name: "Meera Iyer",
  tamilName: "மீரா ஐயர்",
  ageYears: 26,
  birthDetails: {
    date: "02 March 1999",
    time: "19:18 PM",
    place: "Thanjavur, Tamil Nadu",
  },
  star: { tamil: "ரோகிணி", english: "Rohini (Pada 4)" },
  rasi: "Rishabam",
  lagna: "Kanni",
  rasiChart: {
    Mesham: ["Ke"],
    Rishabam: ["Mo", "Ju"],
    Mithunam: ["Su", "Me"],
    Kadagam: ["Ve"],
    Simmam: ["Ma"],
    Kanni: ["La"],
    Thulam: ["Sa"],
    Viruchigam: ["Ra"],
  },
  navamsaChart: {
    Mesham: ["Ju"],
    Rishabam: ["Ve", "La"],
    Kadagam: ["Mo"],
    Simmam: ["Su", "Me"],
    Thulam: ["Sa"],
    Viruchigam: ["Ke"],
    Dhanusu: ["Ma"],
    Kumbam: ["Ra"],
  },
}

export type Porutham = {
  key: string
  tamil: string
  english: string
  description: string
  max: number
  score: number
  passed: boolean
  detail: string
}

export const PORUTHAMS: Porutham[] = [
  {
    key: "dinam",
    tamil: "தினம்",
    english: "Dinam",
    description: "Harmony of stars for day-to-day well-being and longevity.",
    max: 3,
    score: 3,
    passed: true,
    detail: "Bride's star is the 14th from the groom's — a favourable count.",
  },
  {
    key: "ganam",
    tamil: "கணம்",
    english: "Ganam",
    description: "Compatibility of temperament: Deva, Manushya or Rakshasa.",
    max: 6,
    score: 6,
    passed: true,
    detail: "Both charts carry Manushya Ganam, indicating aligned nature.",
  },
  {
    key: "mahendram",
    tamil: "மகேந்திரம்",
    english: "Mahendram",
    description: "Prospects for progeny and family growth.",
    max: 2,
    score: 2,
    passed: true,
    detail: "Groom's star stands 4th, 7th, 10th, 13th, 16th, 19th, 22nd or 25th from bride.",
  },
  {
    key: "stree-dheerkam",
    tamil: "ஸ்திரீ தீர்க்கம்",
    english: "Stree Dheerkam",
    description: "Well-being and longevity of the bride.",
    max: 4,
    score: 4,
    passed: true,
    detail: "Groom's star is placed beyond the 9th from the bride's star.",
  },
  {
    key: "yoni",
    tamil: "யோனி",
    english: "Yoni",
    description: "Natural pairing of physical and emotional temperaments.",
    max: 4,
    score: 2,
    passed: true,
    detail: "Friendly pair (Horse · Snake). Neutral — compatible but not ideal.",
  },
  {
    key: "rasi",
    tamil: "ராசி",
    english: "Rasi",
    description: "Placement of the moon sign between partners.",
    max: 7,
    score: 7,
    passed: true,
    detail: "Bride's Rasi is the 2nd from the groom's — considered auspicious.",
  },
  {
    key: "rasi-athipathi",
    tamil: "ராசி அதிபதி",
    english: "Rasi Athipathi",
    description: "Friendship between the lords of the two Rasis.",
    max: 5,
    score: 5,
    passed: true,
    detail: "Jupiter and Venus share a neutral-to-friendly relation.",
  },
  {
    key: "vasya",
    tamil: "வசியம்",
    english: "Vasya",
    description: "Mutual attraction and emotional influence.",
    max: 2,
    score: 2,
    passed: true,
    detail: "Rishabam falls within the Vasya set of Meenam.",
  },
  {
    key: "rajju",
    tamil: "ரஜ்ஜு",
    english: "Rajju",
    description: "The strand of longevity; must not clash for a long marriage.",
    max: 5,
    score: 0,
    passed: false,
    detail: "Both stars fall in Pada Rajju. Requires a remedial parihara.",
  },
  {
    key: "vedha",
    tamil: "வேதை",
    english: "Vedha",
    description: "Absence of afflicted star pairings between partners.",
    max: 2,
    score: 2,
    passed: true,
    detail: "No Vedha nakshatra pairing between Uthrattathi and Rohini.",
  },
]

export const TOTAL_MAX = PORUTHAMS.reduce((n, p) => n + p.max, 0)
export const TOTAL_SCORE = PORUTHAMS.reduce((n, p) => n + p.score, 0)
export const MATCH_PERCENT = Math.round((TOTAL_SCORE / TOTAL_MAX) * 100)
