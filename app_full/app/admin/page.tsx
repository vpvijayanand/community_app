"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { apiFetchWithRetry } from "@/lib/api"
import { ShieldAlert, Eye, TrendingUp, Users, Clock, IndianRupee, RefreshCw } from "lucide-react"
import { AdminLayout } from "./admin-layout"

// ── Types ─────────────────────────────────────────────────────────────────────

type Stats = {
  totalUsers: number
  activeThisMonth: number
  newThisWeek: number
  pendingApprovals: number
  subscriptions: { basic: number; silver: number; gold: number }
  revenueThisMonth: number
}

type PendingProfile = {
  id: string
  full_name: string
  email: string
  gender: string
  created_at: string
  photo: string | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRupees(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`
  return `₹${n}`
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} min${mins !== 1 ? "s" : ""} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`
  return `${Math.floor(hrs / 24)} days ago`
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()

  const [stats, setStats] = useState<Stats | null>(null)
  const [pending, setPending] = useState<PendingProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Guard: redirect non-admin users
  useEffect(() => {
    if (!isLoggedIn) router.push("/login")
    else if (user?.role !== "admin") router.push("/dashboard")
  }, [isLoggedIn, user, router])

  // Fetch real data from backend — retries up to 5x to handle:
  // 1) JWT race condition (background fetch not done yet after login)
  // 2) Temporary backend unavailability
  useEffect(() => {
    if (!isLoggedIn || user?.role !== "admin") return
    setError(null)
    setLoading(true)

    let cancelled = false

    async function load() {
      if (cancelled) return
      try {
        const [statsData, profilesData] = await Promise.all([
          apiFetchWithRetry<Stats>("/api/admin/stats"),
          apiFetchWithRetry<PendingProfile[]>("/api/admin/profiles?status=pending"),
        ])
        if (cancelled) return
        setStats(statsData)
        setPending(profilesData)
        setLoading(false)
      } catch (err: any) {
        if (cancelled) return
        setError(err.message || "Failed to load dashboard data")
        setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [isLoggedIn, user, refreshKey])

  if (!isLoggedIn || user?.role !== "admin") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-center">
          <ShieldAlert className="h-10 w-10 text-rose-500" />
          <p className="text-slate-600 text-sm">Checking access…</p>
        </div>
      </div>
    )
  }

  const statCards = stats
    ? [
        {
          label: "Total Users",
          value: stats.totalUsers.toLocaleString("en-IN"),
          sub: `${stats.newThisWeek} new this week`,
          up: stats.newThisWeek > 0,
          icon: Users,
          href: "/admin/users",
        },
        {
          label: "Active Subscriptions",
          value: (stats.subscriptions.silver + stats.subscriptions.gold).toLocaleString("en-IN"),
          sub: `${stats.subscriptions.gold} Gold · ${stats.subscriptions.silver} Silver`,
          up: true,
          icon: TrendingUp,
          href: "/admin/subscriptions",
        },
        {
          label: "Pending Approvals",
          value: stats.pendingApprovals.toLocaleString("en-IN"),
          sub: stats.pendingApprovals > 0 ? "Requires attention" : "All clear",
          up: false,
          warn: stats.pendingApprovals > 0,
          icon: Clock,
          href: "/admin/profiles",
        },
        {
          label: "Revenue This Month",
          value: formatRupees(stats.revenueThisMonth),
          sub: `${stats.activeThisMonth} active users`,
          up: stats.revenueThisMonth > 0,
          icon: IndianRupee,
          href: "/admin/subscriptions",
        },
      ]
    : []

  return (
    <AdminLayout activeHref="/admin" title="Dashboard">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Platform statistics and pending tasks.</p>
        <button
          onClick={() => { setStats(null); setPending([]); setRefreshKey(k => k + 1) }}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between gap-4">
          <span>
            {error === "Cannot reach the backend server"
              ? "Cannot reach the backend server — make sure it is running on port 5000."
              : `${error} — Try logging out and back in, or check the backend.`}
          </span>
          <button
            onClick={() => { setStats(null); setPending([]); setRefreshKey(k => k + 1) }}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card p-6 rounded-2xl border border-border shadow-sm animate-pulse">
                <div className="h-3 w-28 rounded bg-muted mb-3" />
                <div className="h-8 w-16 rounded bg-muted mb-2" />
                <div className="h-3 w-24 rounded bg-muted" />
              </div>
            ))
          : statCards.map((stat) => {
              const Icon = stat.icon
              return (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:border-primary/40 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                    <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className={`text-3xl font-bold ${stat.warn ? "text-amber-600" : "text-foreground"}`}>
                    {stat.value}
                  </div>
                  <span className={`text-xs font-medium mt-2 block ${stat.up ? "text-emerald-600" : "text-muted-foreground"}`}>
                    {stat.sub}
                  </span>
                </Link>
              )
            })}
      </div>

      {/* Pending Approvals Table */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground">Recent Pending Approvals</h3>
          <Link
            href="/admin/profiles"
            className="text-xs font-medium text-primary hover:underline"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : pending.length === 0 ? (
          <p className="text-center py-10 text-sm text-muted-foreground">
            No pending approvals right now.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-muted-foreground">
              <thead className="text-xs text-foreground uppercase bg-secondary/40">
                <tr>
                  <th className="px-6 py-3 border-b border-border">User</th>
                  <th className="px-6 py-3 border-b border-border hidden sm:table-cell">Gender</th>
                  <th className="px-6 py-3 border-b border-border">Submitted</th>
                  <th className="px-6 py-3 border-b border-border text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.slice(0, 10).map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{row.full_name}</p>
                      <p className="text-xs text-muted-foreground">{row.email}</p>
                    </td>
                    <td className="px-6 py-4 capitalize hidden sm:table-cell">{row.gender}</td>
                    <td className="px-6 py-4">{timeAgo(row.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end items-center gap-3">
                        <Link
                          href={`/admin/profiles/${row.id}`}
                          className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
