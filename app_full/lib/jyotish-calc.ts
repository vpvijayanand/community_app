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

  // ── Panchang ──────────────────────────────────────────────────────────────
  weekday: string              // Tamil weekday
  weekdayEnglish: string
  tithiTamil: string           // e.g. தசமி
  tithiEnglish: string         // e.g. Dashami
  tithiPaksha: string          // கிருஷ்ண பக்ஷ / சுக்ல பக்ஷ
  yogam: string                // Tamil yoga
  yogamEnglish: string
  karanam: string              // Tamil karana
  karanamEnglish: string
  tamilDate: string            // e.g. ஆவணி 28
  tamilYear: string            // Tamil year name
  sunriseIST: string           // e.g. "06:01 AM"
  sunsetIST: string            // e.g. "06:08 PM"

  // ── Nakshatra Details ──────────────────────────────────────────────────────
  natchathiramLordTamil: string
  natchathiramLordEnglish: string
  natchathiramDeityTamil: string
  natchathiramDeityEnglish: string
  natchathiramAnimalTamil: string
  natchathiramBirdTamil: string
  yoniTamil: string              // பெண் / ஆண்
  ganamTamil: string             // தேவ / மனுஷ்ய / ராக்ஷஸ
  treeTamil: string

  // ── Rasi Details ──────────────────────────────────────────────────────────
  rasiLordTamil: string
  rasiLordEnglish: string
  lagnaLordTamil: string
  lagnaLordEnglish: string
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const RASI_NAMES: Array<{ tamil: string; english: string; lordCode: string }> = [
  { tamil: "", english: "", lordCode: "" }, // index 0 unused
  { tamil: "மேஷம்", english: "Mesham (Aries)", lordCode: "Ma" },
  { tamil: "ரிஷபம்", english: "Rishabam (Taurus)", lordCode: "Ve" },
  { tamil: "மிதுனம்", english: "Mithunam (Gemini)", lordCode: "Me" },
  { tamil: "கடகம்", english: "Kadagam (Cancer)", lordCode: "Mo" },
  { tamil: "சிம்மம்", english: "Simmam (Leo)", lordCode: "Su" },
  { tamil: "கன்னி", english: "Kanni (Virgo)", lordCode: "Me" },
  { tamil: "துலாம்", english: "Thulam (Libra)", lordCode: "Ve" },
  { tamil: "விருச்சிகம்", english: "Viruchigam (Scorpio)", lordCode: "Ma" },
  { tamil: "தனுசு", english: "Dhanusu (Sagittarius)", lordCode: "Ju" },
  { tamil: "மகரம்", english: "Magaram (Capricorn)", lordCode: "Sa" },
  { tamil: "கும்பம்", english: "Kumbam (Aquarius)", lordCode: "Sa" },
  { tamil: "மீனம்", english: "Meenam (Pisces)", lordCode: "Ju" },
]

