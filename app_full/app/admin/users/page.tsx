"use client"

import { useState, useEffect, useMemo, Fragment } from "react"
import Link from "next/link"
import {
  Search, PencilLine, ChevronDown, Eye, CheckCircle, XCircle,
  Clock, ChevronRight, UserCircle2, RefreshCw,
} from "lucide-react"
import { AdminLayout } from "../admin-layout"
import { apiFetchWithRetry } from "@/lib/api"

// ── Types ─────────────────────────────────────────────────────────────────────

type ProfileSummary = {
  id: string
  full_name: string
  gender: "male" | "female"
  status: "pending" | "approved" | "rejected"
  is_closed: boolean
  created_at: string
  city: string | null
  state: string | null
  profile_number: number | null
}

type ApiUser = {
  id: string
  email: string
  role: string
  is_active: boolean
  created_at: string
  last_active_at: string | null
  tier: string | null
  profiles: ProfileSummary[]
}

// ── Badge helpers ─────────────────────────────────────────────────────────────

const ROLE_STYLE: Record<string, string> = {
  admin:  "bg-primary/20 text-primary border border-primary/30",
  groom:  "bg-blue-100 text-blue-700 border border-blue-200",
  bride:  "bg-pink-100 text-pink-700 border border-pink-200",
  user:   "bg-secondary text-muted-foreground border border-border",
  normal: "bg-secondary text-muted-foreground border border-border",
}

const PLAN_STYLE: Record<string, string> = {
  basic:    "bg-secondary text-muted-foreground",
  silver:   "bg-slate-100 text-slate-600",
  gold:     "bg-amber-100 text-amber-700",
  platinum: "bg-purple-100 text-purple-700",
}

const STATUS_STYLE: Record<string, string> = {
  pending:  "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-600",
}

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${className}`}>
      {label}
    </span>
  )
}

function InitialAvatar({ email, id }: { email: string; id: string }) {
  const initial = email[0]?.toUpperCase() ?? "?"
  const colors = [
    "bg-primary/15 text-primary", "bg-amber-100 text-amber-700",
    "bg-blue-100 text-blue-700", "bg-pink-100 text-pink-700", "bg-emerald-100 text-emerald-700",
  ]
  const color = colors[id.charCodeAt(0) % colors.length]
  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${color}`}>
      {initial}
    </div>
  )
}

// ── Profiles cell ─────────────────────────────────────────────────────────────

function ProfilesCell({
  user, expanded, onToggle,
}: { user: ApiUser; expanded: boolean; onToggle: () => void }) {
  const profiles = user.profiles ?? []

  if (profiles.length === 0) {
    return <span className="text-xs text-muted-foreground italic">No profile</span>
  }

  const grooms = profiles.filter(p => p.gender === "male").length
  const brides = profiles.filter(p => p.gender === "female").length

  return (
    <button
      onClick={onToggle}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/40 px-2.5 py-1 text-xs font-medium hover:border-primary/40 hover:bg-primary/5 transition-colors"
    >
      {grooms > 0 && <span className="text-blue-600">Groom {grooms}</span>}
      {grooms > 0 && brides > 0 && <span className="text-muted-foreground">·</span>}
      {brides > 0 && <span className="text-pink-600">Bride {brides}</span>}
      <ChevronRight className={`h-3 w-3 text-muted-foreground transition-transform duration-150 ${expanded ? "rotate-90" : ""}`} />
    </button>
  )
}

// ── Expandable profiles list row ──────────────────────────────────────────────

