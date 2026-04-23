"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Camera, Briefcase, Users, Star, Heart, Shield,
  User, CheckCircle2, XCircle, Clock, Save, MapPin,
  PencilLine, FileText, Lock, Unlock, Sparkles,
} from "lucide-react"
import { AdminLayout } from "../../admin-layout"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { KoduGrid } from "@/components/kodu-grid"
import { PhotoSlideshow } from "@/components/photo-slideshow"
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
  email: string
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
  closed_reason: string | null
  closed_at: string | null
  profile_number: number | null
  completeness_score: number
  created_at: string
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
  { id: "approval",  label: "Approval",           Icon: Shield },
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
  const [photos, setPhotos] = useState(initial)
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (photos.length >= 5) { setErr("Maximum 5 photos allowed"); return }
    setUploading(true); setErr(null)
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("maratha_token") : null
      const fd = new FormData()
      fd.append("photo", file)
      const res = await fetch(`${API_BASE}/api/admin/profiles/${profileId}/photo`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      })
      if (!res.ok) { const j = await res.json().catch(() => ({})); throw new Error(j.message || "Upload failed") }
      const photo: PhotoData = await res.json()
      setPhotos(prev => [...prev, photo])
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  async function handleDelete(photoId: string) {
    try {
      await apiFetch(`/api/admin/profiles/${profileId}/photo/${photoId}`, { method: "DELETE" })
      setPhotos(prev => prev.filter(p => p.id !== photoId))
    } catch (e: any) { setErr(e.message) }
  }

  async function handlePrimary(photoId: string) {
    try {
      await apiFetch(`/api/admin/profiles/${profileId}/photo/${photoId}/primary`, { method: "PUT" })
      setPhotos(prev => prev.map(p => ({ ...p, is_primary: p.id === photoId })))
    } catch (e: any) { setErr(e.message) }
  }

  async function handleBlur(photoId: string, blur: boolean) {
    try {
      await apiFetch(`/api/admin/profiles/${profileId}/photo/${photoId}/blur`, {
        method: "PATCH",
        body: JSON.stringify({ blur }),
      })
      setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, blur_for_basic: blur } : p))
    } catch (e: any) { setErr(e.message) }
  }

  // Build slideshow-compatible photo list (prepend API_BASE to relative URLs)
  const slideshowPhotos = photos.map(ph => ({
    url: `${API_BASE}${ph.url}`,
    is_primary: ph.is_primary,
    label: ph.is_primary ? "Primary Photo" : undefined,
  }))

  return (
    <div>
      <SectionTitle>Profile Photos</SectionTitle>

      {err && <p className="mb-4 text-sm text-destructive">{err}</p>}

      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-secondary/20 py-16 mb-6 gap-3">
          <Camera className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No photos uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 mb-6 items-start">
          {/* Slideshow */}
          <PhotoSlideshow
            photos={slideshowPhotos}
            autoPlayMs={3500}
            showThumbnails
            showFullscreen
            aspectRatio="4/3"
          />

          {/* Management panel */}
          <div className="flex flex-col gap-2 min-w-[180px]">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Manage Photos</p>
            {photos.map((photo, i) => (
              <div key={photo.id} className="group flex items-center gap-2 rounded-xl border border-border bg-secondary/30 p-2 hover:bg-secondary/60 transition">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${API_BASE}${photo.url}`}
                  alt={`Photo ${i + 1}`}
                  className={`h-10 w-10 rounded-lg object-cover shrink-0 ${photo.blur_for_basic ? "blur-sm" : ""}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    Photo {i + 1}{photo.is_primary ? " · Primary" : ""}
                  </p>
                  {photo.blur_for_basic && (
                    <p className="text-[10px] text-muted-foreground">Blurred for basic</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!photo.is_primary && (
                    <button
                      onClick={() => handlePrimary(photo.id)}
                      title="Set as primary"
                      className="rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary hover:bg-primary/20"
                    >★</button>
                  )}
                  <button
                    onClick={() => handleBlur(photo.id, !photo.blur_for_basic)}
                    title={photo.blur_for_basic ? "Remove blur" : "Blur for basic users"}
                    className="rounded-lg bg-secondary px-2 py-1 text-[10px] font-semibold text-muted-foreground hover:bg-secondary/80"
                  >{photo.blur_for_basic ? "Unblur" : "Blur"}</button>
                  <button
                    onClick={() => handleDelete(photo.id)}
                    title="Delete photo"
                    className="rounded-lg bg-red-500/10 px-2 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-500/20"
                  >✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading || photos.length >= 5}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10 disabled:opacity-50"
        >
          {uploading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" /> : <Camera className="h-4 w-4" />}
          {uploading ? "Uploading…" : "Upload Photo"}
        </button>
        <p className="text-xs text-muted-foreground">{photos.length} / 5 photos · Click the slideshow to enlarge · ← → keys to navigate</p>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
    </div>
  )
}

// ── Basic & Physical Tab ──────────────────────────────────────────────────────

function BasicPhysicalTab({ profileId, profile }: { profileId: string; profile: Profile }) {
  const [form, setForm] = useState({
    full_name: profile.full_name ?? "",
    full_name_tamil: profile.full_name_tamil ?? "",
    date_of_birth: profile.date_of_birth?.slice(0, 10) ?? "",
    gender: profile.gender ?? "",
    marital_status: profile.marital_status ?? "",
    mother_tongue: profile.mother_tongue ?? "Tamil",
    religion: profile.religion ?? "Hindu",
    height_cm: profile.height_cm ?? "",
    weight_kg: profile.weight_kg ?? "",
    complexion: profile.complexion ?? "",
    food_preference: profile.food_preference ?? "",
    body_type: profile.body_type ?? "",
    physical_disability: profile.physical_disability ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSave() {
    setSaving(true); setErr(null)
    try {
      await apiFetch(`/api/admin/profiles/${profileId}`, { method: "PUT", body: JSON.stringify({ section: "basic", data: form }) })
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch (e: any) { setErr(e.message) } finally { setSaving(false) }
  }

  return (
    <div>
      <SectionTitle>Basic Details</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Field label="Full Name"><Inp value={form.full_name} onChange={upd("full_name")} /></Field>
        <Field label="Tamil Name"><Inp value={form.full_name_tamil} onChange={upd("full_name_tamil")} placeholder="தமிழ் பெயர்" /></Field>
        <Field label="Date of Birth"><Inp type="date" value={form.date_of_birth} onChange={upd("date_of_birth")} /></Field>
        <Field label="Gender">
          <Sel value={form.gender} onChange={upd("gender")}>
            <option value="">— Select —</option>
            <option value="male">Male (ஆண்)</option>
            <option value="female">Female (பெண்)</option>
          </Sel>
        </Field>
        <Field label="Marital Status">
          <Sel value={form.marital_status} onChange={upd("marital_status")}>
            <option value="">— Select —</option>
            <option value="never_married">Never Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </Sel>
        </Field>
        <Field label="Mother Tongue">
          <Sel value={form.mother_tongue} onChange={upd("mother_tongue")}>
            {["Tamil","Telugu","Kannada","Malayalam","Hindi","Other"].map(t => <option key={t} value={t}>{t}</option>)}
          </Sel>
        </Field>
        <Field label="Religion">
          <Sel value={form.religion} onChange={upd("religion")}>
            {["Hindu","Christian","Muslim","Jain","Other"].map(r => <option key={r} value={r}>{r}</option>)}
          </Sel>
        </Field>
      </div>

      <SectionTitle>Physical Details</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Height (cm)"><Inp type="number" value={form.height_cm} onChange={upd("height_cm")} min={140} max={210} /></Field>
        <Field label="Weight (kg)"><Inp type="number" value={form.weight_kg} onChange={upd("weight_kg")} min={30} max={150} /></Field>
        <Field label="Complexion">
          <Sel value={form.complexion} onChange={upd("complexion")}>
            <option value="">— Select —</option>
            <option value="fair">Fair</option>
            <option value="wheatish">Wheatish</option>
            <option value="dark">Dark</option>
          </Sel>
        </Field>
        <Field label="Food Preference">
          <Sel value={form.food_preference} onChange={upd("food_preference")}>
            <option value="">— Select —</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="non_vegetarian">Non-Vegetarian</option>
            <option value="eggetarian">Eggetarian</option>
          </Sel>
        </Field>
        <Field label="Body Type">
          <Sel value={form.body_type} onChange={upd("body_type")}>
            <option value="">— Select —</option>
            {["Slim","Athletic","Average","Heavy"].map(b => <option key={b} value={b}>{b}</option>)}
          </Sel>
        </Field>
        <Field label="Physical Disability">
          <Inp value={form.physical_disability} onChange={upd("physical_disability")} placeholder="Leave blank if none" />
        </Field>
      </div>

      <SaveBar onSave={handleSave} saving={saving} saved={saved} error={err} />
    </div>
  )
}

// ── Career & Education Tab ────────────────────────────────────────────────────

function CareerEducationTab({ profileId, profile }: { profileId: string; profile: Profile }) {
  const [form, setForm] = useState({
    employment_type: profile.employment_type ?? "",
    company_name: profile.company_name ?? "",
    designation: profile.designation ?? "",
    work_location: profile.work_location ?? "",
    annual_income: profile.annual_income ?? "",
    qualification: profile.qualification ?? "",
    field_of_study: profile.field_of_study ?? "",
    institution: profile.institution ?? "",
    graduation_year: profile.graduation_year ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSave() {
    setSaving(true); setErr(null)
    try {
      await apiFetch(`/api/admin/profiles/${profileId}`, { method: "PUT", body: JSON.stringify({ section: "career", data: form }) })
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch (e: any) { setErr(e.message) } finally { setSaving(false) }
  }

  const showCompany = !["Student","Not Working"].includes(form.employment_type)

  return (
    <div>
      <SectionTitle>Career Details</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Field label="Employment Type">
          <Sel value={form.employment_type} onChange={upd("employment_type")}>
            <option value="">— Select —</option>
            {["Private","Government","Salaried","Business","Self-Employed","Student","Not Working"].map(e =>
              <option key={e} value={e}>{e}</option>
            )}
          </Sel>
        </Field>
        {showCompany && (
          <>
            <Field label="Company / Organisation"><Inp value={form.company_name} onChange={upd("company_name")} /></Field>
            <Field label="Designation"><Inp value={form.designation} onChange={upd("designation")} /></Field>
            <Field label="Work Location"><Inp value={form.work_location} onChange={upd("work_location")} /></Field>
          </>
        )}
        <Field label="Annual Income (₹)"><Inp type="number" value={form.annual_income} onChange={upd("annual_income")} placeholder="e.g. 600000" /></Field>
      </div>

      <SectionTitle>Education Details</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Qualification">
          <Sel value={form.qualification} onChange={upd("qualification")}>
            <option value="">— Select —</option>
            {[["B.E","B.E"],["B.Tech","B.Tech"],["M.E","M.E"],["M.Tech","M.Tech"],["B.Sc","B.Sc"],["M.Sc","M.Sc"],["B.Com","B.Com"],["MBA","MBA"],["MBBS","MBBS"],["PhD","PhD"],["Diploma","Diploma"],["Other","Other"]].map(([v,l]) =>
              <option key={v} value={v}>{l}</option>
            )}
          </Sel>
        </Field>
        <Field label="Field of Study"><Inp value={form.field_of_study} onChange={upd("field_of_study")} /></Field>
        <Field label="Institution / College"><Inp value={form.institution} onChange={upd("institution")} /></Field>
        <Field label="Graduation Year"><Inp type="number" value={form.graduation_year} onChange={upd("graduation_year")} min={1970} max={new Date().getFullYear()} /></Field>
      </div>

      <SaveBar onSave={handleSave} saving={saving} saved={saved} error={err} />
    </div>
  )
}

// ── Family & Location Tab ─────────────────────────────────────────────────────

function FamilyLocationTab({ profileId, profile }: { profileId: string; profile: Profile }) {
  const boolToStr = (v: boolean | null) => v === true ? "yes" : v === false ? "no" : ""
  const [form, setForm] = useState({
    family_type: profile.family_type ?? "",
    family_status: profile.family_status ?? "",
    family_values: profile.family_values ?? "",
    father_name: profile.father_name ?? "",
    father_occupation: profile.father_occupation ?? "",
    father_alive: boolToStr(profile.father_alive),
    mother_name: profile.mother_name ?? "",
    mother_occupation: profile.mother_occupation ?? "",
    mother_alive: boolToStr(profile.mother_alive),
    country: profile.country ?? "India",
    state: profile.state ?? "",
    city: profile.city ?? "",
    area: profile.area ?? "",
    native_place: profile.native_place ?? "",
    willing_to_relocate: boolToStr(profile.willing_to_relocate),
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSave() {
    setSaving(true); setErr(null)
    try {
      await apiFetch(`/api/admin/profiles/${profileId}`, { method: "PUT", body: JSON.stringify({ section: "family", data: form }) })
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch (e: any) { setErr(e.message) } finally { setSaving(false) }
  }

  return (
    <div>
      <SectionTitle>Family Details</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Field label="Family Type">
          <Sel value={form.family_type} onChange={upd("family_type")}>
            <option value="">— Select —</option>
            <option value="joint">Joint (கூட்டுக் குடும்பம்)</option>
            <option value="nuclear">Nuclear (தனிக் குடும்பம்)</option>
          </Sel>
        </Field>
        <Field label="Family Values">
          <Sel value={form.family_values} onChange={upd("family_values")}>
            <option value="">— Select —</option>
            <option value="traditional">Traditional</option>
            <option value="moderate">Moderate</option>
            <option value="liberal">Liberal</option>
          </Sel>
        </Field>
        <Field label="Family Status">
          <Sel value={form.family_status} onChange={upd("family_status")}>
            <option value="">— Select —</option>
            <option value="middle_class">Middle Class</option>
            <option value="upper_middle">Upper Middle</option>
            <option value="affluent">Affluent</option>
          </Sel>
        </Field>
        <Field label="Father's Name"><Inp value={form.father_name} onChange={upd("father_name")} /></Field>
        <Field label="Father's Occupation"><Inp value={form.father_occupation} onChange={upd("father_occupation")} /></Field>
        <Field label="Father Alive">
          <Sel value={form.father_alive} onChange={upd("father_alive")}>
            <option value="">— Select —</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </Sel>
        </Field>
        <Field label="Mother's Name"><Inp value={form.mother_name} onChange={upd("mother_name")} /></Field>
        <Field label="Mother's Occupation"><Inp value={form.mother_occupation} onChange={upd("mother_occupation")} /></Field>
        <Field label="Mother Alive">
          <Sel value={form.mother_alive} onChange={upd("mother_alive")}>
            <option value="">— Select —</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </Sel>
        </Field>
      </div>

      <SectionTitle>Location Details</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Country">
          <Sel value={form.country} onChange={upd("country")}>
            {["India","USA","UK","Canada","Australia","Singapore","UAE","Germany"].map(c => <option key={c} value={c}>{c}</option>)}
          </Sel>
        </Field>
        <Field label="State"><Inp value={form.state} onChange={upd("state")} placeholder="Tamil Nadu" /></Field>
        <Field label="City"><Inp value={form.city} onChange={upd("city")} /></Field>
        <Field label="Area / Locality"><Inp value={form.area} onChange={upd("area")} /></Field>
        <Field label="Native Place"><Inp value={form.native_place} onChange={upd("native_place")} /></Field>
        <Field label="Willing to Relocate">
          <Sel value={form.willing_to_relocate} onChange={upd("willing_to_relocate")}>
            <option value="">— Select —</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </Sel>
        </Field>
      </div>

      <SaveBar onSave={handleSave} saving={saving} saved={saved} error={err} />
    </div>
  )
}

// ── Astrology Tab ─────────────────────────────────────────────────────────────

const RASI_NUM_TO_KEY: Record<number, RasiKey> = {
  1: "Mesham", 2: "Rishabam", 3: "Mithunam", 4: "Kadagam",
  5: "Simmam", 6: "Kanni", 7: "Thulam", 8: "Viruchigam",
  9: "Dhanusu", 10: "Magaram", 11: "Kumbam", 12: "Meenam",
}
const RASI_TO_HOUSE: Record<string, number> = {
  Mesham: 1, Rishabam: 2, Mithunam: 3, Kadagam: 4,
  Simmam: 5, Kanni: 6, Thulam: 7, Viruchigam: 8,
  Dhanusu: 9, Magaram: 10, Kumbam: 11, Meenam: 12,
}
const RASI_LIST = Object.keys(RASI_TO_HOUSE)

function AstrologyTab({ profileId, profile }: { profileId: string; profile: Profile }) {
  const astro = profile.astrology
  const [form, setForm] = useState({
    date_of_birth: astro?.date_of_birth?.slice(0, 10) ?? profile.date_of_birth?.slice(0, 10) ?? "",
    birth_time: astro?.birth_time ?? "",
    birth_am_pm: astro?.birth_am_pm ?? "AM",
    birth_place: astro?.birth_place ?? "",
    lagna_name: astro?.lagna_name ?? "",
    rasi_name: astro?.rasi_name ?? "",
    natchathiram: astro?.natchathiram ?? "",
    padam: astro?.padam ?? "",
  })
  const [rasiChart, setRasiChart] = useState<Chart>(astro?.rasi_chart ?? {})
  const [navamsaChart, setNavamsaChart] = useState<Chart>(astro?.navamsa_chart ?? {})
  const [editingBox, setEditingBox] = useState<{ type: "rasi" | "navamsa"; rasiNum: number } | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const rasiPositions = useMemo(() => convertChartToPositions(rasiChart), [rasiChart])
  const navamsaPositions = useMemo(() => convertChartToPositions(navamsaChart), [navamsaChart])

  function lagnaHouseFromChart(chart: Chart): number {
    for (const [key, planets] of Object.entries(chart)) {
      if ((planets as PlanetCode[]).includes("La")) return RASI_TO_HOUSE[key] ?? 1
    }
    return form.lagna_name ? (RASI_TO_HOUSE[form.lagna_name] ?? 1) : 1
  }

  function togglePlanet(type: "rasi" | "navamsa", rasiKey: RasiKey, planet: PlanetCode) {
    const isRasi = type === "rasi"
    const chart = isRasi ? rasiChart : navamsaChart
    const current = chart[rasiKey] || []
    if (current.includes(planet)) {
      const updated = { ...chart, [rasiKey]: current.filter(p => p !== planet) }
      isRasi ? setRasiChart(updated) : setNavamsaChart(updated)
    } else {
      const cleared: Chart = {}
      for (const [k, v] of Object.entries(chart)) cleared[k as RasiKey] = (v as PlanetCode[]).filter(p => p !== planet)
      const updated = { ...cleared, [rasiKey]: [...(cleared[rasiKey] || []), planet] }
      isRasi ? setRasiChart(updated) : setNavamsaChart(updated)
    }
  }

  async function handleSave() {
    setSaving(true); setErr(null)
    try {
      await apiFetch(`/api/admin/profiles/${profileId}`, {
        method: "PUT",
        body: JSON.stringify({ section: "astrology", data: { ...form, rasi_chart: rasiChart, navamsa_chart: navamsaChart } }),
      })
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch (e: any) { setErr(e.message) } finally { setSaving(false) }
  }

  return (
    <div>
      <SectionTitle>Birth Details</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Field label="Date of Birth"><Inp type="date" value={form.date_of_birth} onChange={upd("date_of_birth")} /></Field>
        <Field label="Birth Time (HH:MM)"><Inp type="time" value={form.birth_time} onChange={upd("birth_time")} /></Field>
        <Field label="AM / PM">
          <Sel value={form.birth_am_pm} onChange={upd("birth_am_pm")}>
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </Sel>
        </Field>
        <Field label="Birth Place"><Inp value={form.birth_place} onChange={upd("birth_place")} placeholder="e.g. Madurai, Tamil Nadu" /></Field>
      </div>

      <SectionTitle>Astrological Values</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Field label="Lagna Rasi">
          <Sel value={form.lagna_name} onChange={upd("lagna_name")}>
            <option value="">— Select —</option>
            {RASI_LIST.map(r => <option key={r} value={r}>{r}</option>)}
          </Sel>
        </Field>
        <Field label="Moon Rasi (ராசி)">
          <Sel value={form.rasi_name} onChange={upd("rasi_name")}>
            <option value="">— Select —</option>
            {RASI_LIST.map(r => <option key={r} value={r}>{r}</option>)}
          </Sel>
        </Field>
        <Field label="Natchathiram (Star)"><Inp value={form.natchathiram} onChange={upd("natchathiram")} placeholder="e.g. Rohini" /></Field>
        <Field label="Padam"><Inp type="number" value={form.padam} onChange={upd("padam")} min={1} max={4} /></Field>
      </div>

      <SectionTitle>Horoscope Charts</SectionTitle>
      <div className="mb-4 rounded-xl bg-orange-50 border border-orange-200 p-4 text-sm text-orange-800">
        <p className="font-semibold flex items-center gap-2"><Star className="h-4 w-4" fill="currentColor" /> Interactive Chart Editor</p>
        <p className="mt-1 text-xs opacity-90">Tap any box to edit planets in that house. Selecting a planet removes it from other houses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="flex flex-col items-center gap-3">
          <p className="font-serif text-base font-semibold text-foreground">ராசி கட்டம் <span className="text-sm font-sans text-muted-foreground font-normal">Rasi Chart</span></p>
          <KoduGrid
            planetPositions={rasiPositions}
            lagnaHouse={lagnaHouseFromChart(rasiChart)}
            mode="rasi"
            size="lg"
            showToggle={false}
            personName={profile.full_name}
            dob={profile.date_of_birth ?? ""}
            onHouseClick={(_h, rasi) => setEditingBox({ type: "rasi", rasiNum: rasi })}
          />
        </div>
        <div className="flex flex-col items-center gap-3">
          <p className="font-serif text-base font-semibold text-foreground">நவாம்ச கட்டம் <span className="text-sm font-sans text-muted-foreground font-normal">Navamsa Chart</span></p>
          <KoduGrid
            planetPositions={navamsaPositions}
            lagnaHouse={lagnaHouseFromChart(navamsaChart)}
            mode="navamsa"
            size="lg"
            showToggle={false}
            personName={profile.full_name}
            onHouseClick={(_h, rasi) => setEditingBox({ type: "navamsa", rasiNum: rasi })}
          />
        </div>
      </div>

      {/* Planet edit modal */}
      {editingBox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background rounded-3xl w-full max-w-sm shadow-2xl border border-border p-5">
            <div className="flex justify-between items-center mb-5 border-b border-border pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold">{editingBox.type === "rasi" ? "Rasi" : "Navamsa"} Chart</h3>
                <p className="text-sm text-primary font-bold">{RASI_NUM_TO_KEY[editingBox.rasiNum]}</p>
              </div>
              <button onClick={() => setEditingBox(null)} className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-muted-foreground hover:bg-secondary/80">✕</button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(PLANETS).map(([code, p]) => {
                const chart = editingBox.type === "rasi" ? rasiChart : navamsaChart
                const rasiKey = RASI_NUM_TO_KEY[editingBox.rasiNum]
                const inHouse = (chart[rasiKey] || []).includes(code as PlanetCode)
                const usedElsewhere = !inHouse && Object.values(chart).some(pl => (pl as PlanetCode[])?.includes(code as PlanetCode))
                return (
                  <button
                    key={code}
                    onClick={() => !usedElsewhere && togglePlanet(editingBox.type, rasiKey, code as PlanetCode)}
                    disabled={usedElsewhere}
                    className={`flex flex-col items-center justify-center py-3 rounded-2xl border-2 transition-all ${
                      inHouse ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : usedElsewhere ? "bg-secondary/30 border-transparent opacity-40 cursor-not-allowed"
                      : "bg-secondary/50 border-transparent hover:border-border hover:bg-secondary"
                    }`}
                  >
                    <span className="text-base font-bold font-tamil mb-1">{p.tamil}</span>
                    <span className={`text-[9px] uppercase tracking-wider font-semibold ${inHouse ? "opacity-90" : "text-muted-foreground"}`}>{p.short}</span>
                  </button>
                )
              })}
            </div>
            <button onClick={() => setEditingBox(null)} className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Done</button>
          </div>
        </div>
      )}

      <SaveBar onSave={handleSave} saving={saving} saved={saved} error={err} />
    </div>
  )
}

// ── Expectations Tab ──────────────────────────────────────────────────────────

function ExpectationsTab({ profileId, profile }: { profileId: string; profile: Profile }) {
  const ex = profile.expectations
  const [form, setForm] = useState({
    age_range_min: ex?.age_range_min ?? "",
    age_range_max: ex?.age_range_max ?? "",
    height_range_min: ex?.height_range_min ?? "",
    height_range_max: ex?.height_range_max ?? "",
    education_pref: ex?.education_pref ?? "",
    income_pref: ex?.income_pref ?? "",
    minimum_poruthams: ex?.minimum_poruthams ?? 6,
    custom_note: ex?.custom_note ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSave() {
    setSaving(true); setErr(null)
    try {
      await apiFetch(`/api/admin/profiles/${profileId}`, { method: "PUT", body: JSON.stringify({ section: "expectations", data: form }) })
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch (e: any) { setErr(e.message) } finally { setSaving(false) }
  }

  return (
    <div>
      <SectionTitle>Partner Expectations</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Field label="Min Age (yrs)"><Inp type="number" value={form.age_range_min} onChange={upd("age_range_min")} min={18} max={65} /></Field>
        <Field label="Max Age (yrs)"><Inp type="number" value={form.age_range_max} onChange={upd("age_range_max")} min={18} max={65} /></Field>
        <Field label="Min Height (cm)"><Inp type="number" value={form.height_range_min} onChange={upd("height_range_min")} min={140} max={210} /></Field>
        <Field label="Max Height (cm)"><Inp type="number" value={form.height_range_max} onChange={upd("height_range_max")} min={140} max={210} /></Field>
        <Field label="Minimum Poruthams (1–10)"><Inp type="number" value={form.minimum_poruthams} onChange={upd("minimum_poruthams")} min={1} max={10} /></Field>
        <Field label="Income Preference (₹)"><Inp type="number" value={form.income_pref} onChange={upd("income_pref")} placeholder="e.g. 500000" /></Field>
        <Field label="Education Preference">
          <Sel value={form.education_pref} onChange={upd("education_pref")}>
            <option value="">Any</option>
            {["Graduate and above","Post Graduate","PhD","Diploma","Any"].map(e => <option key={e} value={e}>{e}</option>)}
          </Sel>
        </Field>
      </div>
      <Field label="Custom Note">
        <textarea
          value={form.custom_note}
          onChange={upd("custom_note")}
          rows={3}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          placeholder="Any specific preferences…"
        />
      </Field>
      <SaveBar onSave={handleSave} saving={saving} saved={saved} error={err} />
    </div>
  )
}

// ── Approval Tab ──────────────────────────────────────────────────────────────

function ApprovalTab({ profileId, profile }: { profileId: string; profile: Profile }) {
  const [status, setStatus] = useState(profile.status)
  const [isClosed, setIsClosed] = useState(profile.is_closed)
  const [closedReason, setClosedReason] = useState(profile.closed_reason ?? "")
  const [closedAt, setClosedAt] = useState(profile.closed_at)
  const [closeInput, setCloseInput] = useState("")
  const [actioning, setActioning] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [msgType, setMsgType] = useState<"ok" | "err">("ok")

  function notify(text: string, type: "ok" | "err" = "ok") { setMsg(text); setMsgType(type) }

  async function act(action: "approve" | "reject") {
    setActioning(true); setMsg(null)
    try {
      await apiFetch(`/api/admin/profiles/${profileId}/${action}`, { method: "PUT" })
      setStatus(action === "approve" ? "approved" : "rejected")
      notify(action === "approve" ? "Profile approved." : "Profile rejected.")
    } catch (e: any) { notify(e.message, "err") } finally { setActioning(false) }
  }

  async function handleClose() {
    if (!closeInput.trim()) { notify("Please enter a reason for closing (e.g. Engagement done, Marriage done).", "err"); return }
    setActioning(true); setMsg(null)
    try {
      await apiFetch(`/api/admin/profiles/${profileId}/close`, { method: "PUT", body: JSON.stringify({ reason: closeInput.trim() }) })
      setIsClosed(true)
      setClosedReason(closeInput.trim())
      setClosedAt(new Date().toISOString())
      setCloseInput("")
      notify("Profile closed successfully.")
    } catch (e: any) { notify(e.message, "err") } finally { setActioning(false) }
  }

  async function handleReopen() {
    setActioning(true); setMsg(null)
    try {
      await apiFetch(`/api/admin/profiles/${profileId}/reopen`, { method: "PUT" })
      setIsClosed(false)
      setClosedReason("")
      setClosedAt(null)
      notify("Profile reopened.")
    } catch (e: any) { notify(e.message, "err") } finally { setActioning(false) }
  }

  return (
    <div className="space-y-8">
      {/* Approval Status */}
      <div>
        <SectionTitle>Approval Status</SectionTitle>
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <span className="text-sm text-muted-foreground font-medium">Current Status:</span>
          {status === "approved" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700 border border-green-200"><CheckCircle2 className="h-4 w-4" /> Approved</span>
          )}
          {status === "rejected" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700 border border-red-200"><XCircle className="h-4 w-4" /> Rejected</span>
          )}
          {status === "pending" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700 border border-amber-200"><Clock className="h-4 w-4" /> Pending Review</span>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {status !== "approved" && (
            <Button disabled={actioning} onClick={() => act("approve")}
              className="bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Approve Profile
            </Button>
          )}
          {status !== "rejected" && (
            <Button disabled={actioning} variant="outline" onClick={() => act("reject")}
              className="border-destructive/40 text-destructive hover:bg-destructive/10 flex items-center gap-2">
              <XCircle className="h-4 w-4" /> Reject Profile
            </Button>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-secondary/20 p-5">
          <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
            <li>Approving sets the profile as public and visible in search.</li>
            <li>Rejecting hides the profile from the matrimony feed.</li>
            <li>User receives a notification when status changes.</li>
          </ul>
        </div>
      </div>

      {/* Close / Reopen Profile */}
      <div>
        <SectionTitle>Close / Reopen Profile</SectionTitle>

        {isClosed ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <Lock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 text-sm">Profile is Closed</p>
                {closedReason && <p className="text-sm text-amber-700 mt-0.5">Reason: <span className="font-medium">{closedReason}</span></p>}
                {closedAt && <p className="text-xs text-amber-600 mt-0.5">Closed on {new Date(closedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>}
              </div>
            </div>
            <Button disabled={actioning} onClick={handleReopen} variant="outline"
              className="flex items-center gap-2 border-emerald-400 text-emerald-700 hover:bg-emerald-50">
              <Unlock className="h-4 w-4" /> Reopen Profile
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Mark this profile as closed when engagement or marriage is done. The profile will remain in the system but be excluded from active matching.</p>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">Reason for Closing</label>
              <textarea
                value={closeInput}
                onChange={e => setCloseInput(e.target.value)}
                rows={2}
                placeholder="e.g. Engagement done, Marriage done, Found match outside platform…"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <Button disabled={actioning || !closeInput.trim()} onClick={handleClose}
              className="flex items-center gap-2 bg-amber-600 text-white hover:bg-amber-700">
              <Lock className="h-4 w-4" /> Close Profile
            </Button>
          </div>
        )}
      </div>

      {msg && (
        <p className={`text-sm font-medium ${msgType === "err" ? "text-destructive" : "text-emerald-700"}`}>{msg}</p>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminProfileEditPage() {
  const params = useParams()
  const router = useRouter()
  const profileId = params.id as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>("photos")

  useEffect(() => {
    apiFetch<Profile>(`/api/admin/profiles/${profileId}`)
      .then(data => setProfile(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [profileId])

  if (loading) {
    return (
      <AdminLayout activeHref="/admin/profiles" title="Profile Detail">
        <div className="space-y-4 animate-pulse">
          <div className="h-24 rounded-2xl bg-muted" />
          <div className="h-12 rounded-2xl bg-muted" />
          <div className="h-72 rounded-2xl bg-muted" />
        </div>
      </AdminLayout>
    )
  }

  if (error || !profile) {
    return (
      <AdminLayout activeHref="/admin/profiles" title="Profile Detail">
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <p className="text-lg font-semibold text-foreground">Profile not found</p>
          <p className="text-sm text-muted-foreground">{error ?? "The requested profile does not exist."}</p>
          <Button onClick={() => router.back()} variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Go Back</Button>
        </div>
      </AdminLayout>
    )
  }

  const isGroom = profile.gender === "male"
  const location = [profile.city, profile.state].filter(Boolean).join(", ") || "—"
  const age = profile.date_of_birth
    ? `${new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear()} yrs`
    : null
  const profileCode = profile.profile_number
    ? `MAT-${String(profile.profile_number).padStart(5, "0")}`
    : null

  return (
    <AdminLayout activeHref="/admin/profiles" title="Edit Profile">
      {/* Header */}
      <div className="mb-6 flex items-start gap-4 flex-wrap justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${isGroom ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
            {profile.full_name?.[0] ?? "?"}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-serif text-lg font-semibold text-foreground">{profile.full_name}</h2>
              {profile.full_name_tamil && <span className="font-tamil text-sm text-muted-foreground">({profile.full_name_tamil})</span>}
              {profileCode && (
                <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary tracking-wider">{profileCode}</span>
              )}
              {profile.is_closed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-xs font-bold text-amber-700"><Lock className="h-3 w-3" /> Closed</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isGroom ? "Groom" : "Bride"}{age ? ` · ${age}` : ""} · <span className="flex-inline"><MapPin className="inline h-3 w-3" /> {location}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Completeness */}
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: `${profile.completeness_score ?? 0}%` }} />
            </div>
            <span className="text-xs font-medium text-muted-foreground">{profile.completeness_score ?? 0}% complete</span>
          </div>
          <Link
            href={`/admin/profiles/${profileId}/matches`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/50 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" /> Find Match
          </Link>
          <Link
            href={`/admin/profiles/${profileId}/view`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/15 transition-colors"
          >
            <FileText className="h-3.5 w-3.5" /> View Biodata
          </Link>
          <Link
            href={`/admin/users/${profile.user_id}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            <PencilLine className="h-3.5 w-3.5" /> Edit User Account
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-1 rounded-xl border border-border bg-secondary/30 p-1">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
              activeTab === id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-2xl border border-border bg-card p-6 mb-12">
        {activeTab === "photos"    && <PhotosTab profileId={profileId} photos={profile.photos ?? []} />}
        {activeTab === "basic"     && <BasicPhysicalTab profileId={profileId} profile={profile} />}
        {activeTab === "career"    && <CareerEducationTab profileId={profileId} profile={profile} />}
        {activeTab === "family"    && <FamilyLocationTab profileId={profileId} profile={profile} />}
        {activeTab === "astrology" && <AstrologyTab profileId={profileId} profile={profile} />}
        {activeTab === "expect"    && <ExpectationsTab profileId={profileId} profile={profile} />}
        {activeTab === "approval"  && <ApprovalTab profileId={profileId} profile={profile} />}
      </div>
    </AdminLayout>
  )
}
