"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Printer, MapPin, Briefcase, BookOpen, Heart, Star, User, Lock, PencilLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api"
import { KoduGrid } from "@/components/kodu-grid"
import { convertChartToPositions } from "@/lib/astrology-utils"
import type { Chart, PlanetCode } from "@/lib/astrology-data"

// ── Types ────────────────────────────────────────────────────────────────────

type Profile = {
  id: string
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
  status: string
  is_closed: boolean
  closed_reason: string | null
  profile_number: number | null
  completeness_score: number
  created_at: string
  photos: { id: string; url: string; is_primary: boolean; sort_order: number }[]
  astrology: {
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
  } | null
  expectations: {
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
  } | null
  siblings: { name: string; gender: string; marital_status: string; occupation: string }[] | null
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

function fmtIncome(n: number | null) {
  if (!n) return "—"
  if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)} LPA`
  return `₹${n.toLocaleString("en-IN")} p.a.`
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
}

function calcAge(dob: string | null) {
  if (!dob) return null
  return `${new Date().getFullYear() - new Date(dob).getFullYear()}`
}

function fmtHeight(cm: number | null) {
  if (!cm) return "—"
  const ft = Math.floor(cm / 30.48)
  const inch = Math.round((cm / 30.48 - ft) * 12)
  return `${ft}'${inch}" / ${cm} cm`
}

const RASI_TO_HOUSE: Record<string, number> = {
  Mesham: 1, Rishabam: 2, Mithunam: 3, Kadagam: 4,
  Simmam: 5, Kanni: 6, Thulam: 7, Viruchigam: 8,
  Dhanusu: 9, Magaram: 10, Kumbam: 11, Meenam: 12,
}

function lagnaHouseFromChart(chart: Chart, lagnaName: string | null): number {
  for (const [key, planets] of Object.entries(chart)) {
    if ((planets as PlanetCode[]).includes("La")) return RASI_TO_HOUSE[key] ?? 1
  }
  return lagnaName ? (RASI_TO_HOUSE[lagnaName] ?? 1) : 1
}

// ── Data cell ────────────────────────────────────────────────────────────────

function Cell({ label, value, wide }: { label: string; value?: string | null; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <span className="block text-[8px] uppercase font-bold tracking-wider text-muted-foreground leading-none mb-0.5">{label}</span>
      <span className="text-[10px] font-semibold text-foreground leading-tight">{value || "—"}</span>
    </div>
  )
}