function ProfilesExpandedRow({ user }: { user: ApiUser }) {
  const profiles = user.profiles ?? []

  return (
    <tr>
      <td colSpan={7} className="bg-secondary/20 px-6 py-4 border-b border-border">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Matrimony Profiles — {user.email}
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map(profile => {
            const isGroom = profile.gender === "male"
            return (
              <div
                key={profile.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isGroom ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
                    {profile.full_name?.[0] ?? "?"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-medium text-sm text-foreground truncate">{profile.full_name}</p>
                      {profile.profile_number && (
                        <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary tracking-wider">
                          MAT-{String(profile.profile_number).padStart(5, "0")}
                        </span>
                      )}
                      {profile.is_closed && (
                        <span className="inline-flex items-center rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-700">Closed</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[10px] font-semibold uppercase ${isGroom ? "text-blue-600" : "text-pink-600"}`}>
                        {isGroom ? "Groom" : "Bride"}
                      </span>
                      {profile.city && (
                        <span className="text-[10px] text-muted-foreground">· {profile.city}{profile.state ? `, ${profile.state}` : ""}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {profile.status === "pending" && <Clock className="h-3 w-3 text-amber-500" />}
                  {profile.status === "approved" && <CheckCircle className="h-3 w-3 text-emerald-500" />}
                  {profile.status === "rejected" && <XCircle className="h-3 w-3 text-red-500" />}
                  <Link
                    href={`/admin/profiles/${profile.id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/15 transition-colors"
                  >
                    <Eye className="h-3 w-3" /> View
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </td>
    </tr>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ApiUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [planFilter, setPlanFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  async function loadUsers(p = 1) {
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetchWithRetry<{ users: ApiUser[]; total: number; page: number }>(
        `/api/admin/users?page=${p}`
      )
      setUsers(data.users)
      setTotal(data.total)
      setPage(data.page)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return users.filter(u => {
      const matchSearch = !q || u.email.toLowerCase().includes(q) ||
        (u.profiles ?? []).some(p => p.full_name?.toLowerCase().includes(q))
      const matchRole   = roleFilter === "all" || u.role === roleFilter
      const matchPlan   = planFilter === "all" || u.tier === planFilter || (planFilter === "basic" && !u.tier)
      const matchStatus = statusFilter === "all" ||
        (statusFilter === "active" && u.is_active) ||
        (statusFilter === "inactive" && !u.is_active)
      return matchSearch && matchRole && matchPlan && matchStatus
    })
  }, [users, search, roleFilter, planFilter, statusFilter])

  const stats = useMemo(() => ({
    total,
    withProfiles: users.filter(u => (u.profiles ?? []).length > 0).length,
    goldPlus: users.filter(u => u.tier === "gold" || u.tier === "platinum").length,
    pending: users.flatMap(u => u.profiles ?? []).filter(p => p.status === "pending").length,
  }), [users, total])

  return (
    <AdminLayout activeHref="/admin/users" title="User Management">

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Users",    value: stats.total,        color: "text-foreground" },
          { label: "Have Profiles",  value: stats.withProfiles, color: "text-primary" },
          { label: "Gold/Platinum",  value: stats.goldPlus,     color: "text-amber-600" },
          { label: "Pending Profiles", value: stats.pending,    color: "text-amber-600" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search email or profile name…"
            className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {[
          { label: "Role",   value: roleFilter,   set: setRoleFilter,
            opts: [["all","All Roles"],["admin","Admin"],["groom","Groom"],["bride","Bride"],["user","User"]] },
          { label: "Plan",   value: planFilter,   set: setPlanFilter,
            opts: [["all","All Plans"],["basic","Basic"],["silver","Silver"],["gold","Gold"]] },
          { label: "Status", value: statusFilter, set: setStatusFilter,
            opts: [["all","All Status"],["active","Active"],["inactive","Inactive"]] },
        ].map(({ label, value, set, opts }) => (
          <div key={label} className="relative">
            <select
              value={value}
              onChange={e => set(e.target.value)}
              className="h-10 appearance-none rounded-xl border border-input bg-background pl-4 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {(opts as [string, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          </div>
        ))}

        <button
          onClick={() => loadUsers(1)}
          className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl border border-input text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>

        <p className="text-sm text-muted-foreground ml-auto">
          {filtered.length} of {total} users
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Role</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Plan</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Profiles</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Joined</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/60 animate-pulse">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-muted" /><div className="h-3 w-32 rounded bg-muted" /></div></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><div className="h-5 w-14 rounded-full bg-muted" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><div className="h-5 w-14 rounded-full bg-muted" /></td>
                    <td className="px-4 py-3"><div className="h-6 w-24 rounded-lg bg-muted" /></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><div className="h-3 w-20 rounded bg-muted" /></td>
                    <td className="px-4 py-3"><div className="h-7 w-16 rounded-lg bg-muted ml-auto" /></td>
                  </tr>
                ))
              : filtered.map((user, idx) => (
                  <Fragment key={user.id}>
                    <tr
                      className={`border-b border-border/60 transition-colors hover:bg-secondary/30 ${idx % 2 === 0 ? "" : "bg-secondary/10"}`}
                    >
                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <InitialAvatar email={user.email} id={user.id} />
                          <div>
                            <p className="font-medium text-foreground text-sm">{user.email}</p>
                            <p className={`text-xs mt-0.5 ${user.is_active ? "text-emerald-600" : "text-red-500"}`}>
                              {user.is_active ? "Active" : "Inactive"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <Badge label={user.role} className={ROLE_STYLE[user.role] ?? ROLE_STYLE.user} />
                      </td>

                      {/* Plan */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Badge label={user.tier ?? "basic"} className={PLAN_STYLE[user.tier ?? "basic"] ?? PLAN_STYLE.basic} />
                      </td>

                      {/* Profiles */}
                      <td className="px-4 py-3">
                        <ProfilesCell
                          user={user}
                          expanded={expandedUserId === user.id}
                          onToggle={() => setExpandedUserId(prev => prev === user.id ? null : user.id)}
                        />
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell whitespace-nowrap">
                        {new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/15 transition-colors"
                        >
                          <PencilLine className="h-3.5 w-3.5" /> Edit
                        </Link>
                      </td>
                    </tr>

                    {/* Expanded profiles row */}
                    {expandedUserId === user.id && <ProfilesExpandedRow user={user} />}
                  </Fragment>
                ))}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center text-sm text-muted-foreground">
                  No users match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 25 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => loadUsers(page - 1)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-secondary transition-colors"
          >
            Previous
          </button>
          <span className="flex items-center px-3 text-sm text-muted-foreground">
            Page {page} of {Math.ceil(total / 25)}
          </span>
          <button
            disabled={page * 25 >= total}
            onClick={() => loadUsers(page + 1)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-secondary transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </AdminLayout>
  )
}