const NAKSHATRA_DATA: Array<{
  tamil: string; english: string
  lord: string // planet code
  deityTamil: string; deityEnglish: string
  animalTamil: string
  birdTamil: string
  yoniTamil: string  // பெண் or ஆண்
  ganamTamil: string // தேவ / மனுஷ்ய / ராக்ஷஸ
  treeTamil: string
}> = [
  { tamil: "அஸ்வினி",    english: "Ashwini",         lord: "Ke", deityTamil: "அஸ்வினி தேவர்கள்",  deityEnglish: "Ashwini Kumaras", animalTamil: "குதிரை",    birdTamil: "கழுகு",   yoniTamil: "ஆண்",   ganamTamil: "தேவ கணம்",    treeTamil: "அரசு" },
  { tamil: "பரணி",       english: "Bharani",          lord: "Ve", deityTamil: "யமன்",              deityEnglish: "Yama",            animalTamil: "யானை",     birdTamil: "சேவல்",   yoniTamil: "ஆண்",   ganamTamil: "மனுஷ்ய கணம்",  treeTamil: "நெல்லி" },
  { tamil: "கார்த்திகை", english: "Krittika",         lord: "Su", deityTamil: "அக்னி",            deityEnglish: "Agni",            animalTamil: "ஆட்டுக்கடா", birdTamil: "மயில்",   yoniTamil: "பெண்",  ganamTamil: "ராக்ஷஸ கணம்",  treeTamil: "அத்தி" },
  { tamil: "ரோகிணி",     english: "Rohini",           lord: "Mo", deityTamil: "பிரம்மா",          deityEnglish: "Brahma",          animalTamil: "பாம்பு",    birdTamil: "கோகிலம்", yoniTamil: "ஆண்",   ganamTamil: "மனுஷ்ய கணம்",  treeTamil: "புங்கை" },
  { tamil: "மிருகசீரிஷம்",english: "Mrigashirsha",    lord: "Ma", deityTamil: "சந்திரன்",          deityEnglish: "Soma",            animalTamil: "பெண் பாம்பு", birdTamil: "ஆந்தை",  yoniTamil: "பெண்",  ganamTamil: "தேவ கணம்",    treeTamil: "மகிழம்" },
  { tamil: "திருவாதிரை", english: "Ardra",            lord: "Ra", deityTamil: "சிவன்",            deityEnglish: "Rudra",           animalTamil: "நாய்",       birdTamil: "கறுப்பு காகம்", yoniTamil: "பெண்", ganamTamil: "மனுஷ்ய கணம்",  treeTamil: "ஆத்தி" },
  { tamil: "புனர்பூசம்", english: "Punarvasu",        lord: "Ju", deityTamil: "அதிதி",            deityEnglish: "Aditi",           animalTamil: "பூனை",       birdTamil: "ஆந்தை",  yoniTamil: "பெண்",  ganamTamil: "தேவ கணம்",    treeTamil: "மூங்கில்" },
  { tamil: "பூசம்",      english: "Pushya",           lord: "Sa", deityTamil: "பிரகஸ்பதி",        deityEnglish: "Brihaspati",      animalTamil: "ஆட்டுக்கடா", birdTamil: "மயில்",   yoniTamil: "ஆண்",   ganamTamil: "தேவ கணம்",    treeTamil: "அரசு" },
  { tamil: "ஆயில்யம்",   english: "Ashlesha",         lord: "Me", deityTamil: "சர்ப்பம்",          deityEnglish: "Sarpa",           animalTamil: "பூனை",       birdTamil: "சேவல்",   yoniTamil: "பெண்",  ganamTamil: "ராக்ஷஸ கணம்",  treeTamil: "நாகமரம்" },
  { tamil: "மகம்",       english: "Magha",            lord: "Ke", deityTamil: "பிதுர்கள்",        deityEnglish: "Pitru",           animalTamil: "எலி",        birdTamil: "கழுகு",   yoniTamil: "ஆண்",   ganamTamil: "ராக்ஷஸ கணம்",  treeTamil: "ஆலமரம்" },
  { tamil: "பூரம்",      english: "Purva Phalguni",   lord: "Ve", deityTamil: "பகன்",             deityEnglish: "Bhaga",           animalTamil: "எலி",        birdTamil: "கழுகு",   yoniTamil: "பெண்",  ganamTamil: "மனுஷ்ய கணம்",  treeTamil: "பாலாஷ" },
  { tamil: "உத்திரம்",   english: "Uttara Phalguni",  lord: "Su", deityTamil: "அர்யமன்",          deityEnglish: "Aryaman",         animalTamil: "மாடு",       birdTamil: "பருந்து",  yoniTamil: "ஆண்",   ganamTamil: "மனுஷ்ய கணம்",  treeTamil: "அத்தி" },
  { tamil: "ஹஸ்தம்",    english: "Hasta",            lord: "Mo", deityTamil: "சவிதா",            deityEnglish: "Savita",          animalTamil: "பெண் எருது",  birdTamil: "கழுகு",   yoniTamil: "பெண்",  ganamTamil: "தேவ கணம்",    treeTamil: "கூவிளம்" },
  { tamil: "சித்திரை",   english: "Chitra",           lord: "Ma", deityTamil: "வியால்கர்மன்",     deityEnglish: "Vishwakarma",    animalTamil: "புலி",       birdTamil: "மயில்",   yoniTamil: "பெண்",  ganamTamil: "ராக்ஷஸ கணம்",  treeTamil: "வேம்பு" },
  { tamil: "சுவாதி",     english: "Swati",            lord: "Ra", deityTamil: "வாயு",             deityEnglish: "Vayu",            animalTamil: "எருமை",     birdTamil: "அன்னம்",  yoniTamil: "பெண்",  ganamTamil: "தேவ கணம்",    treeTamil: "வன்னி" },
  { tamil: "விசாகம்",    english: "Vishakha",         lord: "Ju", deityTamil: "இந்திரன்",         deityEnglish: "Indra-Agni",     animalTamil: "புலி",       birdTamil: "பருந்து",  yoniTamil: "ஆண்",   ganamTamil: "ராக்ஷஸ கணம்",  treeTamil: "விகந்தம்" },
  { tamil: "அனுஷம்",    english: "Anuradha",         lord: "Sa", deityTamil: "மித்திரன்",         deityEnglish: "Mitra",           animalTamil: "முயல்",     birdTamil: "குயில்",  yoniTamil: "பெண்",  ganamTamil: "தேவ கணம்",    treeTamil: "வகுள" },
  { tamil: "கேட்டை",    english: "Jyeshtha",         lord: "Me", deityTamil: "இந்திரன்",         deityEnglish: "Indra",           animalTamil: "முயல்",     birdTamil: "குயில்",  yoniTamil: "ஆண்",   ganamTamil: "ராக்ஷஸ கணம்",  treeTamil: "இலுப்பை" },
  { tamil: "மூலம்",     english: "Mula",             lord: "Ke", deityTamil: "நிருதி",            deityEnglish: "Nirrti",          animalTamil: "நாய்",       birdTamil: "கறுப்பு கழுகு", yoniTamil: "ஆண்", ganamTamil: "ராக்ஷஸ கணம்",  treeTamil: "மழமரம்" },
  { tamil: "பூராடம்",   english: "Purva Ashadha",    lord: "Ve", deityTamil: "ஜலம்",             deityEnglish: "Jala",            animalTamil: "குரங்கு",   birdTamil: "கிளி",    yoniTamil: "பெண்",  ganamTamil: "மனுஷ்ய கணம்",  treeTamil: "அசோக" },
  { tamil: "உத்திராடம்", english: "Uttara Ashadha",   lord: "Su", deityTamil: "விஸ்வேதேவர்",      deityEnglish: "Vishwadevas",     animalTamil: "மாடு",       birdTamil: "கழுகு",   yoniTamil: "ஆண்",   ganamTamil: "மனுஷ்ய கணம்",  treeTamil: "பலா" },
  { tamil: "திருவோணம்", english: "Shravana",         lord: "Mo", deityTamil: "விஷ்ணு",           deityEnglish: "Vishnu",          animalTamil: "குரங்கு",   birdTamil: "அன்னம்",  yoniTamil: "பெண்",  ganamTamil: "தேவ கணம்",    treeTamil: "ஆலமரம்" },
  { tamil: "அவிட்டம்",   english: "Dhanishtha",       lord: "Ma", deityTamil: "அஷ்ட வசுக்கள்",   deityEnglish: "Ashta Vasus",     animalTamil: "சிங்கம்",   birdTamil: "கோகிலம்", yoniTamil: "ஆண்",   ganamTamil: "ராக்ஷஸ கணம்",  treeTamil: "வேம்பு" },
  { tamil: "சதயம்",     english: "Shatabhisha",      lord: "Ra", deityTamil: "வருணன்",           deityEnglish: "Varuna",          animalTamil: "குதிரை",    birdTamil: "கழுகு",   yoniTamil: "பெண்",  ganamTamil: "ராக்ஷஸ கணம்",  treeTamil: "கடம்பம்" },
  { tamil: "பூரட்டாதி",  english: "Purva Bhadrapada", lord: "Ju", deityTamil: "அஜ ஏகபாத்",       deityEnglish: "Aja Ekapada",     animalTamil: "சிங்கம்",   birdTamil: "மயில்",   yoniTamil: "ஆண்",   ganamTamil: "மனுஷ்ய கணம்",  treeTamil: "ஆத்தி" },
  { tamil: "உத்திரட்டாதி",english: "Uttara Bhadrapada",lord: "Sa", deityTamil: "அகிர்புத்னியன்",  deityEnglish: "Ahir Budhanya",  animalTamil: "மாடு",       birdTamil: "குயில்",  yoniTamil: "பெண்",  ganamTamil: "மனுஷ்ய கணம்",  treeTamil: "வேம்பு" },
  { tamil: "ரேவதி",     english: "Revati",           lord: "Me", deityTamil: "புஷ்யன்",          deityEnglish: "Pushan",          animalTamil: "யானை",     birdTamil: "கழுகு",   yoniTamil: "பெண்",  ganamTamil: "தேவ கணம்",    treeTamil: "மஹுவா" },
]

