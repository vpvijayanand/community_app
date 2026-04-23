"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  User, Camera, Briefcase, GraduationCap, Users, MapPin, Star,
  Heart, Shield, Trash2, Save, ArrowLeft, CheckCircle2, Eye
} from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useAuth } from "@/lib/auth-context"
import { MOCK_USERS, type AdminUser, type UserRole, type UserPlan, type UserStatus } from "@/lib/admin-users"
import { KoduGrid } from "@/components/kodu-grid"
import { convertChartToPositions } from "@/lib/astrology-utils"
import { PLANETS, type PlanetCode, type Chart, type RasiKey } from "@/lib/astrology-data"

// ── Tab definitions ───────────────────────────────────────────────────────────

const TABS = [
  { id: "photos",     label: "Photos",           Icon: Camera },
  { id: "basic",      label: "Basic & Physical",  Icon: User },
  { id: "career",     label: "Career & Education", Icon: Briefcase },
  { id: "family",     label: "Family & Location", Icon: Users },
  { id: "astrology",  label: "Astrology & Charts", Icon: Star },
  { id: "expect",     label: "Expectations",      Icon: Heart },
  { id: "account",    label: "Account",           Icon: Shield },
] as const

type TabId = (typeof TABS)[number]["id"]

// ── Field helpers ─────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

function Input({ defaultValue, type = "text", ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      defaultValue={defaultValue}
      type={type}
      {...rest}
      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
    />
  )
}

function Select({ defaultValue, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      defaultValue={defaultValue}
      {...rest}
      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {children}
    </select>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 font-serif text-lg font-semibold text-foreground border-b border-border pb-2">
      {children}
    </h3>
  )
}

