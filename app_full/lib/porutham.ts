// Porutham (10-fold Tamil matrimony compatibility) — pure client-side logic

// Each Rasi contains 3 nakshatras (boundary nakshatras appear in both adjacent Rasis)
export const RASI_NAKSHATRAS: Record<number, number[]> = {
  1:  [1,  2,  3],   // Mesham:     Ashwini, Bharani, Krittika
  2:  [3,  4,  5],   // Rishabam:   Krittika, Rohini, Mrigashira
  3:  [5,  6,  7],   // Mithunam:   Mrigashira, Ardra, Punarvasu
  4:  [7,  8,  9],   // Kadagam:    Punarvasu, Pushya, Ashlesha
  5:  [10, 11, 12],  // Simmam:     Magha, Purva Phalguni, Uttara Phalguni
  6:  [12, 13, 14],  // Kanni:      Uttara Phalguni, Hasta, Chitra
  7:  [14, 15, 16],  // Thulam:     Chitra, Swati, Vishakha
  8:  [16, 17, 18],  // Viruchigam: Vishakha, Anuradha, Jyeshtha
  9:  [19, 20, 21],  // Dhanusu:    Mula, Purva Ashadha, Uttara Ashadha
  10: [21, 22, 23],  // Magaram:    Uttara Ashadha, Shravana, Dhanishtha
  11: [23, 24, 25],  // Kumbam:     Dhanishtha, Shatabhisha, Purva Bhadrapada
  12: [25, 26, 27],  // Meenam:     Purva Bhadrapada, Uttara Bhadrapada, Revati
}

export const NAKSHATRAS = [
  { id: 1,  en: "Ashwini",           ta: "அஸ்வினி" },
  { id: 2,  en: "Bharani",           ta: "பரணி" },
  { id: 3,  en: "Krittika",          ta: "கார்த்திகை" },
  { id: 4,  en: "Rohini",            ta: "ரோகிணி" },
  { id: 5,  en: "Mrigashira",        ta: "மிருகசீரிடம்" },
  { id: 6,  en: "Ardra",             ta: "திருவாதிரை" },
  { id: 7,  en: "Punarvasu",         ta: "புனர்பூசம்" },
  { id: 8,  en: "Pushya",            ta: "பூசம்" },
  { id: 9,  en: "Ashlesha",          ta: "ஆயில்யம்" },
  { id: 10, en: "Magha",             ta: "மகம்" },
  { id: 11, en: "Purva Phalguni",    ta: "பூரம்" },
  { id: 12, en: "Uttara Phalguni",   ta: "உத்திரம்" },
  { id: 13, en: "Hasta",             ta: "அஸ்தம்" },
  { id: 14, en: "Chitra",            ta: "சித்திரை" },
  { id: 15, en: "Swati",             ta: "சுவாதி" },
  { id: 16, en: "Vishakha",          ta: "விசாகம்" },
  { id: 17, en: "Anuradha",          ta: "அனுஷம்" },
  { id: 18, en: "Jyeshtha",          ta: "கேட்டை" },
  { id: 19, en: "Mula",              ta: "மூலம்" },
  { id: 20, en: "Purva Ashadha",     ta: "பூராடம்" },
  { id: 21, en: "Uttara Ashadha",    ta: "உத்திராடம்" },
  { id: 22, en: "Shravana",          ta: "திருவோணம்" },
  { id: 23, en: "Dhanishtha",        ta: "அவிட்டம்" },
  { id: 24, en: "Shatabhisha",       ta: "சதயம்" },
  { id: 25, en: "Purva Bhadrapada",  ta: "பூரட்டாதி" },
  { id: 26, en: "Uttara Bhadrapada", ta: "உத்திரட்டாதி" },
  { id: 27, en: "Revati",            ta: "ரேவதி" },
]

export const RASIS = [
  { id: 1,  en: "Mesham",     ta: "மேஷம்" },
  { id: 2,  en: "Rishabam",   ta: "ரிஷபம்" },
  { id: 3,  en: "Mithunam",   ta: "மிதுனம்" },
  { id: 4,  en: "Kadagam",    ta: "கடகம்" },
  { id: 5,  en: "Simmam",     ta: "சிம்மம்" },
  { id: 6,  en: "Kanni",      ta: "கன்னி" },
  { id: 7,  en: "Thulam",     ta: "துலாம்" },
  { id: 8,  en: "Viruchigam", ta: "விருச்சிகம்" },
  { id: 9,  en: "Dhanusu",    ta: "தனுசு" },
  { id: 10, en: "Magaram",    ta: "மகரம்" },
  { id: 11, en: "Kumbam",     ta: "கும்பம்" },
  { id: 12, en: "Meenam",     ta: "மீனம்" },
]

