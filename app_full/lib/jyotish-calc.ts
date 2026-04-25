/**
 * jyotish-calc.ts
 * Pure TypeScript Jyotish (Vedic Astrology) calculation engine.
 * Uses Lahiri Ayanamsa (Chitrapaksha). All calculations are client-side.
 *
 * Algorithm references: Jean Meeus "Astronomical Algorithms" (2nd ed.),
 * Swiss Ephemeris low-precision planet positions.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BirthInput {
  name: string
  gender: "male" | "female" | "other"
  /** ISO date string YYYY-MM-DD */
  dob: string
  /** HH:MM in 24h format */
  timeOfBirth: string
  /** Decimal degrees, positive = North */
  latitude: number
  /** Decimal degrees, positive = East */
  longitude: number
  /** UTC offset in hours, e.g. +5.5 for IST */
  utcOffset?: number
}

export interface PlanetResult {
  /** Planet code used by KoduGrid */
  code: string
  nameEnglish: string
  nameTamil: string
  /** Tropical longitude 0–360 */
  tropicalLong: number
  /** Sidereal longitude 0–360 after ayanamsa */
  siderealLong: number
  /** Rasi number 1–12 */
  rasi: number
  /** Navamsa number 1–12 */
  navamsa: number
  isRetrograde: boolean
}