function SaveBar({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  return (
    <div className="flex justify-end pt-6 border-t border-border mt-8">
      <button
        onClick={onSave}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
        {saved ? "Saved!" : "Save Changes"}
      </button>
    </div>
  )
}

// ── Photo Placeholder ─────────────────────────────────────────────────────────

function PhotosTab({ user, onSave }: { user: AdminUser; onSave: () => void }) {
  const [photos, setPhotos] = useState(user.photos ?? [])
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    user.photos = photos;
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onSave()
  }

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (photos.length >= 5) {
      alert("Maximum 5 photos allowed")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const isPrimary = photos.length === 0
      setPhotos([...photos, { id: Math.random().toString(36).slice(2), url: reader.result as string, isPrimary, blurForBasic: false }])
    }
    reader.readAsDataURL(file)
  }

  const removePhoto = (id: string) => setPhotos(photos.filter(p => p.id !== id))
  const setPrimary = (id: string) => setPhotos(photos.map(p => ({ ...p, isPrimary: p.id === id })))
  const toggleBlur = (id: string) => setPhotos(photos.map(p => p.id === id ? { ...p, blurForBasic: !p.blurForBasic } : p))

  return (
    <div>
      <SectionTitle>Profile Photos</SectionTitle>
      <p className="text-sm text-muted-foreground mb-6">
        Up to 5 photos. Drag to reorder. Toggle blur for non-Gold users.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
        {Array.from({ length: 5 }).map((_, i) => {
          const photo = photos[i]
          return (
            <div
              key={i}
              className={`group relative aspect-[4/3] rounded-xl border-2 overflow-hidden ${
                photo ? "border-border" : "border-dashed border-border/60"
              } bg-secondary/30`}
            >
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo.url} alt={`Photo ${i + 1}`} className={`h-full w-full object-cover ${photo.blurForBasic ? "blur-md" : ""}`} />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Camera className="h-6 w-6 text-muted-foreground/40" />
                </div>
              )}
              {photo?.isPrimary && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                  Primary
                </span>
              )}
              {photo?.blurForBasic && (
                <span className="absolute right-1.5 top-1.5 rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-white">
                  Blurred
                </span>
              )}
              {photo && (
                <div className="absolute inset-0 flex items-end gap-2 p-2 opacity-0 group-hover:opacity-100 transition bg-gradient-to-t from-black/50">
                  {!photo.isPrimary && (
                    <button onClick={() => setPrimary(photo.id)} className="rounded-lg bg-white/90 px-2 py-1 text-[10px] font-semibold text-foreground">
                      Primary
                    </button>
                  )}
                  <button onClick={() => toggleBlur(photo.id)} className="rounded-lg bg-white/90 px-2 py-1 text-[10px] font-semibold text-foreground">
                    Blur
                  </button>
                  <button onClick={() => removePhoto(photo.id)} className="ml-auto rounded-lg bg-red-500/90 px-2 py-1 text-[10px] font-semibold text-white">
                    ✕
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10">
        <Camera className="h-4 w-4" />
        Upload Photo
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
      {photos.length === 0 && (
        <p className="mt-4 text-sm text-amber-600">
          ⚠ No photos uploaded yet. This user will appear without a photo.
        </p>
      )}
      <SaveBar onSave={handleSave} saved={saved} />
    </div>
  )
}

// ── Basic + Physical Tab ──────────────────────────────────────────────────────

function BasicPhysicalTab({ user, onSave }: { user: AdminUser; onSave: () => void }) {
  const [saved, setSaved] = useState(false)
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); onSave() }

  return (
    <div>
      <SectionTitle>Basic Details</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Field label="First Name"><Input defaultValue={user.firstName} /></Field>
        <Field label="Last Name"><Input defaultValue={user.lastName} /></Field>
        <Field label="Email"><Input type="email" defaultValue={user.email} /></Field>
        <Field label="Phone"><Input type="tel" defaultValue={user.phone} /></Field>
        <Field label="Date of Birth"><Input type="date" defaultValue={user.dateOfBirth} /></Field>
        <Field label="Gender">
          <Select defaultValue={user.gender ?? ""}>
            <option value="">— Select —</option>
            <option value="male">Male (ஆண்)</option>
            <option value="female">Female (பெண்)</option>
          </Select>
        </Field>
        <Field label="Marital Status">
          <Select defaultValue={user.maritalStatus ?? ""}>
            <option value="">— Select —</option>
            <option value="never_married">திருமணமாகாதவர்</option>
            <option value="divorced">விவாகரத்து</option>
            <option value="widowed">கணவன்/மனைவி இறந்தவர்</option>
          </Select>
        </Field>
        <Field label="Mother Tongue">
          <Select defaultValue={user.motherTongue ?? "Tamil"}>
            {["Tamil","Telugu","Kannada","Malayalam","Hindi","Other"].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
        </Field>
        <Field label="Religion">
          <Select defaultValue={user.religion ?? "Hindu"}>
            {["Hindu","Christian","Muslim","Jain","Other"].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </Select>
        </Field>
      </div>

      <SectionTitle>Physical Details</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Height (cm)"><Input type="number" defaultValue={user.height} min={140} max={200} /></Field>
        <Field label="Weight (kg)"><Input type="number" defaultValue={user.weight} min={30} max={150} /></Field>
        <Field label="Complexion">
          <Select defaultValue={user.complexion ?? ""}>
            <option value="">— Select —</option>
            {[["fair","Fair (வெண்மை)"],["wheatish","Wheatish (கோதுமை)"],["dark","Dark (கரு)"]].map(([v,l]) =>
              <option key={v} value={v}>{l}</option>
            )}
          </Select>
        </Field>
        <Field label="Food Preference">
          <Select defaultValue={user.foodPreference ?? ""}>
            <option value="">— Select —</option>
            {[["vegetarian","Vegetarian (சைவம்)"],["non_vegetarian","Non-Vegetarian (அசைவம்)"],["eggetarian","Eggetarian"]].map(([v,l]) =>
              <option key={v} value={v}>{l}</option>
            )}
          </Select>
        </Field>
        <Field label="Body Type">
          <Select defaultValue={user.bodyType ?? ""}>
            <option value="">— Select —</option>
            {["Slim","Athletic","Average","Heavy"].map(b =>
              <option key={b} value={b}>{b}</option>
            )}
          </Select>
        </Field>
        <Field label="Physical Disability (optional)">
          <Input defaultValue={user.physicalDisability} placeholder="Describe if any, or leave blank" />
        </Field>
      </div>

      <SaveBar onSave={handleSave} saved={saved} />
    </div>
  )
}

// ── Career + Education Tab ────────────────────────────────────────────────────

function CareerEducationTab({ user, onSave }: { user: AdminUser; onSave: () => void }) {
  const [saved, setSaved] = useState(false)
  const [empType, setEmpType] = useState(user.employmentType ?? "")
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); onSave() }
  const showCompany = !["Student","Not Working"].includes(empType)

  return (
    <div>
      <SectionTitle>Career Details</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Field label="Employment Type">
          <Select defaultValue={empType} onChange={e => setEmpType(e.target.value)}>
            <option value="">— Select —</option>
            {["Salaried","Business","Self-Employed","Student","Not Working"].map(e =>
              <option key={e} value={e}>{e}</option>
            )}
          </Select>
        </Field>
        {showCompany && (
          <>
            <Field label="Company / Organisation"><Input defaultValue={user.companyName} /></Field>
            <Field label="Designation"><Input defaultValue={user.designation} /></Field>
            <Field label="Work Location"><Input defaultValue={user.workLocation} /></Field>
          </>
        )}
        <Field label="Annual Income">
          <Select defaultValue={user.annualIncome ?? ""}>
            <option value="">— Select —</option>
            {["<2L","2-5L","5-10L","10-20L","20-50L",">50L"].map(i =>
              <option key={i} value={i}>{i}</option>
            )}
          </Select>
        </Field>
      </div>

      <SectionTitle>Education Details</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Qualification">
          <Select defaultValue={user.qualification ?? ""}>
            <option value="">— Select —</option>
            {[["tenth","10th"],["twelfth","12th"],["diploma","Diploma"],["graduate","UG Graduate"],["post_graduate","PG Post Graduate"],["phd","PhD"],["other","Other"]].map(([v,l]) =>
              <option key={v} value={v}>{l}</option>
            )}
          </Select>
        </Field>
        <Field label="Field of Study"><Input defaultValue={user.fieldOfStudy} /></Field>
        <Field label="Institution / College"><Input defaultValue={user.institution} /></Field>
        <Field label="Graduation Year">
          <Input type="number" defaultValue={user.graduationYear} min={1970} max={new Date().getFullYear()} />
        </Field>
      </div>

      <SaveBar onSave={handleSave} saved={saved} />
    </div>
  )
}