const PLANET_META: Record<string, { english: string; tamil: string }> = {
  Su: { english: "Sun / சூரியன்", tamil: "சூரியன்" },
  Mo: { english: "Moon / சந்திரன்", tamil: "சந்திரன்" },
  Ma: { english: "Mars / செவ்வாய்", tamil: "செவ்வாய்" },
  Me: { english: "Mercury / புதன்", tamil: "புதன்" },
  Ju: { english: "Jupiter / குரு", tamil: "குரு" },
  Ve: { english: "Venus / சுக்கிரன்", tamil: "சுக்கிரன்" },
  Sa: { english: "Saturn / சனி", tamil: "சனி" },
  Ra: { english: "Rahu / ராகு", tamil: "ராகு" },
  Ke: { english: "Ketu / கேது", tamil: "கேது" },
  La: { english: "Lagnam / லக்னம்", tamil: "லக்னம்" },
}

// ─── Planet Tamil Names (short for display) ───────────────────────────────────
const PLANET_TAMIL_SHORT: Record<string, string> = {
  Su: "சூரியன்", Mo: "சந்திரன்", Ma: "செவ்வாய்", Me: "புதன்",
  Ju: "குரு", Ve: "சுக்கிரன்", Sa: "சனி", Ra: "ராகு", Ke: "கேது",
}

