"use client"

import Image from "next/image"
import Link from "next/link"
import { memo, useCallback, useEffect, useRef, useState } from "react"
import {
  SlidersHorizontal, Search, X, BadgeCheck, Sparkles,
  MapPin, GraduationCap, Briefcase, Star, Loader2, AlertCircle, RefreshCw,
} from "lucide-react"
import { UserLayout } from "@/components/user-layout"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

// ── Config ────────────────────────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
function authHeaders() {
  const t = typeof window !== "undefined" ? localStorage.getItem("maratha_token") : null
  return t ? { Authorization: `Bearer ${t}` } : {}
}

// ── API types ─────────────────────────────────────────────────────────────────
type ApiProfile = {
  id: string; full_name: string; full_name_tamil: string | null
  gender: "male" | "female" | null; age: number | null
  height_cm: number | null; state: string | null; city: string | null
  qualification: string | null; employment_type: string | null
  completeness_score: number; is_verified: boolean
  rasi_name: string | null; natchathiram: string | null
  photo: string | null; subscription_tier: string | null
}

type FilterOptions = {
  states: string[]; cities: string[]; rasis: string[]; natchathirams: string[]
  foodPreferences: string[]; maritalStatuses: string[]
  employmentTypes: string[]; qualifications: string[]
  religions: string[]; motherTongues: string[]; complexions: string[]; bodyTypes: string[]
}

type Filters = {
  gender: string; ageMin: number; ageMax: number
  heightMin: number; heightMax: number
  state: string; city: string; rasi: string; natchathiram: string
  foodPreference: string; maritalStatus: string
  employmentType: string; qualification: string
  religion: string; motherTongue: string; complexion: string; bodyType: string
  onlyVerified: boolean
}

const DEFAULT: Filters = {
  gender: "", ageMin: 18, ageMax: 65, heightMin: 140, heightMax: 210,
  state: "", city: "", rasi: "", natchathiram: "",
  foodPreference: "", maritalStatus: "", employmentType: "", qualification: "",
  religion: "", motherTongue: "", complexion: "", bodyType: "",
  onlyVerified: false,
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function photoUrl(p: ApiProfile) {
  if (!p.photo) return p.gender === "female" ? "/avatar-female.png" : "/avatar-male.png"
  if (p.photo.startsWith("/uploads/") || p.photo.startsWith("uploads/"))
    return `${API}/${p.photo.replace(/^\//, "")}`
  return p.photo
}
function htDisplay(cm: number | null) {
  if (!cm) return "—"
  const ft = Math.floor(cm / 30.48), inch = Math.round((cm % 30.48) / 2.54)
  return `${ft}'${inch}" (${cm}cm)`
}
function fmtLabel(s: string) { 
  if (!s) return ""
  return s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) 
}