// ── Family + Location Tab ─────────────────────────────────────────────────────

function FamilyLocationTab({ user, onSave }: { user: AdminUser; onSave: () => void }) {
  const [saved, setSaved] = useState(false)
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); onSave() }

  return (
    <div>
      <SectionTitle>Family Details</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Field label="Family Type">
          <Select defaultValue={user.familyType ?? ""}>
            <option value="">— Select —</option>
            <option value="joint">Joint (கூட்டுக் குடும்பம்)</option>
            <option value="nuclear">Nuclear (தனிக் குடும்பம்)</option>
          </Select>
        </Field>
        <Field label="Family Values">
          <Select defaultValue={user.familyValues ?? ""}>
            <option value="">— Select —</option>
            <option value="orthodox">Orthodox (பழைமை வழி)</option>
            <option value="moderate">Moderate (மிதமான)</option>
            <option value="liberal">Liberal (தாராளமான)</option>
          </Select>
        </Field>
        <Field label="Family Status">
          <Select defaultValue={user.familyStatus ?? ""}>
            <option value="">— Select —</option>
            <option value="middle_class">Middle Class</option>
            <option value="upper_middle">Upper Middle</option>
            <option value="affluent">Affluent</option>
          </Select>
        </Field>
        <Field label="Father's Name"><Input defaultValue={user.fatherName} /></Field>
        <Field label="Father's Occupation"><Input defaultValue={user.fatherOccupation} /></Field>
        <Field label="Father Alive">
          <Select defaultValue={user.fatherAlive === true ? "yes" : user.fatherAlive === false ? "no" : ""}>
            <option value="">— Select —</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </Select>
        </Field>
        <Field label="Mother's Name"><Input defaultValue={user.motherName} /></Field>
        <Field label="Mother's Occupation"><Input defaultValue={user.motherOccupation} /></Field>
        <Field label="Mother Alive">
          <Select defaultValue={user.motherAlive === true ? "yes" : user.motherAlive === false ? "no" : ""}>
            <option value="">— Select —</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </Select>
        </Field>
      </div>

      <SectionTitle>Location Details</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Country">
          <Select defaultValue={user.country ?? "India"}>
            {["India","USA","UK","Canada","Australia","Singapore","UAE","Germany"].map(c =>
              <option key={c} value={c}>{c}</option>
            )}
          </Select>
        </Field>
        <Field label="State">
          <Input defaultValue={user.state} placeholder="Tamil Nadu" />
        </Field>
        <Field label="City">
          <Input defaultValue={user.city} />
        </Field>
        <Field label="Area / Locality"><Input defaultValue={user.area} /></Field>
        <Field label="Native Place"><Input defaultValue={user.nativePlace} /></Field>
        <Field label="Willing to Relocate">
          <Select defaultValue={user.willingToRelocate ?? ""}>
            <option value="">— Select —</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="open">Open to Consider</option>
          </Select>
        </Field>
      </div>

      <SaveBar onSave={handleSave} saved={saved} />
    </div>
  )
}