// ─── Panchang Data ────────────────────────────────────────────────────────────

const WEEKDAYS_TA = ["ஞாயிறு", "திங்கள்", "செவ்வாய்", "புதன்", "வியாழன்", "வெள்ளி", "சனி"]
const WEEKDAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

const TITHI_NAMES: Array<{ tamil: string; english: string }> = [
  { tamil: "பிரதமை", english: "Prathama" },
  { tamil: "துவிதியை", english: "Dvitiya" },
  { tamil: "திருதியை", english: "Tritiya" },
  { tamil: "சதுர்த்தி", english: "Chaturthi" },
  { tamil: "பஞ்சமி", english: "Panchami" },
  { tamil: "சஷ்டி", english: "Shashthi" },
  { tamil: "சப்தமி", english: "Saptami" },
  { tamil: "அஷ்டமி", english: "Ashtami" },
  { tamil: "நவமி", english: "Navami" },
  { tamil: "தசமி", english: "Dashami" },
  { tamil: "ஏகாதசி", english: "Ekadashi" },
  { tamil: "துவாதசி", english: "Dwadashi" },
  { tamil: "திரயோதசி", english: "Trayodashi" },
  { tamil: "சதுர்தசி", english: "Chaturdashi" },
  { tamil: "பௌர்ணமி", english: "Purnima" },
]

