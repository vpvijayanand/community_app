"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Printer, MapPin, Briefcase, BookOpen, Heart, Star, User, Loader2, AlertCircle, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { KoduGrid } from "@/components/kodu-grid"
import { UserLayout } from "@/components/user-layout"
import { useAuth } from "@/lib/auth-context"
import { convertChartToPositions } from "@/lib/astrology-utils"

// ── Config ────────────────────────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
function authHeaders() {
  const t = typeof window !== "undefined" ? localStorage.getItem("maratha_token") : null
  return t ? { Authorization: `Bearer ${t}` } : {}
}

// ── Types ─────────────────────────────────────────────────────────────────────
type Profile = {
  id: string
  full_name: string
  full_name_tamil: string | null
  gender: "male" | "female"
  date_of_birth: string
  marital_status: string
  religion: string
  mother_tongue: string
  height_cm: number
  weight_kg: number
  complexion: string
  food_preference: string
  body_type: string
  qualification: string
  field_of_study: string
  institution: string
  employment_type: string
  designation: string
  company_name: string
  work_location: string
  annual_income: string
  graduation_year: number
  family_type: string
  father_name: string
  father_occupation: string
  father_alive: boolean
  mother_name: string
  mother_occupation: string
  mother_alive: boolean
  family_status: string
  family_values: string
  city: string
  state: string
  native_place: string
  willing_to_relocate: boolean
  age_range_min?: number
  age_range_max?: number
  height_range_min?: number
  height_range_max?: number
  minimum_poruthams?: number
  photos: Array<{ id: string; url: string; is_primary: boolean }>
  astrology: {
    rasi_name: string
    natchathiram: string
    birth_time: string
    birth_place: string
    lagna_name: string
    rasi_chart: any
    navamsa_chart: any
  } | null
  siblings: Array<{ name: string; gender: string; marital_status: string; occupation: string }> | null
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
}

function calcAge(dob: string | null | undefined) {
  if (!dob) return null
  return String(Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000)))
}

function fmtHeight(cm: number | null | undefined) {
  if (!cm) return "—"
  const ft = Math.floor(cm / 30.48)
  const inch = Math.round((cm / 30.48 - ft) * 12)
  return `${ft}'${inch}" / ${cm} cm`
}

const RASI_NAME_TO_NUM: Record<string, number> = {
  Mesham: 1, Rishabam: 2, Mithunam: 3, Kadagam: 4,
  Simmam: 5, Kanni: 6, Thulam: 7, Viruchigam: 8,
  Dhanusu: 9, Magaram: 10, Kumbam: 11, Meenam: 12,
}

function SectionHead({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2 border-b border-border/50 pb-1">
      <Icon className="w-3 h-3 text-[#D4AF37] shrink-0" />
      <h3 className="font-serif text-[11px] font-bold text-primary">{label}</h3>
    </div>
  )
}

