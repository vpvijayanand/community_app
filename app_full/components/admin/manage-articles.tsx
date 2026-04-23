"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { toast } from "sonner"
import {
  Search,
  Filter,
  Calendar,
  Eye,
  Pencil,
  Copy,
  Trash2,
  Gift,
  Lock,
  Rocket,
} from "lucide-react"
import { ARTICLES, CATEGORY_META, FEATURED, type NewsCategory } from "@/lib/news-data"
import {
  formatPrice,
  newsStore,
  useArticles,
  type ArticleStatus,
  type Pricing,
  DEFAULT_PRICING,
} from "@/lib/news-store"
import { cn } from "@/lib/utils"

type Row = {
  id: string
  titleEnglish: string
  titleTamil?: string
  category: NewsCategory
  image?: string | null
  status: ArticleStatus
  views: number
  date: string
  pricing: Pricing
  isLive: boolean // from store (editable) vs seed
  updatedAt?: number
}

const STATUS_STYLES: Record<ArticleStatus, { bg: string; color: string; dot: string; label: string }> = {
  published: { bg: "#EAF3DE", color: "#3B6D11", dot: "#3B6D11", label: "Published" },
  draft: { bg: "#F2EDE8", color: "#7A6A60", dot: "#7A6A60", label: "Draft" },
  scheduled: { bg: "#EEEDFE", color: "#3C3489", dot: "#534AB7", label: "Scheduled" },
}

const SEED_ROWS: Row[] = [
  { ...FEATURED, status: "published", pricing: DEFAULT_PRICING, isLive: false },
  { ...ARTICLES[0], status: "published", pricing: DEFAULT_PRICING, isLive: false },
  {
    ...ARTICLES[1],
    status: "scheduled",
    pricing: { ...DEFAULT_PRICING, tier: "paid", price: 99, previewPercent: 25 },
    isLive: false,
  },
  { ...ARTICLES[2], status: "draft", pricing: DEFAULT_PRICING, isLive: false },
  { ...ARTICLES[3], status: "published", pricing: DEFAULT_PRICING, isLive: false },
  {
    ...ARTICLES[4],
    status: "draft",
    pricing: { ...DEFAULT_PRICING, tier: "paid", price: 249, previewPercent: 30 },
    isLive: false,
  },
]

type StatusFilter = "all" | ArticleStatus