// ── Astrology Tab ─────────────────────────────────────────────────────────────

const RASI_NUM_TO_KEY: Record<number, RasiKey> = {
  1: "Mesham", 2: "Rishabam", 3: "Mithunam", 4: "Kadagam",
  5: "Simmam", 6: "Kanni", 7: "Thulam", 8: "Viruchigam",
  9: "Dhanusu", 10: "Magaram", 11: "Kumbam", 12: "Meenam"
}

function AstrologyTab({ user, onSave }: { user: AdminUser; onSave: () => void }) {
  const [saved, setSaved] = useState(false)
  const [rasiChart, setRasiChart] = useState<Chart>(user.rasiChart || {})
  const [navamsaChart, setNavamsaChart] = useState<Chart>(user.navamsaChart || {})
  const [editingBox, setEditingBox] = useState<{ type: 'rasi' | 'navamsa', rasiNum: number } | null>(null)

  const handleSave = () => {
    user.rasiChart = Object.keys(rasiChart).length > 0 ? rasiChart : undefined;
    user.navamsaChart = Object.keys(navamsaChart).length > 0 ? navamsaChart : undefined;
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onSave()
  }

  const rasiPositions = useMemo(
    () => convertChartToPositions(rasiChart),
    [rasiChart]
  )
  const navamsaPositions = useMemo(
    () => convertChartToPositions(navamsaChart),
    [navamsaChart]
  )

  const togglePlanet = (type: 'rasi' | 'navamsa', rasiKey: RasiKey, planet: PlanetCode) => {
    const isRasi = type === 'rasi'
    const chart = isRasi ? rasiChart : navamsaChart
    const currentPlanets = chart[rasiKey] || []
    
    let newPlanets: PlanetCode[]
    if (currentPlanets.includes(planet)) {
      newPlanets = currentPlanets.filter(p => p !== planet)
      const finalChart = { ...chart, [rasiKey]: newPlanets }
      if (isRasi) setRasiChart(finalChart)
      else setNavamsaChart(finalChart)
    } else {
      const newChartState = { ...chart }
      for (const key of Object.keys(newChartState)) {
        if (newChartState[key as RasiKey]) {
          newChartState[key as RasiKey] = newChartState[key as RasiKey]!.filter(p => p !== planet)
        }
      }
      newPlanets = [...(newChartState[rasiKey] || []), planet]
      const finalChart = { ...newChartState, [rasiKey]: newPlanets }
      
      if (isRasi) setRasiChart(finalChart)
      else setNavamsaChart(finalChart)
    }
  }

  // Lagna house dynamically derived from real placement of "La" in charts, 
  // falling back to lagnaRasi dropdown -> RASI_TO_HOUSE logic.
  const RASI_TO_HOUSE: Record<string, number> = {
    Mesham: 1, Rishabam: 2, Mithunam: 3, Kadagam: 4,
    Simmam: 5, Kanni: 6, Thulam: 7, Viruchigam: 8,
    Dhanusu: 9, Magaram: 10, Kumbam: 11, Meenam: 12,
  }
  
  let dynamicRasiLagnaHouse = user.lagnaRasi ? (RASI_TO_HOUSE[user.lagnaRasi] ?? 1) : 1
  for (const [key, planets] of Object.entries(rasiChart)) {
    if ((planets as PlanetCode[]).includes("La")) {
      dynamicRasiLagnaHouse = RASI_TO_HOUSE[key];
      break;
    }
  }

  let dynamicNavamsaLagnaHouse = user.lagnaRasi ? (RASI_TO_HOUSE[user.lagnaRasi] ?? 1) : 1
  for (const [key, planets] of Object.entries(navamsaChart)) {
    if ((planets as PlanetCode[]).includes("La")) {
      dynamicNavamsaLagnaHouse = RASI_TO_HOUSE[key];
      break;
    }
  }

  return (
    <div>
      <SectionTitle>Birth Details</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Field label="Date of Birth (pre-filled from Step 1)">
          <div className="flex h-10 items-center rounded-lg border border-border bg-secondary/40 px-3 text-sm text-foreground/70">
            {user.dateOfBirth ?? "—"}
          </div>
        </Field>
        <Field label="Exact Birth Time (HH:MM)">
          <Input type="time" defaultValue={user.exactBirthTime} />
        </Field>
        <Field label="Birth Place">
          <Input defaultValue={user.birthPlace} placeholder="e.g. Madurai" />
        </Field>
      </div>

      {/* Calculated values */}
      <SectionTitle>Calculated Astrological Values</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "லக்னம் Lagna",       value: user.lagnaRasi    ?? "—" },
          { label: "ராசி Rasi",           value: user.moonRasi     ?? "—" },
          { label: "நட்சத்திரம் Star",    value: user.natchathiram ?? "—" },
          { label: "பாதம் Padam",          value: user.padam        ?? "—" },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-tamil">{label}</p>
            <p className="mt-1 font-bold text-primary font-tamil">{value}</p>
          </div>
        ))}
      </div>

      {/* Editable Lagna/Rasi/Natchathiram overrides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Field label="Lagna Rasi (override)">
          <Select defaultValue={user.lagnaRasi ?? ""}>
            <option value="">— Select —</option>
            {["Mesham","Rishabam","Mithunam","Kadagam","Simmam","Kanni","Thulam","Viruchigam","Dhanusu","Magaram","Kumbam","Meenam"].map(r =>
              <option key={r} value={r}>{r}</option>
            )}
          </Select>
        </Field>
        <Field label="Moon Rasi (override)">
          <Select defaultValue={user.moonRasi ?? ""}>
            <option value="">— Select —</option>
            {["Mesham","Rishabam","Mithunam","Kadagam","Simmam","Kanni","Thulam","Viruchigam","Dhanusu","Magaram","Kumbam","Meenam"].map(r =>
              <option key={r} value={r}>{r}</option>
            )}
          </Select>
        </Field>
        <Field label="Natchathiram"><Input defaultValue={user.natchathiram} /></Field>
        <Field label="Padam"><Input defaultValue={user.padam} /></Field>
      </div>

      {/* Chart grids */}
      <SectionTitle>Horoscope Charts</SectionTitle>
      
      <div className="mb-4 rounded-xl bg-orange-50 border border-orange-200 p-4 text-sm text-orange-800">
        <p className="font-semibold flex items-center gap-2">
          <Star className="h-4 w-4" fill="currentColor" />
          Interactive Chart Editor
        </p>
        <p className="mt-1 opacity-90 text-xs">
          Tap on any box in the Rasi or Navamsa chart below to edit the planets in that house. 
          Selecting a planet automatically removes it from other houses.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rasi Chart */}
        <div className="flex flex-col items-center gap-3">
          <p className="font-serif text-base font-semibold text-foreground">
            ராசி கட்டம் <span className="text-sm font-sans text-muted-foreground font-normal">Rasi Chart</span>
          </p>
          <KoduGrid
            planetPositions={rasiPositions}
            lagnaHouse={dynamicRasiLagnaHouse}
            mode="rasi"
            size="lg"
            showToggle={false}
            personName={`${user.firstName} ${user.lastName}`}
            dob={user.dateOfBirth ?? ""}
            onHouseClick={(_h, rasi) => setEditingBox({ type: 'rasi', rasiNum: rasi })}
          />
        </div>

        {/* Navamsa Chart */}
        <div className="flex flex-col items-center gap-3">
          <p className="font-serif text-base font-semibold text-foreground">
            நவாம்ச கட்டம் <span className="text-sm font-sans text-muted-foreground font-normal">Navamsa Chart</span>
          </p>
          <KoduGrid
            planetPositions={navamsaPositions}
            lagnaHouse={dynamicNavamsaLagnaHouse}
            mode="navamsa"
            size="lg"
            showToggle={false}
            personName={`${user.firstName} ${user.lastName}`}
            onHouseClick={(_h, rasi) => setEditingBox({ type: 'navamsa', rasiNum: rasi })}
          />
        </div>
      </div>

      {/* Editor Modal */}
      {editingBox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-background rounded-3xl w-full max-w-sm shadow-2xl border border-border p-5">
            <div className="flex justify-between items-center mb-5 border-b border-border pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-foreground">
                  {editingBox.type === 'rasi' ? 'Rasi' : 'Navamsa'} Edit
                </h3>
                <p className="text-sm text-primary font-bold font-tamil">
                  {RASI_NUM_TO_KEY[editingBox.rasiNum]}
                </p>
              </div>
              <button 
                onClick={() => setEditingBox(null)} 
                className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-5 gap-2">
               {Object.entries(PLANETS).map(([code, p]) => {
                 const chart = editingBox.type === 'rasi' ? rasiChart : navamsaChart
                 const rasiKey = RASI_NUM_TO_KEY[editingBox.rasiNum]
                 const currentPlanetsInHouse = chart[rasiKey] || []
                 const isSelected = currentPlanetsInHouse.includes(code as PlanetCode)
                 
                 // If not selected in this house, check if it's already used in a different house
                 const isUsedElsewhere = !isSelected && Object.values(chart).some(planetsList => 
                   (planetsList as PlanetCode[])?.includes(code as PlanetCode)
                 )
                 
                 const disabled = isUsedElsewhere;

                 return (
                   <button
                     key={code}
                     onClick={() => !disabled && togglePlanet(editingBox.type, rasiKey, code as PlanetCode)}
                     disabled={disabled}
                     className={`flex flex-col items-center justify-center py-3 rounded-2xl border-2 transition-all ${
                       isSelected 
                         ? 'bg-primary text-primary-foreground border-primary shadow-sm active:scale-95' 
                         : disabled
                           ? 'bg-secondary/30 border-transparent opacity-40 cursor-not-allowed'
                           : 'bg-secondary/50 border-transparent hover:border-border hover:bg-secondary text-foreground active:scale-95'
                     }`}
                   >
                     <span className="text-base font-bold font-tamil mb-1">{p.tamil}</span>
                     <span className={`text-[9px] uppercase tracking-wider font-semibold ${isSelected ? 'opacity-90' : 'text-muted-foreground'}`}>
                       {p.short}
                     </span>
                   </button>
                 )
               })}
            </div>
            
            <div className="mt-6">
              <button 
                onClick={() => setEditingBox(null)}
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <SaveBar onSave={handleSave} saved={saved} />
    </div>
  )
}

