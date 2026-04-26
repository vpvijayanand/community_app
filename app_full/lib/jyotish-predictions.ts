import { JyotishResult } from "./jyotish-calc"

// ── Types ─────────────────────────────────────────────────────────────────
export interface DetailedPrediction {
  lagnaAnalysis: {
    title: string
    description: string
    traits: string[]
    lordStatus: string
  }
  rasiGeneral: {
    title: string
    overview: string
  }
  navamsaInsights: {
    title: string
    description: string
  }
  planetaryPositions: Array<{
    planetTamil: string
    planetEnglish: string
    house: number
    rasi: string
    status: "Exalted" | "Debilitated" | "Own House" | "Friendly House" | "Enemy House" | "Neutral"
    prediction: string
  }>
  yogas: Array<{
    name: string
    description: string
  }>
  career: string
  wealth: string
  marriage: string
  lifePath: string
}

// ── Master Data Dicts ──────────────────────────────────────────────────────

const LAGNA_TRAITS: Record<number, { title: string; desc: string; traits: string[] }> = {
  1: { title: "மேஷம் (Aries)", desc: "Aries ascendants are natural pioneers, fiery, and fiercely independent.", traits: ["Courageous", "Impulsive", "Natural leader", "Energetic"] },
  2: { title: "ரிஷபம் (Taurus)", desc: "Taurus ascendants are grounded, reliable, and appreciate the finer things in life.", traits: ["Steadfast", "Patient", "Artistic", "Stubborn"] },
  3: { title: "மிதுனம் (Gemini)", desc: "Gemini ascendants are highly communicative, intellectual, and adaptable.", traits: ["Witty", "Restless", "Expressive", "Curious"] },
  4: { title: "கடகம் (Cancer)", desc: "Cancer ascendants are deeply intuitive, emotional, and nurturing.", traits: ["Empathetic", "Protective", "Mood-driven", "Family-oriented"] },
  5: { title: "சிம்மம் (Leo)", desc: "Leo ascendants radiate confidence, warmth, and seek to lead naturally.", traits: ["Generous", "Charismatic", "Proud", "Authoritative"] },
  6: { title: "கன்னி (Virgo)", desc: "Virgo ascendants are analytical, detail-oriented, and service-driven.", traits: ["Meticulous", "Practical", "Critical thinker", "Helpful"] },
  7: { title: "துலாம் (Libra)", desc: "Libra ascendants seek balance, harmony, and are highly diplomatic.", traits: ["Charming", "Diplomatic", "Indecisive", "Fair-minded"] },
  8: { title: "விருச்சிகம் (Scorpio)", desc: "Scorpio ascendants are intense, secretive, and powerfully transformative.", traits: ["Passionate", "Resilient", "Intense", "Mysterious"] },
  9: { title: "தனுசு (Sagittarius)", desc: "Sagittarius ascendants are optimistic, philosophical truth-seekers.", traits: ["Adventurous", "Optimistic", "Blunt", "Philosophical"] },
  10: { title: "மகரம் (Capricorn)", desc: "Capricorn ascendants are ambitious, disciplined, and deeply practical.", traits: ["Disciplined", "Ambitious", "Reserved", "Hardworking"] },
  11: { title: "கும்பம் (Aquarius)", desc: "Aquarius ascendants are unconventional, visionary, and humanitarian.", traits: ["Innovative", "Independent", "Rebellious", "Intellectual"] },
  12: { title: "மீனம் (Pisces)", desc: "Pisces ascendants are compassionate, spiritual, and deeply imaginative.", traits: ["Compassionate", "Intuitive", "Dreamy", "Empathetic"] }
}

const HOUSE_MEANINGS: Record<number, string> = {
  1: "shapes your personality, physical body, and general life approach",
  2: "influences your wealth, speech, and early family life",
  3: "affects your courage, siblings, and communication skills",
  4: "rules over mother, property, deep emotions, and domestic happiness",
  5: "governs intellect, romance, children, and creative pursuits",
  6: "relates to overcoming obstacles, health, and daily service or enemies",
  7: "central to marriage, business partnerships, and public dealings",
  8: "deals with transformation, hidden matters, longevity, and inheritance",
  9: "determines your luck, dharma, higher education, and spiritual inclinations",
  10: "marks your career trajectory, public standing, and karma/action in the world",
  11: "indicates major gains, large networks, and fulfillment of desires",
  12: "focuses on spirituality, foreign lands, sub-conscious, and expenditures"
}