// ─── 1. Dina Porutham ────────────────────────────────────────────────────────
// Count girl→boy; divide by 9. Remainder 0,2,4,6,8 → match.
export function calcDina(girlNak: number, boyNak: number) {
  const count = ((boyNak - girlNak + 27) % 27) || 27
  const rem   = count % 9
  const match = rem === 0 || rem === 2 || rem === 4 || rem === 6 || rem === 8
  return { match, detail: `Count: ${count} (remainder ${rem}/9)` }
}

// ─── 2. Gana Porutham ────────────────────────────────────────────────────────
type Gana = "Deva" | "Manushya" | "Rakshasa"
const GANA: Record<number, Gana> = {
  1:"Deva", 2:"Manushya", 3:"Rakshasa", 4:"Manushya", 5:"Deva",
  6:"Manushya", 7:"Deva", 8:"Deva", 9:"Rakshasa", 10:"Rakshasa",
  11:"Manushya", 12:"Manushya", 13:"Deva", 14:"Rakshasa", 15:"Deva",
  16:"Rakshasa", 17:"Deva", 18:"Rakshasa", 19:"Rakshasa", 20:"Manushya",
  21:"Manushya", 22:"Deva", 23:"Rakshasa", 24:"Rakshasa", 25:"Manushya",
  26:"Deva", 27:"Deva",
}
const GANA_LABEL: Record<Gana, string> = { Deva: "தேவ (Deva)", Manushya: "மனுஷ்ய (Manushya)", Rakshasa: "ராக்ஷஸ (Rakshasa)" }

export function calcGana(girlNak: number, boyNak: number) {
  const g = GANA[girlNak], b = GANA[boyNak]
  let match = false
  if (b === "Deva")     match = g === "Deva" || g === "Manushya"
  if (b === "Manushya") match = g === "Deva" || g === "Manushya"
  if (b === "Rakshasa") match = g === "Rakshasa"
  return { match, detail: `Boy: ${GANA_LABEL[b]} | Girl: ${GANA_LABEL[g]}` }
}

// ─── 3. Mahendra Porutham ────────────────────────────────────────────────────
// Count girl→boy; divide by 9. Remainder 1,4,7 → match.
export function calcMahendra(girlNak: number, boyNak: number) {
  const count = ((boyNak - girlNak + 27) % 27) || 27
  const rem   = count % 9
  const match = rem === 1 || rem === 4 || rem === 7
  return { match, detail: `Count: ${count} (remainder ${rem}/9)` }
}

// ─── 4. Sthree Dheerga Porutham ──────────────────────────────────────────────
// Count girl→boy must be > 13.
export function calcSthreeDheerga(girlNak: number, boyNak: number) {
  const count = ((boyNak - girlNak + 27) % 27) || 27
  const match = count > 13
  return { match, detail: `Distance: ${count} stars (need > 13)` }
}

// ─── 5. Yoni Porutham ────────────────────────────────────────────────────────
type Animal = "Horse"|"Elephant"|"Sheep"|"Serpent"|"Dog"|"Cat"|"Rat"|"Cow"|"Buffalo"|"Tiger"|"Deer"|"Monkey"|"Mongoose"|"Lion"
const YONI: Record<number, Animal> = {
  1:"Horse",  2:"Elephant", 3:"Sheep",    4:"Serpent",   5:"Serpent",
  6:"Dog",    7:"Cat",      8:"Sheep",    9:"Cat",       10:"Rat",
  11:"Rat",   12:"Cow",     13:"Buffalo", 14:"Tiger",    15:"Buffalo",
  16:"Tiger", 17:"Deer",    18:"Deer",    19:"Dog",      20:"Monkey",
  21:"Mongoose", 22:"Monkey", 23:"Lion",  24:"Horse",    25:"Lion",
  26:"Cow",   27:"Elephant",
}
const YONI_ENEMIES: [Animal, Animal][] = [
  ["Cat","Rat"], ["Dog","Deer"], ["Serpent","Mongoose"],
  ["Horse","Buffalo"], ["Tiger","Cow"], ["Elephant","Lion"], ["Sheep","Monkey"],
]

