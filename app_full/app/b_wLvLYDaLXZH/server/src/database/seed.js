/**
 * Seed script — populates a local database with a realistic starter set:
 *   - one admin, one editor, one reader
 *   - six bilingual articles covering every category
 *   - category tags and a featured flag
 *
 * Safe to re-run: uses ON CONFLICT DO NOTHING for users and articles.
 */

import { pool, withTransaction } from "../config/db.js"
import { hashPassword } from "../utils/password.js"
import { env } from "../config/env.js"

const ARTICLES = [
  {
    slug: "mathat-kula-mahanadu-2025",
    title_english: "Mathat Kula Mahanadu 2025 — A Gathering of Generations",
    title_tamil: "மாதத் குல மகாநாடு 2025",
    summary:
      "Three days of music, wisdom, and lineage stories on the banks of the Vaigai in Madurai.",
    category: "events",
    image_url: "/images/featured-article.jpg",
    featured: true,
    pinned: true,
    priority: "featured",
    tags: ["mahanadu", "madurai", "community"],
    read_minutes: 5,
  },
  {
    slug: "pongal-2026-guide",
    title_english: "Pongal 2026 — A Practical Family Guide",
    title_tamil: "பொங்கல் 2026 — வீட்டு வழிகாட்டி",
    summary: "Recipes, kolam patterns, and the stories behind each day.",
    category: "culture",
    image_url: "/images/article-festival.jpg",
    tags: ["pongal", "festival", "recipes"],
    read_minutes: 6,
  },
  {
    slug: "meenakshi-amman-temple-restoration",
    title_english: "Meenakshi Amman Temple Restoration Enters Phase II",
    title_tamil: "மீனாக்ஷி அம்மன் கோயில் புனரமைப்பு",
    summary:
      "The gopuram's eastern tower is now under restoration — timelines and donation update.",
    category: "announcements",
    image_url: "/images/article-temple.jpg",
    tags: ["temple", "restoration", "madurai"],
    read_minutes: 4,
  },
  {
    slug: "tamil-script-weekly-class",
    title_english: "Tamil Script — A Weekly Learning Circle",
    title_tamil: "தமிழ் எழுத்து — வாரக் கற்றல்",
    summary: "Now in its third cohort, the weekend class is open for new learners.",
    category: "learning",
    image_url: "/images/article-learning.jpg",
    tags: ["tamil", "learning", "class"],
    read_minutes: 3,
    pricing_tier: "paid",
    price: 199,
    access_tier: "paid-members",
    preview_percent: 35,
    support_note: "Proceeds support our volunteer teachers and printed workbooks.",
  },
  {
    slug: "chithirai-panguni-astrology",
    title_english: "Chithirai & Panguni — Monthly Astrological Outlook",
    title_tamil: "சித்திரை — மாதாந்திர ஜோதிட பார்வை",
    summary: "A grounded look at the month ahead — planetary movements and family guidance.",
    category: "astrology",
    image_url: "/images/article-astrology.jpg",
    tags: ["astrology", "monthly", "guidance"],
    read_minutes: 5,
  },
  {
    slug: "matrimony-meet-bangalore",
    title_english: "Matrimony Meet — Bangalore Chapter",
    title_tamil: "திருமண சந்திப்பு — பெங்களூர்",
    summary: "A curated in-person gathering for Mathat families living in Bangalore.",
    category: "events",
    image_url: "/images/article-matrimony.jpg",
    tags: ["matrimony", "bangalore", "event"],
    read_minutes: 2,
  },
]

const LOREM = `Across generations, the gathering has remained a gentle constant — a place where the youngest among us meet their grand-aunts for the first time, and where elders pass on songs only remembered at dawn.

This year, the committee has chosen Madurai for its symbolic weight. Three days of sessions will cover lineage, classical music, language preservation, and a quiet hour each evening dedicated to shared meals.

Registration opens in the first week of May. Families who have attended before will receive a head-start window. All sessions are bilingual, and printed programs include both Tamil and English.`

async function upsertUser(client, { email, password, display_name, tamil_name, role, tier }) {
  const password_hash = await hashPassword(password)
  const { rows } = await client.query(
    `
    INSERT INTO users (email, password_hash, display_name, tamil_name, role, tier)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name
    RETURNING id
    `,
    [email, password_hash, display_name, tamil_name, role, tier],
  )
  return rows[0].id
}

async function upsertArticle(client, adminId, a) {
  const {
    rows: [row],
  } = await client.query(
    `
    INSERT INTO articles (
      slug, title_english, title_tamil, summary, content,
      category, image_url, featured, pinned, priority,
      pricing_tier, price, currency, access_tier, preview_percent, support_note,
      read_minutes, status, published_at, author_id
    ) VALUES (
      $1,$2,$3,$4,$5,
      $6,$7,$8,$9,$10,
      $11,$12,$13,$14,$15,$16,
      $17,'published', now() - (random() * interval '14 days'), $18
    )
    ON CONFLICT (slug) DO NOTHING
    RETURNING id
    `,
    [
      a.slug,
      a.title_english,
      a.title_tamil ?? null,
      a.summary,
      LOREM,
      a.category,
      a.image_url ?? null,
      !!a.featured,
      !!a.pinned,
      a.priority ?? "normal",
      a.pricing_tier ?? "free",
      a.price ?? 0,
      a.currency ?? "INR",
      a.access_tier ?? "all-members",
      a.preview_percent ?? 100,
      a.support_note ?? null,
      a.read_minutes ?? 3,
      adminId,
    ],
  )
  if (!row) return
  for (const tag of a.tags ?? []) {
    await client.query(
      "INSERT INTO article_tags (article_id, tag) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [row.id, tag],
    )
  }
}

async function main() {
  console.log("[seed] Starting...")
  await withTransaction(async (c) => {
    const adminId = await upsertUser(c, {
      email: env.seed.adminEmail,
      password: env.seed.adminPassword,
      display_name: "Editorial Desk",
      tamil_name: "தலைமை ஆசிரியர்",
      role: "admin",
      tier: "life",
    })
    await upsertUser(c, {
      email: "editor@mathat.local",
      password: "change-me-editor",
      display_name: "Revathi S.",
      tamil_name: "ரேவதி சு.",
      role: "editor",
      tier: "paid",
    })
    await upsertUser(c, {
      email: "reader@mathat.local",
      password: "change-me-reader",
      display_name: "Arun M.",
      tamil_name: "அருண் மு.",
      role: "reader",
      tier: "free",
    })

    for (const a of ARTICLES) {
      await upsertArticle(c, adminId, a)
    }
  })
  console.log("[seed] Done.")
}

main()
  .catch((err) => {
    console.error("[seed] Failed:", err)
    process.exitCode = 1
  })
  .finally(() => pool.end())
