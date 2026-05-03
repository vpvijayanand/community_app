"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Camera, Briefcase, Users, Star, Heart, Shield,
  User, CheckCircle2, XCircle, Clock, Save, MapPin,
  PencilLine, FileText, Lock, Unlock, Sparkles, Eye
} from "lucide-react"
import { UserLayout } from "@/components/user-layout"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { KoduGrid } from "@/components/kodu-grid"
import { convertChartToPositions } from "@/lib/astrology-utils"
import { PLANETS, type PlanetCode, type Chart, type RasiKey } from "@/lib/astrology-data"

// ── Types ─────────────────────────────────────────────────────────────────────

type PhotoData = {
  id: string
  url: string
  is_primary: boolean
  blur_for_basic: boolean
  sort_order: number
}

type AstrologyData = {
  rasi_name: string | null
  natchathiram: string | null
  padam: number | null
  birth_time: string | null
  birth_am_pm: string | null
  birth_place: string | null
  date_of_birth: string | null
  lagna_name: string | null
  rasi_chart: Chart | null
  navamsa_chart: Chart | null
}

type ExpectationsData = {
  age_range_min: number | null
  age_range_max: number | null
  height_range_min: number | null
  height_range_max: number | null
  education_pref: string | null
  employment_pref: string[] | null
  income_pref: number | null
  location_pref: string[] | null
  minimum_poruthams: number | null
  custom_note: string | null
}

type Profile = {
  id: string
  user_id: string
  full_name: string
  full_name_tamil: string | null
  gender: string
  date_of_birth: string | null
  marital_status: string | null
  mother_tongue: string | null
  religion: string | null
  height_cm: number | null
  weight_kg: number | null
  complexion: string | null
  food_preference: string | null
  body_type: string | null
  physical_disability: string | null
  employment_type: string | null
  company_name: string | null
  designation: string | null
  work_location: string | null
  annual_income: number | null
  qualification: string | null
  field_of_study: string | null
  institution: string | null
  graduation_year: number | null
  family_type: string | null
  father_name: string | null
  father_occupation: string | null
  father_alive: boolean | null
  mother_name: string | null
  mother_occupation: string | null
  mother_alive: boolean | null
  family_status: string | null
  family_values: string | null
  country: string | null
  state: string | null
  city: string | null
  area: string | null
  native_place: string | null
  willing_to_relocate: boolean | null
  status: "pending" | "approved" | "rejected"
  is_verified: boolean
  is_closed: boolean
  completeness_score: number
  astrology: AstrologyData | null
  expectations: ExpectationsData | null
  photos: PhotoData[]
}

// ── Tab definitions ───────────────────────────────────────────────────────────

const TABS = [
  { id: "photos",    label: "Photos",            Icon: Camera },
  { id: "basic",     label: "Basic & Physical",   Icon: User },
  { id: "career",    label: "Career & Education", Icon: Briefcase },
  { id: "family",    label: "Family & Location",  Icon: Users },
  { id: "astrology", label: "Astrology & Charts", Icon: Star },
  { id: "expect",    label: "Expectations",       Icon: Heart },
] as const
type TabId = (typeof TABS)[number]["id"]

// ── Small shared UI ───────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

const inputCls = "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"

function Inp(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCls} />
}

function Sel({ children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return <select {...rest} className={inputCls}>{children}</select>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 font-serif text-base font-semibold text-foreground border-b border-border pb-2">
      {children}
    </h3>
  )
}

function SaveBar({ onSave, saving, saved, error }: { onSave: () => void; saving: boolean; saved: boolean; error?: string | null }) {
  return (
    <div className="flex items-center justify-between pt-6 border-t border-border mt-8 gap-4">
      {error ? <p className="text-sm text-destructive">{error}</p> : <span />}
      <button
        onClick={onSave}
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
      >
        {saving ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
        ) : saved ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
      </button>
    </div>
  )
}

// ── Photos Tab ────────────────────────────────────────────────────────────────

