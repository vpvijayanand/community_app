export type Profile = {
  id: string
  name: string
  nameTamil: string
  age: number
  heightCm: number
  photo: string
  location: string
  locationTamil: string
  community: string
  communityTamil: string
  education: string
  profession: string
  company?: string
  star: string
  starTamil: string
  rasi: string
  rasiTamil: string
  diet: "Vegetarian" | "Non-Vegetarian" | "Eggetarian"
  motherTongue: string
  maritalStatus: "Never Married" | "Divorced" | "Widowed"
  about: string
  family: {
    father: string
    mother: string
    siblings: string
    type: "Nuclear" | "Joint"
    values: "Orthodox" | "Traditional" | "Moderate" | "Liberal"
  }
  partnerPreferences: {
    ageRange: [number, number]
    heightRange: [number, number]
    education: string
    location: string
    diet: string
  }
  matchScore: number
  isNew?: boolean
  isVerified?: boolean
  isPremium?: boolean
}

const heightCmToFtIn = (cm: number) => {
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches - feet * 12)
  return `${feet}'${inches}"`
}

export const formatHeight = (cm: number) => `${heightCmToFtIn(cm)} (${cm} cm)`

export const PROFILES: Profile[] = [
  {
    id: "priya-s",
    name: "Priya S.",
    nameTamil: "பிரியா",
    age: 27,
    heightCm: 162,
    photo: "/profiles/priya.jpg",
    location: "Chennai, Tamil Nadu",
    locationTamil: "சென்னை",
    community: "Iyer",
    communityTamil: "ஐயர்",
    education: "M.Sc. Data Science, Anna University",
    profession: "Data Scientist",
    company: "Zoho Corporation",
    star: "Rohini",
    starTamil: "ரோகிணி",
    rasi: "Rishabam",
    rasiTamil: "ரிஷபம்",
    diet: "Vegetarian",
    motherTongue: "Tamil",
    maritalStatus: "Never Married",
    about:
      "Born and raised in Chennai, I love weekend carnatic concerts, long morning runs on the Marina, and cooking with my mother. Looking for a kind, grounded partner who values family and growth equally.",
    family: {
      father: "Retired Bank Manager",
      mother: "Homemaker",
      siblings: "One younger brother (Engineer)",
      type: "Nuclear",
      values: "Traditional",
    },
    partnerPreferences: {
      ageRange: [28, 33],
      heightRange: [170, 185],
      education: "Post-graduate or equivalent",
      location: "Tamil Nadu or open to relocation",
      diet: "Vegetarian preferred",
    },
    matchScore: 92,
    isNew: true,
    isVerified: true,
    isPremium: true,
  },
  {
    id: "arjun-r",
    name: "Arjun R.",
    nameTamil: "அர்ஜுன்",
    age: 31,
    heightCm: 178,
    photo: "/profiles/arjun.jpg",
    location: "Bengaluru, Karnataka",
    locationTamil: "பெங்களூரு",
    community: "Mudaliar",
    communityTamil: "முதலியார்",
    education: "B.Tech CSE, NIT Trichy",
    profession: "Senior Software Engineer",
    company: "Google",
    star: "Uthiram",
    starTamil: "உத்திரம்",
    rasi: "Simmam",
    rasiTamil: "சிம்மம்",
    diet: "Non-Vegetarian",
    motherTongue: "Tamil",
    maritalStatus: "Never Married",
    about:
      "Chennai boy currently based in Bengaluru. I spend weekends trekking in the Western Ghats, reading Tamil fiction, and dabbling in film photography. Looking for someone thoughtful, curious, and warm.",
    family: {
      father: "Professor, IIT Madras",
      mother: "Doctor (Pediatrician)",
      siblings: "One elder sister (married, in the US)",
      type: "Nuclear",
      values: "Moderate",
    },
    partnerPreferences: {
      ageRange: [26, 31],
      heightRange: [155, 172],
      education: "Graduate or post-graduate",
      location: "No preference",
      diet: "No preference",
    },
    matchScore: 88,
    isVerified: true,
    isPremium: true,
  },
  {
    id: "meera-k",
    name: "Meera K.",
    nameTamil: "மீரா",
    age: 28,
    heightCm: 158,
    photo: "/profiles/meera.jpg",
    location: "Coimbatore, Tamil Nadu",
    locationTamil: "கோயம்புத்தூர்",
    community: "Gounder",
    communityTamil: "கவுண்டர்",
    education: "MBBS, PSG Medical College",
    profession: "Resident Doctor",
    company: "Kovai Medical Center",
    star: "Hastam",
    starTamil: "ஹஸ்தம்",
    rasi: "Kanni",
    rasiTamil: "கன்னி",
    diet: "Vegetarian",
    motherTongue: "Tamil",
    maritalStatus: "Never Married",
    about:
      "A doctor by profession and a dancer (Bharatanatyam) by passion. I value quiet evenings, good conversation, and a partner who respects both ambition and family.",
    family: {
      father: "Textile Business Owner",
      mother: "Homemaker",
      siblings: "Two (one elder brother, one younger sister)",
      type: "Joint",
      values: "Traditional",
    },
    partnerPreferences: {
      ageRange: [28, 34],
      heightRange: [170, 185],
      education: "Graduate or post-graduate",
      location: "Tamil Nadu",
      diet: "Vegetarian",
    },
    matchScore: 85,
    isVerified: true,
  },
  {
    id: "karthik-v",
    name: "Karthik V.",
    nameTamil: "கார்த்திக்",
    age: 29,
    heightCm: 175,
    photo: "/profiles/karthik.jpg",
    location: "Madurai, Tamil Nadu",
    locationTamil: "மதுரை",
    community: "Pillai",
    communityTamil: "பிள்ளை",
    education: "CA, ICAI",
    profession: "Chartered Accountant",
    company: "Deloitte",
    star: "Swathi",
    starTamil: "சுவாதி",
    rasi: "Thulam",
    rasiTamil: "துலாம்",
    diet: "Vegetarian",
    motherTongue: "Tamil",
    maritalStatus: "Never Married",
    about:
      "Madurai-born CA with a love for temple architecture, Ilayaraja playlists, and long family lunches. Family-oriented and steady, looking for a partner who values both roots and progress.",
    family: {
      father: "Retired Government Officer",
      mother: "School Teacher",
      siblings: "One younger sister (married)",
      type: "Nuclear",
      values: "Orthodox",
    },
    partnerPreferences: {
      ageRange: [25, 30],
      heightRange: [155, 170],
      education: "Graduate",
      location: "Tamil Nadu preferred",
      diet: "Vegetarian",
    },
    matchScore: 81,
    isVerified: true,
  },
  {
    id: "divya-n",
    name: "Divya N.",
    nameTamil: "திவ்யா",
    age: 26,
    heightCm: 165,
    photo: "/placeholder.svg?height=800&width=600",
    location: "Salem, Tamil Nadu",
    locationTamil: "சேலம்",
    community: "Chettiar",
    communityTamil: "செட்டியார்",
    education: "M.A. English Literature",
    profession: "Content Strategist",
    company: "Freshworks",
    star: "Pooradam",
    starTamil: "பூராடம்",
    rasi: "Dhanusu",
    rasiTamil: "தனுசு",
    diet: "Eggetarian",
    motherTongue: "Tamil",
    maritalStatus: "Never Married",
    about:
      "Writer, reader, and an incurable romantic. Weekends are for bookstores, filter coffee, and long walks. Seeking someone kind, articulate, and a little old-fashioned.",
    family: {
      father: "Business Owner (Textiles)",
      mother: "Homemaker",
      siblings: "One elder brother",
      type: "Joint",
      values: "Moderate",
    },
    partnerPreferences: {
      ageRange: [27, 32],
      heightRange: [170, 180],
      education: "Post-graduate preferred",
      location: "No preference",
      diet: "No preference",
    },
    matchScore: 79,
  },
  {
    id: "vignesh-p",
    name: "Vignesh P.",
    nameTamil: "விக்னேஷ்",
    age: 32,
    heightCm: 180,
    photo: "/placeholder.svg?height=800&width=600",
    location: "Singapore",
    locationTamil: "சிங்கப்பூர்",
    community: "Iyengar",
    communityTamil: "ஐயங்கார்",
    education: "MBA, NUS",
    profession: "Product Manager",
    company: "Grab",
    star: "Anusham",
    starTamil: "அனுஷம்",
    rasi: "Viruchigam",
    rasiTamil: "விருச்சிகம்",
    diet: "Vegetarian",
    motherTongue: "Tamil",
    maritalStatus: "Never Married",
    about:
      "Tamilian at heart, Singaporean by address. I cook a mean sambar, run half marathons, and am planning to move back to Chennai in the next two years. Looking for a thoughtful partner to build a life with.",
    family: {
      father: "Doctor (Cardiologist)",
      mother: "Homemaker",
      siblings: "One younger brother (in Dubai)",
      type: "Nuclear",
      values: "Traditional",
    },
    partnerPreferences: {
      ageRange: [26, 31],
      heightRange: [155, 170],
      education: "Graduate or post-graduate",
      location: "Willing to relocate",
      diet: "Vegetarian",
    },
    matchScore: 76,
    isPremium: true,
  },
  {
    id: "lakshmi-j",
    name: "Lakshmi J.",
    nameTamil: "லக்ஷ்மி",
    age: 29,
    heightCm: 160,
    photo: "/placeholder.svg?height=800&width=600",
    location: "Trichy, Tamil Nadu",
    locationTamil: "திருச்சி",
    community: "Iyer",
    communityTamil: "ஐயர்",
    education: "M.Tech, NIT Trichy",
    profession: "Research Engineer",
    company: "Bosch",
    star: "Punarpusam",
    starTamil: "புனர்பூசம்",
    rasi: "Mithunam",
    rasiTamil: "மிதுனம்",
    diet: "Vegetarian",
    motherTongue: "Tamil",
    maritalStatus: "Never Married",
    about:
      "Engineer, veena player, temple-hopper. I like quiet mornings, crowded kovil festivals, and partners who can hold a good conversation about both rockets and ragas.",
    family: {
      father: "Retired Engineer",
      mother: "Music Teacher",
      siblings: "One elder sister (married)",
      type: "Nuclear",
      values: "Orthodox",
    },
    partnerPreferences: {
      ageRange: [29, 34],
      heightRange: [168, 180],
      education: "Post-graduate preferred",
      location: "Tamil Nadu",
      diet: "Vegetarian",
    },
    matchScore: 73,
    isNew: true,
  },
  {
    id: "rahul-m",
    name: "Rahul M.",
    nameTamil: "ராகுல்",
    age: 30,
    heightCm: 172,
    photo: "/placeholder.svg?height=800&width=600",
    location: "Chennai, Tamil Nadu",
    locationTamil: "சென்னை",
    community: "Naidu",
    communityTamil: "நாயுடு",
    education: "B.E. Mechanical, CEG",
    profession: "Startup Founder",
    star: "Kettai",
    starTamil: "கேட்டை",
    rasi: "Viruchigam",
    rasiTamil: "விருச்சிகம்",
    diet: "Non-Vegetarian",
    motherTongue: "Tamil",
    maritalStatus: "Never Married",
    about:
      "Running a small climate-tech startup out of Chennai. Passionate about cinema, Tamil stand-up, and weekend road trips down the ECR. Looking for a partner who's equally curious about the world.",
    family: {
      father: "Business Owner",
      mother: "Homemaker",
      siblings: "One younger sister",
      type: "Nuclear",
      values: "Liberal",
    },
    partnerPreferences: {
      ageRange: [26, 30],
      heightRange: [155, 170],
      education: "Graduate",
      location: "Chennai",
      diet: "No preference",
    },
    matchScore: 70,
    isVerified: true,
  },
]

export const getProfileById = (id: string) => PROFILES.find((p) => p.id === id)
