/**
 * Zod schemas for every request body across the API. Controllers call
 * `schema.parse(req.body)` and rely on the validation middleware to
 * turn ZodError into a 422 envelope.
 */

import { z } from "zod"

export const CATEGORY = z.enum([
  "events",
  "culture",
  "announcements",
  "learning",
  "astrology",
])

export const PricingSchema = z.object({
  tier: z.enum(["free", "paid"]).default("free"),
  price: z.number().min(0).default(0),
  currency: z.enum(["INR", "USD", "SGD", "MYR"]).default("INR"),
  access: z
    .enum(["all-members", "paid-members", "life-members"])
    .default("all-members"),
  previewPercent: z.number().int().min(0).max(100).default(100),
  supportNote: z.string().max(500).optional().nullable(),
})

export const FlagsSchema = z.object({
  pinned: z.boolean().optional(),
  featured: z.boolean().optional(),
  allowComments: z.boolean().optional(),
  notifySubscribers: z.boolean().optional(),
  emailDigest: z.boolean().optional(),
})

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(120),
  tamilName: z.string().max(120).optional(),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const UpdateProfileSchema = z.object({
  displayName: z.string().min(1).max(120).optional(),
  tamilName: z.string().max(120).optional(),
  avatarUrl: z.string().url().optional(),
})

export const ArticleCreateSchema = z.object({
  slug: z.string().optional(),
  titleEnglish: z.string().min(1).max(240),
  titleTamil: z.string().max(240).optional().nullable(),
  summary: z.string().max(600).default(""),
  content: z.string().default(""),
  category: CATEGORY,
  language: z.enum(["tamil", "english", "bilingual"]).optional(),
  priority: z.enum(["normal", "featured", "breaking"]).optional(),
  imageUrl: z.string().optional().nullable(),
  metaDescription: z.string().max(300).optional().nullable(),
  readMinutes: z.number().int().min(0).max(120).optional(),
  scheduledFor: z.string().datetime().optional().nullable(),
  pricing: PricingSchema.optional(),
  flags: FlagsSchema.optional(),
  tags: z.array(z.string().min(1).max(48)).max(12).optional(),
  status: z.enum(["draft", "scheduled", "published"]).optional(),
})

export const ArticleUpdateSchema = ArticleCreateSchema.partial()

export const DraftSaveSchema = z.object({
  id: z.string().uuid().optional(),
  articleId: z.string().uuid().optional().nullable(),
  payload: z.record(z.any()),
})

export const ProgressSchema = z.object({
  percent: z.number().min(0).max(100),
})

export const PublishSchema = z.object({
  scheduledFor: z.string().datetime().optional().nullable(),
})