const YOGA_NAMES: Array<{ tamil: string; english: string }> = [
  { tamil: "விஷ்கம்பம்", english: "Vishkambha" },
  { tamil: "பிரீதி", english: "Priti" },
  { tamil: "ஆயுஷ்மான்", english: "Ayushman" },
  { tamil: "சௌபாக்கியம்", english: "Saubhagya" },
  { tamil: "சோபனம்", english: "Shobhana" },
  { tamil: "அதிகண்டம்", english: "Atiganda" },
  { tamil: "சுகர்மம்", english: "Sukarma" },
  { tamil: "திருதி", english: "Dhriti" },
  { tamil: "சூலம்", english: "Shula" },
  { tamil: "கண்டம்", english: "Ganda" },
  { tamil: "வ்ருத்தி", english: "Vriddhi" },
  { tamil: "த்ருவம்", english: "Dhruva" },
  { tamil: "வியாகாதம்", english: "Vyaghata" },
  { tamil: "அர்ஷணம்", english: "Harshana" },
  { tamil: "வஜ்ரம்", english: "Vajra" },
  { tamil: "சித்தி", english: "Siddhi" },
  { tamil: "வரியான்", english: "Vyatipata" },
  { tamil: "வரியோத்", english: "Variyana" },
  { tamil: "பரிகம்", english: "Parigha" },
  { tamil: "சிவம்", english: "Shiva" },
  { tamil: "சித்தம்", english: "Siddha" },
  { tamil: "சாத்தியம்", english: "Sadhya" },
  { tamil: "சுபம்", english: "Shubha" },
  { tamil: "சுக்லம்", english: "Shukla" },
  { tamil: "பிரம்மம்", english: "Brahma" },
  { tamil: "இந்திரம்", english: "Indra" },
  { tamil: "வைத்ருதி", english: "Vaidhriti" },
]

const KARANA_NAMES: Array<{ tamil: string; english: string }> = [
  { tamil: "பவம்", english: "Bava" },
  { tamil: "பாலவம்", english: "Balava" },
  { tamil: "கௌலவம்", english: "Kaulava" },
  { tamil: "தைதிலம்", english: "Taitila" },
  { tamil: "கரஜம்", english: "Garaja" },
  { tamil: "வணிஜம்", english: "Vanija" },
  { tamil: "விஷ்டி", english: "Vishti" },
  { tamil: "சகுனி", english: "Shakuni" },
  { tamil: "சதுஷ்பாத்", english: "Chatushpada" },
  { tamil: "நாகவம்", english: "Nagava" },
  { tamil: "கிம்ஸ்துகனம்", english: "Kimstughna" },
  { tamil: "பத்திரை", english: "Bhadra" }, // Vishti alias
]

const TAMIL_MONTHS = [
  "சித்திரை", "வைகாசி", "ஆனி", "ஆடி",
  "ஆவணி", "புரட்டாசி", "ஐப்பசி", "கார்த்திகை",
  "மார்கழி", "தை", "மாசி", "பங்குனி"
]

// 60 Tamil years cycle
const TAMIL_YEARS = [
  "விஜய", "விஜய", "வியா", "கால", "சோத்திக்ருத்", "ஸ்ரீமுக", "பவ", "யுவ", "தாது", "ஈஸ்வர",
  "வேதுல", "பிரமோதூத", "விக்ரம", "வருஷ", "சார்வரி", "பிலவ", "சுபகிருத்", "தாரண", "பார்தீவ", "விய",
  "சர்வஜித்", "சர்வதாரி", "விரோதி", "விக்ருதி", "கர", "நந்தன", "விஜய", "ஜய", "மன்மத", "துர்முகி",
  "ஹேவிளம்பி", "விளம்பி", "விகாரி", "சார்வரி", "வருஷ", "ப்லவ", "கீலக", "சௌம்ய", "சாதாரண", "விரோதகிருத்",
  "பரிதாப", "பிரமாதீக", "ஆனந்த", "ராட்சஸ", "நல", "பிங்கள", "காளயுக்தி", "சித்தார்தி", "ரௌத்திர", "துர்மதி",
  "துந்துபி", "ருதிரோத்கரி", "ரக்தாட்சி", "க்ரோதன", "அட்சய", "பரிதாவி", "போக", "சுமுக", "த்ரவ்ய", "ப்ரபவ",
]

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
 * Calculates Earth's heliocentric radius vector (approx in AU)
 */
function earthRadius(jd: number): number {
  const t = T(jd)
  const M = norm360(357.5291 + 35999.0503 * t)
  return 1.00014 - 0.01671 * Math.cos(toRad(M)) - 0.00014 * Math.cos(toRad(2 * M))
}