// ── Expectations Tab ──────────────────────────────────────────────────────────

function ExpectationsTab({ user, onSave }: { user: AdminUser; onSave: () => void }) {
  const [saved, setSaved] = useState(false)
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); onSave() }

  return (
    <div>
      <SectionTitle>Partner Expectations</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Min Age"><Input type="number" defaultValue={user.ageRangeMin ?? 21} min={18} max={65} /></Field>
        <Field label="Max Age"><Input type="number" defaultValue={user.ageRangeMax ?? 40} min={18} max={65} /></Field>
        <Field label="Min Height (cm)"><Input type="number" defaultValue={user.heightRangeMin ?? 150} min={140} max={200} /></Field>
        <Field label="Max Height (cm)"><Input type="number" defaultValue={user.heightRangeMax ?? 190} min={140} max={200} /></Field>
        <Field label="Minimum Poruthams (out of 10)">
          <Input type="number" defaultValue={user.minimumPoruthams ?? 6} min={1} max={10} />
        </Field>
        <Field label="Income Preference">
          <Select defaultValue="">
            <option value="">Any</option>
            {["<2L","2-5L","5-10L","10-20L","20-50L",">50L"].map(i => <option key={i} value={i}>{i}</option>)}
          </Select>
        </Field>
      </div>
      <SaveBar onSave={handleSave} saved={saved} />
    </div>
  )
}

