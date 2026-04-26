"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { AdminLayout } from "@/app/admin/admin-layout"
import { adminListCharts, deleteChart, type ChartSummary } from "@/lib/astrology-api"
import { History, ChevronRight, CalendarDays, MapPin, Search, Trash2, AlertTriangle, X } from "lucide-react"

// ── Delete confirmation dialog ────────────────────────────────────────────────
function DeleteDialog({
  chart,
  isDeleting,
  onConfirm,
  onCancel,
}: {
  chart: ChartSummary
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-secondary transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Warning icon */}
        <div className="flex flex-col items-center px-6 pt-8 pb-4 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="font-serif text-xl font-semibold text-foreground">Delete Chart As Admin?</h2>
          <p className="mt-1 font-tamil text-sm text-muted-foreground">இந்த ஜாதகத்தை நீக்கவா?</p>
        </div>

        {/* Chart info */}
        <div className="mx-6 mb-5 rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm">
          <p className="font-semibold text-foreground">{chart.name} <span className="text-muted-foreground font-normal">({chart.user_email || "System"})</span></p>
          <p className="font-tamil text-xs text-muted-foreground mt-0.5">
            ராசி: {chart.moon_rasi_tamil} · {chart.natchathiram_tamil} · லக்னம்: {chart.lagnam_tamil}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{chart.place_name} · {chart.time_of_birth}</p>
        </div>

        <p className="px-6 pb-5 text-center text-sm text-muted-foreground">
          This chart will be <strong>soft-deleted</strong> from the system and hidden from the user.
        </p>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 rounded-xl border border-border bg-background py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <><span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Deleting...</>
            ) : (
              <><Trash2 className="h-3.5 w-3.5" /> Delete Chart</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminAstrologyHistoryPage() {
  const [charts, setCharts] = useState<ChartSummary[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  
  // Delete state
  const [pendingDelete, setPendingDelete] = useState<ChartSummary | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const fetchCharts = useCallback(() => {
    setIsLoading(true)
    adminListCharts(1, 100, debouncedSearch).then((data) => {
      if (data) {
        setCharts(data.charts)
        setTotal(data.total)
      }
      setIsLoading(false)
    })
  }, [debouncedSearch])

  useEffect(() => {
    fetchCharts()
  }, [fetchCharts])

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return
    setIsDeleting(true)
    setDeleteError(null)
    const result = await deleteChart(pendingDelete.id)
    setIsDeleting(false)
    if (result.ok) {
      setCharts((prev) => prev.filter((c) => c.id !== pendingDelete.id))
      setTotal((t) => t - 1)
      setPendingDelete(null)
    } else {
      setDeleteError(result.error || "Failed to delete chart")
    }
  }

  // DOB safe display (avoid UTC offset: DOB is YYYY-MM-DD, parse manually)
  const formatDob = (dob: string) => {
    const [y, m, d] = dob.split("-")
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    return `${d} ${months[parseInt(m,10)-1]} ${y}`
  }

  return (
    <>
      {/* Delete confirmation dialog */}
      {pendingDelete && (
        <DeleteDialog
          chart={pendingDelete}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => { setPendingDelete(null); setDeleteError(null) }}
        />
      )}

      <AdminLayout activeHref="/admin/astrology" title="Astrology Chart History — ஜாதக வரலாறு">
        {/* Search + stats bar */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <p className="text-sm text-muted-foreground">
            {total} chart{total !== 1 ? "s" : ""} across all users
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-64 rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Delete error */}
        {deleteError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-300">
            {deleteError}
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-10 text-center text-muted-foreground text-sm">Loading...</div>
          ) : charts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <History className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="font-serif text-lg font-medium text-foreground">No charts found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {search ? "Try a different search." : "No charts have been created yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="px-4 py-3 text-left font-medium text-foreground">Name / பெயர்</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">DOB / Place</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Rasi / Natchathiram</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">User</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Created</th>
                    <th className="px-4 py-3 text-left font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {charts.map((chart) => (
                    <tr key={chart.id} className="group border-b border-border/50 hover:bg-secondary/20 transition">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{chart.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{chart.gender}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-foreground flex items-center gap-1">
                          <CalendarDays className="h-3 w-3 text-muted-foreground" />
                          {formatDob(chart.dob)}
                          {" · "}{chart.time_of_birth}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />{chart.place_name}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-tamil text-[10px] font-semibold text-primary w-fit">
                            {chart.moon_rasi_tamil}
                          </span>
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 font-tamil text-[10px] font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 w-fit">
                            {chart.natchathiram_tamil} ({chart.pada})
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{chart.user_email || "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(chart.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/admin/astrology/${chart.id}`}
                            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                          >
                            View <ChevronRight className="h-3 w-3" />
                          </Link>
                          
                          <button
                            onClick={() => {
                              setDeleteError(null)
                              setPendingDelete(chart)
                            }}
                            className="p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 rounded-md transition dark:hover:bg-red-900/20"
                            title="Delete chart"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
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
    </>
  )
}