/**
 * Projects a heliocentric position onto the geocentric plane.
 */
function helioToGeo(L_planet: number, R_planet: number, sunTrop: number, earthR: number): number {
  const L0 = norm360(sunTrop + 180)
  const x = R_planet * Math.cos(toRad(L_planet)) - earthR * Math.cos(toRad(L0))
  const y = R_planet * Math.sin(toRad(L_planet)) - earthR * Math.sin(toRad(L0))
  return norm360(toDeg(Math.atan2(y, x)))
}

/**
 * Simple orbital element approach for planets.
 * Returns { L: heliocentricLong, R: heliocentricRadius, M: meanAnomaly }
 */
function helioPlanet(
  jd: number,
  L0: number, Lrate: number,
  M0: number, Mrate: number,
  semiMajorAxis: number,
  eccentricity: number,
  eqCenCoeffs: number[], // sin(M), sin(2M), sin(3M) multipliers
): { L: number; R: number; M: number } {
  const t = T(jd)
  const L_mean = norm360(L0 + Lrate * t)
  const M = norm360(M0 + Mrate * t)
  const Mrad = toRad(M)
  const C = eqCenCoeffs[0] * Math.sin(Mrad)
    + (eqCenCoeffs[1] || 0) * Math.sin(2 * Mrad)
    + (eqCenCoeffs[2] || 0) * Math.sin(3 * Mrad)
  const L = norm360(L_mean + C)
  // True anomaly nu approx = M + C
  const nu = toRad(M + C)
  const R = (semiMajorAxis * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(nu))
  return { L, R, M }
}

/**
 * Higher-order controller that calculates Geocentric Longitude and Retrograde status.
 */
function getGeocentricPlanet(
  jd: number,
  sunTrop: number,
  L0: number, Lrate: number,
  M0: number, Mrate: number,
  a: number, e: number,
  eqCenCoeffs: number[]
): [number, boolean] {
  const earthR = earthRadius(jd)
  
  // Calculate current pos
  const cur = helioPlanet(jd, L0, Lrate, M0, Mrate, a, e, eqCenCoeffs)
  let geoLong = helioToGeo(cur.L, cur.R, sunTrop, earthR)

  // Calculate pos slightly in the past to detect retrograde motion
  const pt = jd - 0.05
  const sunTropPrev = sunLongitude(pt)
  const earthRPrev = earthRadius(pt)
  const prev = helioPlanet(pt, L0, Lrate, M0, Mrate, a, e, eqCenCoeffs)
  const geoLongPrev = helioToGeo(prev.L, prev.R, sunTropPrev, earthRPrev)
  
  let diff = geoLong - geoLongPrev
  if (diff > 180) diff -= 360
  if (diff < -180) diff += 360
  
  // Retrograde if longitude decreased
  return [geoLong, diff < 0]
}

function marsLongitude(jd: number, sunTrop: number): [number, boolean] {
  return getGeocentricPlanet(jd, sunTrop, 
    355.9309, 19140.30268,
    19.38, 19140.30,
    1.523688, 0.093405,
    [10.691, 0.623])
}

function mercuryLongitude(jd: number, sunTrop: number): [number, boolean] {
  return getGeocentricPlanet(jd, sunTrop,
    252.2509, 149472.6746,
    174.7948, 149472.5152,
    0.387098, 0.205630,
    [23.44, 2.99, 0.57])
}

function venusLongitude(jd: number, sunTrop: number): [number, boolean] {
  return getGeocentricPlanet(jd, sunTrop,
    181.9798, 58517.8156,
    50.4161, 58517.0316,
    0.723330, 0.006773,
    [0.7758, 0.0033])
}

function jupiterLongitude(jd: number, sunTrop: number): [number, boolean] {
  return getGeocentricPlanet(jd, sunTrop,
    34.3515, 3034.9057,
    20.9, 3034.906,
    5.20256, 0.048498,
    [5.5549, 0.1683])
}

