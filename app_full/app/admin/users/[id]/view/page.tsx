"use client"

import { useMemo, useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Printer, MapPin, Briefcase, Heart, BookOpen, Star, User } from "lucide-react"
import { MOCK_USERS, type AdminUser } from "@/lib/admin-users"
import { KoduGrid } from "@/components/kodu-grid"
import { convertChartToPositions } from "@/lib/astrology-utils"
import { type PlanetCode, type RasiKey } from "@/lib/astrology-data"

export default function UserProfileViewPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

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
    } catch (e) {
      setUser(MOCK_USERS.find(u => u.id === userId))
    }
  }, [userId])

  const rasiPositions = useMemo(() => convertChartToPositions(user?.rasiChart), [user?.rasiChart])
  const navamsaPositions = useMemo(() => convertChartToPositions(user?.navamsaChart), [user?.navamsaChart])

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl font-semibold mb-4">User not found</p>
        <button onClick={() => router.back()} className="text-primary underline">Go Back</button>
      </div>
    )
  }

  const RASI_TO_HOUSE: Record<string, number> = {
    Mesham: 1, Rishabam: 2, Mithunam: 3, Kadagam: 4,
    Simmam: 5, Kanni: 6, Thulam: 7, Viruchigam: 8,
    Dhanusu: 9, Magaram: 10, Kumbam: 11, Meenam: 12,
  }
  
  let dynamicRasiLagnaHouse = user.lagnaRasi ? (RASI_TO_HOUSE[user.lagnaRasi] ?? 1) : 1
  for (const [key, planets] of Object.entries((user.rasiChart || {}))) {
    if ((planets as PlanetCode[]).includes("La")) {
      dynamicRasiLagnaHouse = RASI_TO_HOUSE[key];
      break;
    }
  }

  let dynamicNavamsaLagnaHouse = user.lagnaRasi ? (RASI_TO_HOUSE[user.lagnaRasi] ?? 1) : 1
  for (const [key, planets] of Object.entries((user.navamsaChart || {}))) {
    if ((planets as PlanetCode[]).includes("La")) {
      dynamicNavamsaLagnaHouse = RASI_TO_HOUSE[key];
      break;
    }
  }

  const primaryPhoto = user.photos?.find(p => p.isPrimary)?.url || user.photos?.[0]?.url

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      {/* ── Floating Controls (Hidden in Print) ── */}
      <div className="fixed top-6 left-6 z-50 print:hidden">
        <button
          onClick={() => router.push(`/admin/users/${userId}`)}
          className="flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md px-4 py-2 text-sm font-semibold text-foreground shadow-sm border border-border hover:bg-neutral-100 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      <div className="fixed top-6 right-6 z-50 print:hidden flex gap-3">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-primary/90 transition hover:scale-105 active:scale-95"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </button>
      </div>

      {/* ── Main Printable Page Container ── */}
      <div className="relative z-10 max-w-4xl mx-auto py-6 px-4 sm:px-6 print:p-0 print:m-0 print:max-w-none bg-transparent">
        
        {/* Page Inner Border */}
        <div className="border-[3px] border-[#D4AF37] rounded-3xl p-6 sm:p-8 relative bg-white/90 print:bg-transparent print:rounded-none print:border-4 print:p-6 shadow-2xl print:shadow-none overflow-hidden">
          
          {/* ── Background Watermark (Placed inside container for correct layering) ── */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/images/ganesha_background.png" 
            alt="" 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-auto object-contain opacity-20 print:opacity-20 pointer-events-none z-0 mix-blend-multiply"
          />

          {/* Corner Decorations */}
          <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl opacity-60 z-10"></div>
          <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl opacity-60 z-10"></div>
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl opacity-60 z-10"></div>
          <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl opacity-60 z-10"></div>

          {/* ── Header: Small Ganesha & Title ── */}
          <div className="flex flex-col items-center mb-6 text-center relative z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/ganesha_header.png" alt="Ganesha" className="h-12 w-12 object-contain mb-2 mix-blend-multiply drop-shadow-sm" />
            <h1 className="text-xl font-serif font-bold text-primary mb-1 uppercase tracking-widest">Matrimonial Profile</h1>
            <p className="text-[10px] font-semibold tracking-widest text-[#D4AF37]">|| ஸ்ரீ கணேசாய நமஹ ||</p>
            <div className="w-64 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mt-3"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 print:grid-cols-[1fr_2fr]">
            
            {/* ── Left Column: Photo & Brief ── */}
            <div className="flex flex-col items-center md:items-start print:items-start text-center md:text-left print:text-left border-r-0 md:border-r print:border-r border-border/50 pr-0 md:pr-6 print:pr-6">
              <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-white shadow-xl mb-4 mx-auto bg-neutral-100 flex items-center justify-center relative">
                {primaryPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={primaryPhoto} alt={user.firstName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-neutral-300" />
                )}
                {/* Decorative Photo Frame */}
                <div className="absolute inset-0 border border-[#D4AF37]/50 rounded-2xl pointer-events-none m-1"></div>
              </div>
              
              <h2 className="text-xl font-serif font-bold text-foreground mx-auto md:mx-0 print:mx-0 mt-2">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-muted-foreground text-sm font-medium mb-4 mx-auto md:mx-0 print:mx-0">
                {user.role === 'groom' ? 'Groom' : user.role === 'bride' ? 'Bride' : 'Candidate'}
              </p>

              {/* Prominent Highlight Box */}
              <div className="w-full bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 shadow-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Age</p>
                    <p className="text-lg font-bold text-primary">
                      {user.dateOfBirth ? `${new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear()}` : '—'} 
                      <span className="text-sm font-medium text-foreground ml-1">Yrs</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Height</p>
                    <p className="text-lg font-bold text-primary">
                      {user.height || '—'} 
                      <span className="text-sm font-medium text-foreground ml-1">cm</span>
                    </p>
                  </div>
                  <div className="col-span-2 mt-2 pt-3 border-t border-primary/10">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Lagna Rasi & Star</p>
                    <p className="text-lg font-bold text-primary font-tamil">
                      {user.lagnaRasi || '—'}, {user.natchathiram || '—'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-3">
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"><MapPin className="w-3.5 h-3.5" /></div>
                  <div className="text-left">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Location</p>
                    <p className="font-semibold text-foreground">{[user.city, user.state, user.country].filter(Boolean).join(', ') || '—'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"><Briefcase className="w-3.5 h-3.5" /></div>
                  <div className="text-left">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Profession</p>
                    <p className="font-semibold text-foreground">{user.designation || user.employmentType || '—'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"><BookOpen className="w-3.5 h-3.5" /></div>
                  <div className="text-left">
                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Education</p>
                    <p className="font-semibold text-foreground">{user.qualification || '—'} {user.fieldOfStudy ? `(${user.fieldOfStudy})` : ''}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right Column: Details ── */}
            <div className="flex flex-col gap-6">
              
              {/* Personal Details */}
              <section className="relative z-10">
                <div className="flex items-center gap-2 mb-3 border-b border-border/50 pb-1.5">
                  <Heart className="w-4 h-4 text-[#D4AF37]" />
                  <h3 className="font-serif text-lg font-bold text-primary">Personal Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Marital Status</span>
                    <span className="font-semibold text-foreground capitalize">{user.maritalStatus?.replace('_', ' ') || '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Mother Tongue</span>
                    <span className="font-semibold text-foreground">{user.motherTongue || '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Religion / Caste</span>
                    <span className="font-semibold text-foreground">{user.religion || 'Hindu'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Diet</span>
                    <span className="font-semibold text-foreground capitalize">{user.foodPreference?.replace('_', ' ') || '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Complexion</span>
                    <span className="font-semibold text-foreground capitalize">{user.complexion || '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Body Type</span>
                    <span className="font-semibold text-foreground">{user.bodyType || '—'}</span>
                  </div>
                </div>
              </section>

              {/* Education & Career */}
              <section className="relative z-10">
                <div className="flex items-center gap-2 mb-3 border-b border-border/50 pb-1.5">
                  <Briefcase className="w-4 h-4 text-[#D4AF37]" />
                  <h3 className="font-serif text-lg font-bold text-primary">Education & Career</h3>
                </div>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Qualification</span>
                    <span className="font-semibold text-foreground">{user.qualification || '—'} {user.fieldOfStudy ? `in ${user.fieldOfStudy}` : ''}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Institution</span>
                    <span className="font-semibold text-foreground">{user.institution || '—'} ({user.graduationYear || '—'})</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Employment</span>
                    <span className="font-semibold text-foreground">{user.employmentType || '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Designation</span>
                    <span className="font-semibold text-foreground">{user.designation || '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Company</span>
                    <span className="font-semibold text-foreground">{user.companyName || '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Annual Income</span>
                    <span className="font-semibold text-foreground">{user.annualIncome || '—'}</span>
                  </div>
                </div>
              </section>

              {/* Family & Address */}
              <section className="relative z-10">
                <div className="flex items-center gap-2 mb-3 border-b border-border/50 pb-1.5">
                  <Heart className="w-4 h-4 text-[#D4AF37]" />
                  <h3 className="font-serif text-lg font-bold text-primary">Family & Address</h3>
                </div>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Father's Name & Occ.</span>
                    <span className="font-semibold text-foreground">{user.fatherName || '—'} {user.fatherOccupation ? `(${user.fatherOccupation})` : ''}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Mother's Name & Occ.</span>
                    <span className="font-semibold text-foreground">{user.motherName || '—'} {user.motherOccupation ? `(${user.motherOccupation})` : ''}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Family Type</span>
                    <span className="font-semibold text-foreground capitalize">{user.familyType || '—'} ({user.familyStatus || '—'})</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Family Values</span>
                    <span className="font-semibold text-foreground capitalize">{user.familyValues || '—'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Current Location</span>
                    <span className="font-semibold text-foreground">{[user.area, user.city, user.state, user.country].filter(Boolean).join(', ') || '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Native Place</span>
                    <span className="font-semibold text-foreground">{user.nativePlace || '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Willing to Relocate</span>
                    <span className="font-semibold text-foreground capitalize">{user.willingToRelocate || '—'}</span>
                  </div>
                </div>
              </section>

              {/* Expectations */}
              <section className="relative z-10 print:break-inside-avoid">
                <div className="flex items-center gap-2 mb-3 border-b border-border/50 pb-1.5">
                  <Star className="w-4 h-4 text-[#D4AF37]" />
                  <h3 className="font-serif text-lg font-bold text-primary">Expectations</h3>
                </div>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Age Preference</span>
                    <span className="font-semibold text-foreground">{user.ageRangeMin || '—'} to {user.ageRangeMax || '—'} Years</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Height Preference</span>
                    <span className="font-semibold text-foreground">{user.heightRangeMin || '—'} to {user.heightRangeMax || '—'} cm</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Minimum Poruthams</span>
                    <span className="font-semibold text-foreground">{user.minimumPoruthams || '—'} / 10</span>
                  </div>
                </div>
              </section>

            </div>
          </div>
          
          {/* ── Astrological Highlights (Full Width at Bottom) ── */}
          <div className="mt-8 pt-6 border-t border-border/50 relative z-10">
            <div className="flex justify-center items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="font-serif text-xl font-bold text-primary">Horoscope & Birth Details</h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-4 mb-8 text-sm max-w-3xl mx-auto">
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 text-center shadow-sm">
                <span className="text-primary block text-[10px] font-bold uppercase tracking-wider mb-1">Date of Birth</span>
                <span className="text-lg font-bold text-foreground">{user.dateOfBirth || '—'}</span>
              </div>
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 text-center shadow-sm">
                <span className="text-primary block text-[10px] font-bold uppercase tracking-wider mb-1">Birth Time</span>
                <span className="text-lg font-bold text-foreground">{user.exactBirthTime || '—'}</span>
              </div>
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 text-center shadow-sm">
                <span className="text-primary block text-[10px] font-bold uppercase tracking-wider mb-1">Birth Place</span>
                <span className="text-lg font-bold text-foreground">{user.birthPlace || '—'}</span>
              </div>
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 text-center shadow-sm">
                <span className="text-primary block text-[10px] font-bold uppercase tracking-wider mb-1">Padam</span>
                <span className="text-lg font-bold text-foreground capitalize">{user.padam || '—'}</span>
              </div>
            </div>

            {/* Charts - Full Width Focus */}
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
              <div className="flex flex-col items-center">
                <div className="bg-primary px-6 py-1.5 rounded-t-xl min-w-[180px] text-center mb-0">
                   <p className="font-serif font-bold text-white tracking-widest uppercase">ராசி கட்டம்</p>
                   <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest">Rasi Chart</p>
                </div>
                <div className="bg-white p-4 rounded-b-xl rounded-t-sm shadow-md border-2 border-primary">
                  <KoduGrid
                    planetPositions={rasiPositions}
                    lagnaHouse={dynamicRasiLagnaHouse}
                    mode="rasi"
                    size="md"
                    showToggle={false}
                  />
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                 <div className="bg-primary px-6 py-1.5 rounded-t-xl min-w-[180px] text-center mb-0">
                   <p className="font-serif font-bold text-white tracking-widest uppercase">நவாம்ச கட்டம்</p>
                   <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest">Navamsa Chart</p>
                </div>
                <div className="bg-white p-4 rounded-b-xl rounded-t-sm shadow-md border-2 border-primary">
                  <KoduGrid
                    planetPositions={navamsaPositions}
                    lagnaHouse={dynamicNavamsaLagnaHouse}
                    mode="navamsa"
                    size="md"
                    showToggle={false}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-6 w-full left-0 text-center text-xs text-muted-foreground px-8 mt-10">
            Generated from Matrimonial Platform • {new Date().toLocaleDateString()}
          </div>
          
        </div>
      </div>
      
      {/* Print Styles Injection */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white !important; }
          .bg-white { background-color: white !important; }
          .border-primary { border-color: #CD1C18 !important; }
          .bg-primary\\/5 { background-color: rgba(205, 28, 24, 0.05) !important; }
          .text-primary { color: #CD1C18 !important; }
          
          /* Force charts onto a new page if they get cut off */
          .print\\:break-before-page { page-break-before: always; break-before: page; }
        }
      `}} />
    </div>
  )
}
