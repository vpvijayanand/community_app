"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import {
  Upload,
  X,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Link2,
  Image as ImageIcon,
  Quote,
  List,
  Calendar,
  Clock,
  Rocket,
  Eye,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ToggleSwitch } from "./toggle-switch"
import { PricingSection } from "./pricing-section"
import {
  DEFAULT_PRICING,
  type EditorArticle,
  formatPrice,
  newsStore,
  validateForDraft,
  validateForPublish,
} from "@/lib/news-store"
import type { NewsCategory } from "@/lib/news-data"
import { useTabNav } from "./admin-tabs"

const CHIPS: { key: NewsCategory; label: string; active: { bg: string; border: string; color: string } }[] = [
  { key: "events", label: "Events", active: { bg: "#FCEBEB", border: "#6D211B", color: "#6D211B" } },
  { key: "culture", label: "Culture", active: { bg: "#E1F5EE", border: "#1D9E75", color: "#0F6E56" } },
  { key: "announcements", label: "Announcements", active: { bg: "#FAEEDA", border: "#BA7517", color: "#854F0B" } },
  { key: "learning", label: "Learning", active: { bg: "#EEEDFE", border: "#534AB7", color: "#3C3489" } },
  { key: "astrology", label: "Astrology", active: { bg: "#F2EDE8", border: "#7A6A60", color: "#7A6A60" } },
]

function SectionCard({
  title,
  subtitle,
  badge,
  children,
}: {
  title: string
  subtitle?: string
  badge?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-border-light bg-bg-white p-6">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-text-primary">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-[13px] text-text-muted">{subtitle}</p>
          )}
        </div>
        {badge}
      </header>
      {children}
    </section>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
      {children}
    </span>
  )
}

const fieldClass =
  "w-full rounded-lg border-[1.5px] border-border-light bg-bg-page px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-primary focus:bg-bg-white focus:outline-none"

/* ---------- Initial form state ---------- */

