"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, BadgeCheck, Heart, MapPin, Star, Loader2, AlertCircle, GraduationCap, Briefcase, Ruler, Eye } from "lucide-react"
import { UserLayout } from "@/components/user-layout"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

type ProfileDetail = {
  id: string
  full_name: string
  full_name_tamil: string | null
  gender: "male" | "female" | null
  date_of_birth: string | null
  age?: number
  height_cm: number | null
  complexion: string | null
  food_preference: string | null
  body_type: string | null
  state: string | null
  city: string | null
  country: string | null
  native_place: string | null
  qualification: string | null
  field_of_study: string | null
  institution: string | null
  employment_type: string | null
  company_name: string | null
  designation: string | null
  work_location: string | null
  annual_income: string | null
  marital_status: string | null
  mother_tongue: string | null
  religion: string | null
  family_type: string | null
  family_values: string | null
  family_status: string | null
  father_name: string | null
  father_occupation: string | null
  mother_name: string | null
  mother_occupation: string | null
  is_verified: boolean
  completeness_score: number
  photos: Array<{ id: string; url: string; is_primary: boolean }> | null
  astrology?: {
    rasi_name?: string
    natchathiram?: string
    birth_time?: string
    birth_place?: string
  } | null
  viewerTier?: string
}

function heightDisplay(cm: number | null): string {
  if (!cm) return "—"
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches - feet * 12)
  return `${feet}'${inches}" (${cm} cm)`
}

function getPhotoUrl(profile: ProfileDetail): string {
  const primary = profile.photos?.find((p) => p.is_primary) ?? profile.photos?.[0]
  if (primary?.url) {
    if (primary.url.startsWith("/uploads/") || primary.url.startsWith("uploads/")) {
      return `${API_BASE}/${primary.url.replace(/^\//, "")}`
    }
    return primary.url
  }
  return profile.gender === "female" ? "/avatar-female.png" : "/avatar-male.png"
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-36 shrink-0 text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}

