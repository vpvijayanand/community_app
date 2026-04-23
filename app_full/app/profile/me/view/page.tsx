"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Printer, MapPin, Briefcase, BookOpen, Heart, Star, User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { MOCK_USERS, type AdminUser } from "@/lib/admin-users"
import { KoduGrid } from "@/components/kodu-grid"
import { convertChartToPositions } from "@/lib/astrology-utils"
import type { PlanetCode } from "@/lib/astrology-data"

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
}

function calcAge(dob: string | null | undefined) {
  if (!dob) return null
  return String(new Date().getFullYear() - new Date(dob).getFullYear())
}

function fmtHeight(cm: number | null | undefined) {
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

function lagnaHouseFromUser(user: AdminUser): number {
  for (const [key, planets] of Object.entries(user.rasiChart ?? {})) {
    if ((planets as PlanetCode[]).includes("La")) return RASI_TO_HOUSE[key] ?? 1
  }
  return user.lagnaRasi ? (RASI_TO_HOUSE[user.lagnaRasi] ?? 1) : 1
}

function navamsaLagnaHouseFromUser(user: AdminUser): number {
  for (const [key, planets] of Object.entries(user.navamsaChart ?? {})) {
    if ((planets as PlanetCode[]).includes("La")) return RASI_TO_HOUSE[key] ?? 1
  }
  return user.lagnaRasi ? (RASI_TO_HOUSE[user.lagnaRasi] ?? 1) : 1
}

// ── Shared UI ────────────────────────────────────────────────────────────────

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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MyProfileViewPage() {
  const router = useRouter()
  const { user: authUser } = useAuth()

  const userId = useMemo(() => {
    if (!authUser) return "u001"
    const mock = MOCK_USERS.find(u => u.email.toLowerCase() === authUser.email.toLowerCase())
    return mock?.id || "u001"
  }, [authUser])

  const [user, setUser] = useState<AdminUser | undefined>(undefined)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`mock_user_${userId}`)
      if (stored) {
        setUser(JSON.parse(stored))
      } else {
        const found = MOCK_USERS.find(u => u.id === userId)
        setUser(found ? JSON.parse(JSON.stringify(found)) : undefined)
      }
    } catch {
      setUser(MOCK_USERS.find(u => u.id === userId))
    }
  }, [userId])

  const rasiPositions  = useMemo(() => convertChartToPositions(user?.rasiChart),    [user])
  const navamsaPositions = useMemo(() => convertChartToPositions(user?.navamsaChart), [user])

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-3 w-80 animate-pulse">
          {[8, 48, 32].map(h => <div key={h} className={`h-${h} rounded-2xl bg-muted`} />)}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg font-semibold">Profile not found</p>
        <button onClick={() => router.back()} className="text-sm text-primary underline inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Go Back
        </button>
      </div>
    )
  }

  const isGroom = user.role === "groom" || user.gender === "male"
  const primaryPhoto = user.photos?.find(p => p.isPrimary)?.url ?? user.photos?.[0]?.url
  const fullName = `${user.firstName} ${user.lastName}`.trim()

  const rasiLagnaHouse    = lagnaHouseFromUser(user)
  const navamsaLagnaHouse = navamsaLagnaHouseFromUser(user)

  const hasAstro = user.lagnaRasi || user.moonRasi || user.natchathiram || user.rasiChart || user.navamsaChart
  const hasCharts = !!(user.rasiChart && Object.keys(user.rasiChart).length > 0)
  const hasNavamsa = !!(user.navamsaChart && Object.keys(user.navamsaChart).length > 0)

  const siblingsText = user.siblings?.length
    ? user.siblings.map(s => `${s.name} (${s.gender === "male" ? "Bro" : "Sis"}, ${(s.maritalStatus ?? "").replace(/_/g, " ")})`).join("; ")
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
      <div className="no-print fixed top-6 left-6 z-50">
        <button
          onClick={() => router.push("/profile/me/edit")}
          className="flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md px-4 py-2 text-sm font-semibold text-foreground shadow-sm border border-border hover:bg-neutral-100 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Edit Profile
        </button>
      </div>

      <div className="no-print fixed top-6 right-6 z-50">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-primary/90 transition"
        >
          <Printer className="w-4 h-4" /> Print / Save PDF
        </button>
      </div>

      {/* Printable sheet */}
      <div className="min-h-screen bg-[#FFFDF9] pt-20 pb-10 px-4 print:pt-0 print:pb-0 print:px-0 print:bg-white">
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
              <div className="w-48 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mt-2" />
            </div>

            {/* ── Body ── */}
            <div className="relative z-10 grid grid-cols-[160px_1fr] gap-5 print:grid-cols-[160px_1fr]">

              {/* LEFT: Photo + key stats */}
              <div className="flex flex-col items-center text-center">
                {/* Photo */}
                <div className="relative w-[148px] h-[180px] rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-neutral-100 flex items-center justify-center shrink-0">
                  {primaryPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={primaryPhoto} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-14 h-14 text-neutral-300" />
                  )}
                  <div className="absolute inset-0 border border-[#D4AF37]/40 rounded-2xl pointer-events-none m-1" />
                </div>

                <h2 className="mt-2.5 text-[13px] font-serif font-bold text-foreground leading-tight">{fullName}</h2>
                <p className="text-[9px] font-semibold text-muted-foreground mt-0.5">{isGroom ? "Groom" : "Bride"}</p>

                {/* Key highlights */}
                <div className="mt-2 w-full bg-primary/5 border border-primary/20 rounded-xl p-2.5">
                  <div className="grid grid-cols-2 gap-x-2 gap-y-2">
                    <div>
                      <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-wider">Age</p>
                      <p className="text-sm font-bold text-primary leading-none">
                        {calcAge(user.dateOfBirth) ?? "—"}
                        <span className="text-[9px] font-medium text-foreground ml-0.5">Yrs</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-wider">Height</p>
                      <p className="text-[10px] font-bold text-primary leading-none">{user.height ? `${user.height} cm` : "—"}</p>
                    </div>
                    <div className="col-span-2 pt-1.5 border-t border-primary/10">
                      <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-wider">Rasi · Star</p>
                      <p className="text-[10px] font-bold text-primary font-tamil">{user.moonRasi || "—"} · {user.natchathiram || "—"}</p>
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
                      <p className="text-[9px] font-semibold text-foreground leading-none mt-0.5">
                        {[user.city, user.state].filter(Boolean).join(", ") || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Briefcase className="w-2.5 h-2.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[8px] uppercase tracking-wider text-muted-foreground font-bold leading-none">Profession</p>
                      <p className="text-[9px] font-semibold text-foreground leading-none mt-0.5">
                        {user.designation || user.employmentType || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <BookOpen className="w-2.5 h-2.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[8px] uppercase tracking-wider text-muted-foreground font-bold leading-none">Education</p>
                      <p className="text-[9px] font-semibold text-foreground leading-none mt-0.5">
                        {user.qualification || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Sections */}
              <div className="flex flex-col gap-3">

                {/* Personal */}
                <div>
                  <SectionHead icon={Heart} label="Personal Details" />
                  <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                    <Cell label="Date of Birth"   value={fmtDate(user.dateOfBirth)} />
                    <Cell label="Marital Status"  value={user.maritalStatus?.replace(/_/g, " ")} />
                    <Cell label="Religion"        value={user.religion} />
                    <Cell label="Mother Tongue"   value={user.motherTongue} />
                    <Cell label="Complexion"      value={user.complexion} />
                    <Cell label="Body Type"       value={user.bodyType} />
                    <Cell label="Food Preference" value={user.foodPreference?.replace(/_/g, " ")} />
                    <Cell label="Height"          value={fmtHeight(user.height)} />
                    <Cell label="Weight"          value={user.weight ? `${user.weight} kg` : null} />
                  </div>
                </div>

                {/* Career & Education */}
                <div>
                  <SectionHead icon={Briefcase} label="Career & Education" />
                  <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                    <Cell label="Qualification"   value={user.qualification} />
                    <Cell label="Field of Study"  value={user.fieldOfStudy} />
                    <Cell label="Institution"     value={user.institution} />
                    <Cell label="Employment"      value={user.employmentType} />
                    <Cell label="Designation"     value={user.designation} />
                    <Cell label="Company"         value={user.companyName} />
                    <Cell label="Work Location"   value={user.workLocation} />
                    <Cell label="Annual Income"   value={user.annualIncome || null} />
                    {user.graduationYear && <Cell label="Grad Year" value={String(user.graduationYear)} />}
                  </div>
                </div>

                {/* Family */}
                <div>
                  <SectionHead icon={Heart} label="Family Details" />
                  <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                    <Cell
                      label="Father"
                      value={[user.fatherName, user.fatherOccupation, user.fatherAlive === false ? "Late" : null].filter(Boolean).join(" · ") || null}
                    />
                    <Cell
                      label="Mother"
                      value={[user.motherName, user.motherOccupation, user.motherAlive === false ? "Late" : null].filter(Boolean).join(" · ") || null}
                    />
                    <Cell label="Family Type"   value={user.familyType} />
                    <Cell label="Family Status" value={user.familyStatus} />
                    <Cell label="Family Values" value={user.familyValues} />
                    {siblingsText && <Cell label="Siblings" value={siblingsText} wide />}
                  </div>
                </div>

                {/* Location + Expectations */}
                <div className="grid grid-cols-2 gap-x-5">
                  <div>
                    <SectionHead icon={MapPin} label="Location" />
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                      <Cell label="City"         value={user.city} />
                      <Cell label="State"        value={user.state} />
                      <Cell label="Native Place" value={user.nativePlace} />
                      <Cell label="Relocate"     value={user.willingToRelocate} />
                    </div>
                  </div>
                  <div>
                    <SectionHead icon={Star} label="Partner Expectations" />
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                      <Cell label="Age"
                        value={(user.ageRangeMin || user.ageRangeMax) ? `${user.ageRangeMin ?? "?"}–${user.ageRangeMax ?? "?"} yrs` : null}
                      />
                      <Cell label="Height"
                        value={(user.heightRangeMin || user.heightRangeMax) ? `${user.heightRangeMin ?? "?"}–${user.heightRangeMax ?? "?"} cm` : null}
                      />
                      <Cell label="Min Poruthams" value={user.minimumPoruthams ? `${user.minimumPoruthams} / 10` : null} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Astrology & Charts — full width ── */}
            {hasAstro && (
              <div className="relative z-10 mt-4 pt-3 border-t border-[#D4AF37]/40">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Star className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <h3 className="font-serif text-[11px] font-bold text-primary uppercase tracking-widest">Horoscope & Birth Details</h3>
                </div>

                {/* Birth detail boxes */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: "Date of Birth", val: fmtDate(user.dateOfBirth) },
                    { label: "Birth Time",    val: user.exactBirthTime || "—" },
                    { label: "Birth Place",   val: user.birthPlace || "—" },
                    { label: "Lagna · Rasi · Star", val: [user.lagnaRasi, user.moonRasi, user.natchathiram].filter(Boolean).join(" · ") || "—" },
                  ].map(({ label, val }) => (
                    <div key={label} className="bg-primary/5 rounded-xl border border-primary/20 px-3 py-2 text-center shadow-sm">
                      <span className="block text-[8px] text-primary font-bold uppercase tracking-wider mb-0.5">{label}</span>
                      <span className="text-[10px] font-bold text-foreground">{val}</span>
                    </div>
                  ))}
                </div>

                {/* Charts */}
                {(hasCharts || hasNavamsa) && (
                  <div className="flex justify-center gap-8">
                    {hasCharts && (
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
                          />
                        </div>
                      </div>
                    )}
                    {hasNavamsa && (
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
              <span>Maratha Matrimony · {fullName}</span>
              <span>Generated {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
