"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { listPoruthamHistory, type MatchHistoryListResponse } from "@/lib/porutham-api"
import { ArrowLeft, Clock, Search, ChevronLeft, ChevronRight, Star } from "lucide-react"

export default function PoruthamHistoryPage() {
  const [data, setData] = useState<MatchHistoryListResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setIsLoading(true)
    listPoruthamHistory(page, 20).then((res) => {
      setData(res)
      setIsLoading(false)
    })
  }, [page])

  const formatDate = (ds: string) => new Date(ds).toLocaleDateString("en-IN", { 
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" 
  })

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-background">
        <div className="border-b border-border/60 bg-gradient-to-br from-primary/5 via-background to-amber-50/30 px-6 py-10">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link href="/porutham" className="hover:text-primary flex items-center gap-1 transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Calculator
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium">History</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-serif text-3xl font-bold text-foreground">Saved Matches</h1>
                <p className="text-muted-foreground mt-1">View your previously calculated Porutham comparisons.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-6 py-10">
          {isLoading ? (
            <div className="flex justify-center py-20 text-muted-foreground animate-pulse">Loading history...</div>
          ) : !data || data.matches.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center text-muted-foreground">
              <Star className="mx-auto h-8 w-8 opacity-20 mb-3" />
              <p>You haven't saved any Porutham matches yet.</p>
              <Link href="/porutham" className="mt-4 inline-block text-primary font-medium hover:underline">
                Calculate your first match →
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground uppercase text-[11px] font-semibold tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Groom & Bride</th>
                        <th className="px-6 py-4">DOBs</th>
                        <th className="px-6 py-4">Score</th>
                        <th className="px-6 py-4">Date Saved</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.matches.map((match) => (
                        <tr key={match.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-foreground">{match.boy_name}</div>
                            <div className="text-xs text-muted-foreground">& {match.girl_name}</div>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground text-xs font-mono">
                            <div>{new Date(match.boy_dob).toLocaleDateString("en-IN")}</div>
                            <div>{new Date(match.girl_dob).toLocaleDateString("en-IN")}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold ${
                                match.total_score >= 7 ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                                match.total_score >= 5 ? "bg-amber-100 text-amber-700 border border-amber-200" :
                                "bg-red-100 text-red-700 border border-red-200"
                              }`}>
                                {match.matched_count}/10
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap">
                            {formatDate(match.created_at)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link 
                              href={`/porutham/history/${match.id}`}
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
              </div>
              
              {/* Pagination */}
              {Math.ceil(data.total / data.limit) > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {(page - 1) * data.limit + 1} - {Math.min(page * data.limit, data.total)} of {data.total}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="rounded-lg border border-border p-2 text-foreground disabled:opacity-50 hover:bg-muted"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setPage(p => p + 1)}
                      disabled={page >= Math.ceil(data.total / data.limit)}
                      className="rounded-lg border border-border p-2 text-foreground disabled:opacity-50 hover:bg-muted"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
