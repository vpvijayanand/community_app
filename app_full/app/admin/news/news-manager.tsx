"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import {
  Plus, X, Eye, Trash2, Pencil, ImagePlus,
  Tag, Bell, MessageSquare, Pin, Mail, DollarSign,
  BarChart3, FileText, Send, Clock, Check, AlertCircle,
} from "lucide-react"

import {
  ARTICLES, FEATURED, CATEGORY_META,
  type NewsCategory,
} from "@/lib/news-data"
import {
  newsStore, useArticles, useArticleCounts,
  validateForPublish, validateForDraft,
  DEFAULT_PRICING,
  type EditorArticle, type ArticleStatus,
} from "@/lib/news-store"

/* ─────────────── helpers ─────────────── */

function uid() { return Math.random().toString(36).slice(2, 10) }
function today() { return new Date().toISOString().slice(0, 10) }
function nowTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

function blankArticle(): EditorArticle {
  return {
    id: uid(), titleTamil: "", titleEnglish: "", summary: "", content: "",
    category: "announcements", language: "english", priority: "normal",
    imagePreview: null, tags: [], metaDescription: "",
    publishDate: today(), publishTime: nowTime(),
    notify: true, allowComments: true, pinToTop: false, emailDigest: false,
    pricing: { ...DEFAULT_PRICING },
    status: "draft",
    author: { name: "Admin", initials: "A" },
    createdAt: Date.now(), updatedAt: Date.now(), views: 0,
  }
}

/* ─────────────── Small UI pieces ─────────────── */

