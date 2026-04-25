"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AdminLayout } from "@/app/admin/admin-layout"
import { adminListPoruthamHistory, type MatchHistoryListResponse } from "@/lib/porutham-api"
import { Search, ChevronLeft, ChevronRight, Clock } from "lucide-react"

export default function AdminPoruthamHistoryPage() {
  const [data, setData] = useState<MatchHistoryListResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")

  function loadData(p: number, s: string) {
    setIsLoading(true)
    adminListPoruthamHistory(p, 50, s).then((res) => {
      setData(res)
      setIsLoading(false)
    })
  }

  useEffect(() => {
    loadData(page, searchTerm)
  }, [page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadData(1, searchTerm)
  }

  const formatDate = (ds: string) => new Date(ds).toLocaleDateString("en-IN", { 
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" 
  })

  return (
    <AdminLayout activeHref="/admin/porutham/history" title="Porutham History (Admin)">
      <div className="flex flex-col gap-6">
        
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground">Global Match History</h2>
              <p className="text-sm text-muted-foreground mt-1">All Porutham comparisons saved by users.</p>
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="flex max-w-sm w-full gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search boy, girl or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
              Search
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="py-20 text-center text-muted-foreground animate-pulse">Loading history...</div>
          ) : !data || data.matches.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">No porutham matches found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-[11px] font-semibold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">ID / User</th>
                    <th className="px-6 py-4">Groom & Bride</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4">Date Saved</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.matches.map((match) => (
                    <tr key={match.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs text-muted-foreground mb-1">{match.id.split('-')[0]}...</div>
                        <div className="font-medium text-foreground">{match.user_email || "Anonymous/Guest"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{match.boy_name} <span className="text-muted-foreground font-normal mx-1">&</span> {match.girl_name}</div>
                        <div className="text-xs text-muted-foreground flex gap-3 mt-1">
                          <span>B: {new Date(match.boy_dob).toLocaleDateString("en-IN")}</span>
                          <span>G: {new Date(match.girl_dob).toLocaleDateString("en-IN")}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold ${
                                match.total_score >= 7 ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                                match.total_score >= 5 ? "bg-amber-100 text-amber-700 border border-amber-200" :
                                "bg-red-100 text-red-700 border border-red-200"
                              }`}>
                          {match.matched_count}/10
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(match.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/admin/porutham/${match.id}`}
                          className="font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                          View Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {data && Math.ceil(data.total / data.limit) > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(page - 1) * data.limit + 1} - {Math.min(page * data.limit, data.total)} of {data.total}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-border p-2 text-foreground disabled:opacity-50 hover:bg-muted transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(data.total / data.limit)}
                className="rounded-lg border border-border p-2 text-foreground disabled:opacity-50 hover:bg-muted transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