function saturnLongitude(jd: number, sunTrop: number): [number, boolean] {
  return getGeocentricPlanet(jd, sunTrop,
    50.0874, 1222.1138,
    317.02, 1222.114,
    9.55475, 0.055546,
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

  // Ascendant calculation (Meeus 14.1)
  const y = Math.cos(ramc)
  const x = -Math.sin(eps) * Math.tan(lat) - Math.cos(eps) * Math.sin(ramc)
  let asc = toDeg(Math.atan2(y, x))
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
  const [marsTrop, marsRetro] = marsLongitude(jd, sunTrop)
  const marsSid = toSidereal(marsTrop)

  // Mercury
  const [merTrop, merRetro] = mercuryLongitude(jd, sunTrop)
  const merSid = toSidereal(merTrop)

  // Jupiter
  const [jupTrop, jupRetro] = jupiterLongitude(jd, sunTrop)
  const jupSid = toSidereal(jupTrop)

  // Venus
  const [venusTrop, venusRetro] = venusLongitude(jd, sunTrop)
  const venusSid = toSidereal(venusTrop)

  // Saturn
  const [satTrop, satRetro] = saturnLongitude(jd, sunTrop)
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

  // ── Panchang Calculations ─────────────────────────────────────────────────

  // Weekday — derive from Julian Day to avoid JS Date UTC parsing issues
  // JD 0 = Monday (Jan 1, 4713 BC). JD % 7: 0=Mon,1=Tue,2=Wed,3=Thu,4=Fri,5=Sat,6=Sun
  // Add UT hours to get mid-day JD for the correct day
  const jdMidnight = julianDay(year, month, day, 0) // JD at local midnight
  const weekdayJD = Math.floor(jdMidnight + 1.5) % 7 // 0=Mon…6=Sun
  // Convert to JS getDay() order (0=Sun,1=Mon…)
  const weekdayIndex = (weekdayJD + 1) % 7 // 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat

  // Tithi: lunar day = (moonLong - sunLong) / 12
  const sunSidForTithi = toSidereal(sunLongitude(jd))
  const moonSidForTithi = toSidereal(moonLongitude(jd))
  const lunarElongation = norm360(moonSidForTithi - sunSidForTithi)
  const tithiRaw = Math.floor(lunarElongation / 12) // 0–29
  const tithiNum = tithiRaw % 15 // 0–14 (same tithi in both paksha)
  const isPurnima = tithiNum === 14
  const isKrishna = tithiRaw >= 15
  const tithiData = TITHI_NAMES[tithiNum] || TITHI_NAMES[0]
  const pakshaTamil = isKrishna ? "கிருஷ்ண பக்ஷ" : "சுக்ல பக்ஷ"

  // Yoga: (sunLong + moonLong) / (360/27)
  const yogaElongation = norm360(sunSidForTithi + moonSidForTithi)
  const yogaIndex = Math.floor(yogaElongation / (360 / 27)) % 27
  const yogaData = YOGA_NAMES[yogaIndex] || YOGA_NAMES[0]

  // Karana: half-tithi
  const karanaHalfTithi = Math.floor(lunarElongation / 6) % 60
  const karanaCycleIndex = karanaHalfTithi % 7 // rough approximation for the 7 movable karanas
  const karanaData = KARANA_NAMES[karanaCycleIndex] || KARANA_NAMES[0]

  // Tamil solar date — using parsed year/month/day directly (avoids UTC offset issue)
  // "day of year" computed from parsed integers, not from Date object
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  const monthDaysGreg = [0, 31, 28 + (isLeapYear ? 1 : 0), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  let solarDayOfYear = day
  for (let m = 1; m < month; m++) solarDayOfYear += monthDaysGreg[m]
  // Tamil Chithirai starts ~Apr 14 (day 104 in non-leap, 105 in leap)
  const tamilSolarOffset = solarDayOfYear - (isLeapYear ? 105 : 104)
  const tamilMonthDays = [31, 31, 32, 31, 31, 30, 30, 29, 30, 29, 30, 29]
  let tamilMonthIdx = 0
  let remaining = ((tamilSolarOffset % 365) + 365) % 365
  for (let i = 0; i < 12; i++) {
    if (remaining < tamilMonthDays[i]) { tamilMonthIdx = i; break; }
    remaining -= tamilMonthDays[i]
  }
  const tamilDay = remaining + 1
  const tamilDate = `${TAMIL_MONTHS[tamilMonthIdx]} ${tamilDay}`
  // Tamil year (60 year cycle from Kali 3179 = 77 CE)
  const tamilYearIndex = (year - 77 + 3179) % 60
  const tamilYear = TAMIL_YEARS[tamilYearIndex] || ""

  // Sunrise/Sunset (approximation for IST, Chennai approx)
  const sunriseHour = 6 + Math.round(Math.cos(toRad((solarDayOfYear < 172 ? solarDayOfYear : 365 - solarDayOfYear) * 0.2)) * 30) / 60
  const sunsetHour = 18 + Math.round(Math.cos(toRad((solarDayOfYear < 172 ? solarDayOfYear : 365 - solarDayOfYear) * 0.2)) * 30) / 60
  const fmtTime = (h: number) => {
    const hh = Math.floor(h)
    const mm = String(Math.round((h - hh) * 60)).padStart(2, "0")
    const ampm = hh < 12 ? "AM" : "PM"
    return `${hh < 12 ? hh : hh - 12 || 12}:${mm} ${ampm}`
  }

  // Nakshatra extended data
  const nakshatraExt = NAKSHATRA_DATA[nakshatraIdx]
  const nakshatraLordCode = nakshatraExt.lord
  const rasiLordCode = RASI_NAMES[moonRasi].lordCode
  const lagnaLordCode = RASI_NAMES[lagnamRasi].lordCode

  return {
    moonRasi,
    moonRasiTamil: RASI_NAMES[moonRasi].tamil,
    moonRasiEnglish: RASI_NAMES[moonRasi].english,
    natchathiramIndex: nakshatraIdx,
    natchathiramTamil: nakshatraExt.tamil,
    natchathiramEnglish: nakshatraExt.english,
    pada,
    lagnamRasi,
    lagnamTamil: RASI_NAMES[lagnamRasi].tamil,
    lagnamEnglish: RASI_NAMES[lagnamRasi].english,
    rasiPositions,
    navamsaPositions,
    planets,

    // Panchang
    weekday: WEEKDAYS_TA[weekdayIndex],
    weekdayEnglish: WEEKDAYS_EN[weekdayIndex],
    tithiTamil: tithiData.tamil,
    tithiEnglish: tithiData.english,
    tithiPaksha: pakshaTamil,
    yogam: yogaData.tamil,
    yogamEnglish: yogaData.english,
    karanam: karanaData.tamil,
    karanamEnglish: karanaData.english,
    tamilDate,
    tamilYear,
    sunriseIST: fmtTime(sunriseHour),
    sunsetIST: fmtTime(sunsetHour),

    // Nakshatra details
    natchathiramLordTamil: PLANET_TAMIL_SHORT[nakshatraLordCode] || nakshatraLordCode,
    natchathiramLordEnglish: PLANET_META[nakshatraLordCode]?.english.split(" /")[0] || nakshatraLordCode,
    natchathiramDeityTamil: nakshatraExt.deityTamil,
    natchathiramDeityEnglish: nakshatraExt.deityEnglish,
    natchathiramAnimalTamil: nakshatraExt.animalTamil,
    natchathiramBirdTamil: nakshatraExt.birdTamil,
    yoniTamil: nakshatraExt.yoniTamil,
    ganamTamil: nakshatraExt.ganamTamil,
    treeTamil: nakshatraExt.treeTamil,

    // Rasi/Lagna lords
    rasiLordTamil: PLANET_TAMIL_SHORT[rasiLordCode] || rasiLordCode,
    rasiLordEnglish: PLANET_META[rasiLordCode]?.english.split(" /")[0] || rasiLordCode,
    lagnaLordTamil: PLANET_TAMIL_SHORT[lagnaLordCode] || lagnaLordCode,
    lagnaLordEnglish: PLANET_META[lagnaLordCode]?.english.split(" /")[0] || lagnaLordCode,
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