// ── Account Tab ───────────────────────────────────────────────────────────────

function AccountTab({ user, onSave }: { user: AdminUser; onSave: () => void }) {
  const [saved, setSaved] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); onSave() }

  return (
    <div>
      <SectionTitle>Account Settings</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Field label="Role">
          <Select defaultValue={user.role}>
            {(["groom","bride","normal","admin"] as UserRole[]).map(r =>
              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
            )}
          </Select>
        </Field>
        <Field label="Subscription Plan">
          <Select defaultValue={user.plan}>
            {(["basic","silver","gold","platinum"] as UserPlan[]).map(p =>
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            )}
          </Select>
        </Field>
        <Field label="Account Status">
          <Select defaultValue={user.status}>
            {(["active","pending","banned"] as UserStatus[]).map(s =>
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            )}
          </Select>
        </Field>
        <Field label="Email"><Input type="email" defaultValue={user.email} /></Field>
      </div>

      <SaveBar onSave={handleSave} saved={saved} />

      {/* Danger Zone */}
      <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6">
        <h3 className="mb-2 font-serif text-lg font-semibold text-red-700">⚠ Danger Zone</h3>
        <p className="mb-4 text-sm text-red-600">
          Deleting a user is permanent and cannot be undone. All profile data, photos, and chat history will be removed.
        </p>
        {!showDelete ? (
          <button
            onClick={() => setShowDelete(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
            Delete This Account
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-red-700">Are you sure? This cannot be undone.</p>
            <button
              onClick={() => alert("Deleted! (mock — no real deletion)")}
              className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => setShowDelete(false)}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MyProfileEditPage() {
  const router = useRouter()
  const { user: authUser } = useAuth()
  
  // Find the MOCK_USER ID corresponding to the authenticated email securely
  const userId = useMemo(() => {
    if (!authUser) return "u001"
    const mock = MOCK_USERS.find(u => u.email.toLowerCase() === authUser.email.toLowerCase())
    return mock?.id || "u001"
  }, [authUser])

  // Read from localStorage first, fallback to MOCK_USERS
  const [user, setUser] = useState<AdminUser | undefined>(undefined)
  const [activeTab, setActiveTab] = useState<TabId>("photos")
  const [savedGlobal, setSavedGlobal] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`mock_user_${userId}`)
      if (stored) {
        setUser(JSON.parse(stored))
      } else {
        const found = MOCK_USERS.find(u => u.id === userId)
        setUser(found ? JSON.parse(JSON.stringify(found)) : undefined)
      }
    } catch (e) {
      setUser(MOCK_USERS.find(u => u.id === userId))
    }
  }, [userId])

  if (user === undefined) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center py-24"><p>Loading...</p></main>
        <SiteFooter />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 flex flex-col items-center justify-center py-24 gap-4">
          <p className="text-lg font-semibold text-foreground">User not found</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const handleSave = () => {
    localStorage.setItem(`mock_user_${userId}`, JSON.stringify(user))
    setSavedGlobal(true)
    setTimeout(() => setSavedGlobal(false), 2000)
  }

  const mappedTabs = TABS.filter(t => t.id !== "account")

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-6 md:py-12">
        {/* Back link + user summary */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </button>
          <div className="flex items-center gap-3 ml-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <p className="font-serif text-lg font-semibold text-foreground">
                Edit My Profile
              </p>
              <p className="text-xs text-muted-foreground">{user.email} · {user.role}</p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/profile/me/view`)}
            className="ml-auto inline-flex items-center gap-2 rounded-xl border border-primary px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 transition"
          >
            <Eye className="h-4 w-4" />
            View Public Page
          </button>
          {savedGlobal && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Changes saved
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-1 rounded-xl border border-border bg-secondary/30 p-1">
          {mappedTabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="rounded-2xl border border-border bg-card p-6 mb-12">
          {activeTab === "photos"    && <PhotosTab user={user} onSave={handleSave} />}
          {activeTab === "basic"     && <BasicPhysicalTab user={user} onSave={handleSave} />}
          {activeTab === "career"    && <CareerEducationTab user={user} onSave={handleSave} />}
          {activeTab === "family"    && <FamilyLocationTab user={user} onSave={handleSave} />}
          {activeTab === "astrology" && <AstrologyTab user={user} onSave={handleSave} />}
          {activeTab === "expect"    && <ExpectationsTab user={user} onSave={handleSave} />}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
