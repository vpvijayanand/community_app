"use client"

import { useRouter } from "next/navigation"
import { useAuth, ROLE_LABELS } from "@/lib/auth-context"
import { useProfilesStore, RELATIONSHIP_LABELS } from "@/hooks/use-profiles-store"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { NextTaskCard } from "@/components/next-task-card"
import { TaskQueue } from "@/components/task-queue"
import { ProgressRing } from "@/components/progress-ring"
import { DashboardAstroWidget } from "@/components/astrology/dashboard-astro-widget"
import { useEffect, useState, useMemo } from "react"
import {
  computeProgress,
  resolveNextTask,
  resolveTaskQueue,
  type UserState,
} from "@/lib/navigation-priority"
import { MOCK_USERS, type AdminUser } from "@/lib/admin-users"
import { Button } from "@/components/ui/button"
import { UserPlus, Search, Clock, CheckCircle, XCircle, ChevronRight, Eye } from "lucide-react"

// ── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  if (status === "approved") return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
      <CheckCircle className="h-3 w-3" /> Approved
    </span>
  )
  if (status === "rejected") return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
      <XCircle className="h-3 w-3" /> Rejected
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
      <Clock className="h-3 w-3" /> Pending Approval
    </span>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, isLoggedIn, logout } = useAuth()
  const router = useRouter()
  const { getProfilesByOwner, addProfile } = useProfilesStore()

  // ── Redirect Admins ────────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.role === "admin") {
      router.push("/admin")
    }
  }, [user, router])

  // ── Demo Seeder ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.email === "family@example.com") {
      const existing = getProfilesByOwner(user.email)
      if (existing.length === 0) {
        // Seed Son
        addProfile({
          id: "seed_son_123",
          ownerEmail: user.email,
          relationship: "son",
          status: "approved",
          fullName: "Rajesh Sivaram",
          gender: "male",
          createdAt: new Date().toISOString(),
          wizardData: { fullName: "Rajesh Sivaram", gender: "male", height: 175, qualification: "B.Tech" },
        })
        // Seed Daughter
        addProfile({
          id: "seed_daughter_456",
          ownerEmail: user.email,
          relationship: "daughter",
          status: "pending",
          fullName: "Priya Sivaram",
          gender: "female",
          createdAt: new Date().toISOString(),
          wizardData: { fullName: "Priya Sivaram", gender: "female", height: 162, qualification: "MBA" },
        })
      }
    }
  }, [user, getProfilesByOwner, addProfile])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const displayName = isLoggedIn && user ? user.firstName : "Guest"

  // My profiles (managed via wizard)
  const myProfiles = useMemo(
    () => (user ? getProfilesByOwner(user.email) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user]
  )

  // Active approved profile (for progress section)
  const activeProfile = myProfiles.find((p) => p.status === "approved")

  // For demo accounts, also look up mock user data
  const [mockUser, setMockUser] = useState<AdminUser | undefined>(undefined)

  useEffect(() => {
    if (!user) return
    if (activeProfile) {
      // Use wizard data as AdminUser shape
      setMockUser({
        id: activeProfile.id,
        fullName: activeProfile.fullName,
        email: user.email,
        phone: user.phone || "",
        gender: activeProfile.gender,
        ...activeProfile.wizardData,
      } as unknown as AdminUser)
      return
    }
    // Fallback: demo mock user
    const found = MOCK_USERS.find((u) => u.email.toLowerCase() === user.email.toLowerCase())
    setMockUser(found ? JSON.parse(JSON.stringify(found)) : undefined)
  }, [user, activeProfile])

  const state: UserState = useMemo(() => {
    if (!mockUser) return {
      isEmailVerified: true,
      isPhoneVerified: false,
      hasPhoto: false,
      hasBasicProfile: false,
      hasHoroscope: false,
      hasPreferences: false,
      hasBrowsedMatches: false,
      hasSentFirstInterest: false,
      isPremium: false,
    }
    return {
      isEmailVerified: true,
      isPhoneVerified: !!mockUser.phone,
      hasPhoto: !!mockUser.photos && mockUser.photos.length > 0,
      hasBasicProfile: !!(mockUser.height && mockUser.weight),
      hasHoroscope: !!mockUser.lagnaRasi && !!mockUser.natchathiram,
      hasPreferences: !!mockUser.ageRangeMin,
      hasBrowsedMatches: false,
      hasSentFirstInterest: false,
      isPremium: mockUser.plan !== "basic",
    }
  }, [mockUser])

  const nextTask = resolveNextTask(state)
  const pending = resolveTaskQueue(state)
  const progress = computeProgress(state)
  const roleInfo = user ? ROLE_LABELS[user.role] : null

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">

        {/* ── Greeting strip ────────────────────────────────── */}
        <section className="border-b border-border bg-secondary/40">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between md:py-12">
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-xs uppercase tracking-[0.2em] text-primary">Welcome back</p>
                {roleInfo && (
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ${roleInfo.color}`}>
                    {roleInfo.label}
                    <span className="font-tamil font-normal opacity-80">· {roleInfo.tamil}</span>
                  </span>
                )}
              </div>
              <h1 className="mt-2 font-serif text-4xl font-medium text-foreground sm:text-5xl">
                Vanakkam, <span className="text-primary">{displayName}</span>
              </h1>
              <p className="font-tamil mt-1 text-lg text-muted-foreground">வணக்கம், {displayName}</p>
            </div>

            {/* Quick-action buttons */}
            <div className="flex flex-wrap gap-3 shrink-0">
              <Button
                onClick={() => router.push("/matches")}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" /> Browse Profiles
              </Button>
              <Button
                onClick={() => router.push("/profile/create")}
                className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <UserPlus className="h-4 w-4" /> Create New Profile
              </Button>
            </div>
          </div>
        </section>

        {/* ── My Profiles grid ─────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl font-medium text-foreground">My Profiles</h2>
              <p className="font-tamil text-sm text-muted-foreground">என் சுயவிவரங்கள்</p>
            </div>
            {myProfiles.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/profile/create")}
                className="text-primary hover:bg-primary/5"
              >
                + Add Another
              </Button>
            )}
          </div>

          {myProfiles.length === 0 ? (
            /* Empty state for brand-new users */
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <UserPlus className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-medium text-foreground">No profiles yet</h3>
              <p className="font-tamil mt-1 text-sm text-muted-foreground">சுயவிவரம் இல்லை</p>
              <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto">
                You can browse profiles, read news, or create a matrimonial profile for yourself, your son, daughter, or a relative.
              </p>
              <Button
                onClick={() => router.push("/profile/create")}
                className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Create Your First Profile
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">{profile.fullName}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {RELATIONSHIP_LABELS[profile.relationship].label}
                        <span className="font-tamil ml-2">{RELATIONSHIP_LABELS[profile.relationship].tamil}</span>
                      </p>
                    </div>
                    <StatusBadge status={profile.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(profile.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  {profile.status === "approved" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-auto w-full group-hover:border-primary group-hover:text-primary"
                      onClick={() => router.push(`/profile/me/view`)}
                    >
                      View Profile <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  )}
                  {profile.status === "pending" && (
                    <div className="mt-auto space-y-2">
                      <p className="text-xs italic text-muted-foreground">
                        Admin review in progress. You will be notified once approved.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 group-hover:border-primary group-hover:text-primary"
                          onClick={() => router.push(`/profile/me/view`)}
                        >
                          <Eye className="mr-1 h-3.5 w-3.5" /> View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push(`/profile/me/edit`)}
                        >
                          Edit Profile
                        </Button>
                      </div>
                    </div>
                  )}
                  {profile.status === "rejected" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-auto w-full border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => router.push(`/profile/create`)}
                    >
                      Re-submit Profile
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Progress / Tasks (only for approved active profile) ── */}
        {(activeProfile || mockUser) && (
          <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 sm:pb-14">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="font-serif text-2xl font-medium text-foreground">Complete your profile</h2>
                <p className="font-tamil text-sm text-muted-foreground">சுயவிவரத்தை முடிக்கவும்</p>
              </div>
              <div className="flex items-center gap-5 rounded-2xl border border-border bg-card p-4 shadow-sm">
                <ProgressRing
                  percent={progress.percent}
                  completed={progress.completed}
                  total={progress.total}
                />
                <div className="min-w-0">
                  <p className="font-serif text-sm font-medium text-foreground">Profile readiness</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {progress.completed} of {progress.total} steps complete
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
              <div className="space-y-10">
                <NextTaskCard task={nextTask} />
                <TaskQueue pending={pending} state={state} />
              </div>
              <aside className="hidden lg:block">
                <div className="sticky top-24">
                  <DashboardAstroWidget user={mockUser} />
                </div>
              </aside>
            </div>
          </section>
        )}

      </main>

      <SiteFooter />
    </div>
  )
}
