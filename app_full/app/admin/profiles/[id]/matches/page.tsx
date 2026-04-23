"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Search, SlidersHorizontal, RefreshCw,
  MapPin, GraduationCap, Briefcase, Star, Eye, FileText,
  ChevronLeft, ChevronRight, Users,
} from "lucide-react"
import { AdminLayout } from "../../../admin-layout"
import { apiFetch } from "@/lib/api"

// ── Types ─────────────────────────────────────────────────────────────────────

type SourceProfile = {
  id: string
  full_name: string
  gender: string
  profile_number: number | null
}

type Candidate = {
  id: string
  profile_number: number | null
  full_name: string
  full_name_tamil: string | null
  gender: string
  date_of_birth: string | null
  age: number | null
  height_cm: number | null
  state: string | null
  city: string | null
  qualification: string | null
  field_of_study: string | null
  employment_type: string | null
  designation: string | null
  religion: string | null
  rasi_name: string | null
  natchathiram: string | null
  completeness_score: number
  photo: string | null
  matchScore: number
  matchTotal: number
  matchDetails: string[]
}

type MatchResult = {
  sourceProfile: SourceProfile
  candidates: Candidate[]
  total: number
  page: number
  totalPages: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

function fmtHeight(cm: number | null) {
  if (!cm) return null
  const ft = Math.floor(cm / 30.48)
  const inch = Math.round((cm / 30.48 - ft) * 12)
  return `${ft}'${inch}"`
}

function profileCode(n: number | null) {
  return n ? `MAT-${String(n).padStart(5, "0")}` : null
}

// ── Score badge + hover tooltip ───────────────────────────────────────────────

function ScoreBadge({ score, total, details }: { score: number; total: number; details: string[] }) {
  const pct = score / total
  const color =
    pct >= 0.8 ? "bg-emerald-500" :
    pct >= 0.6 ? "bg-amber-500" :
    pct >= 0.4 ? "bg-orange-400" :
    "bg-red-400"
  const textColor =
    pct >= 0.8 ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
    pct >= 0.6 ? "text-amber-700 bg-amber-50 border-amber-200" :
    pct >= 0.4 ? "text-orange-700 bg-orange-50 border-orange-200" :
    "text-red-700 bg-red-50 border-red-200"

  return (
    <div className="group relative flex flex-col items-center">
      {/* Badge */}
      <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold cursor-default ${textColor}`}>
        <Star className="h-3.5 w-3.5 fill-current" />
        {score}/{total}
      </div>

      {/* Progress dots */}
      <div className="flex gap-0.5 mt-1">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`h-1.5 w-1.5 rounded-full ${i < score ? color : "bg-muted"}`} />
        ))}
      </div>

      {/* Hover tooltip */}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 hidden group-hover:block w-56 pointer-events-none">
        <div className="bg-popover border border-border rounded-2xl shadow-xl p-3">
          <p className="text-xs font-bold text-foreground mb-2">Match Breakdown</p>
          {details.length > 0 ? (
            <ul className="space-y-1">
              {details.map((d, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                  <span className="text-emerald-500 mt-px shrink-0">✓</span>
                  {d}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] text-muted-foreground">No matching criteria yet.</p>
          )}
          <div className="mt-2 pt-2 border-t border-border">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Compatibility score</span>
              <span className="font-bold text-foreground">{score}/{total}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full ${color}`} style={{ width: `${(score / total) * 100}%` }} />
            </div>
          </div>
        </div>
        {/* Tooltip arrow */}
        <div className="flex justify-center">
          <div className="h-2 w-2 rotate-45 bg-popover border-b border-r border-border -mt-1" />
        </div>
      </div>
    </div>
  )
}

// ── Candidate card ────────────────────────────────────────────────────────────