function SectionHead({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2 border-b border-border/50 pb-1">
      <Icon className="w-3 h-3 text-[#D4AF37] shrink-0" />
      <h3 className="font-serif text-[11px] font-bold text-primary">{label}</h3>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function BiodataViewPage() {
  const params = useParams()
  const router = useRouter()
  const profileId = params.id as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<Profile>(`/api/admin/profiles/${profileId}`)
      .then(data => setProfile(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [profileId])

  const rasiPositions = useMemo(
    () => convertChartToPositions(profile?.astrology?.rasi_chart ?? {}),
    [profile]
  )
  const navamsaPositions = useMemo(
    () => convertChartToPositions(profile?.astrology?.navamsa_chart ?? {}),
    [profile]
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-3 w-96 animate-pulse">
          {[8, 48, 32].map(h => (
            <div key={h} className={`h-${h} bg-muted rounded-2xl`} />
          ))}
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold">Profile not found</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-primary underline">
            <ArrowLeft className="h-4 w-4" /> Go back
          </button>
        </div>
      </div>
    )
  }

  const profileCode = profile.profile_number
    ? `MAT-${String(profile.profile_number).padStart(5, "0")}`
    : null
  const isGroom = profile.gender === "male"
  const primaryPhoto = profile.photos?.find(p => p.is_primary) ?? profile.photos?.[0]
  const astro = profile.astrology
  const ex = profile.expectations

  const rasiLagnaHouse = lagnaHouseFromChart(astro?.rasi_chart ?? {}, astro?.lagna_name ?? null)
  const navamsaLagnaHouse = lagnaHouseFromChart(astro?.navamsa_chart ?? {}, astro?.lagna_name ?? null)

  const siblingsText = profile.siblings?.length
    ? profile.siblings.map(s => `${s.name} (${s.gender === "male" ? "Bro" : "Sis"}, ${(s.marital_status ?? "").replace(/_/g, " ")})`).join("; ")
    : null

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 7mm 9mm; }
          html { font-size: 8.5pt; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white !important; }
          .no-print { display: none !important; }
          .print-sheet { box-shadow: none !important; max-width: 100% !important; margin: 0 !important; }
          .border-gold { border-color: #D4AF37 !important; }
          .text-primary { color: #CD1C18 !important; }
          .bg-primary { background-color: #CD1C18 !important; }
          .bg-primary\\/5 { background-color: rgba(205,28,24,0.05) !important; }
          .border-primary { border-color: #CD1C18 !important; }
          .border-primary\\/20 { border-color: rgba(205,28,24,0.2) !important; }
        }
      `}</style>

      {/* Nav — hidden in print */}
      <div className="no-print fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-4 border-b border-border bg-background/95 backdrop-blur px-6 py-3">
        <div className="flex items-center gap-3">
          <Link href={`/admin/profiles/${profileId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Editor
          </Link>
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(`/admin/profiles/${profileId}`)}
            className="h-8 border-primary/40 text-primary hover:bg-primary/5 hidden sm:flex items-center gap-1.5"
          >
            <PencilLine className="h-3.5 w-3.5" /> Edit Profile
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {profileCode && (
            <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary">{profileCode}</span>
          )}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
          >
            <Printer className="h-4 w-4" /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Printable sheet */}
      <div className="min-h-screen bg-[#FFFDF9] pt-16 pb-8 px-4 print:pt-0 print:pb-0 print:px-0 print:bg-white">
        <div className="print-sheet relative max-w-[794px] mx-auto">

          {/* Gold border wrapper */}
          <div className="border-[3px] border-[#D4AF37] rounded-3xl p-5 relative bg-white shadow-xl overflow-hidden print:rounded-none print:shadow-none print:p-4">

            {/* Ganesha watermark */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/ganesha_background.png"
              alt=""
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-auto object-contain opacity-[0.12] pointer-events-none z-0 mix-blend-multiply"
            />

            {/* Corner decorations */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-[3px] border-l-[3px] border-primary rounded-tl-xl opacity-60 z-10" />
            <div className="absolute top-2 right-2 w-6 h-6 border-t-[3px] border-r-[3px] border-primary rounded-tr-xl opacity-60 z-10" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-[3px] border-l-[3px] border-primary rounded-bl-xl opacity-60 z-10" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-[3px] border-r-[3px] border-primary rounded-br-xl opacity-60 z-10" />

            {/* ── Title header ── */}
            <div className="relative z-10 flex flex-col items-center mb-4 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/ganesha_header.png" alt="" className="h-9 w-9 object-contain mb-1 mix-blend-multiply drop-shadow-sm" />
              <h1 className="text-base font-serif font-bold text-primary uppercase tracking-widest leading-none">Matrimonial Profile</h1>
              <p className="text-[9px] font-semibold tracking-widest text-[#D4AF37] mt-0.5">|| ஸ்ரீ கணேசாய நமஹ ||</p>
              {profileCode && (
                <span className="mt-1 inline-block rounded-full bg-primary/10 border border-primary/20 px-3 py-0.5 text-[9px] font-bold text-primary tracking-widest">{profileCode}</span>
              )}
              {profile.is_closed && (
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[9px] font-bold text-amber-700">
                  <Lock className="h-2.5 w-2.5" /> Profile Closed{profile.closed_reason ? ` — ${profile.closed_reason}` : ""}
                </span>
              )}
              <div className="w-48 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mt-2" />
            </div>

            {/* ── Body: Left photo col + Right data col ── */}
            <div className="relative z-10 grid grid-cols-[160px_1fr] gap-5 print:grid-cols-[160px_1fr]">

              {/* LEFT: Photo + key stats */}
              <div className="flex flex-col items-center text-center">
                {/* Photo — large */}
                <div className="relative w-[148px] h-[180px] rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-neutral-100 flex items-center justify-center shrink-0">
                  {primaryPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`${API_BASE}${primaryPhoto.url}`} alt={profile.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-14 h-14 text-neutral-300" />
                  )}
                  <div className="absolute inset-0 border border-[#D4AF37]/40 rounded-2xl pointer-events-none m-1" />
                </div>

                <h2 className="mt-2.5 text-[13px] font-serif font-bold text-foreground leading-tight">{profile.full_name}</h2>
                {profile.full_name_tamil && (
                  <p className="font-tamil text-[10px] text-muted-foreground mt-0.5 leading-tight">{profile.full_name_tamil}</p>
                )}
                <p className="text-[9px] font-semibold text-muted-foreground mt-0.5">{isGroom ? "Groom" : "Bride"}</p>

                {/* Key highlights box */}
                <div className="mt-2 w-full bg-primary/5 border border-primary/20 rounded-xl p-2.5">
                  <div className="grid grid-cols-2 gap-x-2 gap-y-2">
                    <div>
                      <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-wider">Age</p>
                      <p className="text-sm font-bold text-primary leading-none">{calcAge(profile.date_of_birth) ?? "—"}<span className="text-[9px] font-medium text-foreground ml-0.5">Yrs</span></p>
                    </div>
                    <div>
                      <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-wider">Height</p>
                      <p className="text-[10px] font-bold text-primary leading-none">{profile.height_cm ? `${profile.height_cm} cm` : "—"}</p>
                    </div>
                    <div className="col-span-2 pt-1.5 border-t border-primary/10">
                      <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-wider">Rasi · Star</p>
                      <p className="text-[10px] font-bold text-primary font-tamil">{astro?.rasi_name || "—"} · {astro?.natchathiram || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Quick info icons */}
                <div className="mt-2 w-full space-y-1.5 text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-2.5 h-2.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[8px] uppercase tracking-wider text-muted-foreground font-bold leading-none">Location</p>
                      <p className="text-[9px] font-semibold text-foreground leading-none mt-0.5">{[profile.city, profile.state].filter(Boolean).join(", ") || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Briefcase className="w-2.5 h-2.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[8px] uppercase tracking-wider text-muted-foreground font-bold leading-none">Profession</p>
                      <p className="text-[9px] font-semibold text-foreground leading-none mt-0.5">{profile.designation || profile.employment_type || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <BookOpen className="w-2.5 h-2.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[8px] uppercase tracking-wider text-muted-foreground font-bold leading-none">Education</p>
                      <p className="text-[9px] font-semibold text-foreground leading-none mt-0.5">{profile.qualification || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Detail sections */}
              <div className="flex flex-col gap-3">

                {/* Personal Details */}
                <div>
                  <SectionHead icon={Heart} label="Personal Details" />
                  <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                    <Cell label="Date of Birth" value={fmtDate(profile.date_of_birth)} />
                    <Cell label="Marital Status" value={profile.marital_status?.replace(/_/g, " ")} />
                    <Cell label="Religion" value={profile.religion} />
                    <Cell label="Mother Tongue" value={profile.mother_tongue} />
                    <Cell label="Complexion" value={profile.complexion} />
                    <Cell label="Body Type" value={profile.body_type} />
                    <Cell label="Food Preference" value={profile.food_preference} />
                    <Cell label="Height" value={fmtHeight(profile.height_cm)} />
                    <Cell label="Weight" value={profile.weight_kg ? `${profile.weight_kg} kg` : null} />
                  </div>
                </div>

                {/* Career & Education */}
                <div>
                  <SectionHead icon={Briefcase} label="Career & Education" />
                  <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                    <Cell label="Qualification" value={profile.qualification} />
                    <Cell label="Field of Study" value={profile.field_of_study} />
                    <Cell label="Institution" value={profile.institution} />
                    <Cell label="Employment" value={profile.employment_type} />
                    <Cell label="Designation" value={profile.designation} />
                    <Cell label="Company" value={profile.company_name} />
                    <Cell label="Work Location" value={profile.work_location} />
                    <Cell label="Annual Income" value={fmtIncome(profile.annual_income)} />
                    {profile.graduation_year && <Cell label="Grad Year" value={String(profile.graduation_year)} />}
                  </div>
                </div>

                {/* Family Details */}
                <div>
                  <SectionHead icon={Heart} label="Family Details" />
                  <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                    <Cell label="Father" value={[profile.father_name, profile.father_occupation, profile.father_alive === false ? "Late" : null].filter(Boolean).join(" · ") || null} />
                    <Cell label="Mother" value={[profile.mother_name, profile.mother_occupation, profile.mother_alive === false ? "Late" : null].filter(Boolean).join(" · ") || null} />
                    <Cell label="Family Type" value={profile.family_type} />
                    <Cell label="Family Status" value={profile.family_status} />
                    <Cell label="Family Values" value={profile.family_values} />
                    {siblingsText && <Cell label="Siblings" value={siblingsText} wide />}
                  </div>
                </div>

                {/* Location & Expectations side by side */}
                <div className="grid grid-cols-2 gap-x-5">
                  <div>
                    <SectionHead icon={MapPin} label="Location" />
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                      <Cell label="City" value={profile.city} />
                      <Cell label="State" value={profile.state} />
                      <Cell label="Native Place" value={profile.native_place} />
                      <Cell label="Relocate" value={profile.willing_to_relocate === true ? "Yes" : profile.willing_to_relocate === false ? "No" : null} />
                    </div>
                  </div>
                  {ex && (
                    <div>
                      <SectionHead icon={Star} label="Partner Expectations" />
                      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                        <Cell label="Age" value={(ex.age_range_min || ex.age_range_max) ? `${ex.age_range_min ?? "?"}–${ex.age_range_max ?? "?"} yrs` : null} />
                        <Cell label="Height" value={(ex.height_range_min || ex.height_range_max) ? `${ex.height_range_min ?? "?"}–${ex.height_range_max ?? "?"} cm` : null} />
                        <Cell label="Education" value={ex.education_pref} />
                        <Cell label="Min Poruthams" value={ex.minimum_poruthams ? `${ex.minimum_poruthams} / 10` : null} />
                        {ex.custom_note && <Cell label="Note" value={ex.custom_note} wide />}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Astrology & Charts — full width ── */}
            {astro && (
              <div className="relative z-10 mt-4 pt-3 border-t border-[#D4AF37]/40">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Star className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <h3 className="font-serif text-[11px] font-bold text-primary uppercase tracking-widest">Horoscope & Birth Details</h3>
                </div>

                {/* Birth details row */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: "Date of Birth", val: fmtDate(astro.date_of_birth) },
                    { label: "Birth Time", val: astro.birth_time ? `${astro.birth_time} ${astro.birth_am_pm ?? ""}` : "—" },
                    { label: "Birth Place", val: astro.birth_place || "—" },
                    { label: "Lagna · Rasi · Star", val: [astro.lagna_name, astro.rasi_name, astro.natchathiram].filter(Boolean).join(" · ") || "—" },
                  ].map(({ label, val }) => (
                    <div key={label} className="bg-primary/5 rounded-xl border border-primary/20 px-3 py-2 text-center shadow-sm">
                      <span className="block text-[8px] text-primary font-bold uppercase tracking-wider mb-0.5">{label}</span>
                      <span className="text-[10px] font-bold text-foreground">{val}</span>
                    </div>
                  ))}
                </div>

                {/* Charts */}
                {(astro.rasi_chart || astro.navamsa_chart) && (
                  <div className="flex justify-center gap-8">
                    {astro.rasi_chart && (
                      <div className="flex flex-col items-center">
                        <div className="bg-primary px-5 py-1 rounded-t-xl text-center">
                          <p className="font-serif text-[9px] font-bold text-white tracking-widest uppercase">ராசி கட்டம் · Rasi Chart</p>
                        </div>
                        <div className="bg-white p-3 rounded-b-xl rounded-t-sm shadow-md border-2 border-primary">
                          <KoduGrid
                            planetPositions={rasiPositions}
                            lagnaHouse={rasiLagnaHouse}
                            mode="rasi"
                            size="sm"
                            showToggle={false}
                            personName={profile.full_name}
                            dob={profile.date_of_birth ?? ""}
                          />
                        </div>
                      </div>
                    )}
                    {astro.navamsa_chart && (
                      <div className="flex flex-col items-center">
                        <div className="bg-primary px-5 py-1 rounded-t-xl text-center">
                          <p className="font-serif text-[9px] font-bold text-white tracking-widest uppercase">நவாம்ச கட்டம் · Navamsa Chart</p>
                        </div>
                        <div className="bg-white p-3 rounded-b-xl rounded-t-sm shadow-md border-2 border-primary">
                          <KoduGrid
                            planetPositions={navamsaPositions}
                            lagnaHouse={navamsaLagnaHouse}
                            mode="navamsa"
                            size="sm"
                            showToggle={false}
                            personName={profile.full_name}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="relative z-10 mt-3 pt-2 border-t border-[#D4AF37]/30 flex items-center justify-between text-[8px] text-gray-400">
              <span>Maratha Matrimony · {profileCode ?? profile.id}</span>
              <span>Generated {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