function Cell({ label, value, wide }: { label: string; value?: string | null; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <span className="block text-[8px] uppercase font-bold tracking-wider text-muted-foreground leading-none mb-0.5">{label}</span>
      <span className="text-[10px] font-semibold text-foreground leading-tight">{value || "—"}</span>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProfileViewPage() {
  const params = useParams()
  const router = useRouter()
  const profileId = params?.profileId as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!profileId) return
    fetch(`${API}/api/profile/${profileId}`, { headers: authHeaders() as HeadersInit })
      .then(r => {
        if (!r.ok) throw new Error(r.status === 404 ? "Profile not found" : "Error loading profile")
        return r.json()
      })
      .then(setProfile)
      .catch(e => setError(e.message))
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
  const lagnaRasiNum = useMemo(() => {
    if (profile?.astrology?.rasi_chart) {
      for (const [key, planets] of Object.entries(profile.astrology.rasi_chart)) {
        if ((planets as string[]).includes("La")) return RASI_NAME_TO_NUM[key] ?? 1
      }
    }
    return profile?.astrology?.lagna_name ? (RASI_NAME_TO_NUM[profile.astrology.lagna_name] ?? 1) : 1
  }, [profile])

  const navamsaLagnaRasiNum = useMemo(() => {
    if (profile?.astrology?.navamsa_chart) {
      for (const [key, planets] of Object.entries(profile.astrology.navamsa_chart)) {
        if ((planets as string[]).includes("La")) return RASI_NAME_TO_NUM[key] ?? 1
      }
    }
    return lagnaRasiNum
  }, [profile, lagnaRasiNum])

  const { user: authUser } = useAuth()
  const isAdmin = authUser?.role === "admin"

  if (loading) {
    return (
      <UserLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">Preparing Profile View...</p>
        </div>
      </UserLayout>
    )
  }

  if (error || !profile) {
    return (
      <UserLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
          <div className="p-4 bg-red-50 rounded-full text-red-500"><AlertCircle className="w-10 h-10" /></div>
          <h2 className="text-xl font-bold text-foreground">{error || "Profile not found"}</h2>
          <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
        </div>
      </UserLayout>
    )
  }

  const primaryPhoto = profile.photos?.find(p => p.is_primary)?.url || profile.photos?.[0]?.url
  const photoUrl = primaryPhoto 
    ? (primaryPhoto.startsWith("http") ? primaryPhoto : `${API}/${primaryPhoto.replace(/^\//, "")}`)
    : (profile.gender === "female" ? "/avatar-female.png" : "/avatar-male.png")

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

      {/* Floating controls — hidden in print */}
      <div className="no-print fixed top-6 left-6 z-50 flex gap-2">
        <Button variant="outline" onClick={() => router.back()} className="rounded-full bg-white/80 backdrop-blur-md shadow-sm">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        {isAdmin && (
          <Button 
            variant="outline" 
            onClick={() => router.push(`/profile/${profileId}/edit`)} 
            className="rounded-full bg-white/80 backdrop-blur-md shadow-sm border-primary text-primary hover:bg-primary/5"
          >
            <Edit className="w-4 h-4 mr-2" /> Edit Profile
          </Button>
        )}
      </div>

      <div className="no-print fixed top-6 right-6 z-50">
        <Button onClick={() => window.print()} className="rounded-full shadow-lg gap-2">
          <Printer className="w-4 h-4" /> Print / Save PDF
        </Button>
      </div>

      <div className="min-h-screen bg-[#FFFDF9] pt-20 pb-10 px-4 print:pt-0 print:pb-0 print:px-0 print:bg-white">
        <div className="print-sheet relative max-w-[794px] mx-auto">
          <div className="border-[3px] border-[#D4AF37] rounded-3xl p-5 relative bg-white shadow-xl overflow-hidden print:rounded-none print:shadow-none print:p-4">
            
            {/* Watermark */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/ganesha_background.png" alt="" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-auto object-contain opacity-[0.12] pointer-events-none z-0 mix-blend-multiply" />

            <div className="relative z-10 flex flex-col items-center mb-4 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/ganesha_header.png" alt="" className="h-9 w-9 object-contain mb-1 mix-blend-multiply drop-shadow-sm" />
              <h1 className="text-base font-serif font-bold text-primary uppercase tracking-widest leading-none">Matrimonial Profile</h1>
              <p className="text-[9px] font-semibold tracking-widest text-[#D4AF37] mt-0.5">|| ஸ்ரீ கணேசாய நமஹ ||</p>
            </div>

            <div className="relative z-10 grid grid-cols-[160px_1fr] gap-5">
              {/* LEFT COL */}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-[148px] h-[180px] rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-neutral-100 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border border-[#D4AF37]/40 rounded-2xl pointer-events-none m-1" />
                </div>
                <h2 className="mt-2.5 text-[13px] font-serif font-bold text-foreground leading-tight">{profile.full_name}</h2>
                <p className="text-[9px] font-semibold text-muted-foreground mt-0.5 capitalize">{profile.gender === "male" ? "Groom" : "Bride"}</p>

                <div className="mt-2 w-full bg-primary/5 border border-primary/20 rounded-xl p-2.5">
                  <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-left">
                    <div>
                      <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-wider">Age</p>
                      <p className="text-sm font-bold text-primary leading-none">{calcAge(profile.date_of_birth)}<span className="text-[9px] font-medium text-foreground ml-0.5">Yrs</span></p>
                    </div>
                    <div>
                      <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-wider">Height</p>
                      <p className="text-[10px] font-bold text-primary leading-none">{profile.height_cm ? `${profile.height_cm} cm` : "—"}</p>
                    </div>
                    <div className="col-span-2 pt-1.5 border-t border-primary/10">
                      <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-wider">Rasi · Star</p>
                      <p className="text-[10px] font-bold text-primary font-tamil">{profile.astrology?.rasi_name || "—"} · {profile.astrology?.natchathiram || "—"}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-2 w-full space-y-1.5 text-left">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-2.5 h-2.5 text-primary" />
                    <div>
                      <p className="text-[8px] uppercase tracking-wider text-muted-foreground font-bold leading-none">Location</p>
                      <p className="text-[9px] font-semibold text-foreground mt-0.5">{[profile.city, profile.state].filter(Boolean).join(", ") || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-2.5 h-2.5 text-primary" />
                    <div>
                      <p className="text-[8px] uppercase tracking-wider text-muted-foreground font-bold leading-none">Profession</p>
                      <p className="text-[9px] font-semibold text-foreground mt-0.5">{profile.designation || profile.employment_type || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COL */}
              <div className="flex flex-col gap-3">
                <div>
                  <SectionHead icon={Heart} label="Personal Details" />
                  <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                    <Cell label="Date of Birth"   value={fmtDate(profile.date_of_birth)} />
                    <Cell label="Marital Status"  value={profile.marital_status?.replace(/_/g, " ")} />
                    <Cell label="Religion"        value={profile.religion} />
                    <Cell label="Mother Tongue"   value={profile.mother_tongue} />
                    <Cell label="Complexion"      value={profile.complexion} />
                    <Cell label="Body Type"       value={profile.body_type} />
                    <Cell label="Food Preference" value={profile.food_preference?.replace(/_/g, " ")} />
                    <Cell label="Height"          value={fmtHeight(profile.height_cm)} />
                  </div>
                </div>

                <div>
                  <SectionHead icon={Briefcase} label="Career & Education" />
                  <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                    <Cell label="Qualification"   value={profile.qualification} />
                    <Cell label="Field of Study"  value={profile.field_of_study} />
                    <Cell label="Employment"      value={profile.employment_type} />
                    <Cell label="Designation"     value={profile.designation} />
                    <Cell label="Annual Income"   value={profile.annual_income} />
                  </div>
                </div>

                <div>
                  <SectionHead icon={Heart} label="Family Details" />
                  <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                    <Cell label="Father" value={[profile.father_name, profile.father_occupation, profile.father_alive === false ? "Late" : null].filter(Boolean).join(" · ") || null} />
                    <Cell label="Mother" value={[profile.mother_name, profile.mother_occupation, profile.mother_alive === false ? "Late" : null].filter(Boolean).join(" · ") || null} />
                    <Cell label="Family Type" value={profile.family_type} />
                    {siblingsText && <Cell label="Siblings" value={siblingsText} wide />}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-5">
                  <div>
                    <SectionHead icon={MapPin} label="Location" />
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                      <Cell label="City" value={profile.city} />
                      <Cell label="State" value={profile.state} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ASTRO SECTION */}
            {profile.astrology && (
              <div className="relative z-10 mt-4 pt-3 border-t border-[#D4AF37]/40">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Star className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <h3 className="font-serif text-[11px] font-bold text-primary uppercase tracking-widest">Horoscope & Birth Details</h3>
                </div>
                <div className="grid grid-cols-4 gap-3 mb-4 text-center">
                   <div className="bg-primary/5 rounded-xl border border-primary/20 px-3 py-2"><span className="block text-[8px] text-primary font-bold uppercase mb-0.5">Birth Time</span><span className="text-[10px] font-bold">{profile.astrology.birth_time || "—"}</span></div>
                   <div className="bg-primary/5 rounded-xl border border-primary/20 px-3 py-2"><span className="block text-[8px] text-primary font-bold uppercase mb-0.5">Birth Place</span><span className="text-[10px] font-bold">{profile.astrology.birth_place || "—"}</span></div>
                   <div className="bg-primary/5 rounded-xl border border-primary/20 px-3 py-2"><span className="block text-[8px] text-primary font-bold uppercase mb-0.5">Rasi</span><span className="text-[10px] font-bold">{profile.astrology.rasi_name || "—"}</span></div>
                   <div className="bg-primary/5 rounded-xl border border-primary/20 px-3 py-2"><span className="block text-[8px] text-primary font-bold uppercase mb-0.5">Star</span><span className="text-[10px] font-bold">{profile.astrology.natchathiram || "—"}</span></div>
                </div>

                <div className="flex justify-center gap-8">
                  <div className="flex flex-col items-center">
                    <p className="font-serif text-[9px] font-bold text-primary uppercase mb-1">Rasi Chart</p>
                    <div className="bg-white p-2 rounded-xl shadow-md border-2 border-primary">
                      <KoduGrid planetPositions={rasiPositions} lagnaHouse={lagnaRasiNum || 1} size="sm" showToggle={false} />
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="font-serif text-[9px] font-bold text-primary uppercase mb-1">Navamsa Chart</p>
                    <div className="bg-white p-2 rounded-xl shadow-md border-2 border-primary">
                      <KoduGrid planetPositions={navamsaPositions} lagnaHouse={navamsaLagnaRasiNum || 1} size="sm" showToggle={false} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