function PhotosTab({ profileId, photos: initial }: { profileId: string; photos: PhotoData[] }) {
  const [photos, setPhotos] = useState<PhotoData[]>(initial || [])
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  // Sync if initial changes
  useEffect(() => {
    if (initial) setPhotos(initial)
  }, [initial])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (photos.length >= 5) { setErr("Maximum 5 photos allowed"); return }
    setUploading(true); setErr(null)
    try {
      const fd = new FormData()
      fd.append("photo", file)
      const photo = await apiFetch<PhotoData>(`/api/profile/${profileId}/photo`, {
        method: "POST",
        body: fd,
      })
      setPhotos(prev => [...prev, photo])
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setUploading(false)
    }
  }

  async function deletePhoto(id: string) {
    try {
      await apiFetch(`/api/profile/${profileId}/photo/${id}`, { method: "DELETE" })
      setPhotos(prev => prev.filter(p => p.id !== id))
    } catch (e: any) { alert(e.message) }
  }

  async function setPrimary(id: string) {
    try {
      await apiFetch(`/api/profile/${profileId}/photo/${id}/primary`, { method: "PUT" })
      setPhotos(prev => prev.map(p => ({ ...p, is_primary: p.id === id })))
    } catch (e: any) { alert(e.message) }
  }

  const getUrl = (url: string) => {
    if (!url) return ""
    if (url.startsWith("http")) return url
    return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`
  }

  return (
    <div>
      <SectionTitle>Profile Photos</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
        {photos && photos.length > 0 ? photos.map(p => (
          <div key={p.id} className="group relative aspect-[3/4] rounded-xl border border-border overflow-hidden bg-muted">
            <img src={getUrl(p.url)} className="h-full w-full object-cover" alt="Profile" />
            {p.is_primary && <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">Primary</span>}
            <div className="absolute inset-0 flex items-end gap-2 p-2 opacity-0 group-hover:opacity-100 transition bg-gradient-to-t from-black/60 pt-10">
              {!p.is_primary && (
                <button onClick={() => setPrimary(p.id)} className="rounded-lg bg-white/90 px-2 py-1 text-[10px] font-bold text-foreground hover:bg-white">Set Primary</button>
              )}
              <button onClick={() => deletePhoto(p.id)} className="ml-auto rounded-lg bg-red-500 px-2 py-1 text-[10px] font-bold text-white hover:bg-red-600">Delete</button>
            </div>
          </div>
        )) : null}
        {photos.length < 5 && (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition"
          >
            {uploading ? <Clock className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
            <span className="text-xs font-bold uppercase tracking-wider">{uploading ? "Uploading…" : "Add Photo"}</span>
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={handleUpload} />
      {err && <p className="text-sm text-destructive mt-2">{err}</p>}
      {photos.length === 0 && <p className="text-sm text-muted-foreground italic">No photos uploaded yet.</p>}
    </div>
  )
}

// ── Profile Edit Content ──────────────────────────────────────────────────────

export default function ProfileEditPage() {
  const { profileId } = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabId>("basic")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch(`/api/profile/${profileId}`)
        setProfile(data)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [profileId])

  async function handleSave(section: TabId, data: any) {
    setSaving(true); setError(null)
    try {
      await apiFetch(`/api/profile/${profileId}`, {
        method: "PUT",
        body: JSON.stringify({ section, data })
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <UserLayout>
      <div className="flex h-[60vh] items-center justify-center"><Clock className="h-8 w-8 animate-spin text-primary" /></div>
    </UserLayout>
  )

  if (error || !profile) return (
    <UserLayout>
      <div className="mx-auto max-w-md rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center mt-20">
        <XCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="font-serif text-xl font-bold text-foreground mb-2">Error Loading Profile</h2>
        <p className="text-muted-foreground mb-6">{error || "Profile not found"}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    </UserLayout>
  )

  const TabIcon = TABS.find(t => t.id === activeTab)?.Icon || User

  return (
    <UserLayout>
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full"><ArrowLeft className="h-5 w-5" /></Button>
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">Edit Profile</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                {profile.full_name} • <span className="font-tamil">{profile.full_name_tamil}</span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ${
                  profile.status === "approved" ? "bg-green-600" : profile.status === "rejected" ? "bg-red-600" : "bg-amber-500"
                }`}>
                  {profile.status}
                </span>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/profile/me/view`}>
              <Button variant="outline" size="sm" className="rounded-xl"><Eye className="mr-2 h-4 w-4" /> View as others</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Nav */}
          <aside className="lg:col-span-1 space-y-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  activeTab === tab.id ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <tab.Icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3 text-primary">
                <TabIcon className="h-5 w-5" />
                <h2 className="font-serif text-lg font-bold text-foreground">{TABS.find(t => t.id === activeTab)?.label}</h2>
              </div>

              {activeTab === "photos" && <PhotosTab profileId={profile.id} photos={profile.photos} />}
              {activeTab === "basic" && <BasicSection profile={profile} onSave={d => handleSave("basic", d)} saving={saving} saved={saved} />}
              {activeTab === "career" && <CareerSection profile={profile} onSave={d => handleSave("career", d)} saving={saving} saved={saved} />}
              {activeTab === "family" && <FamilySection profile={profile} onSave={d => handleSave("family", d)} saving={saving} saved={saved} />}
              {activeTab === "astrology" && <AstrologySection profile={profile} onSave={d => handleSave("astrology", d)} saving={saving} saved={saved} />}
              {activeTab === "expect" && <ExpectationsSection profile={profile} onSave={d => handleSave("expect", d)} saving={saving} saved={saved} />}
            </div>
          </main>
        </div>
      </div>
    </UserLayout>
  )
}

// ── Sections ──────────────────────────────────────────────────────────────────

function BasicSection({ profile, onSave, saving, saved }: { profile: Profile; onSave: (d: any) => void; saving: boolean; saved: boolean }) {
  const [data, setData] = useState({ ...profile })
  return (
    <div className="space-y-6">
      <SectionTitle>Name & Identity</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name (English)"><Inp value={data.full_name} onChange={e => setData({...data, full_name: e.target.value})} /></Field>
        <Field label="Full Name (Tamil)"><Inp value={data.full_name_tamil || ""} onChange={e => setData({...data, full_name_tamil: e.target.value})} className="font-tamil h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" /></Field>
        <Field label="Date of Birth"><Inp type="date" value={data.date_of_birth ? data.date_of_birth.split("T")[0] : ""} onChange={e => setData({...data, date_of_birth: e.target.value})} /></Field>
        <Field label="Gender">
          <Sel value={data.gender} onChange={e => setData({...data, gender: e.target.value})}>
            <option value="male">Male</option><option value="female">Female</option>
          </Sel>
        </Field>
      </div>
      <SectionTitle>Cultural & Personal</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Marital Status">
          <Sel value={data.marital_status || ""} onChange={e => setData({...data, marital_status: e.target.value})}>
            <option value="never_married">Never Married</option><option value="divorced">Divorced</option><option value="widowed">Widowed</option>
          </Sel>
        </Field>
        <Field label="Mother Tongue"><Inp value={data.mother_tongue || ""} onChange={e => setData({...data, mother_tongue: e.target.value})} /></Field>
        <Field label="Religion"><Inp value={data.religion || ""} onChange={e => setData({...data, religion: e.target.value})} /></Field>
      </div>
      <SectionTitle>Physical Appearance</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Height (cm)"><Inp type="number" value={data.height_cm || ""} onChange={e => setData({...data, height_cm: Number(e.target.value)})} /></Field>
        <Field label="Weight (kg)"><Inp type="number" value={data.weight_kg || ""} onChange={e => setData({...data, weight_kg: Number(e.target.value)})} /></Field>
        <Field label="Complexion">
          <Sel value={data.complexion || ""} onChange={e => setData({...data, complexion: e.target.value})}>
            <option value="fair">Fair</option><option value="wheatish">Wheatish</option><option value="dark">Dark</option>
          </Sel>
        </Field>
        <Field label="Food Preference">
          <Sel value={data.food_preference || ""} onChange={e => setData({...data, food_preference: e.target.value})}>
            <option value="vegetarian">Vegetarian</option><option value="non_vegetarian">Non-Vegetarian</option><option value="eggetarian">Eggetarian</option>
          </Sel>
        </Field>
        <Field label="Body Type">
          <Sel value={data.body_type || ""} onChange={e => setData({...data, body_type: e.target.value})}>
            <option value="slim">Slim</option><option value="average">Average</option><option value="heavy">Heavy</option><option value="athletic">Athletic</option>
          </Sel>
        </Field>
      </div>
      <SaveBar onSave={() => onSave(data)} saving={saving} saved={saved} />
    </div>
  )
}

function CareerSection({ profile, onSave, saving, saved }: { profile: Profile; onSave: (d: any) => void; saving: boolean; saved: boolean }) {
  const [data, setData] = useState({ ...profile })
  return (
    <div className="space-y-6">
      <SectionTitle>Education</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Qualification"><Inp value={data.qualification || ""} onChange={e => setData({...data, qualification: e.target.value})} /></Field>
        <Field label="Field of Study"><Inp value={data.field_of_study || ""} onChange={e => setData({...data, field_of_study: e.target.value})} /></Field>
        <Field label="Institution"><Inp value={data.institution || ""} onChange={e => setData({...data, institution: e.target.value})} /></Field>
        <Field label="Graduation Year"><Inp type="number" value={data.graduation_year || ""} onChange={e => setData({...data, graduation_year: Number(e.target.value)})} /></Field>
      </div>
      <SectionTitle>Career</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Employment Type">
          <Sel value={data.employment_type || ""} onChange={e => setData({...data, employment_type: e.target.value})}>
            <option value="salaried">Salaried</option><option value="business">Business</option><option value="self_employed">Self-Employed</option><option value="not_working">Not Working</option>
          </Sel>
        </Field>
        <Field label="Company Name"><Inp value={data.company_name || ""} onChange={e => setData({...data, company_name: e.target.value})} /></Field>
        <Field label="Designation"><Inp value={data.designation || ""} onChange={e => setData({...data, designation: e.target.value})} /></Field>
        <Field label="Work Location"><Inp value={data.work_location || ""} onChange={e => setData({...data, work_location: e.target.value})} /></Field>
        <Field label="Annual Income (₹)"><Inp type="number" value={data.annual_income || ""} onChange={e => setData({...data, annual_income: Number(e.target.value)})} /></Field>
      </div>
      <SaveBar onSave={() => onSave(data)} saving={saving} saved={saved} />
    </div>
  )
}

function FamilySection({ profile, onSave, saving, saved }: { profile: Profile; onSave: (d: any) => void; saving: boolean; saved: boolean }) {
  const [data, setData] = useState({ ...profile })
  return (
    <div className="space-y-6">
      <SectionTitle>Family Members</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Father's Name"><Inp value={data.father_name || ""} onChange={e => setData({...data, father_name: e.target.value})} /></Field>
        <Field label="Father's Occupation"><Inp value={data.father_occupation || ""} onChange={e => setData({...data, father_occupation: e.target.value})} /></Field>
        <Field label="Mother's Name"><Inp value={data.mother_name || ""} onChange={e => setData({...data, mother_name: e.target.value})} /></Field>
        <Field label="Mother's Occupation"><Inp value={data.mother_occupation || ""} onChange={e => setData({...data, mother_occupation: e.target.value})} /></Field>
      </div>
      <SectionTitle>Location</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Country"><Inp value={data.country || "India"} onChange={e => setData({...data, country: e.target.value})} /></Field>
        <Field label="State"><Inp value={data.state || ""} onChange={e => setData({...data, state: e.target.value})} /></Field>
        <Field label="City"><Inp value={data.city || ""} onChange={e => setData({...data, city: e.target.value})} /></Field>
        <Field label="Area"><Inp value={data.area || ""} onChange={e => setData({...data, area: e.target.value})} /></Field>
        <Field label="Native Place"><Inp value={data.native_place || ""} onChange={e => setData({...data, native_place: e.target.value})} /></Field>
      </div>
      <SaveBar onSave={() => onSave(data)} saving={saving} saved={saved} />
    </div>
  )
}

function AstrologySection({ profile, onSave, saving, saved }: { profile: Profile; onSave: (d: any) => void; saving: boolean; saved: boolean }) {
  const [data, setData] = useState<AstrologyData>(profile.astrology || {
    rasi_name: null, natchathiram: null, padam: null, birth_time: null, birth_am_pm: "AM",
    birth_place: null, date_of_birth: profile.date_of_birth, lagna_name: null,
    rasi_chart: {}, navamsa_chart: {}
  })
  const [editingBox, setEditingBox] = useState<{ type: 'rasi' | 'navamsa', rasiNum: number } | null>(null)

  const rasiPositions = useMemo(() => convertChartToPositions(data.rasi_chart || {}), [data.rasi_chart])
  const navamsaPositions = useMemo(() => convertChartToPositions(data.navamsa_chart || {}), [data.navamsa_chart])

  const togglePlanet = (type: 'rasi' | 'navamsa', rasiKey: RasiKey, planet: PlanetCode) => {
    const isRasi = type === 'rasi'
    const chart = isRasi ? { ...(data.rasi_chart || {}) } : { ...(data.navamsa_chart || {}) }
    const current = chart[rasiKey] || []
    
    if (current.includes(planet)) {
      chart[rasiKey] = current.filter(p => p !== planet)
    } else {
      // Clear elsewhere
      Object.keys(chart).forEach(k => { if(chart[k as RasiKey]) chart[k as RasiKey] = chart[k as RasiKey]!.filter(p => p !== planet) })
      chart[rasiKey] = [...(chart[rasiKey] || []), planet]
    }
    if (isRasi) setData({ ...data, rasi_chart: chart })
    else setData({ ...data, navamsa_chart: chart })
  }

  return (
    <div className="space-y-6">
      <SectionTitle>Birth Details</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Birth Time"><Inp type="time" value={data.birth_time || ""} onChange={e => setData({...data, birth_time: e.target.value})} /></Field>
        <Field label="Birth Place"><Inp value={data.birth_place || ""} onChange={e => setData({...data, birth_place: e.target.value})} /></Field>
        <Field label="Rasi">
          <Sel value={data.rasi_name || ""} onChange={e => setData({...data, rasi_name: e.target.value})}>
            <option value="">Select</option>
            {["Mesham","Rishabam","Mithunam","Kadagam","Simmam","Kanni","Thulam","Viruchigam","Dhanusu","Magaram","Kumbam","Meenam"].map(r => <option key={r} value={r}>{r}</option>)}
          </Sel>
        </Field>
        <Field label="Star"><Inp value={data.natchathiram || ""} onChange={e => setData({...data, natchathiram: e.target.value})} /></Field>
      </div>

      <SectionTitle>Charts</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Rasi Chart</p>
          <KoduGrid planetPositions={rasiPositions} size="sm" onHouseClick={(_h, r) => setEditingBox({ type: 'rasi', rasiNum: r })} />
        </div>
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Navamsa Chart</p>
          <KoduGrid planetPositions={navamsaPositions} size="sm" onHouseClick={(_h, r) => setEditingBox({ type: 'navamsa', rasiNum: r })} />
        </div>
      </div>

      {editingBox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-2xl p-6 w-full max-w-sm border shadow-2xl">
            <h3 className="mb-4 font-bold">{editingBox.type.toUpperCase()} - {editingBox.rasiNum}</h3>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(PLANETS).map(([code, p]) => {
                const rasiKey = ["Mesham","Rishabam","Mithunam","Kadagam","Simmam","Kanni","Thulam","Viruchigam","Dhanusu","Magaram","Kumbam","Meenam"][editingBox.rasiNum - 1] as RasiKey
                const chart = editingBox.type === 'rasi' ? data.rasi_chart : data.navamsa_chart
                const active = chart?.[rasiKey]?.includes(code as PlanetCode)
                return (
                  <button key={code} onClick={() => togglePlanet(editingBox.type, rasiKey, code as PlanetCode)}
                    className={`rounded-lg p-2 text-xs font-bold border transition ${active ? "bg-primary text-primary-foreground border-primary" : "bg-muted hover:bg-secondary border-transparent"}`}>
                    {p.short}
                  </button>
                )
              })}
            </div>
            <Button className="mt-6 w-full" onClick={() => setEditingBox(null)}>Done</Button>
          </div>
        </div>
      )}

      <SaveBar onSave={() => onSave(data)} saving={saving} saved={saved} />
    </div>
  )
}

function ExpectationsSection({ profile, onSave, saving, saved }: { profile: Profile; onSave: (d: any) => void; saving: boolean; saved: boolean }) {
  const [data, setData] = useState(profile.expectations || {
    age_range_min: 21, age_range_max: 35, height_range_min: 150, height_range_max: 180,
    education_pref: "", employment_pref: [], income_pref: 0, location_pref: [], custom_note: ""
  })
  return (
    <div className="space-y-6">
      <SectionTitle>Partner Preferences</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Age Range Min"><Inp type="number" value={data.age_range_min || ""} onChange={e => setData({...data, age_range_min: Number(e.target.value)})} /></Field>
        <Field label="Age Range Max"><Inp type="number" value={data.age_range_max || ""} onChange={e => setData({...data, age_range_max: Number(e.target.value)})} /></Field>
        <Field label="Height Range Min (cm)"><Inp type="number" value={data.height_range_min || ""} onChange={e => setData({...data, height_range_min: Number(e.target.value)})} /></Field>
        <Field label="Height Range Max (cm)"><Inp type="number" value={data.height_range_max || ""} onChange={e => setData({...data, height_range_max: Number(e.target.value)})} /></Field>
        <Field label="Education Preference"><Inp value={data.education_pref || ""} onChange={e => setData({...data, education_pref: e.target.value})} /></Field>
      </div>
      <Field label="Custom Note (Expectations)"><textarea value={data.custom_note || ""} onChange={e => setData({...data, custom_note: e.target.value})} className="h-24 w-full rounded-lg border border-input bg-background p-3 text-sm" /></Field>
      <SaveBar onSave={() => onSave(data)} saving={saving} saved={saved} />
    </div>
  )
}