const PLANET_NATURE: Record<string, string> = {
  Su: "The Sun represents your soul, ego, and authority.",
  Mo: "The Moon reflects your mind, emotions, and receptivity.",
  Ma: "Mars drives your ambition, energy, and assertiveness.",
  Me: "Mercury dictates your intellect, speech, and analytical abilities.",
  Ju: "Jupiter brings expansion, wisdom, grace, and optimism.",
  Ve: "Venus rules over relationships, luxury, aesthetics, and comfort.",
  Sa: "Saturn provides discipline, delays, hard work, and karmic lessons.",
  Ra: "Rahu creates obsessions, worldly desires, and unconventional paths.",
  Ke: "Ketu detaches you from the material world, pushing towards liberation."
}

// Rasi rulerships: 1=Ma, 2=Ve, 3=Me, 4=Mo, 5=Su, 6=Me, 7=Ve, 8=Ma, 9=Ju, 10=Sa, 11=Sa, 12=Ju
const RASI_LORDS: Record<number, string> = { 1: "Ma", 2: "Ve", 3: "Me", 4: "Mo", 5: "Su", 6: "Me", 7: "Ve", 8: "Ma", 9: "Ju", 10: "Sa", 11: "Sa", 12: "Ju" }

const EXALTATIONS: Record<string, number> = { Su: 1, Mo: 2, Ma: 10, Me: 6, Ju: 4, Ve: 12, Sa: 7, Ra: 2, Ke: 8 }
const DEBILITATIONS: Record<string, number> = { Su: 7, Mo: 8, Ma: 4, Me: 12, Ju: 10, Ve: 6, Sa: 1, Ra: 8, Ke: 2 }

// ── Generator Function ────────────────────────────────────────────────────