// ── Profile card ──────────────────────────────────────────────────────────────
const ProfileCard = memo(function ProfileCard({ p }: { p: ApiProfile }) {
  const url = photoUrl(p)
  const isPremium = p.subscription_tier === "gold" || p.subscription_tier === "platinum"
  const score = p.completeness_score ?? 0
  const scoreColor = score >= 80 ? "bg-primary text-primary-foreground" : score >= 60 ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"
  return (
    <Link href={`/matches/${p.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        <Image src={url} alt={p.full_name} fill sizes="(min-width:1024px) 25vw,(min-width:640px) 33vw,100vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          unoptimized={url.startsWith("http://localhost")} />
        {isPremium && (
          <div className="absolute left-3 top-3">
            <span className="flex items-center gap-1 rounded-full bg-primary/95 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary-foreground backdrop-blur">
              <Sparkles className="h-2.5 w-2.5" /> Premium
            </span>
          </div>
        )}
        <div className={`absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${scoreColor}`}>
          <Star className="h-3 w-3 fill-current" />{score}%
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/85 via-foreground/40 to-transparent px-4 pb-3 pt-10">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <h3 className="flex items-center gap-1.5 truncate font-serif text-lg font-medium text-background">
                {p.full_name}
                {p.is_verified && <BadgeCheck className="h-4 w-4 shrink-0 text-accent" />}
              </h3>
              {p.full_name_tamil && <p className="font-tamil text-sm text-background/80">{p.full_name_tamil}</p>}
            </div>
            {p.age && <span className="text-sm font-medium tabular-nums text-background/90">{p.age} <span className="text-background/60">yrs</span></span>}
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 text-sm">
        <div className="flex items-center gap-2 text-foreground">
          <span>{htDisplay(p.height_cm)}</span>
          {p.rasi_name && <><span className="h-1 w-1 rounded-full bg-border" /><span className="truncate">{p.rasi_name}</span></>}
        </div>
        {p.qualification && <div className="flex items-start gap-2 text-muted-foreground"><GraduationCap className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span className="line-clamp-1">{p.qualification}</span></div>}
        {p.employment_type && <div className="flex items-start gap-2 text-muted-foreground"><Briefcase className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span className="line-clamp-1">{fmtLabel(p.employment_type)}</span></div>}
        <div className="flex items-start gap-2 text-muted-foreground"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span className="truncate">{[p.city, p.state].filter(Boolean).join(", ") || "—"}</span></div>
      </div>
    </Link>
  )
})

// ── Select filter row ─────────────────────────────────────────────────────────
function FilterSelect({ label, value, options, placeholder, onChange }: {
  label: string; value: string; options: string[]
  placeholder: string; onChange: (v: string) => void
}) {
  if (!options || !options.length) return null
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Select value={value || "_all"} onValueChange={v => onChange(v === "_all" ? "" : v)}>
        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">All</SelectItem>
          {options.map(o => <SelectItem key={o} value={o}>{fmtLabel(o)}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}

// ── Filters panel ─────────────────────────────────────────────────────────────
function FiltersPanel({ value, options, onChange }: {
  value: Filters; options: FilterOptions; onChange: (f: Filters) => void
}) {
  const set = (k: keyof Filters, v: Filters[keyof Filters]) => onChange({ ...value, [k]: v, city: k === "state" ? "" : value.city })
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between">
        <div><h2 className="font-serif text-lg font-medium text-foreground">Refine</h2>
          <p className="font-tamil text-xs text-muted-foreground">வடிகட்டு</p></div>
        <Button variant="ghost" size="sm" onClick={() => onChange(DEFAULT)} className="h-auto p-0 text-xs text-muted-foreground hover:text-primary">Reset all</Button>
      </div>
      <Separator />

      {/* Gender */}
      <div>
        <Label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Looking for</Label>
        <div className="flex gap-2">
          {[{ v: "", l: "All" }, { v: "female", l: "Bride" }, { v: "male", l: "Groom" }].map(({ v, l }) => (
            <button key={v} onClick={() => set("gender", v)}
              className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition ${value.gender === v ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Age */}
      <div>
        <div className="mb-2 flex justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Age</Label>
          <span className="text-xs tabular-nums text-muted-foreground">{value.ageMin}–{value.ageMax} yrs</span>
        </div>
        <Slider min={18} max={70} step={1} value={[value.ageMin, value.ageMax]}
          onValueChange={([a, b]) => onChange({ ...value, ageMin: a, ageMax: b })} />
      </div>

      {/* Height */}
      <div>
        <div className="mb-2 flex justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Height (cm)</Label>
          <span className="text-xs tabular-nums text-muted-foreground">{value.heightMin}–{value.heightMax}</span>
        </div>
        <Slider min={120} max={220} step={1} value={[value.heightMin, value.heightMax]}
          onValueChange={([a, b]) => onChange({ ...value, heightMin: a, heightMax: b })} />
      </div>

      <Separator />

      {/* Dynamic selects — all from real DB */}
      <FilterSelect label="State" value={value.state} options={options.states} placeholder="Any state" onChange={v => set("state", v)} />
      <FilterSelect label="City" value={value.city} options={options.cities} placeholder="Any city" onChange={v => set("city", v)} />
      <FilterSelect label="Religion" value={value.religion} options={options.religions} placeholder="Any religion" onChange={v => set("religion", v)} />
      <FilterSelect label="Mother Tongue" value={value.motherTongue} options={options.motherTongues} placeholder="Any language" onChange={v => set("motherTongue", v)} />
      <FilterSelect label="Marital Status" value={value.maritalStatus} options={options.maritalStatuses} placeholder="Any status" onChange={v => set("maritalStatus", v)} />
      <FilterSelect label="Rasi (ராசி)" value={value.rasi} options={options.rasis} placeholder="Any rasi" onChange={v => set("rasi", v)} />
      <FilterSelect label="Natchathiram (நட்சத்திரம்)" value={value.natchathiram} options={options.natchathirams} placeholder="Any star" onChange={v => set("natchathiram", v)} />
      <FilterSelect label="Food Preference" value={value.foodPreference} options={options.foodPreferences} placeholder="Any diet" onChange={v => set("foodPreference", v)} />
      <FilterSelect label="Complexion" value={value.complexion} options={options.complexions} placeholder="Any complexion" onChange={v => set("complexion", v)} />
      <FilterSelect label="Body Type" value={value.bodyType} options={options.bodyTypes} placeholder="Any body type" onChange={v => set("bodyType", v)} />
      <FilterSelect label="Employment" value={value.employmentType} options={options.employmentTypes} placeholder="Any employment" onChange={v => set("employmentType", v)} />
      <FilterSelect label="Qualification" value={value.qualification} options={options.qualifications} placeholder="Any qualification" onChange={v => set("qualification", v)} />

      <Separator />

      {/* Verified only */}
      <div className="flex items-center gap-2.5">
        <Checkbox id="verified" checked={value.onlyVerified} onCheckedChange={c => onChange({ ...value, onlyVerified: !!c })} />
        <Label htmlFor="verified" className="cursor-pointer text-sm font-normal text-foreground/90">Verified profiles only</Label>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
type SortKey = "score" | "newest" | "age"

export default function MatchesPage() {
  const [profiles, setProfiles] = useState<ApiProfile[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortKey>("score")
  const [filters, setFilters] = useState<Filters>(DEFAULT)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    states: [], cities: [], rasis: [], natchathirams: [],
    foodPreferences: [], maritalStatuses: [], employmentTypes: [], qualifications: [],
    religions: [], motherTongues: [], complexions: [], bodyTypes: [],
  })

  // Load filter options once
  useEffect(() => {
    fetch(`${API}/api/matches/filters`, { headers: authHeaders() as HeadersInit })
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setFilterOptions(d))
      .catch(() => {})
  }, [])

  const fetchProfiles = useCallback(async (pg = 1) => {
    setLoading(true); setError(null)
    try {
      const p = new URLSearchParams({ page: String(pg), sort })
      if (filters.gender) p.set("gender", filters.gender)
      p.set("ageMin", String(filters.ageMin)); p.set("ageMax", String(filters.ageMax))
      p.set("heightMin", String(filters.heightMin)); p.set("heightMax", String(filters.heightMax))
      if (filters.state) p.set("state", filters.state)
      if (filters.city) p.set("city", filters.city)
      if (filters.rasi) p.set("rasi", filters.rasi)
      if (filters.natchathiram) p.set("natchathiram", filters.natchathiram)
      if (filters.foodPreference) p.set("foodPreference", filters.foodPreference)
      if (filters.maritalStatus) p.set("maritalStatus", filters.maritalStatus)
      if (filters.employmentType) p.set("employmentType", filters.employmentType)
      if (filters.qualification) p.set("qualification", filters.qualification)
      if (filters.religion) p.set("religion", filters.religion)
      if (filters.motherTongue) p.set("motherTongue", filters.motherTongue)
      if (filters.complexion) p.set("complexion", filters.complexion)
      if (filters.bodyType) p.set("bodyType", filters.bodyType)
      if (filters.onlyVerified) p.set("onlyVerified", "true")

      const res = await fetch(`${API}/api/matches?${p}`, { headers: authHeaders() as HeadersInit })
      if (res.status === 401) { setError("Please log in to browse matches."); return }
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()

      let rows: ApiProfile[] = data.profiles ?? []
      if (query.trim()) {
        const q = query.toLowerCase()
        rows = rows.filter(r =>
          [r.full_name, r.full_name_tamil, r.city, r.state, r.employment_type, r.qualification].join(" ").toLowerCase().includes(q)
        )
      }
      setProfiles(pg === 1 ? rows : prev => [...prev, ...rows])
      setTotal(data.total ?? 0); setTotalPages(data.totalPages ?? 1); setPage(pg)
    } catch (e: any) { setError(e.message) } finally { setLoading(false) }
  }, [sort, filters, query])

  useEffect(() => { fetchProfiles(1) }, [sort, filters]) // eslint-disable-line

  const timer = useRef<ReturnType<typeof setTimeout>>()
  function handleSearch(v: string) {
    setQuery(v); clearTimeout(timer.current)
    timer.current = setTimeout(() => fetchProfiles(1), 400)
  }

  const filterPanel = <FiltersPanel value={filters} options={filterOptions} onChange={f => { setFilters(f); setPage(1) }} />

  return (
    <UserLayout>
      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-primary">Matches</span>
            <span className="font-tamil text-sm text-muted-foreground">பொருத்தங்கள்</span>
          </div>
          <h1 className="font-serif text-3xl font-medium text-foreground md:text-4xl">
            Find your perfect match
          </h1>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={query} onChange={e => handleSearch(e.target.value)} placeholder="Search name, city…"
                className="w-full rounded-lg border border-border bg-background pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              {query && <button onClick={() => handleSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><X className="h-3.5 w-3.5" /></button>}
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden"><SlidersHorizontal className="h-4 w-4 mr-1" />Filters</Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto">
                <SheetHeader><SheetTitle>Refine matches</SheetTitle></SheetHeader>
                <div className="mt-4">{filterPanel}</div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground tabular-nums">{loading ? "…" : `${total} profile${total !== 1 ? "s" : ""}`}</span>
            <Select value={sort} onValueChange={v => { setSort(v as SortKey); setPage(1) }}>
              <SelectTrigger className="h-9 w-44 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Best match</SelectItem>
                <SelectItem value="newest">Recently joined</SelectItem>
                <SelectItem value="age">By age</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden w-64 shrink-0 md:block">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-5 max-h-[80vh] overflow-y-auto">
              {filterPanel}
            </div>
          </aside>

          <section className="min-w-0 flex-1">
            {/* 401 / session expired */}
            {error === "Please log in to browse matches." && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 py-16 text-center gap-4">
                <p className="text-amber-800 font-medium">{error}</p>
                <Link href="/login"><Button>Go to Login</Button></Link>
              </div>
            )}

            {/* Other errors */}
            {error && error !== "Please log in to browse matches." && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />{error}
                <Button variant="ghost" size="sm" onClick={() => fetchProfiles(1)} className="ml-auto gap-1 text-red-700 hover:bg-red-100">
                  <RefreshCw className="h-3.5 w-3.5" /> Retry
                </Button>
              </div>
            )}

            {/* Loading skeletons */}
            {loading && profiles.length === 0 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="aspect-[3/4] bg-muted" />
                    <div className="p-4 space-y-2"><div className="h-4 bg-muted rounded w-3/4" /><div className="h-3 bg-muted rounded w-1/2" /></div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty */}
            {!loading && !error && profiles.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-20 text-center gap-4">
                <Search className="h-10 w-10 text-primary/40" />
                <h3 className="font-serif text-xl font-medium">No profiles found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
                <Button variant="outline" size="sm" onClick={() => { setFilters(DEFAULT); setQuery("") }}>Reset filters</Button>
              </div>
            )}

            {/* Grid */}
            {profiles.length > 0 && (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {profiles.map(p => <ProfileCard key={p.id} p={p} />)}
                </div>
                {page < totalPages && (
                  <div className="mt-10 flex justify-center">
                    <Button variant="outline" onClick={() => fetchProfiles(page + 1)} disabled={loading} className="gap-2">
                      {loading && <Loader2 className="h-4 w-4 animate-spin" />}Load more
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </UserLayout>
  )
}
