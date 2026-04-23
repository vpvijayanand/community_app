// TODO: REMOVE — This file has been merged into app_full/lib/news-data.ts and is no longer needed.
// Safe to delete this entire directory (b_wLvLYDaLXZH) once all references are confirmed removed.
export type NewsCategory =
  | "events"
  | "culture"
  | "announcements"
  | "learning"
  | "astrology"

export type Article = {
  id: string
  slug: string
  titleTamil?: string
  titleEnglish: string
  excerpt: string
  category: NewsCategory
  image?: string
  author: {
    name: string
    initials: string
  }
  date: string
  readMinutes: number
  views: number
  featured?: boolean
  pinned?: boolean
}

export const CATEGORY_META: Record<
  NewsCategory,
  {
    label: string
    tamilLabel: string
    textColor: string
    badgeBg: string
    thumbBg: string
  }
> = {
  events: {
    label: "Events",
    tamilLabel: "நிகழ்ச்சிகள்",
    textColor: "#6D211B",
    badgeBg: "#FCEBEB",
    thumbBg: "#FFF3DC",
  },
  culture: {
    label: "Culture",
    tamilLabel: "பண்பாடு",
    textColor: "#0F6E56",
    badgeBg: "#E1F5EE",
    thumbBg: "#E1F5EE",
  },
  announcements: {
    label: "Announcements",
    tamilLabel: "அறிவிப்புகள்",
    textColor: "#854F0B",
    badgeBg: "#FAEEDA",
    thumbBg: "#F2EDE8",
  },
  learning: {
    label: "Learning",
    tamilLabel: "கற்றல்",
    textColor: "#3C3489",
    badgeBg: "#EEEDFE",
    thumbBg: "#EEEDFE",
  },
  astrology: {
    label: "Astrology",
    tamilLabel: "ஜோதிடம்",
    textColor: "#7A6A60",
    badgeBg: "#F2EDE8",
    thumbBg: "#FAECE7",
  },
}

export const FEATURED: Article = {
  id: "1",
  slug: "mathat-kula-mahanadu-2025",
  titleTamil: "மாதத் குல மகாநாடு 2025",
  titleEnglish: "Mathat Kula Mahanadu 2025 — A Gathering of Generations",
  excerpt:
    "Join thousands of families this December as we reconvene for the biennial community conference. Three days of music, wisdom, lineage stories, and the warmth of coming home — held this year on the banks of the Vaigai in Madurai.",
  category: "events",
  image: "/images/featured-article.jpg",
  author: { name: "Editorial Desk", initials: "ED" },
  date: "Apr 14, 2026",
  readMinutes: 5,
  views: 2143,
  featured: true,
  pinned: true,
}

export const ARTICLES: Article[] = [
  {
    id: "2",
    slug: "pongal-2026-guide",
    titleTamil: "பொங்கல் 2026 — வீட்டு வழிகாட்டி",
    titleEnglish: "Pongal 2026 — A Practical Family Guide",
    excerpt:
      "Recipes, kolam patterns, and the stories behind each day — a keepsake guide for the harvest festival.",
    category: "culture",
    image: "/images/article-festival.jpg",
    author: { name: "Revathi S.", initials: "RS" },
    date: "Apr 12, 2026",
    readMinutes: 6,
    views: 1284,
  },
  {
    id: "3",
    slug: "meenakshi-amman-temple-restoration",
    titleTamil: "மீனாக்ஷி அம்மன் கோயில் புனரமைப்பு",
    titleEnglish: "Meenakshi Amman Temple Restoration Enters Phase II",
    excerpt:
      "The gopuram’s eastern tower is now under restoration — the committee shares timelines and a donation update.",
    category: "announcements",
    image: "/images/article-temple.jpg",
    author: { name: "Comms Team", initials: "CT" },
    date: "Apr 10, 2026",
    readMinutes: 4,
    views: 964,
  },
  {
    id: "4",
    slug: "tamil-script-weekly-class",
    titleTamil: "தமிழ் எழுத்து — வாரக் கற்றல்",
    titleEnglish: "Tamil Script — A Weekly Learning Circle",
    excerpt:
      "Now in its third cohort, our weekend class is open for new learners. Small groups, patient teachers.",
    category: "learning",
    image: "/images/article-learning.jpg",
    author: { name: "Kavya N.", initials: "KN" },
    date: "Apr 09, 2026",
    readMinutes: 3,
    views: 617,
  },
  {
    id: "5",
    slug: "chithirai-panguni-astrology",
    titleEnglish: "Chithirai & Panguni — Monthly Astrological Outlook",
    titleTamil: "சித்திரை — மாதாந்திர ஜோதிட பார்வை",
    excerpt:
      "Elder Krishnan Iyer offers a grounded look at the month ahead — planetary movements and family guidance.",
    category: "astrology",
    image: "/images/article-astrology.jpg",
    author: { name: "K. Iyer", initials: "KI" },
    date: "Apr 07, 2026",
    readMinutes: 5,
    views: 1492,
  },
  {
    id: "6",
    slug: "matrimony-meet-bangalore",
    titleEnglish: "Matrimony Meet — Bangalore Chapter",
    titleTamil: "திருமண சந்திப்பு — பெங்களூர்",
    excerpt:
      "A curated in-person gathering for Mathat families living in Bangalore. Registration closes April 30.",
    category: "events",
    image: "/images/article-matrimony.jpg",
    author: { name: "Events Desk", initials: "ED" },
    date: "Apr 05, 2026",
    readMinutes: 2,
    views: 2206,
  },
  {
    id: "7",
    slug: "kolam-as-living-art",
    titleEnglish: "The Kolam as Living Art — A Thursday Essay",
    titleTamil: "கோலம் — வாழும் கலை",
    excerpt:
      "Why the daily ritual at the threshold matters more than ever, and how young families are carrying it forward.",
    category: "culture",
    author: { name: "Meera P.", initials: "MP" },
    date: "Apr 03, 2026",
    readMinutes: 4,
    views: 812,
  },
  {
    id: "8",
    slug: "scholarship-announcement-2026",
    titleEnglish: "Community Scholarship — Applications Open",
    titleTamil: "சமூக புலமைப்பரிசில் — விண்ணப்பங்கள்",
    excerpt:
      "Twelve scholarships for engineering and medical students across India. Deadline May 15, 2026.",
    category: "announcements",
    author: { name: "Trust Board", initials: "TB" },
    date: "Apr 01, 2026",
    readMinutes: 3,
    views: 1703,
  },
]

export const TRENDING = ARTICLES.slice(0, 5)

export const CATEGORY_COUNTS: { category: NewsCategory; count: number }[] = [
  { category: "events", count: 8 },
  { category: "culture", count: 12 },
  { category: "announcements", count: 6 },
  { category: "learning", count: 9 },
  { category: "astrology", count: 4 },
]
