"use client"

import Image from "next/image"
import Link from "next/link"
import { memo, useCallback, useEffect, useRef, useState } from "react"
import {
  SlidersHorizontal, Search, X, BadgeCheck, Sparkles,
  MapPin, GraduationCap, Briefcase, Star, Loader2, AlertCircle, RefreshCw,
  Coins, User, Languages, Heart, Eye, PencilLine
} from "lucide-react"
import { UserLayout } from "@/components/user-layout"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/lib/auth-context"

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
  marital_status: string | null; religion: string | null; annual_income: number | null
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
  incomeMin: number; onlyVerified: boolean
}

// ── DEFAULT is now "Open" ─────────────────────────────────────────────────────
const DEFAULT: Filters = {
  gender: "", 
  ageMin: 18, ageMax: 70, // Open range
  heightMin: 120, heightMax: 220, // Open range
  state: "", city: "", rasi: "", natchathiram: "",
  foodPreference: "", maritalStatus: "", employmentType: "", qualification: "",
  religion: "", motherTongue: "", complexion: "", bodyType: "",
  incomeMin: 0,
  onlyVerified: false,
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function photoUrl(p: ApiProfile, filterGender: string = "") {
  if (!p.photo) {
    const gender = p.gender || filterGender || "male"
    return gender === "female" ? "/avatar-female.png" : "/avatar-male.png"
  }
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
function fmtCurrency(val: number | null) {
  if (!val) return "—"
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} Lakh`
  return `₹${val.toLocaleString()}`
}

// ── Profile card ──────────────────────────────────────────────────────────────
const ProfileCard = memo(function ProfileCard({ p, filterGender }: { p: ApiProfile; filterGender?: string }) {
  const url = photoUrl(p, filterGender || "")
  const isPremium = p.subscription_tier === "gold" || p.subscription_tier === "platinum"
  const score = p.completeness_score ?? 0
  const scoreColor = score >= 80 ? "bg-primary text-primary-foreground" : score >= 60 ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
      <Link href={`/matches/${p.id}`} className="block">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
          <Image src={url} alt={p.full_name} fill sizes="(min-width:1024px) 25vw,(min-width:640px) 33vw,100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
            unoptimized={url.startsWith("http://localhost")} />
          
          {/* Floating badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {isPremium && (
              <span className="flex items-center gap-1 rounded-full bg-primary/95 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground backdrop-blur-md shadow-lg">
                <Sparkles className="h-2.5 w-2.5" /> Premium
              </span>
            )}
            {p.is_verified && (
              <span className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 backdrop-blur-md shadow-md">
                <BadgeCheck className="h-3 w-3" /> Verified
              </span>
            )}
          </div>

          <div className={`absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-lg ${scoreColor}`}>
            <Star className="h-3 w-3 fill-current" />{score}%
          </div>

          {/* Bottom Info Overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 pb-4 pt-12">
            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate font-serif text-xl font-semibold text-white">
                  {p.full_name}
                </h3>
                <p className="flex items-center gap-2 text-sm text-white/80">
                  <span>{p.age} yrs</span>
                  <span className="h-1 w-1 rounded-full bg-white/40" />
                  <span>{htDisplay(p.height_cm).split(" (")[0]}</span>
                </p>
              </div>
              <div className="rounded-full bg-white/20 p-2 text-white backdrop-blur-md transition hover:bg-primary hover:text-white">
                <Eye className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </Link>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-4 text-[13px] relative">
        <div className="flex items-center gap-2 text-muted-foreground min-w-0">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/60" />
          <span className="truncate">{p.city || "—"}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground min-w-0">
          <GraduationCap className="h-3.5 w-3.5 shrink-0 text-primary/60" />
          <span className="truncate">{p.qualification || "—"}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground min-w-0">
          <Briefcase className="h-3.5 w-3.5 shrink-0 text-primary/60" />
          <span className="truncate">{fmtLabel(p.employment_type || "—")}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground min-w-0">
          <Coins className="h-3.5 w-3.5 shrink-0 text-primary/60" />
          <span className="truncate">{fmtCurrency(p.annual_income)}</span>
        </div>
        <div className="col-span-2 flex items-center gap-2 text-muted-foreground border-t border-border/50 pt-2 mt-1">
          <Star className="h-3.5 w-3.5 shrink-0 text-amber-500" />
          <span className="truncate">{p.rasi_name ? `${p.rasi_name}, ${p.natchathiram}` : "Astrology not shared"}</span>
        </div>

        {/* Admin Quick Edit Button */}
        {isAdmin && (
          <div className="col-span-2 mt-3 pt-3 border-t border-border/50 flex justify-end">
            <Link href={`/admin/profiles/${p.id}`}>
              <Button size="sm" variant="outline" className="h-8 text-[10px] uppercase font-bold tracking-wider border-primary/30 text-primary hover:bg-primary/5">
                <PencilLine className="h-3 w-3 mr-1.5" /> Edit Profile
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
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
      <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">{label}</Label>
      <Select value={value || "_all"} onValueChange={v => onChange(v === "_all" ? "" : v)}>
        <SelectTrigger className="h-10 text-sm border-border bg-background hover:bg-secondary/30 transition">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">All (No Restriction)</SelectItem>
          {options.filter(Boolean).map(o => <SelectItem key={o} value={o}>{fmtLabel(o)}</SelectItem>)}
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          <h2 className="font-serif text-lg font-bold text-foreground">Advanced Filters</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onChange(DEFAULT)} 
          className="h-8 px-2 text-xs font-bold text-primary hover:bg-primary/5 uppercase tracking-tighter">
          Reset All
        </Button>
      </div>

      <Separator className="bg-border/60" />

      {/* Gender */}
      <div className="space-y-2">
        <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">I am looking for</Label>
        <div className="flex p-1 gap-1 rounded-xl bg-secondary/50 border border-border/50">
          {[
            { v: "", l: "All", i: Heart }, 
            { v: "female", l: "Brides", i: Star }, 
            { v: "male", l: "Grooms", i: User }
          ].map(({ v, l, i: Icon }) => (
            <button key={v} onClick={() => set("gender", v)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all duration-200 ${
                value.gender === v 
                  ? "bg-background text-primary shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}>
              <Icon className="h-3.5 w-3.5" />
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Age */}
      <div className="space-y-4">
        <div className="flex justify-between items-baseline">
          <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">Age Range</Label>
          <span className="text-xs font-bold text-primary tabular-nums bg-primary/5 px-2 py-0.5 rounded-full">{value.ageMin}–{value.ageMax} yrs</span>
        </div>
        <Slider min={18} max={80} step={1} value={[value.ageMin, value.ageMax]}
          onValueChange={([a, b]) => onChange({ ...value, ageMin: a, ageMax: b })}
          className="py-1" />
      </div>

      {/* Height */}
      <div className="space-y-4">
        <div className="flex justify-between items-baseline">
          <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">Height (cm)</Label>
          <span className="text-xs font-bold text-primary tabular-nums bg-primary/5 px-2 py-0.5 rounded-full">{value.heightMin}–{value.heightMax} cm</span>
        </div>
        <Slider min={100} max={250} step={1} value={[value.heightMin, value.heightMax]}
          onValueChange={([a, b]) => onChange({ ...value, heightMin: a, heightMax: b })}
          className="py-1" />
      </div>

      <Separator className="bg-border/60" />

      {/* Dynamic selects */}
      <div className="space-y-5">
        <FilterSelect label="State" value={value.state} options={options.states} placeholder="Anywhere in India" onChange={v => set("state", v)} />
        <FilterSelect label="City" value={value.city} options={options.cities} placeholder="Any city" onChange={v => set("city", v)} />
        <FilterSelect label="Religion" value={value.religion} options={options.religions} placeholder="Any religion" onChange={v => set("religion", v)} />
        <FilterSelect label="Mother Tongue" value={value.motherTongue} options={options.motherTongues} placeholder="Any language" onChange={v => set("motherTongue", v)} />
        <FilterSelect label="Marital Status" value={value.maritalStatus} options={options.maritalStatuses} placeholder="Any status" onChange={v => set("maritalStatus", v)} />
        
        <Separator className="bg-border/40" />
        
        <FilterSelect label="Rasi (ராசி)" value={value.rasi} options={options.rasis} placeholder="Any rasi" onChange={v => set("rasi", v)} />
        <FilterSelect label="Natchathiram (நட்சத்திரம்)" value={value.natchathiram} options={options.natchathirams} placeholder="Any star" onChange={v => set("natchathiram", v)} />
        
        <Separator className="bg-border/40" />

        <FilterSelect label="Complexion" value={value.complexion} options={options.complexions} placeholder="Any complexion" onChange={v => set("complexion", v)} />
        <FilterSelect label="Body Type" value={value.bodyType} options={options.bodyTypes} placeholder="Any body type" onChange={v => set("bodyType", v)} />
        <FilterSelect label="Employment" value={value.employmentType} options={options.employmentTypes} placeholder="Any employment" onChange={v => set("employmentType", v)} />
        <FilterSelect label="Qualification" value={value.qualification} options={options.qualifications} placeholder="Any degree" onChange={v => set("qualification", v)} />
      </div>

      <Separator className="bg-border/60" />

      {/* Verified toggle */}
      <div className="group flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/20 transition-colors hover:bg-secondary/40 cursor-pointer" 
        onClick={() => onChange({ ...value, onlyVerified: !value.onlyVerified })}>
        <Checkbox id="verified" checked={value.onlyVerified} className="pointer-events-none" />
        <div className="flex flex-col">
          <Label htmlFor="verified" className="cursor-pointer text-sm font-bold text-foreground">Verified Profiles Only</Label>
          <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
            <BadgeCheck className="h-2.5 w-2.5" /> High trust browsing
          </span>
        </div>
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
      
      // Only send non-default/active filters
      if (filters.gender) p.set("gender", filters.gender)
      
      // Send age/height only if they restrict the full range (to stay "Open" by default)
      if (filters.ageMin > 18 || filters.ageMax < 80) {
        p.set("ageMin", String(filters.ageMin)); p.set("ageMax", String(filters.ageMax))
      }
      if (filters.heightMin > 100 || filters.heightMax < 250) {
        p.set("heightMin", String(filters.heightMin)); p.set("heightMax", String(filters.heightMax))
      }

      if (filters.state) p.set("state", filters.state)
      if (filters.city) p.set("city", filters.city)
      if (filters.rasi) p.set("rasi", filters.rasi)
      if (filters.natchathiram) p.set("natchathiram", filters.natchathiram)
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
      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary border border-primary/20">Discovery</span>
              <span className="font-tamil text-sm text-muted-foreground opacity-60">பொருத்தங்கள்</span>
            </div>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Match Discovery
            </h1>
            <p className="text-muted-foreground max-w-lg">
              Find your ideal life partner from our community of verified profiles. Refine your search using the advanced filters below.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-secondary/30 p-2 rounded-2xl border border-border/50">
            <div className="px-4 py-2 text-center border-r border-border/50">
              <p className="text-2xl font-bold tabular-nums text-foreground">{total}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Profiles</p>
            </div>
            <div className="flex flex-col gap-1 pr-2">
               <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 pl-1">Sort By</Label>
               <Select value={sort} onValueChange={v => { setSort(v as SortKey); setPage(1) }}>
                <SelectTrigger className="h-9 w-40 text-xs font-bold border-none shadow-none bg-transparent hover:bg-background transition-colors"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Best Match Score</SelectItem>
                  <SelectItem value="newest">Recently Joined</SelectItem>
                  <SelectItem value="age">By Age (Youngest)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-10">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-muted-foreground">
              <Search className="h-5 w-5" />
            </div>
            <input 
              value={query} 
              onChange={e => handleSearch(e.target.value)} 
              placeholder="Search by name, location, occupation or education..."
              className="w-full rounded-2xl border-2 border-border bg-background py-4 pl-12 pr-12 text-base transition-all focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10" />
            {query && (
              <button onClick={() => handleSearch("")} className="absolute inset-y-0 right-4 flex items-center text-muted-foreground hover:text-primary transition-colors">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Sidebar / Filters */}
          <aside className="hidden w-80 shrink-0 md:block">
            <div className="sticky top-28 rounded-3xl border border-border bg-card p-6 shadow-sm ring-1 ring-black/[0.02]">
              {filterPanel}
            </div>
          </aside>

          <section className="min-w-0 flex-1">
            <div className="md:hidden mb-6">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full gap-2 h-12 rounded-2xl font-bold border-2"><SlidersHorizontal className="h-4 w-4" /> Filters & Preferences</Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[90vw] max-w-sm overflow-y-auto">
                  <SheetHeader className="mb-6"><SheetTitle>Refine Matches</SheetTitle></SheetHeader>
                  {filterPanel}
                </SheetContent>
              </Sheet>
            </div>

            {/* Content States */}
            {error === "Please log in to browse matches." ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-amber-200 bg-amber-50/50 py-20 text-center gap-6 px-6">
                <div className="p-4 bg-amber-100 rounded-full text-amber-600"><Star className="h-10 w-10" /></div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-amber-900">Session Expired</h3>
                  <p className="text-amber-800/80 max-w-xs mx-auto">Please log in again to browse the community and find your perfect match.</p>
                </div>
                <Link href="/login"><Button className="rounded-full px-8 shadow-lg shadow-amber-200/50">Go to Login</Button></Link>
              </div>
            ) : error ? (
              <div className="mb-8 flex flex-col items-center gap-4 rounded-3xl border-2 border-red-100 bg-red-50/50 px-6 py-12 text-center">
                <div className="p-3 bg-red-100 rounded-full text-red-600"><AlertCircle className="h-8 w-8" /></div>
                <div className="space-y-1">
                   <h3 className="font-bold text-red-900">Discovery Error</h3>
                   <p className="text-sm text-red-800/70">{error}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => fetchProfiles(1)} className="gap-2 text-red-600 hover:bg-red-100/50 font-bold uppercase tracking-tighter">
                  <RefreshCw className="h-4 w-4" /> Retry Connection
                </Button>
              </div>
            ) : loading && profiles.length === 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-3xl border border-border bg-card overflow-hidden">
                    <div className="aspect-[4/5] bg-secondary/50" />
                    <div className="p-5 space-y-4">
                      <div className="h-5 bg-secondary/50 rounded-lg w-3/4" />
                      <div className="space-y-2">
                        <div className="h-3 bg-secondary/50 rounded-lg w-1/2" />
                        <div className="h-3 bg-secondary/50 rounded-lg w-2/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : profiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-secondary/10 py-24 text-center gap-6 px-6">
                <div className="p-5 bg-background rounded-2xl shadow-sm"><Search className="h-12 w-12 text-muted-foreground/30" /></div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-serif font-bold">No matches found</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto">We couldn't find any profiles matching your current filters. Try expanding your search criteria.</p>
                </div>
                <Button variant="outline" className="rounded-full px-8 border-2 font-bold hover:bg-primary hover:text-white transition-all" 
                  onClick={() => { setFilters(DEFAULT); setQuery("") }}>
                  Reset All Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-12">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {profiles.map(p => <ProfileCard key={p.id} p={p} filterGender={filters.gender} />)}
                </div>
                
                {page < totalPages && (
                  <div className="flex justify-center pt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => fetchProfiles(page + 1)} 
                      disabled={loading} 
                      className="group relative h-14 rounded-2xl px-12 font-bold border-2 transition-all hover:border-primary hover:bg-primary/5 active:scale-95"
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      ) : (
                        <span className="flex items-center gap-2">
                          Show More Matches
                          <Eye className="h-4 w-4 transition-transform group-hover:scale-110" />
                        </span>
                      )}
                    </Button>
                  </div>
                )}

                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <Separator className="w-24 bg-primary/20 h-1 mb-4 rounded-full" />
                  <p className="text-sm font-medium text-muted-foreground">You've reached the end of matches</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-bold">New profiles are added daily</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </UserLayout>
  )
}