export function generatePredictions(chart: JyotishResult, gender: string = "male"): DetailedPrediction {
  const lRasi = chart.lagnamRasi
  const moonRasi = chart.moonRasi
  
  // 1. Lagna Analysis
  const lagnaInfo = LAGNA_TRAITS[lRasi] || LAGNA_TRAITS[1]
  const lagnaLord = RASI_LORDS[lRasi]
  
  // Find Lagna Lord placement in Rasi
  const lordPos = chart.rasiPositions.find(p => p.planet === lagnaLord)
  let lordStatusText = ""
  let lordHouse = 1
  if (lordPos) {
    lordHouse = ((lordPos.house - lRasi + 12) % 12) + 1
    if (EXALTATIONS[lagnaLord] === lordPos.house) {
      lordStatusText = `Your Lagna Lord (${chart.lagnaLordEnglish}) is highly exalted in house ${lordHouse}, granting exceptional vitality and life directional strength.`
    } else if (DEBILITATIONS[lagnaLord] === lordPos.house) {
      lordStatusText = `Your Lagna Lord is debilitated in house ${lordHouse}, which may bring initial struggles in self-confidence but teaches profound resilience over time.`
    } else if (lordPos.house === lRasi) {
      lordStatusText = `Your Lagna Lord sits in its own house, creating a strong Mahapurusha effect giving stability, health, and a commanding presence.`
    } else {
      lordStatusText = `Your Lagna Lord is positioned in the ${lordHouse}${lordHouse === 1 ? 'st' : lordHouse === 2 ? 'nd' : lordHouse === 3 ? 'rd' : 'th'} house from the ascendant. This placement heavily weaves your core life purpose with matters of the ${lordHouse}th house.`
    }
  }

  // 2. Planets
  const planetaryPositions: DetailedPrediction['planetaryPositions'] = []
  
  const planetNameMap: Record<string, { en: string; ta: string }> = {
    Su: { en: "Sun", ta: "சூரியன்" }, Mo: { en: "Moon", ta: "சந்திரன்" },
    Ma: { en: "Mars", ta: "செவ்வாய்" }, Me: { en: "Mercury", ta: "புதன்" },
    Ju: { en: "Jupiter", ta: "குரு" }, Ve: { en: "Venus", ta: "சுக்கிரன்" },
    Sa: { en: "Saturn", ta: "சனி" }, Ra: { en: "Rahu", ta: "ராகு" }, Ke: { en: "Ketu", ta: "கேது" }
  }
  const rasiNames: Record<number, string> = {
    1: "Mesham", 2: "Rishabam", 3: "Mithunam", 4: "Kadagam", 5: "Simmam", 6: "Kanni",
    7: "Thulam", 8: "Viruchigam", 9: "Dhanusu", 10: "Magaram", 11: "Kumbam", 12: "Meenam"
  }

  chart.rasiPositions.forEach(pos => {
    if (pos.planet === "La") return
    const h = ((pos.house - lRasi + 12) % 12) + 1
    const pNature = PLANET_NATURE[pos.planet] || ""
    const hMeaning = HOUSE_MEANINGS[h] || ""
    
    let status: "Exalted" | "Debilitated" | "Own House" | "Neutral" = "Neutral"
    if (EXALTATIONS[pos.planet] === pos.house) status = "Exalted"
    else if (DEBILITATIONS[pos.planet] === pos.house) status = "Debilitated"
    else if (RASI_LORDS[pos.house] === pos.planet) status = "Own House"
    
    let statusPhrase = `placed in ${rasiNames[pos.house]}`
    if (status === "Exalted") statusPhrase = `Exalted (Ucham) in ${rasiNames[pos.house]}`
    if (status === "Debilitated") statusPhrase = `Debilitated (Neecham) in ${rasiNames[pos.house]}`
    if (status === "Own House") statusPhrase = `placed in its Own House in ${rasiNames[pos.house]}`

    let pt = `Sitting in the ${h}th House, which ${hMeaning}. ${pNature} Being ${statusPhrase}, this generally indicates `
    if (status === "Exalted" || status === "Own House") {
      pt += "highly auspicious and powerful results regarding this house's significations."
    } else if (status === "Debilitated") {
      pt += "areas where you may face karmic lessons or delays requiring patience."
    } else {
      pt += "moderate and mixed results depending on aspects and transits."
    }

    planetaryPositions.push({
      planetTamil: planetNameMap[pos.planet]?.ta || pos.planet,
      planetEnglish: planetNameMap[pos.planet]?.en || pos.planet,
      house: h,
      rasi: rasiNames[pos.house],
      status: status,
      prediction: pt
    })
  })

  // Sort by house 1..12
  planetaryPositions.sort((a, b) => a.house - b.house)

  // 3. Yogas check
  const yogas: DetailedPrediction['yogas'] = []
  
  // Gaja Kesari: Jupiter in Kendra (1, 4, 7, 10) from Moon
  const moPos = chart.rasiPositions.find(p => p.planet === "Mo")
  const juPos = chart.rasiPositions.find(p => p.planet === "Ju")
  if (moPos && juPos) {
    const jFromM = ((juPos.house - moPos.house + 12) % 12) + 1
    if ([1, 4, 7, 10].includes(jFromM)) {
      yogas.push({
        name: "Gaja Kesari Yoga (கஜ கேசரி யோகம்)",
        description: "Jupiter is placed in a Kendra from the Moon. This is a highly auspicious yoga granting lasting reputation, wisdom, success, and ability to overcome major obstacles."
      })
    }
  }

  // Ruchaka Yoga: Mars exalted or own house in Kendra from Lagna
  const maPos = chart.rasiPositions.find(p => p.planet === "Ma")
  if (maPos) {
    const maH = ((maPos.house - lRasi + 12) % 12) + 1
    if ([1, 4, 7, 10].includes(maH) && (EXALTATIONS["Ma"] === maPos.house || RASI_LORDS[maPos.house] === "Ma")) {
      yogas.push({
        name: "Ruchaka Mahapurusha Yoga (ருசக யோகம்)",
        description: "Mars is strongly placed in a primary house. This grants bold leadership, courage, athleticism, taking strong initiatives, and property gains."
      })
    }
  }

  // Hamsa Yoga: Jupiter exalted or own house in Kendra from Lagna
  if (juPos) {
    const juH = ((juPos.house - lRasi + 12) % 12) + 1
    if ([1, 4, 7, 10].includes(juH) && (EXALTATIONS["Ju"] === juPos.house || RASI_LORDS[juPos.house] === "Ju")) {
      yogas.push({
        name: "Hamsa Mahapurusha Yoga (ஹம்ச யோகம்)",
        description: "Jupiter is maximally powerful in an angular house. This brings tremendous divine grace, moral purity, deep philosophical knowledge, and respect in society."
      })
    }
  }

  if (yogas.length === 0) {
    yogas.push({
      name: "Standard Planetary Alignments",
      description: "No rare major Mahapurusha yogas detected prominently, but the chart's strength is fueled by the core dignity of the Lagna and Navamsa."
    })
  }

  // 4. Summaries (Career, Wealth, Marriage)
  const house10 = ((lRasi + 9 - 1) % 12) + 1 // Actually 10th house is lRasi + 9, clamped. Wait (lRasi-1 + 9)%12 + 1
  const planets10 = planetaryPositions.filter(p => p.house === 10)
  let careerText = `Your 10th house rules your profession. `
  if (planets10.length > 0) {
    careerText += `Since it contains ${planets10.map(p => p.planetEnglish).join(", ")}, your career is heavily influenced by their energies. Expect dynamic events indicating authority, analysis, or creativity depending on those planets.`
  } else {
    careerText += `As it is empty, your career direction is dictated by its lord. Your karmic path often focuses on stability and taking up roles that provide steady growth over sudden bursts.`
  }

  const planets2 = planetaryPositions.filter(p => p.house === 2)
  const planets11 = planetaryPositions.filter(p => p.house === 11)
  let wealthText = "Your 2nd (savings) and 11th (gains) houses determine your financial landscape. "
  if (planets2.length > 0 || planets11.length > 0) {
    wealthText += "Having planets placed in these financial houses suggests strong karmic triggers for income. "
  } else {
    wealthText += "The lords of your 2nd and 11th houses govern your income sources. "
  }
  wealthText += "Financial stability will generally require disciplined saving, but favorable periods of these rulers bring sudden ascents in wealth."

  const planets7 = planetaryPositions.filter(p => p.house === 7)
  let marriageText = `The 7th house and Venus govern partnership. `
  if (planets7.length > 0) {
    marriageText += `With ${planets7.map(p => p.planetEnglish).join(", ")} residing in the 7th house, your marriage and business partnerships are central focal points in your life journey. `
  }
  marriageText += gender === "female" 
    ? "For a female chart, Jupiter's position also strongly shapes the husband's characteristics and marital fulfillment."
    : "For a male chart, Venus's dignity is vital for a harmonious and affectionate marital life."

  return {
    lagnaAnalysis: {
      title: lagnaInfo.title,
      description: lagnaInfo.desc,
      traits: lagnaInfo.traits,
      lordStatus: lordStatusText
    },
    rasiGeneral: {
      title: "Rasi Chart (D1) Overview",
      overview: `Driven by Moon in ${chart.moonRasiTamil} (${chart.natchathiramTamil}), your mind and emotional reactions are heavily tied to this constellation's deity and animal symbolism. Your underlying psychological motivation is constant movement and adaptation.`
    },
    navamsaInsights: {
      title: "Navamsa Chart (D9) Dynamics",
      description: "The D9 chart reveals your soul's latent potential, manifesting fully after marriage or in the second half of life. It acts as the microscopic view of planetary dignity confirming your true strengths."
    },
    planetaryPositions,
    yogas,
    career: careerText,
    wealth: wealthText,
    marriage: marriageText,
    lifePath: "Your path is uniquely carved by your Lagna. Adhering to righteous action (Dharma) and understanding your core planetary weaknesses will significantly alleviate any obstacles."
  }
}