export function ManageArticles() {
  const articles = useArticles()
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  const rows: Row[] = useMemo(() => {
    const live: Row[] = articles.map((a) => ({
      id: a.id,
      titleEnglish: a.titleEnglish || a.titleTamil || "(Untitled)",
      titleTamil: a.titleTamil || undefined,
      category: a.category,
      image: a.imagePreview,
      status: a.status,
      views: a.views,
      date: new Date(a.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      pricing: a.pricing,
      isLive: true,
      updatedAt: a.updatedAt,
    }))
    return [...live, ...SEED_ROWS]
  }, [articles])

  const filtered = rows.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      r.titleEnglish.toLowerCase().includes(q) ||
      (r.titleTamil || "").toLowerCase().includes(q)
    )
  })

  const handlePublishDraft = (id: string) => {
    newsStore.update(id, { status: "published", publishedAt: Date.now() })
    toast.success("Draft published", {
      description: "The article is now live in the community feed.",
    })
  }

  const handleDelete = (row: Row) => {
    if (!row.isLive) {
      toast.error("Seed articles cannot be deleted in this demo.")
      return
    }
    newsStore.remove(row.id)
    toast.success("Article deleted", { description: `"${row.titleEnglish}" removed.` })
  }

  const handleDuplicate = (row: Row) => {
    if (!row.isLive) {
      toast.info("Duplicate is only enabled for drafts you create.")
      return
    }
    const source = articles.find((a) => a.id === row.id)
    if (!source) return
    newsStore.add({
      ...source,
      id: `a_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      titleEnglish: `${source.titleEnglish} (copy)`,
      status: "draft",
      publishedAt: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      views: 0,
    })
    toast.success("Duplicated as draft")
  }

  return (
    <div className="px-4 pb-10 md:px-8">
      {/* Search + filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-border-light bg-bg-white p-3">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles..."
            className="h-10 w-full rounded-lg border border-border-light bg-bg-page pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:bg-bg-white focus:outline-none"
          />
        </div>
        <div className="inline-flex rounded-lg border border-border-light bg-bg-page p-1">
          {(["all", "published", "draft", "scheduled"] as StatusFilter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={cn(
                "h-8 rounded-md px-3 text-[12px] font-semibold capitalize transition-all",
                statusFilter === f
                  ? "bg-bg-white text-primary shadow-sm"
                  : "text-text-muted hover:text-text-primary",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-border-light bg-bg-white px-3 text-[13px] font-medium text-text-secondary transition-colors hover:border-primary hover:text-primary"
        >
          <Filter className="h-4 w-4" />
          All Categories
        </button>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-border-light bg-bg-white px-3 text-[13px] font-medium text-text-secondary transition-colors hover:border-primary hover:text-primary"
        >
          <Calendar className="h-4 w-4" />
          Date range
        </button>
      </div>

      {/* Rows */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-medium bg-bg-white p-12 text-center">
          <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-bg-subtle text-text-muted">
            <Search className="h-4 w-4" />
          </div>
          <div className="text-sm font-semibold text-text-primary">No articles found</div>
          <div className="mt-1 text-[13px] text-text-muted">
            Try a different search term or change the status filter.
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((row) => {
            const meta = CATEGORY_META[row.category]
            const s = STATUS_STYLES[row.status]
            const isPaid = row.pricing.tier === "paid"
            return (
              <div
                key={row.id + row.status}
                className="flex flex-wrap items-start gap-4 rounded-xl border border-border-light bg-bg-white p-4 transition-colors hover:bg-bg-subtle/60"
              >
                <div
                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg"
                  style={{ backgroundColor: meta.thumbBg }}
                >
                  {row.image &&
                    (row.isLive ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={row.image}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <Image
                        src={row.image}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ))}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
                      style={{ backgroundColor: meta.badgeBg, color: meta.textColor }}
                    >
                      {meta.label}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]",
                        isPaid
                          ? "bg-[#FAEEDA] text-[#854F0B]"
                          : "bg-[#E1F5EE] text-[#0F6E56]",
                      )}
                    >
                      {isPaid ? (
                        <>
                          <Lock className="h-2.5 w-2.5" />
                          {formatPrice(row.pricing)}
                        </>
                      ) : (
                        <>
                          <Gift className="h-2.5 w-2.5" />
                          Free
                        </>
                      )}
                    </span>
                  </div>
                  <h4 className="mt-1.5 text-sm font-semibold text-text-primary line-clamp-1">
                    {row.titleEnglish}
                  </h4>
                  {row.titleTamil && (
                    <div className="mt-0.5 font-tamil text-[13px] text-text-secondary line-clamp-1">
                      {row.titleTamil}
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-text-muted">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]"
                      style={{ backgroundColor: s.bg, color: s.color }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: s.dot }}
                      />
                      {s.label}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {row.views.toLocaleString()} views
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {row.date}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 self-center">
                  {row.isLive && row.status === "draft" && (
                    <button
                      type="button"
                      onClick={() => handlePublishDraft(row.id)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-2.5 text-[12px] font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
                    >
                      <Rocket className="h-3.5 w-3.5" />
                      Publish
                    </button>
                  )}
                  {[
                    {
                      Icon: Eye,
                      label: "View",
                      cls: "hover:bg-[#E1F5EE] hover:text-[#0F6E56] hover:border-[#1D9E75]",
                      onClick: () => toast.info("Preview opens the public article view."),
                    },
                    {
                      Icon: Pencil,
                      label: "Edit",
                      cls: "hover:bg-[#FCEBEB] hover:text-primary hover:border-primary",
                      onClick: () =>
                        toast.info("Editing an existing article is coming soon."),
                    },
                    {
                      Icon: Copy,
                      label: "Duplicate",
                      cls: "hover:bg-bg-subtle hover:text-text-primary",
                      onClick: () => handleDuplicate(row),
                    },
                    {
                      Icon: Trash2,
                      label: "Delete",
                      cls: "hover:bg-[#FCEBEB] hover:text-danger hover:border-danger",
                      onClick: () => handleDelete(row),
                    },
                  ].map(({ Icon, label, cls, onClick }) => (
                    <button
                      key={label}
                      type="button"
                      aria-label={label}
                      onClick={onClick}
                      className={cn(
                        "inline-flex h-8 items-center gap-1.5 rounded-md border border-border-light bg-transparent px-2.5 text-[12px] font-semibold text-text-secondary transition-colors",
                        cls,
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="hidden md:inline">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