export default function MatchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [profile, setProfile] = useState<ProfileDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [interestSent, setInterestSent] = useState(false)

  useEffect(() => {
    if (!id) return
    const token = typeof window !== "undefined" ? localStorage.getItem("maratha_token") : null
    fetch(`${API_BASE}/api/profile/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 404 ? "Profile not found" : `Server error ${r.status}`)
        return r.json()
      })
      .then(setProfile)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  async function sendInterest() {
    const token = typeof window !== "undefined" ? localStorage.getItem("maratha_token") : null
    if (!token) { router.push("/login"); return }
    await fetch(`${API_BASE}/api/profile/${id}/interest`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
    setInterestSent(true)
  }

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center py-32 gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading profile…
        </div>
      </UserLayout>
    )
  }

  if (error || !profile) {
    return (
      <UserLayout>
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
          <AlertCircle className="h-10 w-10 text-red-400" />
          <h2 className="font-serif text-xl font-medium text-foreground">{error || "Profile not found"}</h2>
          <Button variant="outline" onClick={() => router.push("/matches")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to matches
          </Button>
        </div>
      </UserLayout>
    )
  }

  const photoUrl = getPhotoUrl(profile)
  const location = [profile.city, profile.state, profile.country].filter(Boolean).join(", ")
  const age = profile.age ?? (profile.date_of_birth ? Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / (365.25 * 24 * 3600 * 1000)) : null)

  return (
    <UserLayout>
      <div className="mx-auto w-full max-w-6xl px-6 py-8 md:py-12">
        {/* Back */}
        <Link
          href="/matches"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to matches
        </Link>

        {/* Hero section */}
        <div className="flex flex-col gap-8 md:flex-row md:gap-10">
          {/* Left: photo */}
          <div className="shrink-0 md:w-72">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-border bg-muted">
              <Image
                src={photoUrl}
                alt={profile.full_name}
                fill
                sizes="(min-width: 768px) 288px, 100vw"
                className="object-cover"
                priority
                unoptimized={photoUrl.startsWith("http://localhost")}
              />
              {profile.is_verified && (
                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-primary backdrop-blur">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified
                </div>
              )}
            </div>

            {/* Additional photos */}
            {profile.photos && profile.photos.length > 1 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {profile.photos.slice(1, 4).map((ph) => {
                  const url = ph.url.startsWith("/uploads/") || ph.url.startsWith("uploads/")
                    ? `${API_BASE}/${ph.url.replace(/^\//, "")}`
                    : ph.url
                  return (
                    <div key={ph.id} className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                      <Image src={url} alt="" fill className="object-cover" unoptimized={url.startsWith("http://localhost")} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right: info */}
          <div className="flex-1">
            <h1 className="flex items-baseline gap-3 font-serif text-3xl font-medium text-foreground md:text-4xl">
              {profile.full_name}
              {profile.is_verified && <BadgeCheck className="h-5 w-5 text-accent" aria-label="Verified" />}
            </h1>
            {profile.full_name_tamil && (
              <p className="font-tamil mt-1 text-lg text-muted-foreground">{profile.full_name_tamil}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-foreground">
              {age && <span>{age} yrs</span>}
              {profile.height_cm && (
                <>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5" /> {heightDisplay(profile.height_cm)}</span>
                </>
              )}
              {location && (
                <>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {location}
                  </span>
                </>
              )}
            </div>

            {/* Astro facts */}
            {(profile.astrology?.rasi_name || profile.astrology?.natchathiram) && (
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {profile.astrology?.natchathiram && (
                  <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-center">
                    <p className="font-tamil text-[10px] text-muted-foreground">நட்சத்திரம்</p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">{profile.astrology.natchathiram}</p>
                  </div>
                )}
                {profile.astrology?.rasi_name && (
                  <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-center">
                    <p className="font-tamil text-[10px] text-muted-foreground">ராசி</p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">{profile.astrology.rasi_name}</p>
                  </div>
                )}
                <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-center">
                  <p className="text-[10px] text-muted-foreground">Profile Score</p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">{profile.completeness_score}%</p>
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={sendInterest}
                disabled={interestSent}
              >
                <Heart className="mr-2 h-4 w-4" />
                {interestSent ? "Interest Sent!" : "Express Interest"}
              </Button>
              <Button
                variant="outline"
                asChild
                className="border-primary text-primary hover:bg-primary/5"
              >
                <Link href={`/profile/${profile.id}/view`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Full Profile
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-10" />

        {/* Profile details */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Personal */}
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-semibold text-foreground">Personal</h2>
            <div className="space-y-2">
              <InfoRow label="Religion" value={profile.religion} />
              <InfoRow label="Mother Tongue" value={profile.mother_tongue} />
              <InfoRow label="Marital Status" value={profile.marital_status?.replace(/_/g, " ")} />
              <InfoRow label="Complexion" value={profile.complexion} />
              <InfoRow label="Food Preference" value={profile.food_preference} />
              <InfoRow label="Body Type" value={profile.body_type} />
              <InfoRow label="Native Place" value={profile.native_place} />
            </div>
          </div>

          {/* Education & Career */}
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" /> Education &amp; Career
            </h2>
            <div className="space-y-2">
              <InfoRow label="Qualification" value={profile.qualification} />
              <InfoRow label="Field of Study" value={profile.field_of_study} />
              <InfoRow label="Institution" value={profile.institution} />
              <InfoRow label="Employment" value={profile.employment_type} />
              <InfoRow label="Company" value={profile.company_name} />
              <InfoRow label="Designation" value={profile.designation} />
              <InfoRow label="Work Location" value={profile.work_location} />
              {profile.annual_income && (
                <InfoRow label="Annual Income" value={profile.annual_income} />
              )}
            </div>
          </div>

          {/* Family */}
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" /> Family
            </h2>
            <div className="space-y-2">
              <InfoRow label="Family Type" value={profile.family_type} />
              <InfoRow label="Family Values" value={profile.family_values} />
              <InfoRow label="Family Status" value={profile.family_status} />
              <InfoRow label="Father" value={profile.father_name ? `${profile.father_name}${profile.father_occupation ? ` (${profile.father_occupation})` : ""}` : null} />
              <InfoRow label="Mother" value={profile.mother_name ? `${profile.mother_name}${profile.mother_occupation ? ` (${profile.mother_occupation})` : ""}` : null} />
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  )
}