const emptyArticle = (): EditorArticle => ({
  id: `a_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  titleTamil: "",
  titleEnglish: "",
  summary: "",
  content: "",
  category: "events",
  language: "tamil",
  priority: "normal",
  imagePreview: null,
  tags: [],
  metaDescription: "",
  publishDate: "2026-04-22",
  publishTime: "09:00",
  notify: true,
  allowComments: true,
  pinToTop: false,
  emailDigest: true,
  pricing: { ...DEFAULT_PRICING },
  status: "draft",
  author: { name: "Editorial Desk", initials: "ED" },
  createdAt: Date.now(),
  updatedAt: Date.now(),
  views: 0,
})

type SaveState = "idle" | "saving" | "saved"

export function CreateArticleForm() {
  const navTo = useTabNav()
  const [article, setArticle] = useState<EditorArticle>(() => emptyArticle())
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<null | "draft" | "publish">(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const draftIdRef = useRef<string | null>(null)
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dirtyRef = useRef(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const update = useCallback(<K extends keyof EditorArticle>(key: K, value: EditorArticle[K]) => {
    dirtyRef.current = true
    setArticle((prev) => ({ ...prev, [key]: value, updatedAt: Date.now() }))
  }, [])

  /* ------------------- Auto-save (debounced) ------------------- */
  useEffect(() => {
    if (!dirtyRef.current) return
    if (!article.titleEnglish.trim() && !article.titleTamil.trim()) return // nothing meaningful yet

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    setSaveState("saving")

    autosaveTimer.current = setTimeout(() => {
      const id = draftIdRef.current
      if (id) {
        newsStore.update(id, { ...article, status: "draft" })
      } else {
        const draft = { ...article, status: "draft" as const }
        draftIdRef.current = draft.id
        newsStore.add(draft)
      }
      setSaveState("saved")
      setLastSavedAt(Date.now())
      dirtyRef.current = false
    }, 1200)

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    }
  }, [article])

  /* ------------------- Image upload ------------------- */
  const onFiles = (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("That file doesn't look like an image.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is larger than 5MB. Please compress it first.")
      return
    }
    const url = URL.createObjectURL(file)
    update("imagePreview", url)
  }

  /* ------------------- Actions ------------------- */

  const resetForm = () => {
    draftIdRef.current = null
    setArticle(emptyArticle())
    setFieldErrors({})
    setSaveState("idle")
    setLastSavedAt(null)
    dirtyRef.current = false
  }

  const handleSaveDraft = async () => {
    const errs = validateForDraft(article)
    if (errs.length) {
      const map: Record<string, string> = {}
      errs.forEach((e) => (map[e.field] = e.message))
      setFieldErrors(map)
      toast.error(errs[0].message)
      return
    }
    setFieldErrors({})
    setIsSubmitting("draft")
    try {
      const draft: EditorArticle = { ...article, status: "draft", updatedAt: Date.now() }
      if (draftIdRef.current) {
        newsStore.update(draftIdRef.current, draft)
      } else {
        newsStore.add(draft)
        draftIdRef.current = draft.id
      }
      await new Promise((r) => setTimeout(r, 350))
      setLastSavedAt(Date.now())
      setSaveState("saved")
      toast.success("Draft saved", {
        description: "You can keep editing or publish whenever you're ready.",
        action: { label: "View drafts", onClick: () => navTo("manage") },
      })
    } finally {
      setIsSubmitting(null)
    }
  }

  const handlePublish = async () => {
    const errs = validateForPublish(article)
    if (errs.length) {
      const map: Record<string, string> = {}
      errs.forEach((e) => (map[e.field] = e.message))
      setFieldErrors(map)
      toast.error("Please fix a few things before publishing", {
        description: errs[0].message,
      })
      return
    }
    setFieldErrors({})
    setIsSubmitting("publish")
    try {
      const published: EditorArticle = {
        ...article,
        status: "published",
        publishedAt: Date.now(),
        updatedAt: Date.now(),
      }
      if (draftIdRef.current) {
        newsStore.update(draftIdRef.current, published)
      } else {
        newsStore.add(published)
      }
      await new Promise((r) => setTimeout(r, 500))
      toast.success("Article published", {
        description:
          article.pricing.tier === "paid"
            ? `Live as a ${formatPrice(article.pricing)} premium read.`
            : "Live and free to read for the community.",
      })
      resetForm()
      navTo("manage")
    } finally {
      setIsSubmitting(null)
    }
  }

  /* ------------------- Save indicator ------------------- */
  const savedLabel = useMemo(() => {
    if (saveState === "saving") return "Saving…"
    if (saveState === "saved" && lastSavedAt) {
      const s = Math.round((Date.now() - lastSavedAt) / 1000)
      if (s < 5) return "Saved just now"
      if (s < 60) return `Saved ${s}s ago`
      return `Saved ${Math.round(s / 60)}m ago`
    }
    return "Not saved yet"
  }, [saveState, lastSavedAt])

  const pricingError = fieldErrors["pricing"]

  return (
    <div className="mx-auto max-w-[900px] space-y-5 px-4 pb-28 md:px-8 md:pb-10">
      {/* Auto-save status strip */}
      <div className="flex items-center justify-between rounded-xl border border-border-light bg-bg-white px-4 py-2.5">
        <div className="flex items-center gap-2 text-[13px] font-medium text-text-secondary">
          {saveState === "saving" ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : saveState === "saved" ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : (
            <AlertCircle className="h-4 w-4 text-text-muted" />
          )}
          <span>{savedLabel}</span>
        </div>
        <div className="text-[11px] uppercase tracking-[0.14em] text-text-muted">
          Autosave on
        </div>
      </div>

      {/* Featured image */}
      <SectionCard
        title="Featured Image"
        subtitle="This is the first thing your readers will see."
      >
        {article.imagePreview ? (
          <div className="relative overflow-hidden rounded-xl border border-border-light bg-bg-subtle">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.imagePreview}
              alt="Featured preview"
              className="h-64 w-full object-cover"
            />
            <button
              type="button"
              onClick={() => update("imagePreview", null)}
              className="absolute right-3 top-3 inline-flex h-8 items-center gap-1.5 rounded-full bg-white/95 px-3 text-[12px] font-semibold text-text-primary shadow hover:bg-danger hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              onFiles(e.dataTransfer.files)
            }}
            className={cn(
              "rounded-xl border-2 border-dashed p-10 text-center transition-colors hover:border-primary hover:bg-accent-light/60",
              fieldErrors["image"]
                ? "border-danger/60 bg-[#FCEBEB]/40"
                : "border-primary/25 bg-bg-subtle",
            )}
          >
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-bg-white text-text-muted">
              <Upload className="h-5 w-5" />
            </div>
            <div className="mt-4 text-sm font-medium text-text-primary">
              Drag and drop your image here
            </div>
            <div className="mt-1 text-[12px] text-text-muted">
              Supports JPG, PNG, WebP — max 5MB
            </div>
            <div className="mx-auto my-4 flex max-w-[180px] items-center gap-3 text-[11px] uppercase tracking-wider text-text-muted">
              <span className="h-px flex-1 bg-border-light" /> or{" "}
              <span className="h-px flex-1 bg-border-light" />
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex h-10 items-center rounded-lg border-[1.5px] border-primary px-5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Browse Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFiles(e.target.files)}
            />
            {fieldErrors["image"] && (
              <div className="mt-3 text-[12px] font-medium text-danger">
                {fieldErrors["image"]}
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {/* Category */}
      <SectionCard
        title="Article Category"
        subtitle="Choose the primary category. This colors the card and badge."
      >
        <Label>Select Category</Label>
        <div className="flex flex-wrap gap-2">
          {CHIPS.map((c) => {
            const active = c.key === article.category
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => update("category", c.key)}
                className={cn(
                  "rounded-full border-[1.5px] px-4 py-2 text-[13px] font-medium transition-all",
                  !active &&
                    "border-border-light bg-bg-subtle text-text-secondary hover:border-border-medium",
                )}
                style={
                  active
                    ? {
                        backgroundColor: c.active.bg,
                        borderColor: c.active.border,
                        color: c.active.color,
                      }
                    : undefined
                }
              >
                {c.label}
              </button>
            )
          })}
        </div>
      </SectionCard>

      {/* Article details */}
      <SectionCard title="Article Details" subtitle="Tell the story.">
        <div className="space-y-4">
          <div>
            <Label>Title — Tamil</Label>
            <input
              type="text"
              value={article.titleTamil}
              onChange={(e) => update("titleTamil", e.target.value)}
              placeholder="மாதத் குல மகாநாடு 2025"
              className={cn(
                fieldClass,
                "font-tamil text-base",
                fieldErrors["title"] && "border-danger/60",
              )}
            />
          </div>
          <div>
            <Label>Title — English</Label>
            <input
              type="text"
              value={article.titleEnglish}
              onChange={(e) => update("titleEnglish", e.target.value)}
              placeholder="Mathat Kula Mahanadu 2025"
              className={cn(fieldClass, fieldErrors["title"] && "border-danger/60")}
            />
            {fieldErrors["title"] && (
              <div className="mt-1.5 text-[12px] font-medium text-danger">
                {fieldErrors["title"]}
              </div>
            )}
          </div>
          <div>
            <Label>Subtitle / Summary</Label>
            <input
              type="text"
              value={article.summary}
              onChange={(e) => update("summary", e.target.value)}
              placeholder="A one-line summary that appears below the headline…"
              className={cn(fieldClass, fieldErrors["summary"] && "border-danger/60")}
            />
            {fieldErrors["summary"] && (
              <div className="mt-1.5 text-[12px] font-medium text-danger">
                {fieldErrors["summary"]}
              </div>
            )}
          </div>

          <div>
            <Label>Full Content</Label>
            <div className="flex flex-wrap items-center gap-1 rounded-t-lg border-[1.5px] border-b-0 border-border-light bg-bg-subtle px-2.5 py-2">
              {[
                { Icon: Bold, label: "Bold" },
                { Icon: Italic, label: "Italic" },
                { Icon: Underline, label: "Underline" },
                { divider: true },
                { Icon: Heading1, label: "H1" },
                { Icon: Heading2, label: "H2" },
                { divider: true },
                { Icon: Link2, label: "Link" },
                { Icon: ImageIcon, label: "Image" },
                { Icon: Quote, label: "Quote" },
                { Icon: List, label: "List" },
              ].map((t, i) =>
                "divider" in t ? (
                  <span key={i} className="mx-1 h-5 w-px bg-border-medium" />
                ) : (
                  <button
                    key={i}
                    type="button"
                    aria-label={t.label}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border-light bg-bg-white text-text-secondary transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <t.Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </button>
                ),
              )}
            </div>
            <textarea
              value={article.content}
              onChange={(e) => update("content", e.target.value)}
              placeholder="Write your article here. Tamil & English welcome — be warm, be specific, be true."
              className={cn(
                "min-h-[220px] w-full resize-y rounded-b-lg border-[1.5px] border-t-0 bg-bg-white px-4 py-3.5 text-sm leading-relaxed text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none",
                fieldErrors["content"] ? "border-danger/60" : "border-border-light",
              )}
            />
            <div className="mt-1 flex justify-between text-[11px] text-text-muted">
              <span>
                {fieldErrors["content"] && (
                  <span className="font-medium text-danger">
                    {fieldErrors["content"]}
                  </span>
                )}
              </span>
              <span>{article.content.trim().length} chars</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Language</Label>
              <select
                value={article.language}
                onChange={(e) =>
                  update("language", e.target.value as EditorArticle["language"])
                }
                className={fieldClass}
              >
                <option value="tamil">Tamil (தமிழ்)</option>
                <option value="english">English</option>
                <option value="bilingual">Bilingual</option>
              </select>
            </div>
            <div>
              <Label>Priority</Label>
              <select
                value={article.priority}
                onChange={(e) =>
                  update("priority", e.target.value as EditorArticle["priority"])
                }
                className={fieldClass}
              >
                <option value="normal">Normal</option>
                <option value="featured">Featured ★</option>
                <option value="breaking">Breaking ●</option>
              </select>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* PRICING & MONETIZATION */}
      <SectionCard
        title="Pricing & Access"
        subtitle="Keep it free, or make it a paid premium read for supporters."
        badge={
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em]",
              article.pricing.tier === "paid"
                ? "bg-[#FAEEDA] text-[#854F0B]"
                : "bg-[#E1F5EE] text-[#0F6E56]",
            )}
          >
            {article.pricing.tier === "paid"
              ? `Premium · ${formatPrice(article.pricing)}`
              : "Free"}
          </span>
        }
      >
        <PricingSection
          value={article.pricing}
          onChange={(next) => update("pricing", next)}
          error={pricingError}
        />
      </SectionCard>

      {/* Publishing options */}
      <SectionCard title="Publishing Options" subtitle="When and how this goes live.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Publish Date</Label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="date"
                value={article.publishDate}
                onChange={(e) => update("publishDate", e.target.value)}
                className={cn(fieldClass, "pl-10")}
              />
            </div>
          </div>
          <div>
            <Label>Publish Time</Label>
            <div className="relative">
              <Clock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="time"
                value={article.publishTime}
                onChange={(e) => update("publishTime", e.target.value)}
                className={cn(fieldClass, "pl-10")}
              />
            </div>
          </div>
        </div>

        <div className="mt-2">
          <ToggleSwitch
            title="Send push notification"
            description="Notify all community members when this is live"
            checked={article.notify}
            onCheckedChange={(v) => update("notify", v)}
          />
          <ToggleSwitch
            title="Allow comments"
            description="Members can comment on this article"
            checked={article.allowComments}
            onCheckedChange={(v) => update("allowComments", v)}
          />
          <ToggleSwitch
            title="Pin to top of feed"
            description="Always show this first in the news feed"
            checked={article.pinToTop}
            onCheckedChange={(v) => update("pinToTop", v)}
          />
          <ToggleSwitch
            title="Send email digest"
            description="Include this in the weekly community email"
            checked={article.emailDigest}
            onCheckedChange={(v) => update("emailDigest", v)}
            last
          />
        </div>
      </SectionCard>

      {/* Tags & SEO */}
      <SectionCard title="Tags & SEO" subtitle="Help readers discover this article.">
        <div className="space-y-4">
          <div>
            <Label>Tags (comma separated)</Label>
            <input
              type="text"
              value={article.tags.join(", ")}
              onChange={(e) =>
                update(
                  "tags",
                  e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                )
              }
              placeholder="marriage, festival, madurai, family..."
              className={fieldClass}
            />
          </div>
          <div>
            <Label>Meta Description</Label>
            <textarea
              maxLength={160}
              value={article.metaDescription}
              onChange={(e) => update("metaDescription", e.target.value)}
              placeholder="A concise summary for search engines and social previews."
              className={cn(fieldClass, "min-h-[80px] resize-y")}
            />
            <div className="mt-1 flex justify-end text-[11px] text-text-muted">
              {article.metaDescription.length} / 160
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Actions — sticky on mobile */}
      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-end gap-3 border-t border-border-light bg-bg-white px-4 py-4 md:static md:-mx-0 md:rounded-xl md:border md:px-6">
        <div className="mr-auto hidden min-w-0 items-center gap-2 text-[12px] text-text-muted md:flex">
          {saveState === "saving" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
          )}
          <span className="truncate">{savedLabel}</span>
        </div>
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={isSubmitting !== null}
          className="inline-flex h-11 items-center gap-2 rounded-lg border-[1.5px] border-border-medium bg-transparent px-5 text-sm font-semibold text-text-secondary transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting === "draft" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Draft
        </button>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-lg border-[1.5px] border-primary bg-transparent px-5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
          onClick={() =>
            toast.info("Preview opens in a new tab once you save a draft.")
          }
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>
        <button
          type="button"
          onClick={handlePublish}
          disabled={isSubmitting !== null}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting === "publish" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Rocket className="h-4 w-4" />
          )}
          Publish Now
        </button>
      </div>
    </div>
  )
}