export function calcYoni(girlNak: number, boyNak: number) {
  const g = YONI[girlNak], b = YONI[boyNak]
  if (g === b) return { match: true,  detail: `Same Yoni: ${g} — Best compatibility` }
  for (const [a, x] of YONI_ENEMIES) {
    if ((g === a && b === x) || (g === x && b === a))
      return { match: false, detail: `Enemy Yoni: ${g} vs ${b}` }
  }
  return { match: true, detail: `Neutral Yoni: ${g} & ${b}` }
}

// ─── 6. Rasi Porutham ────────────────────────────────────────────────────────
// Count girl→boy rasi. Bad positions: 2, 6, 8, 12.
export function calcRasi(girlRasi: number, boyRasi: number) {
  const count = ((boyRasi - girlRasi + 12) % 12) || 12
  const match = ![2, 6, 8, 12].includes(count)
  const r = RASIS.find(r => r.id === girlRasi)!.en
  const b = RASIS.find(r => r.id === boyRasi)!.en
  return { match, detail: `${r} → ${b} (position ${count})` }
}

// ─── 7. Rasi Adhipathi Porutham ──────────────────────────────────────────────
type Planet = "Sun"|"Moon"|"Mars"|"Mercury"|"Jupiter"|"Venus"|"Saturn"
const RASI_LORD: Record<number, Planet> = {
  1:"Mars", 2:"Venus", 3:"Mercury", 4:"Moon", 5:"Sun", 6:"Mercury",
  7:"Venus", 8:"Mars", 9:"Jupiter", 10:"Saturn", 11:"Saturn", 12:"Jupiter",
}
const ENEMIES: Record<Planet, Planet[]> = {
  Sun:     ["Saturn","Venus"],
  Moon:    [],
  Mars:    ["Mercury"],
  Mercury: ["Moon"],
  Jupiter: ["Mercury","Venus"],
  Venus:   ["Sun","Moon"],
  Saturn:  ["Sun","Moon","Mars"],
}
const FRIENDS: Record<Planet, Planet[]> = {
  Sun:     ["Moon","Mars","Jupiter"],
  Moon:    ["Sun","Mercury"],
  Mars:    ["Sun","Moon","Jupiter"],
  Mercury: ["Sun","Venus"],
  Jupiter: ["Sun","Moon","Mars"],
  Venus:   ["Mercury","Saturn"],
  Saturn:  ["Mercury","Venus"],
}

export function calcRasiAdhipathi(girlRasi: number, boyRasi: number) {
  const g = RASI_LORD[girlRasi], b = RASI_LORD[boyRasi]
  if (g === b) return { match: true,  detail: `Same lord: ${g}` }
  const enemy = ENEMIES[b].includes(g) || ENEMIES[g].includes(b)
  const friend = FRIENDS[b].includes(g) || FRIENDS[g].includes(b)
  const rel = enemy ? "Enemy" : friend ? "Friend" : "Neutral"
  return { match: !enemy, detail: `${g} & ${b} — ${rel}` }
}

// ─── 8. Vasya Porutham ───────────────────────────────────────────────────────
const VASYA: Record<number, number[]> = {
  1:[5,8], 2:[4,7], 3:[6], 4:[8,9], 5:[7], 6:[3,12],
  7:[10], 8:[6], 9:[12], 10:[11], 11:[1,10], 12:[10],
}

export function calcVasya(girlRasi: number, boyRasi: number) {
  const boyCtrlGirl = VASYA[boyRasi]?.includes(girlRasi) ?? false
  const girlCtrlBoy = VASYA[girlRasi]?.includes(boyRasi) ?? false
  const match = boyCtrlGirl || girlCtrlBoy
  const detail = boyCtrlGirl
    ? `Boy's rasi has Vasya over girl's rasi`
    : girlCtrlBoy
    ? `Girl's rasi has Vasya over boy's rasi`
    : "No Vasya relationship"
  return { match, detail }
}

