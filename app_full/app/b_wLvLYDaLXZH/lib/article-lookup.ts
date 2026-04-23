// TODO: REMOVE — This file is part of the b_wLvLYDaLXZH prototype. Safe to delete with the whole directory.
import {
  ARTICLES,
  FEATURED,
  CATEGORY_META,
  type Article,
  type NewsCategory,
} from "./news-data"
import {
  newsStore,
  formatPrice,
  type EditorArticle,
  type Pricing,
} from "./news-store"

/* --------------------------- Display types --------------------------- */

export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string; by?: string }
  | { type: "list"; items: string[] }

export type DisplayArticle = {
  slug: string
  titleEnglish: string
  titleTamil?: string
  excerpt: string
  category: NewsCategory
  image?: string
  author: { name: string; initials: string }
  date: string
  readMinutes: number
  views: number
  content: ContentBlock[]
  tags: string[]
  pricing: Pricing
  priceLabel: string
  isPremium: boolean
  previewPercent: number
  source: "seed" | "user"
}

/* --------------------------- Helpers --------------------------- */

export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^\w\s\u0B80-\u0BFF-]/g, "") // keep Tamil unicode range
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "untitled"
  )
}

function editorSlug(a: EditorArticle): string {
  const base = (a.titleEnglish || a.titleTamil || a.id).trim()
  const s = slugify(base)
  return s === "untitled" ? `article-${a.id}` : `${s}-${a.id.slice(0, 6)}`
}

function formatEditorDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })
}

/* ---------------------- Default body (seed articles) ---------------------- */

function defaultContent(a: Article): ContentBlock[] {
  const meta = CATEGORY_META[a.category]
  return [
    {
      type: "p",
      text: `${a.excerpt} This is one of several stories our editorial desk has been shaping this week — rooted in the small, everyday details that make our community feel like home.`,
    },
    {
      type: "p",
      text: `Across our ${meta.label.toLowerCase()} desk, the team has been listening carefully to voices from every chapter — from Madurai to Coimbatore, and from the extended family abroad. What follows is a close look at what this moment means, and how you can take part.`,
    },
    { type: "h2", text: "What we're seeing" },
    {
      type: "p",
      text: `The response so far has been quietly remarkable. Families are arriving earlier, young members are taking on more responsibility, and the elders — as always — are offering the steadying hand. There is a particular kind of patience at work here, and it is worth paying attention to.`,
    },
    {
      type: "quote",
      text: `"We show up for one another. That has not changed in three generations, and it will not change now."`,
      by: a.author.name,
    },
    {
      type: "p",
      text: `Within that continuity, there are of course fresh choices being made. The way gatherings are organised, the way information travels between chapters, the way we welcome new members — each of these is being thoughtfully refined, without losing the warmth that carried it in the first place.`,
    },
    { type: "h2", text: "How you can take part" },
    {
      type: "list",
      items: [
        "Share this story with the family members who would care most.",
        "Reach out to your local chapter lead if you'd like to volunteer.",
        "Save this article to your reading list to revisit details later.",
        "Send a note to the editorial desk if you have something to add.",
      ],
    },
    {
      type: "p",
      text: `If you are reading this from far away, know that your participation — even in small forms — carries further than you might imagine. A message, a photograph, a memory written down: these are the things that keep a community alive between the big gatherings.`,
    },
    {
      type: "p",
      text: `We'll continue to update this page as more details become available. In the meantime, thank you for reading — and for being part of the long, patient story we are all writing together.`,
    },
  ]
}

/* ---------------------- Seed conversion ---------------------- */

function fromSeed(a: Article): DisplayArticle {
  return {
    slug: a.slug,
    titleEnglish: a.titleEnglish,
    titleTamil: a.titleTamil,
    excerpt: a.excerpt,
    category: a.category,
    image: a.image,
    author: a.author,
    date: a.date,
    readMinutes: a.readMinutes,
    views: a.views,
    content: defaultContent(a),
    tags: [a.category],
    pricing: {
      tier: "free",
      price: 0,
      currency: "INR",
      access: "all-members",
      previewPercent: 100,
    },
    priceLabel: "Free",
    isPremium: false,
    previewPercent: 100,
    source: "seed",
  }
}

/* ---------------------- Editor conversion ---------------------- */

function editorContent(a: EditorArticle): ContentBlock[] {
  // Split on blank lines into paragraphs; keep it simple and readable.
  const paragraphs = a.content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  const blocks: ContentBlock[] = []
  if (a.summary.trim()) {
    blocks.push({ type: "p", text: a.summary.trim() })
  }
  paragraphs.forEach((p) => blocks.push({ type: "p", text: p }))
  return blocks.length
    ? blocks
    : [{ type: "p", text: a.summary || "No content yet — check back soon." }]
}

function fromEditor(a: EditorArticle): DisplayArticle {
  const title = a.titleEnglish.trim() || a.titleTamil.trim() || "Untitled"
  const readMinutes = Math.max(2, Math.round(a.content.split(/\s+/).length / 220))
  return {
    slug: editorSlug(a),
    titleEnglish: a.titleEnglish || title,
    titleTamil: a.titleTamil || undefined,
    excerpt: a.summary || a.metaDescription || "",
    category: a.category,
    image: a.imagePreview ?? undefined,
    author: a.author,
    date: formatEditorDate(a.publishedAt ?? a.createdAt),
    readMinutes,
    views: a.views,
    content: editorContent(a),
    tags: a.tags.length ? a.tags : [a.category],
    pricing: a.pricing,
    priceLabel: formatPrice(a.pricing),
    isPremium: a.pricing.tier === "paid",
    previewPercent: a.pricing.previewPercent,
    source: "user",
  }
}

/* ---------------------- Public lookup API ---------------------- */

export function listSeedArticles(): DisplayArticle[] {
  return [fromSeed(FEATURED), ...ARTICLES.map(fromSeed)]
}

export function listUserArticles(): DisplayArticle[] {
  return newsStore
    .getSnapshot()
    .articles.filter((a) => a.status === "published")
    .map(fromEditor)
}

export function listAllArticles(): DisplayArticle[] {
  // User-published first so fresh posts surface above the seed backlog.
  return [...listUserArticles(), ...listSeedArticles()]
}

export function lookupArticle(slug: string): DisplayArticle | null {
  // Seed lookup (available on both server + client)
  if (FEATURED.slug === slug) return fromSeed(FEATURED)
  const seed = ARTICLES.find((a) => a.slug === slug)
  if (seed) return fromSeed(seed)

  // User-published lookup (client-only; returns null during SSR)
  const user = newsStore.getSnapshot().articles.find(
    (a) => a.status === "published" && editorSlug(a) === slug,
  )
  return user ? fromEditor(user) : null
}

export function relatedArticles(
  slug: string,
  category: NewsCategory,
  limit = 3,
): DisplayArticle[] {
  const all = listAllArticles()
  const sameCat = all.filter(
    (a) => a.slug !== slug && a.category === category,
  )
  const rest = all.filter(
    (a) => a.slug !== slug && a.category !== category,
  )
  return [...sameCat, ...rest].slice(0, limit)
}
