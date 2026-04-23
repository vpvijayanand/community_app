// Migrated from app/b_wLvLYDaLXZH/lib/news-store.ts — that file is now marked for deletion.
"use client"

import { useSyncExternalStore } from "react"
import type { NewsCategory } from "./news-data"

/* ------------------------------ Types ------------------------------ */

export type ArticleStatus = "draft" | "scheduled" | "published"

export type PricingTier = "free" | "paid"
export type Currency = "INR" | "USD" | "SGD" | "MYR"
export type AccessTier = "all-members" | "paid-members" | "life-members"

export type Pricing = {
  tier: PricingTier
  price: number // in major units (e.g. rupees)
  currency: Currency
  access: AccessTier
  previewPercent: number // 0-100 — how much of the article is readable before paywall
  supportNote?: string
}

export type EditorArticle = {
  id: string
  titleTamil: string
  titleEnglish: string
  summary: string
  content: string
  category: NewsCategory
  language: "tamil" | "english" | "bilingual"
  priority: "normal" | "featured" | "breaking"
  imagePreview: string | null // data URL / object URL
  tags: string[]
  metaDescription: string
  publishDate: string // YYYY-MM-DD
  publishTime: string // HH:mm
  notify: boolean
  allowComments: boolean
  pinToTop: boolean
  emailDigest: boolean
  pricing: Pricing
  status: ArticleStatus
  author: { name: string; initials: string }
  createdAt: number
  updatedAt: number
  publishedAt?: number
  views: number
}

/* ---------------------------- Defaults ---------------------------- */

export const DEFAULT_PRICING: Pricing = {
  tier: "free",
  price: 0,
  currency: "INR",
  access: "all-members",
  previewPercent: 100,
  supportNote: "",
}

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  INR: "₹",
  USD: "$",
  SGD: "S$",
  MYR: "RM",
}

export function formatPrice(p: Pricing): string {
  if (p.tier === "free") return "Free"
  return `${CURRENCY_SYMBOL[p.currency]}${p.price.toLocaleString("en-IN")}`
}

/* --------------------------- Vanilla Store --------------------------- */

type State = {
  articles: EditorArticle[]
}

type Listener = () => void

let state: State = { articles: [] }
const listeners = new Set<Listener>()

function emit() {
  listeners.forEach((l) => l())
}

function setState(updater: (s: State) => State) {
  state = updater(state)
  emit()
}

/* --------------------------- Public API --------------------------- */

export const newsStore = {
  getSnapshot: () => state,
  subscribe: (l: Listener) => {
    listeners.add(l)
    return () => listeners.delete(l)
  },

  add(article: EditorArticle) {
    setState((s) => ({ articles: [article, ...s.articles] }))
  },

  update(id: string, patch: Partial<EditorArticle>) {
    setState((s) => ({
      articles: s.articles.map((a) =>
        a.id === id ? { ...a, ...patch, updatedAt: Date.now() } : a,
      ),
    }))
  },

  remove(id: string) {
    setState((s) => ({ articles: s.articles.filter((a) => a.id !== id) }))
  },
}

/* ---------------------------- React hooks ---------------------------- */

export function useArticles(): EditorArticle[] {
  return useSyncExternalStore(
    newsStore.subscribe,
    () => newsStore.getSnapshot().articles,
    () => newsStore.getSnapshot().articles,
  )
}

export function useArticleCounts() {
  const articles = useArticles()
  return {
    total: articles.length,
    published: articles.filter((a) => a.status === "published").length,
    drafts: articles.filter((a) => a.status === "draft").length,
    scheduled: articles.filter((a) => a.status === "scheduled").length,
    paid: articles.filter((a) => a.pricing.tier === "paid").length,
    views: articles.reduce((sum, a) => sum + a.views, 0),
  }
}

/* ---------------------------- Validation ---------------------------- */

export type ValidationError = { field: string; message: string }

export function validateForPublish(a: EditorArticle): ValidationError[] {
  const errs: ValidationError[] = []
  if (!a.titleEnglish.trim() && !a.titleTamil.trim()) {
    errs.push({ field: "title", message: "Add a title in Tamil or English." })
  }
  if (!a.summary.trim()) {
    errs.push({ field: "summary", message: "A one-line summary is required." })
  }
  if (!a.content.trim() || a.content.trim().length < 40) {
    errs.push({ field: "content", message: "Write at least 40 characters of content." })
  }
  if (a.pricing.tier === "paid") {
    if (!a.pricing.price || a.pricing.price <= 0) {
      errs.push({ field: "pricing", message: "Paid articles need a price greater than zero." })
    }
    if (a.pricing.previewPercent < 0 || a.pricing.previewPercent > 100) {
      errs.push({ field: "pricing", message: "Preview must be between 0 and 100 percent." })
    }
  }
  return errs
}

export function validateForDraft(a: EditorArticle): ValidationError[] {
  const errs: ValidationError[] = []
  if (!a.titleEnglish.trim() && !a.titleTamil.trim()) {
    errs.push({
      field: "title",
      message: "Drafts still need a working title in Tamil or English.",
    })
  }
  return errs
}
