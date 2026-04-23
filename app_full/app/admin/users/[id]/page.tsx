"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Mail, Shield, CreditCard, Clock, CheckCircle2,
  XCircle, Save, Eye, Trash2, User, Calendar,
} from "lucide-react"
import { AdminLayout } from "../../admin-layout"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"

// ── Types ─────────────────────────────────────────────────────────────────────

type ProfileSummary = {
  id: string
  full_name: string
  gender: "male" | "female"
  status: "pending" | "approved" | "rejected"
  created_at: string
  city: string | null
  state: string | null
  completeness_score: number | null
}

type UserDetail = {
  id: string
  email: string
  role: string
  is_active: boolean
  is_email_verified: boolean
  created_at: string
  last_active_at: string | null
  last_login_at: string | null
  tier: string | null
  sub_start: string | null
  sub_end: string | null
  profiles: ProfileSummary[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null) {
  if (!iso) return "Never"
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-foreground break-all">{value}</p>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminUserEditPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Editable fields
  const [role, setRole] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [tier, setTier] = useState("")

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    apiFetch<UserDetail>(`/api/admin/users/${userId}`)
      .then(data => {
        setUser(data)
        setRole(data.role)
        setIsActive(data.is_active)
        setTier(data.tier ?? "basic")
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [userId])

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      await apiFetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify({ role, isActive }),
      })
      setUser(prev => prev ? { ...prev, role, is_active: isActive } : prev)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err: any) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await apiFetch(`/api/admin/users/${userId}`, { method: "DELETE" })
      router.push("/admin/users")
    } catch (err: any) {
      setSaveError(err.message)
      setDeleting(false)
      setShowDelete(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout activeHref="/admin/users" title="User Account">
        <div className="space-y-4 animate-pulse">
          <div className="h-20 rounded-2xl bg-muted" />
          <div className="h-64 rounded-2xl bg-muted" />
        </div>
      </AdminLayout>
    )
  }

  if (error || !user) {
    return (
      <AdminLayout activeHref="/admin/users" title="User Not Found">
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <p className="text-lg font-semibold text-foreground">User not found</p>
          <p className="text-sm text-muted-foreground">{error ?? `ID: ${userId}`}</p>
          <Button onClick={() => router.push("/admin/users")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Users
          </Button>
        </div>
      </AdminLayout>
    )
  }

  const initial = user.email[0]?.toUpperCase() ?? "?"

  return (
    <AdminLayout activeHref="/admin/users" title="User Account">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4 flex-wrap">
        <button
          onClick={() => router.push("/admin/users")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> All Users
        </button>

        <div className="flex items-center gap-3 ml-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
            {initial}
          </div>
          <div>
            <p className="font-semibold text-foreground leading-tight">{user.email}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role} · {user.tier ?? "Basic"} plan</p>
          </div>
        </div>

        {saved && (
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Saved
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — Read-only account info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="font-semibold text-foreground mb-1">Account Info</h3>
            <p className="text-xs text-muted-foreground mb-4">Read-only details from the database.</p>
            <InfoRow icon={Mail}     label="Email"          value={user.email} />
            <InfoRow icon={Shield}   label="Email Verified" value={user.is_email_verified ? "Verified" : "Not verified"} />
            <InfoRow icon={Calendar} label="Joined"         value={fmtDate(user.created_at)} />
            <InfoRow icon={Clock}    label="Last Login"     value={fmtDate(user.last_login_at)} />
            <InfoRow icon={Clock}    label="Last Active"    value={fmtDate(user.last_active_at)} />
            {user.tier && user.sub_end && (
              <InfoRow icon={CreditCard} label="Subscription Ends" value={fmtDate(user.sub_end)} />
            )}
          </div>
        </div>

        {/* Right — Editable fields + profiles list */}
        <div className="lg:col-span-2 space-y-6">

          {/* Editable account settings */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="font-semibold text-foreground mb-4">Account Settings</h3>

            {saveError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                {saveError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Role */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {["user", "groom", "bride", "admin"].map(r => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Account Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account Status</label>
                <select
                  value={isActive ? "active" : "inactive"}
                  onChange={e => setIsActive(e.target.value === "active")}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive (disabled)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
                {saving ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </div>

          {/* Matrimony profiles */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="font-semibold text-foreground mb-1">Matrimony Profiles</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Profiles registered under this account. Click View to see full details or Approve/Reject.
            </p>

            {user.profiles.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
                No matrimony profiles created yet.
              </div>
            ) : (
              <div className="space-y-3">
                {user.profiles.map(profile => {
                  const isGroom = profile.gender === "male"
                  return (
                    <div
                      key={profile.id}
                      className="flex items-center gap-4 rounded-xl border border-border bg-secondary/20 px-4 py-3"
                    >
                      {/* Avatar */}
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isGroom ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
                        {profile.full_name?.[0] ?? "?"}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">{profile.full_name}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className={`text-[10px] font-bold uppercase ${isGroom ? "text-blue-600" : "text-pink-600"}`}>
                            {isGroom ? "Groom" : "Bride"}
                          </span>
                          {profile.city && (
                            <span className="text-[10px] text-muted-foreground">
                              · {profile.city}{profile.state ? `, ${profile.state}` : ""}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            · {profile.completeness_score ?? 0}% complete
                          </span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="shrink-0">
                        {profile.status === "approved" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" /> Approved
                          </span>
                        )}
                        {profile.status === "pending" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">
                            <Clock className="h-3 w-3" /> Pending
                          </span>
                        )}
                        {profile.status === "rejected" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-semibold text-red-700">
                            <XCircle className="h-3 w-3" /> Rejected
                          </span>
                        )}
                      </div>

                      {/* View link */}
                      <Link
                        href={`/admin/profiles/${profile.id}`}
                        className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/15 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Danger zone */}
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <h3 className="font-semibold text-red-700 mb-1 flex items-center gap-2">
              <Trash2 className="h-4 w-4" /> Danger Zone
            </h3>
            <p className="text-xs text-red-600 mb-4">
              Permanently deletes the account and all associated profiles, photos, and messages.
            </p>
            {!showDelete ? (
              <button
                onClick={() => setShowDelete(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
              >
                <Trash2 className="h-4 w-4" /> Delete Account
              </button>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-sm font-semibold text-red-700">Are you sure? This cannot be undone.</p>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? "Deleting…" : "Yes, Delete"}
                </button>
                <button
                  onClick={() => setShowDelete(false)}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </AdminLayout>
  )
}