// ─── 9. Rajju Porutham ───────────────────────────────────────────────────────
type Rajju = "Siro"|"Kanta"|"Udara"|"Kati"|"Pada"
const RAJJU: Record<number, Rajju> = {
  1:"Pada",  2:"Kati",  3:"Udara", 4:"Siro",  5:"Siro",
  6:"Kanta", 7:"Pada",  8:"Udara", 9:"Udara", 10:"Pada",
  11:"Kati", 12:"Udara",13:"Kanta",14:"Siro", 15:"Kanta",
  16:"Kati", 17:"Udara",18:"Pada", 19:"Pada", 20:"Kati",
  21:"Siro", 22:"Siro", 23:"Kati", 24:"Kanta",25:"Pada",
  26:"Udara",27:"Pada",
}
const RAJJU_LABEL: Record<Rajju, string> = {
  Siro: "சிரோ (Head)", Kanta: "கண்ட (Neck)", Udara: "உதர (Navel)",
  Kati: "கடி (Hip)", Pada: "பாத (Feet)",
}
const RAJJU_DOSHA: Record<Rajju, string> = {
  Siro: "Danger to husband", Kanta: "Danger to wife",
  Udara: "Danger to children", Kati: "Danger to both", Pada: "Minor dosha",
}

export function calcRajju(girlNak: number, boyNak: number) {
  const g = RAJJU[girlNak], b = RAJJU[boyNak]
  const match = g !== b
  const detail = g === b
    ? `Both in ${RAJJU_LABEL[g]} Rajju — ${RAJJU_DOSHA[g]}`
    : `Different Rajjus: ${RAJJU_LABEL[g]} & ${RAJJU_LABEL[b]}`
  return { match, detail }
}

// ─── 10. Vedha Porutham ──────────────────────────────────────────────────────
const VEDHA_PAIRS: [number, number][] = [
  [1,24],[2,27],[3,16],[4,15],[5,23],[6,22],[7,21],
  [8,20],[9,19],[10,18],[11,17],[12,26],[13,25],
]

export function calcVedha(girlNak: number, boyNak: number) {
  for (const [a, b] of VEDHA_PAIRS) {
    if ((girlNak === a && boyNak === b) || (girlNak === b && boyNak === a)) {
      const g = NAKSHATRAS.find(n => n.id === girlNak)!.en
      const bo = NAKSHATRAS.find(n => n.id === boyNak)!.en
      return { match: false, detail: `Vedha pair: ${g} & ${bo}` }
    }
  }
  return { match: true, detail: "No Vedha obstruction" }
}

// ─── Master calculation ───────────────────────────────────────────────────────
export type PoruthItem = {
  id: number
  name: string
  tamil: string
  description: string
  match: boolean
  detail: string
}

export function calcAllPorutham(
  girlNak: number, girlRasi: number,
  boyNak:  number, boyRasi:  number,
): PoruthItem[] {
  const results = [
    { id:1, name:"Dina Porutham",            tamil:"தின பொருத்தம்",        description:"Health, well-being & day-to-day harmony",            ...calcDina(girlNak, boyNak) },
    { id:2, name:"Gana Porutham",            tamil:"கண பொருத்தம்",         description:"Temperament & character compatibility",              ...calcGana(girlNak, boyNak) },
    { id:3, name:"Mahendra Porutham",        tamil:"மகேந்திர பொருத்தம்",   description:"Longevity of relationship & progeny",                ...calcMahendra(girlNak, boyNak) },
    { id:4, name:"Sthree Dheerga Porutham",  tamil:"ஸ்த்ரீ தீர்க பொருத்தம்", description:"Long life & well-being of the wife",            ...calcSthreeDheerga(girlNak, boyNak) },
    { id:5, name:"Yoni Porutham",            tamil:"யோனி பொருத்தம்",       description:"Physical & intimate compatibility",                  ...calcYoni(girlNak, boyNak) },
    { id:6, name:"Rasi Porutham",            tamil:"ராசி பொருத்தம்",       description:"Zodiac sign compatibility & emotional bonding",       ...calcRasi(girlRasi, boyRasi) },
    { id:7, name:"Rasi Adhipathi Porutham",  tamil:"ராசி அதிபதி பொருத்தம்", description:"Lords of zodiac — mutual understanding",          ...calcRasiAdhipathi(girlRasi, boyRasi) },
    { id:8, name:"Vasya Porutham",           tamil:"வசிய பொருத்தம்",       description:"Mutual attraction & influence",                      ...calcVasya(girlRasi, boyRasi) },
    { id:9, name:"Rajju Porutham",           tamil:"ரஜ்ஜு பொருத்தம்",     description:"Marital longevity & safety (very important)",         ...calcRajju(girlNak, boyNak) },
    { id:10,name:"Vedha Porutham",           tamil:"வேத பொருத்தம்",        description:"No mutual obstruction between nakshatras",           ...calcVedha(girlNak, boyNak) },
  ]
  return results
}
