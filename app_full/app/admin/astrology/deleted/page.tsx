"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { AdminLayout } from "@/app/admin/admin-layout"
import { adminListCharts, deleteChart, type ChartSummary } from "@/lib/astrology-api"
import { History, ChevronRight, CalendarDays, MapPin, Search, Trash2, AlertTriangle, X } from "lucide-react"

// ── Dedicated list for explicitly Deleted items ──────────────────────────────

export default function AdminAstrologyHistoryPage() {
  const [charts, setCharts] = useState<ChartSummary[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  


  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const fetchCharts = useCallback(() => {
    setIsLoading(true)
    adminListCharts(1, 100, debouncedSearch, true).then((data) => {
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



  // DOB safe display (avoid UTC offset: DOB is YYYY-MM-DD, parse manually)
  const formatDob = (dob: string) => {
    const [y, m, d] = dob.split("-")
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    return `${d} ${months[parseInt(m,10)-1]} ${y}`
  }

  return (
    <>
      <AdminLayout activeHref="/admin/astrology/deleted" title="Astrology Deleted Charts — நீக்கப்பட்ட ஜாதகங்கள்">
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
                        <p className="font-medium text-foreground">{chart.name}
                          <span className="ml-2 rounded-md bg-red-100/10 px-1.5 py-0.5 text-[10px] uppercase text-red-500 font-medium tracking-wide">
                            DELETED
                          </span>
                        </p>
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
