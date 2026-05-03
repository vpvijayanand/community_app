"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Eye, CheckCircle, XCircle, Clock, Search, RefreshCw, PencilLine, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminLayout } from "../admin-layout"
import { apiFetch, apiFetchWithRetry } from "@/lib/api"

type Status = "pending" | "approved" | "rejected"
type FilterTab = "pending" | "approved" | "rejected" | "all"

type Profile = {
  id: string
  full_name: string
  email: string
  gender: string
  date_of_birth: string | null
  state: string | null
  city: string | null
  status: Status
  is_closed: boolean
  completeness_score: number
  created_at: string
  photo: string | null
  profile_number: number | null
}

function StatusBadge({ status }: { status: Status }) {
  if (status === "approved") return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-[10px] uppercase tracking-wider font-bold text-green-700 border border-green-200">
      <CheckCircle className="h-3 w-3" /> Approved
    </span>
  )
  if (status === "rejected") return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-[10px] uppercase tracking-wider font-bold text-red-700 border border-red-200">
      <XCircle className="h-3 w-3" /> Rejected
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[10px] uppercase tracking-wider font-bold text-amber-700 border border-amber-200">
      <Clock className="h-3 w-3" /> Pending Review
    </span>
  )
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function AdminProfilesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("pending")
  const [search, setSearch] = useState("")
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actioning, setActioning] = useState<string | null>(null)

  async function load(filter: FilterTab) {
    setLoading(true)
    setError(null)
    try {
      const statusParam = filter === "all" ? "" : `?status=${filter}`
      const data = await apiFetchWithRetry<Profile[]>(`/api/admin/profiles${statusParam}`)
      setProfiles(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(activeFilter) }, [activeFilter])

  async function handleApprove(profileId: string) {
    setActioning(profileId)
    try {
      await apiFetch(`/api/admin/profiles/${profileId}/approve`, { method: "PUT" })
      setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, status: "approved" as Status } : p))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActioning(null)
    }
  }

  async function handleReject(profileId: string) {
    setActioning(profileId)
    try {
      await apiFetch(`/api/admin/profiles/${profileId}/reject`, { method: "PUT" })
      setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, status: "rejected" as Status } : p))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActioning(null)
    }
  }

  const filtered = profiles.filter(p =>
    !search || p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    (p.city ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (p.state ?? "").toLowerCase().includes(search.toLowerCase())
  )

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "pending",  label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    { key: "all",      label: "All" },
  ]

  function age(dob: string | null) {
    if (!dob) return null
    return `${new Date().getFullYear() - new Date(dob).getFullYear()} yrs`
  }

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <AdminLayout activeHref="/admin/profiles" title="Profile Approvals">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">Review, approve, or reject member profile submissions.</p>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, city…"
              className="h-9 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            onClick={() => load(activeFilter)}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between gap-4">
          <span>{error}</span>
          <button onClick={() => load(activeFilter)} className="shrink-0 text-xs font-semibold underline">Retry</button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="mb-5 flex gap-1 rounded-xl border border-border bg-secondary/40 p-1 w-fit flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveFilter(t.key)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${activeFilter === t.key ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile cards */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            {search ? "No profiles match your search." : `No ${activeFilter === "all" ? "" : activeFilter} profiles found.`}
          </div>
        ) : (
          filtered.map((p) => {
            const isGroom = p.gender === "male"
            const location = [p.city, p.state].filter(Boolean).join(", ") || "—"
            const profileAge = age(p.date_of_birth)
            return (
              <div
                key={p.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 bg-card rounded-2xl border border-border p-5 shadow-sm transition hover:bg-secondary/30"
              >
                {/* Avatar / photo */}
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 overflow-hidden ${isGroom ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
                  {p.photo
                    ? <img src={`${API_BASE}${p.photo}`} alt={p.full_name} className="w-full h-full object-cover" />
                    : p.full_name.charAt(0)
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground text-base">{p.full_name}</p>
                    {p.profile_number && (
                      <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary tracking-wider">
                        MAT-{String(p.profile_number).padStart(5, "0")}
                      </span>
                    )}
                    {p.is_closed && (
                      <span className="inline-flex items-center rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-700">Closed</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {profileAge ? `${profileAge} · ` : ""}
                    {isGroom ? "Groom" : "Bride"} · {location}
                  </p>
                  <p className="text-xs text-muted-foreground">{p.email} · {timeAgo(p.created_at)}</p>
                  {/* Completeness bar */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="w-20 h-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${p.completeness_score ?? 0}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{p.completeness_score ?? 0}% complete</span>
                  </div>
                </div>

                {/* Status badge */}
                <div className="hidden sm:block shrink-0">
                  <StatusBadge status={p.status} />
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0 sm:ml-2 flex-wrap">
                  <Link href={`/admin/profiles/${p.id}`}>
                    <Button size="sm" variant="outline" className="border-border text-foreground hover:bg-secondary flex items-center gap-1.5">
                      <PencilLine className="h-3.5 w-3.5" /> Edit
                    </Button>
                  </Link>
                  <Link href={`/profile/${p.id}/view`}>
                    <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" /> View Premium
                    </Button>
                  </Link>
                  {p.status !== "approved" && (
                    <Button
                      size="sm"
                      disabled={actioning === p.id}
                      onClick={() => handleApprove(p.id)}
                      className="bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      {actioning === p.id ? "…" : "Approve"}
                    </Button>
                  )}
                  {p.status !== "rejected" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actioning === p.id}
                      onClick={() => handleReject(p.id)}
                      className="border-destructive/30 text-destructive hover:bg-destructive/10 flex items-center gap-1.5"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      {actioning === p.id ? "…" : "Reject"}
                    </Button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </AdminLayout>
  )
}
