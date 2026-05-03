"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { UserLayout } from "@/components/user-layout"
import { getPoruthamMatch, type MatchDetail } from "@/lib/porutham-api"
import { ArrowLeft, Printer, History } from "lucide-react"

import { NAKSHATRAS, RASIS, RASI_NAKSHATRAS, type PoruthItem } from "@/lib/porutham"
import { PoruthamA4Report } from "@/components/porutham/porutham-print-view"

// Helper functions for names
const rasiName = (id: string | number)  => RASIS.find(r => r.id === Number(id))
const nakName  = (id: string | number)  => NAKSHATRAS.find(n => n.id === Number(id))

export default function PoruthamHistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [match, setMatch] = useState<MatchDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPrintMode, setIsPrintMode] = useState(false)

  useEffect(() => {
    getPoruthamMatch(id).then((data) => {
      if (data) setMatch(data)
      else setError("Match history not found or you don't have access to it.")
      setIsLoading(false)
    })
  }, [id])

  useEffect(() => {
    if (isPrintMode) {
      window.print()
      setTimeout(() => setIsPrintMode(false), 500)
    }
  }, [isPrintMode])

  if (isLoading) return <div className="flex justify-center p-20 animate-pulse text-muted-foreground">Loading match details...</div>
  
  if (error || !match) return (
    <UserLayout>
      <div className="flex flex-col items-center justify-center p-20 text-center gap-4 flex-1">
        <p className="text-red-500 font-medium">{error || "Something went wrong."}</p>
        <Link href="/porutham/history" className="text-primary hover:underline">← Back to History</Link>
      </div>
    </UserLayout>
  )

  const resultItems = match.result_json.items || []
  const score = match.result_json.matchedCount || 0
  const pct = score / 10
  const verdict = pct >= 0.7 ? "நல்ல பொருத்தம் (Excellent Match)" : pct >= 0.5 ? "சாதாரண பொருத்தம் (Good Match)" : pct >= 0.4 ? "சற்று பொருத்தம் (Average Match)" : "குறைந்த பொருத்தம் (Low Compatibility)"
  const barColor = pct >= 0.7 ? "#16a34a" : pct >= 0.5 ? "#d97706" : "#dc2626"
  const createdDate = new Date(match.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })

  // Data maps
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })

  return (
    <>
      {/* ── Normal Screen UI ── */}
      {!isPrintMode && (
        <UserLayout>
          <div className="flex-1 flex flex-col no-print">
          <div className="border-b border-border/60 bg-muted/30 px-6 py-6">
            <div className="mx-auto max-w-4xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Link href="/porutham/history" className="hover:text-primary flex items-center gap-1 transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to History
                  </Link>
                </div>
                <h1 className="font-serif text-2xl font-bold text-foreground">Matched Details</h1>
              </div>
              <button onClick={() => setIsPrintMode(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-primary/90 transition-transform active:scale-95">
                <Printer className="h-4 w-4" /> Print Report
              </button>
            </div>
          </div>
          
          <div className="mx-auto max-w-4xl px-6 py-10 w-full overflow-hidden flex-1">
             <div className="flex items-center justify-center bg-gray-100 rounded-2xl p-6 overflow-x-auto shadow-inner border border-border">
                <div className="relative shadow-2xl rounded-xl overflow-hidden bg-white shrink-0 self-start">
                    <PoruthamA4Report match={match} score={score} verdict={verdict} barColor={barColor} dateStr={createdDate} fmtDate={fmtDate} />
                </div>
             </div>
          </div>
          </div>
        </UserLayout>
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
