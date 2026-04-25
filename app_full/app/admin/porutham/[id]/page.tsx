"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { AdminLayout } from "@/app/admin/admin-layout"
import { getPoruthamMatch, type MatchDetail } from "@/lib/porutham-api"
import { ArrowLeft, Printer } from "lucide-react"
import { PoruthamA4Report } from "@/components/porutham/porutham-print-view"

export default function AdminPoruthamHistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [match, setMatch] = useState<MatchDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPrintMode, setIsPrintMode] = useState(false)

  useEffect(() => {
    getPoruthamMatch(id).then((data) => {
      if (data) setMatch(data)
      else setError("Match history not found.")
      setIsLoading(false)
    })
  }, [id])

  useEffect(() => {
    if (isPrintMode) {
      window.print()
      setTimeout(() => setIsPrintMode(false), 500)
    }
  }, [isPrintMode])

  if (isLoading) return (
    <AdminLayout activeHref="/admin/porutham/history" title="Porutham Report">
      <div className="flex justify-center p-20 animate-pulse text-muted-foreground">Loading details...</div>
    </AdminLayout>
  )
  
  if (error || !match) return (
    <AdminLayout activeHref="/admin/porutham/history" title="Porutham Report">
      <div className="flex flex-col items-center justify-center p-20 text-center gap-4">
        <p className="text-red-500 font-medium">{error || "Something went wrong."}</p>
        <Link href="/admin/porutham/history" className="text-primary hover:underline">← Back to History</Link>
      </div>
    </AdminLayout>
  )

  const score = match.result_json.matchedCount || 0
  const pct = score / 10
  const verdict = pct >= 0.7 ? "நல்ல பொருத்தம் (Excellent Match)" : pct >= 0.5 ? "சாதாரண பொருத்தம் (Good Match)" : pct >= 0.4 ? "சற்று பொருத்தம் (Average Match)" : "குறைந்த பொருத்தம் (Low Compatibility)"
  const barColor = pct >= 0.7 ? "#16a34a" : pct >= 0.5 ? "#d97706" : "#dc2626"
  const createdDate = new Date(match.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })

  return (
    <>
      {!isPrintMode && (
        <div className="no-print">
          <AdminLayout activeHref="/admin/porutham/history" title="Porutham History Detail">
            <div className="flex flex-col gap-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Link href="/admin/porutham/history" className="rounded-full p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition">
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-foreground">Matched Details</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {match.boy_name} & {match.girl_name}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsPrintMode(true)}
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90 shadow transition-transform active:scale-95">
                  <Printer className="h-4 w-4" /> Print A4 Report
                </button>
              </div>

              {/* Preview Container */}
              <div className="flex items-center justify-center bg-gray-100 rounded-2xl p-6 overflow-x-auto shadow-inner border border-border">
                <div className="relative shadow-2xl rounded-xl overflow-hidden bg-white shrink-0 self-start">
                    <PoruthamA4Report match={match} score={score} verdict={verdict} barColor={barColor} dateStr={createdDate} fmtDate={fmtDate} />
                </div>
              </div>

            </div>
          </AdminLayout>
        </div>
      )}

      {/* ── Print UI (Always present, revealed via @media print) ── */}
      <style>{`
        @page { size: A4; margin: 10mm; }
        @media print {
          body > * { display: none !important; }
          #print-root { display: block !important; position: static !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        #print-root { display: none; }
      `}</style>
      
      <div id="print-root">
         <PoruthamA4Report match={match} score={score} verdict={verdict} barColor={barColor} dateStr={createdDate} fmtDate={fmtDate} />
      </div>
    </>
  )
}