export interface JyotishResult {
  /** Moon's rasi number 1–12 */
  moonRasi: number
  /** Moon's rasi name Tamil */
  moonRasiTamil: string
  /** Moon's rasi name English */
  moonRasiEnglish: string
  /** Nakshatra index 0–26 */
  natchathiramIndex: number
  /** Nakshatra Tamil name */
  natchathiramTamil: string
  /** Nakshatra English name */
  natchathiramEnglish: string
  /** Nakshatra pada 1–4 */
  pada: number
  /** Lagnam (Ascendant) rasi 1–12 */
  lagnamRasi: number
  lagnamTamil: string
  lagnamEnglish: string
  /** All planet positions for Rasi chart (house = rasi number) */
  rasiPositions: Array<{ planet: string; house: number; isRetrograde: boolean }>
  /** All planet positions for Navamsa chart */
  navamsaPositions: Array<{ planet: string; house: number; isRetrograde: boolean }>
  /** Detailed planet data */
  planets: PlanetResult[]
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const RASI_NAMES: Array<{ tamil: string; english: string }> = [
  { tamil: "", english: "" }, // index 0 unused
  { tamil: "மேஷம்", english: "Mesham (Aries)" },
  { tamil: "ரிஷபம்", english: "Rishabam (Taurus)" },
  { tamil: "மிதுனம்", english: "Mithunam (Gemini)" },
  { tamil: "கடகம்", english: "Kadagam (Cancer)" },
  { tamil: "சிம்மம்", english: "Simmam (Leo)" },
  { tamil: "கன்னி", english: "Kanni (Virgo)" },
  { tamil: "துலாம்", english: "Thulam (Libra)" },
  { tamil: "விருச்சிகம்", english: "Viruchigam (Scorpio)" },
  { tamil: "தனுசு", english: "Dhanusu (Sagittarius)" },
  { tamil: "மகரம்", english: "Magaram (Capricorn)" },
  { tamil: "கும்பம்", english: "Kumbam (Aquarius)" },
  { tamil: "மீனம்", english: "Meenam (Pisces)" },
]

const NAKSHATRA_DATA: Array<{ tamil: string; english: string }> = [
  { tamil: "அஸ்வினி", english: "Ashwini" },
  { tamil: "பரணி", english: "Bharani" },
  { tamil: "கார்த்திகை", english: "Krittika" },
  { tamil: "ரோகிணி", english: "Rohini" },
  { tamil: "மிருகசீரிஷம்", english: "Mrigashirsha" },
  { tamil: "திருவாதிரை", english: "Ardra" },
  { tamil: "புனர்பூசம்", english: "Punarvasu" },
  { tamil: "பூசம்", english: "Pushya" },
  { tamil: "ஆயில்யம்", english: "Ashlesha" },
  { tamil: "மகம்", english: "Magha" },
  { tamil: "பூரம்", english: "Purva Phalguni" },
  { tamil: "உத்திரம்", english: "Uttara Phalguni" },
  { tamil: "ஹஸ்தம்", english: "Hasta" },
  { tamil: "சித்திரை", english: "Chitra" },
  { tamil: "சுவாதி", english: "Swati" },
  { tamil: "விசாகம்", english: "Vishakha" },
  { tamil: "அனுஷம்", english: "Anuradha" },
  { tamil: "கேட்டை", english: "Jyeshtha" },
  { tamil: "மூலம்", english: "Mula" },
  { tamil: "பூராடம்", english: "Purva Ashadha" },
  { tamil: "உத்திராடம்", english: "Uttara Ashadha" },
  { tamil: "திருவோணம்", english: "Shravana" },
  { tamil: "அவிட்டம்", english: "Dhanishtha" },
  { tamil: "சதயம்", english: "Shatabhisha" },
  { tamil: "பூரட்டாதி", english: "Purva Bhadrapada" },
  { tamil: "உத்திரட்டாதி", english: "Uttara Bhadrapada" },
  { tamil: "ரேவதி", english: "Revati" },
]

const PLANET_META: Record<string, { english: string; tamil: string }> = {
  Su: { english: "Sun", tamil: "சூரியன்" },
  Mo: { english: "Moon", tamil: "சந்திரன்" },
  Ma: { english: "Mars", tamil: "செவ்வாய்" },
  Me: { english: "Mercury", tamil: "புதன்" },
  Ju: { english: "Jupiter", tamil: "குரு" },
  Ve: { english: "Venus", tamil: "சுக்கிரன்" },
  Sa: { english: "Saturn", tamil: "சனி" },
  Ra: { english: "Rahu", tamil: "ராகு" },
  Ke: { english: "Ketu", tamil: "கேது" },
  La: { english: "Lagnam", tamil: "லக்னம்" },
}

// ─── Math Helpers ─────────────────────────────────────────────────────────────

function toRad(deg: number) { return deg * Math.PI / 180 }
function toDeg(rad: number) { return rad * 180 / Math.PI }
function norm360(d: number) { return ((d % 360) + 360) % 360 }

/** Julian Day Number from calendar date (Gregorian) */
function julianDay(year: number, month: number, day: number, hour = 0.0): number {
  if (month <= 2) { year -= 1; month += 12 }
  const A = Math.floor(year / 100)
  const B = 2 - A + Math.floor(A / 4)
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + hour / 24 + B - 1524.5
}

/** Centuries from J2000.0 */
function T(jd: number) { return (jd - 2451545.0) / 36525.0 }

// ─── Ayanamsa (Lahiri / Chitrapaksha) ────────────────────────────────────────

/** Lahiri ayanamsa in degrees for a given JD */
function lahiriAyanamsa(jd: number): number {
  const t = T(jd)
  // Polynomial fit to Lahiri ayanamsa (accurate to ~1 arcmin for modern dates)
  return 23.85 + 1.3972222 * t + 0.0003086 * t * t
}

// ─── Planet Longitude Calculations ───────────────────────────────────────────

/** Sun tropical longitude (degrees) — Meeus low-precision */
function sunLongitude(jd: number): number {
  const t = T(jd)
  // Geometric mean longitude
  const L0 = norm360(280.46646 + 36000.76983 * t + 0.0003032 * t * t)
  // Mean anomaly
  const M = norm360(357.52911 + 35999.05029 * t - 0.0001537 * t * t)
  const Mrad = toRad(M)
  // Equation of centre
  const C = (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(Mrad)
    + (0.019993 - 0.000101 * t) * Math.sin(2 * Mrad)
    + 0.000289 * Math.sin(3 * Mrad)
  const sunLon = L0 + C
  // Apparent longitude (aberration correction)
  const omega = norm360(125.04 - 1934.136 * t)
  return norm360(sunLon - 0.00569 - 0.00478 * Math.sin(toRad(omega)))
}

/** Moon tropical longitude (degrees) — simplified Meeus series */
function moonLongitude(jd: number): number {
  const t = T(jd)
  // Mean longitude
  const Lp = norm360(218.3164477 + 481267.88123421 * t - 0.0015786 * t * t)
  // Mean elongation
  const D = norm360(297.8501921 + 445267.1114034 * t - 0.0018819 * t * t)
  // Sun mean anomaly
  const M = norm360(357.5291092 + 35999.0502909 * t - 0.0001536 * t * t)
  // Moon mean anomaly
  const Mp = norm360(134.9633964 + 477198.8675055 * t + 0.0087414 * t * t)
  // Moon argument of latitude
  const F = norm360(93.2720950 + 483202.0175233 * t - 0.0036539 * t * t)

  const Drad = toRad(D); const Mrad = toRad(M)
  const Mprad = toRad(Mp); const Frad = toRad(F)

  // Leading longitude perturbations
  const sumL = 6288774 * Math.sin(Mprad)
    + 1274027 * Math.sin(2 * Drad - Mprad)
    + 658314 * Math.sin(2 * Drad)
    + 213618 * Math.sin(2 * Mprad)
    - 185116 * Math.sin(Mrad)
    - 114332 * Math.sin(2 * Frad)
    + 58793 * Math.sin(2 * Drad - 2 * Mprad)
    + 57066 * Math.sin(2 * Drad - Mrad - Mprad)
    + 53322 * Math.sin(2 * Drad + Mprad)
    + 45758 * Math.sin(2 * Drad - Mrad)
    - 40923 * Math.sin(Mrad - Mprad)
    - 34720 * Math.sin(Drad)
    - 30383 * Math.sin(Mrad + Mprad)
    + 15327 * Math.sin(2 * Drad - 2 * Frad)
    - 12528 * Math.sin(Mprad + 2 * Frad)
    + 10980 * Math.sin(Mprad - 2 * Frad)
    + 10675 * Math.sin(4 * Drad - Mprad)
    + 10034 * Math.sin(3 * Mprad)
    + 8548 * Math.sin(4 * Drad - 2 * Mprad)
    - 7888 * Math.sin(2 * Drad + Mrad - Mprad)
    - 6766 * Math.sin(2 * Drad + Mrad)

  return norm360(Lp + sumL / 1000000)
}

/**
 * Mars tropical longitude (low-precision VSOP87 approximation)
 */
function marsLongitude(jd: number): [number, boolean] {
  const t = T(jd)
  const L = norm360(355.9309 + 19140.30268 * t + 0.00034 * t * t)
  const M = norm360(19.38 + 19140.30 * t)
  const Mrad = toRad(M)
  const lon = norm360(L + 10.691 * Math.sin(Mrad) + 0.623 * Math.sin(2 * Mrad))
  // Retrograde: approximate — Mars goes retro roughly when near opposition
  const isRetro = Math.abs(M - 180) < 30
  return [lon, isRetro]
}

/**
 * Simple orbital element approach for outer/inner planets.
 * Returns [longitude, isRetrograde]
 */
function simplePlanetLong(
  jd: number,
  L0: number, Lrate: number,
  M0: number, Mrate: number,
  eqCenCoeffs: number[], // sin(M), sin(2M), sin(3M) multipliers
): [number, boolean] {
  const t = T(jd)
  const L = norm360(L0 + Lrate * t)
  const M = norm360(M0 + Mrate * t)
  const Mrad = toRad(M)
  const C = eqCenCoeffs[0] * Math.sin(Mrad)
    + (eqCenCoeffs[1] || 0) * Math.sin(2 * Mrad)
    + (eqCenCoeffs[2] || 0) * Math.sin(3 * Mrad)
  const lon = norm360(L + C)
  // Retrograde: planet appears to move backwards when M is near 180°
  const isRetro = Math.abs(M - 180) < 30
  return [lon, isRetro]
}

function mercuryLongitude(jd: number): [number, boolean] {
  return simplePlanetLong(jd,
    252.2509, 149472.6746,
    174.7948, 149472.5152,
    [23.44, 2.99, 0.57])
}

function venusLongitude(jd: number): [number, boolean] {
  return simplePlanetLong(jd,
    181.9798, 58517.8156,
    50.4161, 58517.0316,
    [0.7758, 0.0033])
}

function jupiterLongitude(jd: number): [number, boolean] {
  return simplePlanetLong(jd,
    34.3515, 3034.9057,
    20.9, 3034.906,
    [5.5549, 0.1683])
}

function saturnLongitude(jd: number): [number, boolean] {
  return simplePlanetLong(jd,
    50.0874, 1222.1138,
    317.02, 1222.114,
    [6.3585, 0.2204])
}

/** Rahu (True node) — mean node approximation */
function rahuLongitude(jd: number): number {
  const t = T(jd)
  // Mean ascending node
  const omega = norm360(125.04452 - 1934.136261 * t + 0.0020708 * t * t)
  return omega
}

// ─── Ascendant (Lagnam) ───────────────────────────────────────────────────────

function ascendantLongitude(jd: number, latDeg: number, lngDeg: number, utcOffset: number): number {
  // Local apparent sidereal time
  const t = T(jd)
  // Greenwich mean sidereal time in degrees
  const GMST = norm360(280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * t * t)
  const LMST = norm360(GMST + lngDeg) // Local sidereal time
  const ramc = toRad(LMST) // Right Ascension of Midheaven Correction
  const eps = toRad(23.4392911) // Obliquity of ecliptic (approx)
  const lat = toRad(latDeg)

  // Ascendant calculation
  const y = -Math.cos(ramc)
  const x = Math.sin(eps) * Math.tan(lat) + Math.cos(eps) * Math.sin(ramc)
  let asc = toDeg(Math.atan2(y, x))
  if (x < 0) asc += 180
  else if (y < 0) asc += 360
  return norm360(asc)
}

// ─── Conversion Helpers ───────────────────────────────────────────────────────

function longToRasi(lon: number): number {
  return Math.floor(lon / 30) + 1
}

function longToNavamsa(lon: number): number {
  const rasiIndex = Math.floor(lon / 30)         // 0–11
  const posInRasi = lon % 30                       // 0–30°
  const navamsaIndex = Math.floor(posInRasi / (30 / 9)) // 0–8
  // Navamsa start depends on rasi element
  const elementStarts = [0, 4, 8, 0, 4, 8, 0, 4, 8, 0, 4, 8] // Aries, Leo, Sag start from 0 (Mesh)
  const startRasi = elementStarts[rasiIndex]
  return ((startRasi + navamsaIndex) % 12) + 1
}

function longToNakshatra(lon: number): { index: number; pada: number } {
  // Each nakshatra = 360/27 = 13.333...°, each pada = 3.333...°
  const nakshatraSpan = 360 / 27
  const padaSpan = nakshatraSpan / 4
  const index = Math.floor(lon / nakshatraSpan)
  const posInNak = lon % nakshatraSpan
  const pada = Math.floor(posInNak / padaSpan) + 1
  return { index: Math.min(index, 26), pada: Math.min(pada, 4) }
}

// ─── Main Calculator ──────────────────────────────────────────────────────────

export function calcJyotishChart(input: BirthInput): JyotishResult {
  const { dob, timeOfBirth, latitude, longitude, utcOffset = 5.5 } = input

  // Parse date/time
  const [year, month, day] = dob.split("-").map(Number)
  const [hourStr, minStr] = timeOfBirth.split(":").map(Number)
  const localHour = hourStr + minStr / 60
  const utHour = localHour - utcOffset

  // Julian Day at Universal Time
  const jd = julianDay(year, month, day, utHour)

  // Ayanamsa
  const ayanamsa = lahiriAyanamsa(jd)

  // Helper: tropical → sidereal
  const toSidereal = (trop: number) => norm360(trop - ayanamsa)

  // Sun
  const sunTrop = sunLongitude(jd)
  const sunSid = toSidereal(sunTrop)

  // Moon
  const moonTrop = moonLongitude(jd)
  const moonSid = toSidereal(moonTrop)

  // Mars
  const [marsTrop, marsRetro] = marsLongitude(jd) as [number, boolean]
  const marsSid = toSidereal(marsTrop)

  // Mercury
  const [merTrop, merRetro] = mercuryLongitude(jd)
  const merSid = toSidereal(merTrop)

  // Jupiter
  const [jupTrop, jupRetro] = jupiterLongitude(jd)
  const jupSid = toSidereal(jupTrop)

  // Venus
  const [venusTrop, venusRetro] = venusLongitude(jd)
  const venusSid = toSidereal(venusTrop)

  // Saturn
  const [satTrop, satRetro] = saturnLongitude(jd)
  const satSid = toSidereal(satTrop)

  // Rahu (True node) — moves retrograde
  const rahuTrop = rahuLongitude(jd)
  const rahuSid = toSidereal(rahuTrop)
  // Ketu is always opposite Rahu
  const ketuSid = norm360(rahuSid + 180)

  // Lagnam
  const lagnaTrop = ascendantLongitude(jd, latitude, longitude, utcOffset)
  const lagnaSid = toSidereal(lagnaTrop)

  // Build planet array
  const rawPlanets: Array<{ code: string; sidereal: number; tropical: number; retro: boolean }> = [
    { code: "Su", sidereal: sunSid, tropical: sunTrop, retro: false },
    { code: "Mo", sidereal: moonSid, tropical: moonTrop, retro: false },
    { code: "Ma", sidereal: marsSid, tropical: marsTrop, retro: marsRetro },
    { code: "Me", sidereal: merSid, tropical: merTrop, retro: merRetro },
    { code: "Ju", sidereal: jupSid, tropical: jupTrop, retro: jupRetro },
    { code: "Ve", sidereal: venusSid, tropical: venusTrop, retro: venusRetro },
    { code: "Sa", sidereal: satSid, tropical: satTrop, retro: satRetro },
    { code: "Ra", sidereal: rahuSid, tropical: rahuTrop, retro: true },
    { code: "Ke", sidereal: ketuSid, tropical: norm360(rahuTrop + 180), retro: true },
  ]

  const planets: PlanetResult[] = rawPlanets.map(({ code, sidereal, tropical, retro }) => ({
    code,
    nameEnglish: PLANET_META[code].english,
    nameTamil: PLANET_META[code].tamil,
    tropicalLong: tropical,
    siderealLong: sidereal,
    rasi: longToRasi(sidereal),
    navamsa: longToNavamsa(sidereal),
    isRetrograde: retro,
  }))

  // Moon details
  const moonRasi = longToRasi(moonSid)
  const { index: nakshatraIdx, pada } = longToNakshatra(moonSid)

  // Lagnam details
  const lagnamRasi = longToRasi(lagnaSid)

  // Rasi chart positions (house = rasi number 1–12)
  const rasiPositions = [
    ...planets.map(p => ({ planet: p.code, house: p.rasi, isRetrograde: p.isRetrograde })),
    { planet: "La", house: lagnamRasi, isRetrograde: false },
  ]

  // Navamsa positions
  const navamsaPositions = [
    ...planets.map(p => ({ planet: p.code, house: p.navamsa, isRetrograde: p.isRetrograde })),
    { planet: "La", house: longToNavamsa(lagnaSid), isRetrograde: false },
  ]

  return {
    moonRasi,
    moonRasiTamil: RASI_NAMES[moonRasi].tamil,
    moonRasiEnglish: RASI_NAMES[moonRasi].english,
    natchathiramIndex: nakshatraIdx,
    natchathiramTamil: NAKSHATRA_DATA[nakshatraIdx].tamil,
    natchathiramEnglish: NAKSHATRA_DATA[nakshatraIdx].english,
    pada,
    lagnamRasi,
    lagnamTamil: RASI_NAMES[lagnamRasi].tamil,
    lagnamEnglish: RASI_NAMES[lagnamRasi].english,
    rasiPositions,
    navamsaPositions,
    planets,
  }
}

// ─── Tamil Nadu City Geocode Table ────────────────────────────────────────────

export interface CityData {
  name: string
  latitude: number
  longitude: number
  utcOffset: number
}

export const TN_CITIES: CityData[] = [
  { name: "Chennai", latitude: 13.0827, longitude: 80.2707, utcOffset: 5.5 },
  { name: "Coimbatore", latitude: 11.0168, longitude: 76.9558, utcOffset: 5.5 },
  { name: "Madurai", latitude: 9.9252, longitude: 78.1198, utcOffset: 5.5 },
  { name: "Salem", latitude: 11.6543, longitude: 78.1460, utcOffset: 5.5 },
  { name: "Tiruchirappalli (Trichy)", latitude: 10.7905, longitude: 78.7047, utcOffset: 5.5 },
  { name: "Tirunelveli", latitude: 8.7139, longitude: 77.7567, utcOffset: 5.5 },
  { name: "Vellore", latitude: 12.9165, longitude: 79.1325, utcOffset: 5.5 },
  { name: "Erode", latitude: 11.3410, longitude: 77.7172, utcOffset: 5.5 },
  { name: "Thanjavur", latitude: 10.7870, longitude: 79.1378, utcOffset: 5.5 },
  { name: "Thoothukudi (Tuticorin)", latitude: 8.7642, longitude: 78.1348, utcOffset: 5.5 },
  { name: "Dindigul", latitude: 10.3620, longitude: 77.9695, utcOffset: 5.5 },
  { name: "Cuddalore", latitude: 11.7447, longitude: 79.7689, utcOffset: 5.5 },
  { name: "Nagercoil", latitude: 8.1833, longitude: 77.4119, utcOffset: 5.5 },
  { name: "Kanchipuram", latitude: 12.8185, longitude: 79.6947, utcOffset: 5.5 },
  { name: "Kumbakonam", latitude: 10.9602, longitude: 79.3845, utcOffset: 5.5 },
  { name: "Tiruppur", latitude: 11.1075, longitude: 77.3398, utcOffset: 5.5 },
  { name: "Ramanathapuram", latitude: 9.3762, longitude: 78.8311, utcOffset: 5.5 },
  { name: "Sivagangai", latitude: 9.8477, longitude: 78.4793, utcOffset: 5.5 },
  { name: "Namakkal", latitude: 11.2190, longitude: 78.1675, utcOffset: 5.5 },
  { name: "Dharmapuri", latitude: 12.1278, longitude: 78.1560, utcOffset: 5.5 },
  { name: "Krishnagiri", latitude: 12.5186, longitude: 78.2137, utcOffset: 5.5 },
  { name: "Hosur", latitude: 12.7409, longitude: 77.8253, utcOffset: 5.5 },
  { name: "Villupuram", latitude: 11.9397, longitude: 79.4937, utcOffset: 5.5 },
  { name: "Nagapattinam", latitude: 10.7651, longitude: 79.8452, utcOffset: 5.5 },
  { name: "Pudukkottai", latitude: 10.3797, longitude: 78.8202, utcOffset: 5.5 },
  { name: "Virudhunagar", latitude: 9.5681, longitude: 77.9624, utcOffset: 5.5 },
  { name: "Karur", latitude: 10.9601, longitude: 78.0766, utcOffset: 5.5 },
  { name: "Ooty (Udhagamandalam)", latitude: 11.4064, longitude: 76.6932, utcOffset: 5.5 },
  { name: "Pollachi", latitude: 10.6552, longitude: 77.0081, utcOffset: 5.5 },
  { name: "Ariyalur", latitude: 11.1375, longitude: 79.0769, utcOffset: 5.5 },
  { name: "Kallakurichi", latitude: 11.7377, longitude: 78.9600, utcOffset: 5.5 },
  { name: "Chengalpattu", latitude: 12.6961, longitude: 79.9861, utcOffset: 5.5 },
  { name: "Ranipet", latitude: 12.9275, longitude: 79.3310, utcOffset: 5.5 },
  { name: "Tenkasi", latitude: 8.9593, longitude: 77.3142, utcOffset: 5.5 },
  { name: "Tirupathur", latitude: 12.4967, longitude: 78.5656, utcOffset: 5.5 },
  { name: "Tiruvarur", latitude: 10.7730, longitude: 79.6327, utcOffset: 5.5 },
  { name: "Mayiladuthurai", latitude: 11.1027, longitude: 79.6512, utcOffset: 5.5 },
  { name: "Perambalur", latitude: 11.2342, longitude: 78.8800, utcOffset: 5.5 },
  { name: "Sivakasi", latitude: 9.4529, longitude: 77.7974, utcOffset: 5.5 },
  { name: "Karaikudi", latitude: 10.0737, longitude: 78.7754, utcOffset: 5.5 },
]