function CandidateCard({ c }: { c: Candidate }) {
  const code = profileCode(c.profile_number)
  const isGroom = c.gender === "male"
  const location = [c.city, c.state].filter(Boolean).join(", ")

  return (
    <div className="flex flex-col sm:flex-row gap-4 bg-card rounded-2xl border border-border p-4 shadow-sm hover:shadow-md transition hover:border-primary/30 group">
      {/* Photo */}
      <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl font-bold ${isGroom ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
        {c.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`${API_BASE}${c.photo}`} alt={c.full_name} className="w-full h-full object-cover" />
        ) : (
          c.full_name[0]
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground text-base">{c.full_name}</h3>
              {code && (
                <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">{code}</span>
              )}
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isGroom ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
                {isGroom ? "Groom" : "Bride"}
              </span>
            </div>
            {c.full_name_tamil && (
              <p className="font-tamil text-xs text-muted-foreground mt-0.5">{c.full_name_tamil}</p>
            )}
          </div>
          {/* Score badge (right side) */}
          <ScoreBadge score={c.matchScore} total={c.matchTotal} details={c.matchDetails} />
        </div>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {c.age && <span className="font-medium text-foreground">{c.age} yrs</span>}
          {c.height_cm && <span>{fmtHeight(c.height_cm)}</span>}
          {location && (
            <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{location}</span>
          )}
          {c.religion && <span>{c.religion}</span>}
        </div>

        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {(c.qualification || c.field_of_study) && (
            <span className="flex items-center gap-0.5">
              <GraduationCap className="h-3 w-3" />
              {[c.qualification, c.field_of_study].filter(Boolean).join(" in ")}
            </span>
          )}
          {(c.designation || c.employment_type) && (
            <span className="flex items-center gap-0.5">
              <Briefcase className="h-3 w-3" />
              {c.designation || c.employment_type}
            </span>
          )}
          {c.rasi_name && (
            <span className="flex items-center gap-0.5">
              <Star className="h-3 w-3" />
              {c.rasi_name}{c.natchathiram ? ` · ${c.natchathiram}` : ""}
            </span>
          )}
        </div>

        {/* Completeness */}
        <div className="mt-2 flex items-center gap-2">
          <div className="w-20 h-1 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: `${c.completeness_score}%` }} />
          </div>
          <span className="text-[10px] text-muted-foreground">{c.completeness_score}% complete</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex sm:flex-col gap-2 items-start sm:items-end justify-end shrink-0">
        <Link href={`/admin/profiles/${c.id}`}
          className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/15 transition">
          <Eye className="h-3.5 w-3.5" /> View & Edit
        </Link>
        <Link href={`/admin/profiles/${c.id}/view`} target="_blank"
          className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition">
          <FileText className="h-3.5 w-3.5" /> View Biodata
        </Link>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const RASI_LIST = [
  "Mesham","Rishabam","Mithunam","Kadagam","Simmam","Kanni",
  "Thulam","Viruchigam","Dhanusu","Magaram","Kumbam","Meenam",
]

export default function FindMatchPage() {
  const params = useParams()
  const profileId = params.id as string

  const [result, setResult] = useState<MatchResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [gender, setGender] = useState("")          // "" = auto (opposite)
  const [ageMin, setAgeMin] = useState("")
  const [ageMax, setAgeMax] = useState("")
  const [state, setState] = useState("")
  const [rasi, setRasi] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const load = useCallback(async (p = 1) => {
    setLoading(true); setError(null)
    try {
      const q = new URLSearchParams({ page: String(p) })
      if (gender)  q.set("gender", gender)
      if (ageMin)  q.set("ageMin", ageMin)
      if (ageMax)  q.set("ageMax", ageMax)
      if (state)   q.set("state", state)
      if (rasi)    q.set("rasi", rasi)
      const data = await apiFetch<MatchResult>(`/api/admin/profiles/${profileId}/matches?${q}`)
      setResult(data)
      setPage(p)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [profileId, gender, ageMin, ageMax, state, rasi])

  useEffect(() => { load(1) }, [load])

  const src = result?.sourceProfile
  const srcCode = profileCode(src?.profile_number ?? null)
  const isGroom = src?.gender === "male"
  const defaultTargetGender = isGroom ? "female" : "male"

  // Client-side name search filter
  const filtered = (result?.candidates ?? []).filter(c =>
    !search || c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.city ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (c.state ?? "").toLowerCase().includes(search.toLowerCase())
  )

  // Score distribution stats
  const total = result?.candidates.length ?? 0
  const highMatch  = (result?.candidates ?? []).filter(c => c.matchScore >= 8).length
  const goodMatch  = (result?.candidates ?? []).filter(c => c.matchScore >= 6 && c.matchScore < 8).length
  const fairMatch  = (result?.candidates ?? []).filter(c => c.matchScore >= 4 && c.matchScore < 6).length

  return (
    <AdminLayout activeHref="/admin/profiles" title="Find Match">
      {/* Header */}
      <div className="mb-6 flex items-start gap-4 flex-wrap justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/admin/profiles/${profileId}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Profile
          </Link>
          <div className="h-4 w-px bg-border" />
          <div>
            <h2 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2 flex-wrap">
              <Users className="h-5 w-5 text-primary" />
              Find Match
              {src && (
                <span className="text-muted-foreground font-normal text-sm">
                  — {src.full_name}{srcCode ? ` (${srcCode})` : ""}
                </span>
              )}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Showing {gender || defaultTargetGender}s ranked by compatibility score
            </p>
          </div>
        </div>
        <button onClick={() => load(page)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Match stats strip */}
      {!loading && result && (
        <div className="mb-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Candidates", value: result.total, color: "text-foreground" },
            { label: "High Match (8–10)", value: highMatch, color: "text-emerald-600" },
            { label: "Good Match (6–7)", value: goodMatch, color: "text-amber-600" },
            { label: "Fair Match (4–5)", value: fairMatch, color: "text-orange-500" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-3.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter bar */}
      <div className="mb-5 flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, city…"
            className="h-9 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Gender toggle */}
        <div className="flex gap-1 rounded-xl border border-border bg-secondary/40 p-1">
          {["", "male", "female"].map(g => (
            <button key={g}
              onClick={() => { setGender(g); setPage(1) }}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${gender === g ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {g === "" ? "Auto" : g === "male" ? "Grooms" : "Brides"}
            </button>
          ))}
        </div>

        {/* Advanced filters toggle */}
        <button
          onClick={() => setShowFilters(f => !f)}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${showFilters ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
        </button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="mb-5 rounded-2xl border border-border bg-card p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-1">Min Age</label>
            <input type="number" value={ageMin} onChange={e => setAgeMin(e.target.value)} placeholder="e.g. 22"
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-1">Max Age</label>
            <input type="number" value={ageMax} onChange={e => setAgeMax(e.target.value)} placeholder="e.g. 30"
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-1">State</label>
            <input value={state} onChange={e => setState(e.target.value)} placeholder="e.g. Tamil Nadu"
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-1">Moon Rasi</label>
            <select value={rasi} onChange={e => setRasi(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Any</option>
              {RASI_LIST.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="col-span-2 sm:col-span-4 flex justify-end gap-2">
            <button onClick={() => { setAgeMin(""); setAgeMax(""); setState(""); setRasi(""); setGender("") }}
              className="rounded-xl border border-border px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition">
              Clear Filters
            </button>
            <button onClick={() => load(1)}
              className="rounded-xl bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition">
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => load(page)} className="text-xs font-semibold underline">Retry</button>
        </div>
      )}

      {/* Results */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
            {search ? "No candidates match your search." : "No matching profiles found. Try adjusting the filters."}
          </div>
        ) : (
          filtered.map(c => <CandidateCard key={c.id} c={c} />)
        )}
      </div>

      {/* Pagination */}
      {result && result.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            disabled={page <= 1 || loading}
            onClick={() => load(page - 1)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 transition"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <span className="text-sm text-muted-foreground">Page {page} of {result.totalPages}</span>
          <button
            disabled={page >= result.totalPages || loading}
            onClick={() => load(page + 1)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 transition"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </AdminLayout>
  )
}