function StatusBadge({ status }: { status: ArticleStatus }) {
  const map: Record<ArticleStatus, { label: string; cls: string }> = {
    published: { label: "Published", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    draft:     { label: "Draft",     cls: "bg-slate-100  text-slate-600  border-slate-200"  },
    scheduled: { label: "Scheduled", cls: "bg-amber-100  text-amber-700  border-amber-200"  },
  }
  const { label, cls } = map[status]
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>{label}</span>
}

function CatBadge({ category }: { category: NewsCategory }) {
  const m = CATEGORY_META[category]
  return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: m.badgeBg, color: m.textColor }}>{m.label}</span>
}

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string | number; icon: React.ElementType; accent?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${accent ?? "bg-slate-100"}`}>
        <Icon className={`h-5 w-5 ${accent ? "text-white" : "text-slate-600"}`} />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  )
}

/* ─────────────── Article Editor Slide-in ─────────────── */

function ArticleEditor({ initial, onClose }: { initial: EditorArticle; onClose: () => void }) {
  const [form, setForm] = useState<EditorArticle>(initial)
  const [tagInput, setTagInput] = useState("")
  const [errors, setErrors] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const set = useCallback((patch: Partial<EditorArticle>) => { setForm(f => ({ ...f, ...patch })); setErrors([]) }, [])

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => set({ imagePreview: reader.result as string })
    reader.readAsDataURL(file)
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase()
    if (t && !form.tags.includes(t)) set({ tags: [...form.tags, t] })
    setTagInput("")
  }

  function handleSave(targetStatus: ArticleStatus) {
    const errs = targetStatus === "published" ? validateForPublish(form) : validateForDraft(form)
    if (errs.length) { setErrors(errs.map(e => e.message)); return }
    const now = Date.now()
    const article: EditorArticle = { ...form, status: targetStatus, updatedAt: now, publishedAt: targetStatus === "published" ? now : form.publishedAt }
    const existing = newsStore.getSnapshot().articles.find(a => a.id === form.id)
    if (existing) newsStore.update(form.id, article)
    else newsStore.add(article)
    onClose()
  }

  const cats: NewsCategory[] = ["events", "culture", "announcements", "learning", "astrology"]

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex w-full max-w-2xl flex-col bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Editorial Workspace</p>
            <h2 className="mt-0.5 text-lg font-bold text-white">{form.titleEnglish || form.titleTamil || "New Article"}</h2>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {errors.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2 mb-1"><AlertCircle className="h-4 w-4 text-red-500" /><p className="text-sm font-semibold text-red-700">Fix these issues:</p></div>
              {errors.map((e, i) => <p key={i} className="text-xs text-red-600 ml-6">• {e}</p>)}
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">English Title</label>
              <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none" placeholder="Title in English…" value={form.titleEnglish} onChange={e => set({ titleEnglish: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Tamil Title</label>
              <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none" placeholder="தமிழில் தலைப்பு…" value={form.titleTamil} onChange={e => set({ titleTamil: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Summary / Excerpt</label>
            <textarea rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm resize-none focus:border-rose-400 focus:outline-none" placeholder="One line summary…" value={form.summary} onChange={e => set({ summary: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Content</label>
            <textarea rows={7} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm resize-y focus:border-rose-400 focus:outline-none" placeholder="Article body… (blank line = new paragraph)" value={form.content} onChange={e => set({ content: e.target.value })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Category</label>
              <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.category} onChange={e => set({ category: e.target.value as NewsCategory })}>
                {cats.map(c => <option key={c} value={c}>{CATEGORY_META[c].label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Language</label>
              <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.language} onChange={e => set({ language: e.target.value as EditorArticle["language"] })}>
                <option value="english">English</option><option value="tamil">Tamil</option><option value="bilingual">Bilingual</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Priority</label>
              <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.priority} onChange={e => set({ priority: e.target.value as EditorArticle["priority"] })}>
                <option value="normal">Normal</option><option value="featured">Featured</option><option value="breaking">Breaking</option>
              </select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Publish Date</label>
              <input type="date" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.publishDate} onChange={e => set({ publishDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Publish Time</label>
              <input type="time" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.publishTime} onChange={e => set({ publishTime: e.target.value })} />
            </div>
          </div>
          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.tags.map(t => (
                <span key={t} className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                  {t}<button onClick={() => set({ tags: form.tags.filter(x => x !== t) })} className="text-slate-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm" placeholder="Add tag…" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag() } }} />
              <button type="button" onClick={addTag} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Add</button>
            </div>
          </div>
          {/* Image */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Featured Image</label>
            {form.imagePreview ? (
              <div className="relative h-36 rounded-xl overflow-hidden border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.imagePreview} alt="" className="h-full w-full object-cover" />
                <button onClick={() => set({ imagePreview: null })} className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-rose-400 hover:text-rose-500 transition">
                <ImagePlus className="h-6 w-6" /><span className="text-xs font-medium">Upload image</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          </div>
          {/* Options toggles */}
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Options</p>
            <div className="space-y-2">
              {[
                { key: "notify", label: "Notify members on publish", icon: Bell },
                { key: "allowComments", label: "Allow comments", icon: MessageSquare },
                { key: "pinToTop", label: "Pin to top of feed", icon: Pin },
                { key: "emailDigest", label: "Include in email digest", icon: Mail },
              ].map(({ key, label, icon: Icon }) => (
                <label key={key} className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 hover:bg-slate-100 transition">
                  <span className="flex items-center gap-2 text-sm text-slate-700"><Icon className="h-3.5 w-3.5 text-slate-500" />{label}</span>
                  <input type="checkbox" className="h-4 w-4 rounded accent-rose-500" checked={(form as Record<string, unknown>)[key] as boolean} onChange={e => set({ [key]: e.target.checked } as Partial<EditorArticle>)} />
                </label>
              ))}
            </div>
          </div>
          {/* Pricing */}
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Pricing</p>
            <div className="flex gap-2 mb-3">
              {(["free", "paid"] as const).map(t => (
                <button key={t} type="button" onClick={() => set({ pricing: { ...form.pricing, tier: t } })}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${form.pricing.tier === t ? "border-rose-500 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
                  {t === "free" ? "Free" : "Paid"}
                </button>
              ))}
            </div>
            {form.pricing.tier === "paid" && (
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Currency</label>
                  <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.pricing.currency} onChange={e => set({ pricing: { ...form.pricing, currency: e.target.value as any } })}>
                    {(["INR", "USD", "SGD", "MYR"] as const).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Price</label>
                  <input type="number" min={0} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.pricing.price} onChange={e => set({ pricing: { ...form.pricing, price: Number(e.target.value) } })} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Preview %</label>
                  <input type="number" min={0} max={100} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.pricing.previewPercent} onChange={e => set({ pricing: { ...form.pricing, previewPercent: Number(e.target.value) } })} />
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Footer */}
        <div className="flex items-center gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button type="button" onClick={() => handleSave("published")} className="flex items-center gap-2 rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 transition">
            <Send className="h-4 w-4" />Publish
          </button>
          <button type="button" onClick={() => handleSave("scheduled")} className="flex items-center gap-2 rounded-lg border border-amber-400 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition">
            <Clock className="h-4 w-4" />Schedule
          </button>
          <button type="button" onClick={() => handleSave("draft")} className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
            <FileText className="h-4 w-4" />Save Draft
          </button>
          <button type="button" onClick={onClose} className="ml-auto rounded-lg px-4 py-2.5 text-sm text-slate-500 hover:text-slate-700 transition">Cancel</button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────── Delete Confirm Dialog ─────────────── */

function DeleteDialog({ title, onConfirm, onCancel }: { title: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4"><Trash2 className="h-6 w-6 text-red-600" /></div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Delete article?</h3>
        <p className="text-sm text-slate-500 mb-6"><span className="font-medium text-slate-700">"{title}"</span> will be permanently removed.</p>
        <div className="flex gap-3">
          <button onClick={onConfirm} className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition">Delete</button>
          <button onClick={onCancel} className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Cancel</button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────── Seed row (read-only) ─────────────── */

function SeedRow({ article }: { article: (typeof ARTICLES)[0] }) {
  const m = CATEGORY_META[article.category]
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
      <td className="px-6 py-4 max-w-xs">
        <p className="font-semibold text-slate-900 truncate">{article.titleEnglish}</p>
        {article.titleTamil && <p className="text-xs text-slate-500 truncate">{article.titleTamil}</p>}
      </td>
      <td className="px-6 py-4"><span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: m.badgeBg, color: m.textColor }}>{m.label}</span></td>
      <td className="px-6 py-4"><StatusBadge status="published" /></td>
      <td className="px-6 py-4 text-sm text-slate-500">{article.date}</td>
      <td className="px-6 py-4 text-sm text-slate-500">{article.views.toLocaleString()}</td>
      <td className="px-6 py-4"><span className="text-xs text-slate-400 italic">Seed article</span></td>
    </tr>
  )
}

/* ─────────────── Main interactive news editor ─────────────── */

type Filter = "all" | ArticleStatus

export function NewsManager() {
  const articles = useArticles()
  const counts = useArticleCounts()
  const [filter, setFilter] = useState<Filter>("all")
  const [catFilter, setCatFilter] = useState<NewsCategory | "all">("all")
  const [editorArticle, setEditorArticle] = useState<EditorArticle | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EditorArticle | null>(null)

  const openNew = () => setEditorArticle(blankArticle())
  const openEdit = (a: EditorArticle) => setEditorArticle({ ...a })
  const confirmDelete = () => { if (deleteTarget) { newsStore.remove(deleteTarget.id); setDeleteTarget(null) } }

  const filteredUser = articles.filter(a => {
    if (filter !== "all" && a.status !== filter) return false
    if (catFilter !== "all" && a.category !== catFilter) return false
    return true
  })

  const seedArticles = [FEATURED, ...ARTICLES].filter(a => catFilter === "all" || a.category === catFilter)
  const cats: NewsCategory[] = ["events", "culture", "announcements", "learning", "astrology"]

  return (
    <>
      {editorArticle && <ArticleEditor initial={editorArticle} onClose={() => setEditorArticle(null)} />}
      {deleteTarget && <DeleteDialog title={deleteTarget.titleEnglish || deleteTarget.titleTamil} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />}

      {/* Page header (content area) */}
      <div className="border-b border-slate-200 bg-white px-4 py-6 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Editorial Workspace</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">News Management</h1>
            <p className="mt-1 max-w-lg text-sm text-slate-500">Create, schedule and manage community articles — in Tamil, English, or both.</p>
          </div>
          <button type="button" onClick={openNew} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 active:scale-95 transition">
            <Plus className="h-4 w-4" />Create Article
          </button>
        </div>
      </div>

      <div className="px-4 py-6 md:px-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Total",     value: counts.total + seedArticles.length,      icon: BarChart3,  accent: "bg-slate-700" },
            { label: "Published", value: counts.published + seedArticles.length,   icon: Check,      accent: "bg-emerald-500" },
            { label: "Drafts",    value: counts.drafts,                            icon: FileText,   accent: undefined },
            { label: "Scheduled", value: counts.scheduled,                         icon: Clock,      accent: "bg-amber-500" },
            { label: "Paid",      value: counts.paid,                              icon: DollarSign, accent: "bg-violet-500" },
            { label: "Views",     value: counts.views.toLocaleString(),            icon: Eye,        accent: "bg-sky-500" },
          ].map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status:</span>
            {(["all", "published", "draft", "scheduled"] as Filter[]).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize transition ${filter === f ? "border-rose-500 bg-rose-50 text-rose-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{f}</button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Category:</span>
            <select className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 focus:border-rose-400 focus:outline-none" value={catFilter} onChange={e => setCatFilter(e.target.value as NewsCategory | "all")}>
              <option value="all">All Categories</option>
              {cats.map(c => <option key={c} value={c}>{CATEGORY_META[c].label}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Articles</h2>
            <span className="text-xs text-slate-400">{filteredUser.length + (filter === "all" ? seedArticles.length : 0)} articles</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 border-b border-slate-100">Title</th>
                  <th className="px-6 py-3 border-b border-slate-100">Category</th>
                  <th className="px-6 py-3 border-b border-slate-100">Status</th>
                  <th className="px-6 py-3 border-b border-slate-100">Date</th>
                  <th className="px-6 py-3 border-b border-slate-100">Views</th>
                  <th className="px-6 py-3 border-b border-slate-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUser.map(a => {
                  const date = a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : a.publishDate
                  return (
                    <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50 transition group">
                      <td className="px-6 py-4 max-w-xs">
                        <p className="font-semibold text-slate-900 truncate">{a.titleEnglish || "Untitled"}</p>
                        {a.titleTamil && <p className="text-xs text-slate-500 truncate">{a.titleTamil}</p>}
                        {a.tags.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {a.tags.slice(0, 3).map(t => <span key={t} className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{t}</span>)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4"><CatBadge category={a.category} /></td>
                      <td className="px-6 py-4"><StatusBadge status={a.status} /></td>
                      <td className="px-6 py-4 text-slate-500">{date}</td>
                      <td className="px-6 py-4 text-slate-500">{a.views.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition">
                          <button onClick={() => openEdit(a)} className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-600 transition">
                            <Pencil className="h-3 w-3" />Edit
                          </button>
                          <button onClick={() => setDeleteTarget(a)} className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-red-400 hover:text-red-600 transition">
                            <Trash2 className="h-3 w-3" />Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {(filter === "all" || filter === "published") && seedArticles.map(a => <SeedRow key={a.id} article={a} />)}
                {filteredUser.length === 0 && filter !== "all" && filter !== "published" && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <FileText className="h-10 w-10 text-slate-300" />
                        <p className="font-medium text-slate-500">No articles found</p>
                        <p className="text-sm text-slate-400">Change filters or create a new article.</p>
                        <button onClick={openNew} className="mt-2 inline-flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition">
                          <Plus className="h-4 w-4" />Create Article
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
