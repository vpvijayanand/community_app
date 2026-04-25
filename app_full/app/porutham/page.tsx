"use client"

import { useState } from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { calcAllPorutham, NAKSHATRAS, RASIS, RASI_NAKSHATRAS, type PoruthItem } from "@/lib/porutham"
import { CheckCircle2, XCircle, ArrowLeft, Sparkles, Star, RotateCcw, Printer, X, History, Save } from "lucide-react"
import { savePoruthamMatch } from "@/lib/porutham-api"

// ── Types ─────────────────────────────────────────────────────────────────────

type PersonInput = {
  name: string; dob: string; time: string; place: string; rasi: string; nak: string
}
const empty = (): PersonInput => ({ name: "", dob: "", time: "", place: "", rasi: "", nak: "" })

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
}
function rasiName(id: string)  { return RASIS.find(r => r.id === Number(id)) }
function nakName(id: string)   { return NAKSHATRAS.find(n => n.id === Number(id)) }

// ── Form field ────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

const inputCls  = "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
const selectCls = inputCls + " cursor-pointer"

// ── Person form ───────────────────────────────────────────────────────────────

function PersonForm({ title, color, emoji, values, onChange }: {
  title: string; color: string; emoji: string
  values: PersonInput; onChange: (k: keyof PersonInput, v: string) => void
}) {
  const rasiId = Number(values.rasi)
  const filteredNaks = rasiId ? NAKSHATRAS.filter(n => RASI_NAKSHATRAS[rasiId]?.includes(n.id)) : []

  function handleRasiChange(v: string) { onChange("rasi", v); onChange("nak", "") }

  return (
    <div className={`rounded-2xl border-2 ${color} bg-card p-5 flex flex-col gap-4`}>
      <div className="flex items-center gap-2">
        <span className="text-2xl">{emoji}</span>
        <h3 className="font-serif text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name">
          <input className={inputCls} placeholder="Enter name" value={values.name}
            onChange={e => onChange("name", e.target.value)} />
        </Field>
        <Field label="Date of Birth">
          <input type="date" className={inputCls} value={values.dob}
            onChange={e => onChange("dob", e.target.value)} />
        </Field>
        <Field label="Time of Birth">
          <input type="time" className={inputCls} value={values.time}
            onChange={e => onChange("time", e.target.value)} />
        </Field>
        <Field label="Place of Birth">
          <input className={inputCls} placeholder="Enter city/town" value={values.place}
            onChange={e => onChange("place", e.target.value)} />
        </Field>
        <Field label="Rasi (ராசி)">
          <select className={selectCls} value={values.rasi} onChange={e => handleRasiChange(e.target.value)}>
            <option value="">Select Rasi</option>
            {RASIS.map(r => <option key={r.id} value={String(r.id)}>{r.en} — {r.ta}</option>)}
          </select>
        </Field>
        <Field label="Natchatram (நட்சத்திரம்)">
          <select className={selectCls + (!rasiId ? " opacity-50 cursor-not-allowed" : "")}
            value={values.nak} disabled={!rasiId} onChange={e => onChange("nak", e.target.value)}>
            <option value="">{rasiId ? "Select Natchatram" : "Select Rasi first"}</option>
            {filteredNaks.map(n => <option key={n.id} value={String(n.id)}>{n.en} — {n.ta}</option>)}
          </select>
        </Field>
      </div>
    </div>
  )
}

// ── Score ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score, total }: { score: number; total: number }) {
  const pct   = score / total
  const color = pct >= 0.7 ? "text-emerald-600" : pct >= 0.5 ? "text-amber-500" : "text-red-500"
  const bg    = pct >= 0.7 ? "bg-emerald-50 border-emerald-200" : pct >= 0.5 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"
  const label = pct >= 0.7 ? "Excellent Match" : pct >= 0.5 ? "Good Match" : pct >= 0.4 ? "Average Match" : "Low Compatibility"
  const dotColor = pct >= 0.7 ? "bg-emerald-500" : pct >= 0.5 ? "bg-amber-500" : "bg-red-400"
  return (
    <div className={`flex flex-col items-center justify-center rounded-3xl border-2 ${bg} p-8 gap-2`}>
      <div className={`font-serif text-6xl font-bold ${color}`}>{score}<span className="text-2xl text-muted-foreground">/{total}</span></div>
      <div className="flex gap-1 mt-1">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`h-2.5 w-2.5 rounded-full ${i < score ? dotColor : "bg-muted"}`} />
        ))}
      </div>
      <p className={`text-sm font-bold mt-1 ${color}`}>{label}</p>
      <p className="text-xs text-muted-foreground text-center mt-1">
        {score >= 8 ? "Very auspicious — highly recommended." :
         score >= 6 ? "Good match — generally compatible." :
         score >= 4 ? "Moderate match — may need consideration." : "Low match — consult an astrologer."}
      </p>
    </div>
  )
}

// ── Porutham row (interactive) ────────────────────────────────────────────────

function PoruthCard({ item, idx }: { item: PoruthItem; idx: number }) {
  const [open, setOpen] = useState(false)
  return (
    <button onClick={() => setOpen(o => !o)}
      className={`w-full text-left rounded-2xl border-2 p-4 transition-all hover:shadow-md ${item.match ? "border-emerald-200 bg-emerald-50/60 hover:border-emerald-300" : "border-red-200 bg-red-50/60 hover:border-red-300"}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 shrink-0 rounded-full p-1 ${item.match ? "bg-emerald-100" : "bg-red-100"}`}>
          {item.match ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-red-500" />}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-muted-foreground">#{idx}</span>
            <span className="font-semibold text-foreground text-sm">{item.name}</span>
            <span className="font-tamil text-xs text-muted-foreground">{item.tamil}</span>
            <span className={`ml-auto shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${item.match ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
              {item.match ? "Match ✓" : "No Match ✗"}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
          {open && <p className="mt-2 rounded-xl bg-white/70 px-3 py-2 text-xs text-foreground border border-border/60">{item.detail}</p>}
        </div>
      </div>
    </button>
  )
}

// ── PRINT REPORT ──────────────────────────────────────────────────────────────

function PrintReport({ boy, girl, result, score, onClose }: {
  boy: PersonInput; girl: PersonInput
  result: PoruthItem[]; score: number; onClose: () => void
}) {
  const pct      = score / 10
  const verdict  = pct >= 0.7 ? "நல்ல பொருத்தம் (Excellent Match)" : pct >= 0.5 ? "சாதாரண பொருத்தம் (Good Match)" : pct >= 0.4 ? "சற்று பொருத்தம் (Average Match)" : "குறைந்த பொருத்தம் (Low Compatibility)"
  const barColor = pct >= 0.7 ? "#16a34a" : pct >= 0.5 ? "#d97706" : "#dc2626"
  const today    = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })

  const boyRasi = rasiName(boy.rasi)
  const girlRasi = rasiName(girl.rasi)
  const boyNak  = nakName(boy.nak)
  const girlNak = nakName(girl.nak)

  return (
    <>
      {/* ── Print CSS ── */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #porutham-print-root { display: block !important; position: static !important; }
          #porutham-print-root .no-print { display: none !important; }
          @page { size: A4 portrait; margin: 10mm 12mm; }
          html { font-size: 9pt; }
          * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
        #porutham-print-root { display: none; }
      `}</style>

      {/* ── Screen overlay ── */}
      <div className="fixed inset-0 z-[300] flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-6 px-4 no-print">
        <div className="relative w-full max-w-[210mm] bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Toolbar */}
          <div className="no-print flex items-center justify-between bg-gray-900 px-5 py-3">
            <span className="text-white text-sm font-semibold">Porutham Report Preview</span>
            <div className="flex gap-2">
              <button onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-white hover:bg-primary/90 transition">
                <Printer className="h-3.5 w-3.5" /> Print / Save PDF
              </button>
              <button onClick={onClose}
                className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition">
                <X className="h-3.5 w-3.5" /> Close
              </button>
            </div>
          </div>

          {/* A4 Content */}
          <div className="bg-white p-[12mm] font-sans text-[9pt] leading-snug text-gray-900">
            <ReportBody boy={boy} girl={girl} result={result} score={score} verdict={verdict}
              barColor={barColor} today={today} boyRasi={boyRasi} girlRasi={girlRasi}
              boyNak={boyNak} girlNak={girlNak} />
          </div>
        </div>
      </div>

      {/* ── Print-only version (hidden on screen, shown by @media print) ── */}
      <div id="porutham-print-root">
        <div style={{ background: "#fff", padding: "0", fontFamily: "sans-serif", fontSize: "9pt", lineHeight: 1.35, color: "#111" }}>
          <ReportBody boy={boy} girl={girl} result={result} score={score} verdict={verdict}
            barColor={barColor} today={today} boyRasi={boyRasi} girlRasi={girlRasi}
            boyNak={boyNak} girlNak={girlNak} />
        </div>
      </div>
    </>
  )
}

// ── Shared report body (used in both preview and print) ───────────────────────

function ReportBody({ boy, girl, result, score, verdict, barColor, today, boyRasi, girlRasi, boyNak, girlNak }: {
  boy: PersonInput; girl: PersonInput; result: PoruthItem[]; score: number
  verdict: string; barColor: string; today: string
  boyRasi: ReturnType<typeof rasiName>; girlRasi: ReturnType<typeof rasiName>
  boyNak:  ReturnType<typeof nakName>;  girlNak:  ReturnType<typeof nakName>
}) {
  const matched   = result.filter(p => p.match).length
  const unmatched = result.filter(p => !p.match).length

  return (
    <div style={{ border: "2.5px solid #D4AF37", borderRadius: 10, padding: "14px 16px", position: "relative", minHeight: 260 }}>

      {/* Corner decorations */}
      {[["top:0;left:0", "0 0 14px 0"], ["top:0;right:0", "0 0 0 14px"], ["bottom:0;left:0", "0 14px 0 0"], ["bottom:0;right:0", "14px 0 0 0"]].map(([pos, radius], i) => (
        <div key={i} style={{ position: "absolute", [pos.split(";")[0].split(":")[0]]: pos.split(";")[0].split(":")[1], [pos.split(";")[1].split(":")[0]]: pos.split(";")[1].split(":")[1], width: 18, height: 18, border: "2px solid #D4AF37", borderRadius: radius, pointerEvents: "none" } as React.CSSProperties} />
      ))}

      {/* Header */}
      <div style={{ textAlign: "center", borderBottom: "1px solid #D4AF37", paddingBottom: 8, marginBottom: 10 }}>
        <div style={{ fontFamily: "serif", fontSize: "8pt", color: "#8B7536", letterSpacing: 2, marginBottom: 2 }}>|| ஸ்ரீ கணேசாய நமஹ ||</div>
        <div style={{ fontFamily: "serif", fontSize: "15pt", fontWeight: 800, color: "#1a1a1a", letterSpacing: 1 }}>MARATHA</div>
        <div style={{ fontSize: "10pt", fontWeight: 700, color: "#8B7536", marginTop: 1 }}>திருமண பொருத்தம் அறிக்கை</div>
        <div style={{ fontSize: "7.5pt", color: "#555", marginTop: 1 }}>Marriage Compatibility Report</div>
      </div>

      {/* Person details — 2 columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        {[
          { label: "மணமகன் — GROOM", data: boy, rasi: boyRasi, nak: boyNak, bg: "#eff6ff", border: "#bfdbfe" },
          { label: "மணமகள் — BRIDE", data: girl, rasi: girlRasi, nak: girlNak, bg: "#fdf2f8", border: "#f9a8d4" },
        ].map(({ label, data, rasi, nak, bg, border }) => (
          <div key={label} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontWeight: 800, fontSize: "8.5pt", color: "#374151", borderBottom: `1px solid ${border}`, paddingBottom: 4, marginBottom: 6, letterSpacing: 0.5 }}>{label}</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8pt" }}>
              <tbody>
                {[
                  ["Name", data.name || "—"],
                  ["Date of Birth", fmtDate(data.dob)],
                  ["Time of Birth", data.time || "—"],
                  ["Place of Birth", data.place || "—"],
                  ["Rasi", rasi ? `${rasi.en} (${rasi.ta})` : "—"],
                  ["Natchatram", nak ? `${nak.en} (${nak.ta})` : "—"],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ color: "#6b7280", paddingRight: 6, paddingBottom: 2, whiteSpace: "nowrap", width: "38%" }}>{k}</td>
                    <td style={{ fontWeight: 600, color: "#111", paddingBottom: 2 }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Score banner */}
      <div style={{ background: "linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)", border: "1.5px solid #D4AF37", borderRadius: 8, padding: "10px 14px", marginBottom: 10, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ textAlign: "center", minWidth: 72 }}>
          <div style={{ fontFamily: "serif", fontSize: "26pt", fontWeight: 900, color: barColor, lineHeight: 1 }}>{score}<span style={{ fontSize: "12pt", color: "#6b7280" }}>/10</span></div>
          <div style={{ fontSize: "7pt", color: "#6b7280", marginTop: 2 }}>Overall Score</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: "10pt", color: "#1a1a1a", marginBottom: 4 }}>{verdict}</div>
          {/* Progress bar */}
          <div style={{ height: 8, background: "#e5e7eb", borderRadius: 99, overflow: "hidden", marginBottom: 5 }}>
            <div style={{ height: "100%", width: `${score * 10}%`, background: barColor, borderRadius: 99 }} />
          </div>
          {/* Dot strip */}
          <div style={{ display: "flex", gap: 4 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i < score ? barColor : "#d1d5db" }} />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 80 }}>
          <div style={{ background: "#dcfce7", border: "1px solid #86efac", borderRadius: 6, padding: "4px 8px", textAlign: "center" }}>
            <div style={{ fontWeight: 800, fontSize: "13pt", color: "#16a34a" }}>{matched}</div>
            <div style={{ fontSize: "6.5pt", color: "#166534" }}>Matched</div>
          </div>
          <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 6, padding: "4px 8px", textAlign: "center" }}>
            <div style={{ fontWeight: 800, fontSize: "13pt", color: "#dc2626" }}>{unmatched}</div>
            <div style={{ fontSize: "6.5pt", color: "#991b1b" }}>Not Matched</div>
          </div>
        </div>
      </div>

      {/* Porutham table */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8pt", marginBottom: 8 }}>
        <thead>
          <tr style={{ background: "#D4AF37" }}>
            <th style={{ padding: "5px 6px", textAlign: "center", color: "#fff", fontWeight: 700, width: 24 }}>#</th>
            <th style={{ padding: "5px 6px", textAlign: "left",  color: "#fff", fontWeight: 700 }}>Porutham Name</th>
            <th style={{ padding: "5px 6px", textAlign: "left",  color: "#fff", fontWeight: 700 }}>Tamil Name</th>
            <th style={{ padding: "5px 6px", textAlign: "left",  color: "#fff", fontWeight: 700 }}>Significance</th>
            <th style={{ padding: "5px 8px", textAlign: "center",color: "#fff", fontWeight: 700, width: 72 }}>Result</th>
            <th style={{ padding: "5px 6px", textAlign: "left",  color: "#fff", fontWeight: 700 }}>Detail</th>
          </tr>
        </thead>
        <tbody>
          {result.map((item, i) => (
            <tr key={item.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #e5e7eb" }}>
              <td style={{ padding: "4px 6px", textAlign: "center", color: "#6b7280", fontWeight: 600 }}>{i + 1}</td>
              <td style={{ padding: "4px 6px", fontWeight: 700, color: "#111", whiteSpace: "nowrap" }}>{item.name.replace(" Porutham", "")}</td>
              <td style={{ padding: "4px 6px", color: "#8B7536", whiteSpace: "nowrap" }}>{item.tamil}</td>
              <td style={{ padding: "4px 6px", color: "#4b5563" }}>{item.description}</td>
              <td style={{ padding: "4px 8px", textAlign: "center" }}>
                <span style={{
                  display: "inline-block", padding: "2px 8px", borderRadius: 99,
                  fontWeight: 700, fontSize: "7.5pt", whiteSpace: "nowrap",
                  background: item.match ? "#dcfce7" : "#fee2e2",
                  color:      item.match ? "#166534" : "#991b1b",
                  border:     `1px solid ${item.match ? "#86efac" : "#fca5a5"}`,
                }}>
                  {item.match ? "✓ Match" : "✗ No Match"}
                </span>
              </td>
              <td style={{ padding: "4px 6px", color: "#6b7280", fontSize: "7.5pt" }}>{item.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #D4AF37", paddingTop: 6, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "7pt", color: "#6b7280" }}>
        <span>Generated by <strong style={{ color: "#D4AF37" }}>Maratha</strong> — Tamil Matrimony Platform</span>
        <span>Report Date: {today}</span>
        <span>For important decisions, consult a qualified Jyotish astrologer.</span>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PoruthPage() {
  const [boy,        setBoy]        = useState<PersonInput>(empty())
  const [girl,       setGirl]       = useState<PersonInput>(empty())
  const [result,     setResult]     = useState<PoruthItem[] | null>(null)
  const [error,      setError]      = useState<string | null>(null)
  const [showReport, setShowReport] = useState(false)
  const [savedId,    setSavedId]    = useState<string | null>(null)
  const [isSaving,   setIsSaving]   = useState(false)

  function update(who: "boy" | "girl", k: keyof PersonInput, v: string) {
    if (who === "boy") setBoy(p => ({ ...p, [k]: v }))
    else               setGirl(p => ({ ...p, [k]: v }))
    setResult(null); setShowReport(false); setSavedId(null);
  }

  async function calculate() {
    if (!boy.nak || !boy.rasi || !girl.nak || !girl.rasi) {
      setError("Please select Rasi and Natchatram for both boy and girl.")
      return
    }
    setError(null)
    const matchingResult = calcAllPorutham(Number(girl.nak), Number(girl.rasi), Number(boy.nak), Number(boy.rasi))
    setResult(matchingResult)
    
    // Attempt auto-save in background
    setIsSaving(true)
    try {
      const saved = await savePoruthamMatch({
        boyName: boy.name || "Groom", boyDob: boy.dob || new Date().toISOString().split('T')[0], boyTime: boy.time || "00:00", boyPlace: boy.place || "Not given",
        girlName: girl.name || "Bride", girlDob: girl.dob || new Date().toISOString().split('T')[0], girlTime: girl.time || "00:00", girlPlace: girl.place || "Not given",
        resultJson: {
          items: matchingResult,
          matchedCount: matchingResult.filter(p => !!p.match).length,
          totalScore: 10
        } as any
      })
      if (saved?.id) setSavedId(saved.id)
    } catch (err) {
      console.error("Auto-save failed", err)
    } finally {
      setIsSaving(false)
    }
  }

  function reset() { setBoy(empty()); setGirl(empty()); setResult(null); setError(null); setShowReport(false); setSavedId(null); }

  const score = result ? result.filter(p => p.match).length : 0

  return (
    <>
      <SiteHeader />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <div className="border-b border-border/60 bg-gradient-to-br from-primary/5 via-background to-amber-50/30 px-6 py-10">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link href="/dashboard" className="hover:text-primary flex items-center gap-1 transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium">Porutham Calculator</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-4xl">🔯</span>
              <div>
                <h1 className="font-serif text-3xl font-bold text-foreground">Porutham Calculator</h1>
                <p className="font-tamil text-lg text-primary mt-1">பொருத்தம் கணிப்பு</p>
                <p className="text-muted-foreground text-sm mt-2 max-w-xl">
                  Traditional Tamil 10-fold matrimony compatibility check. Enter the Rasi and Natchatram of both bride and groom to get an instant compatibility report.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-6 py-10 space-y-8">

          {/* Input forms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <PersonForm title="Groom / மணமகன்" color="border-blue-200"  emoji="👨" values={boy}  onChange={(k, v) => update("boy",  k, v)} />
            <PersonForm title="Bride / மணமகள்"  color="border-pink-200" emoji="👩" values={girl} onChange={(k, v) => update("girl", k, v)} />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 flex-wrap">
            <button onClick={calculate}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow hover:bg-primary/90 transition-all active:scale-95">
              <Sparkles className="h-4 w-4" /> Calculate Porutham
            </button>
            {result && (
              <>
                <button onClick={() => setShowReport(true)}
                  className="flex items-center gap-2 rounded-xl border-2 border-amber-400 bg-amber-50 px-5 py-3 text-sm font-bold text-amber-700 hover:bg-amber-100 transition-colors">
                  <Printer className="h-4 w-4" /> View & Print Report
                </button>
                <button onClick={reset}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
                  <RotateCcw className="h-4 w-4" /> Reset
                </button>
              </>
            )}
          </div>

          {/* Save Status Banner */}
          {savedId && (
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>Result securely saved to your history!</span>
              </div>
              <Link href={`/porutham/history/${savedId}`} className="flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-900 transition underline underline-offset-4">
                View in History
              </Link>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Summary card */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5 text-primary fill-primary" />
                  <h2 className="font-serif text-xl font-semibold text-foreground">Compatibility Report</h2>
                  {boy.name && girl.name && (
                    <span className="ml-auto text-sm text-muted-foreground">{boy.name} <span className="text-primary">&</span> {girl.name}</span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 items-start">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center">
                      <p className="text-2xl font-bold text-emerald-600">{score}</p>
                      <p className="text-[11px] text-emerald-700 font-medium">Matched</p>
                    </div>
                    <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-center">
                      <p className="text-2xl font-bold text-red-500">{10 - score}</p>
                      <p className="text-[11px] text-red-600 font-medium">Not Matched</p>
                    </div>
                    <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 text-center col-span-2">
                      <p className="text-2xl font-bold text-primary">{Math.round(score * 10)}%</p>
                      <p className="text-[11px] text-primary/80 font-medium">Compatibility</p>
                    </div>
                  </div>
                  <ScoreRing score={score} total={10} />
                </div>
              </div>

              {/* Individual poruthams */}
              <div>
                <h3 className="font-serif text-base font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="inline-block h-1.5 w-6 rounded-full bg-primary" />
                  Detailed Breakdown
                  <span className="text-xs font-normal text-muted-foreground">(click any row for details)</span>
                </h3>
                <div className="grid grid-cols-1 gap-2.5">
                  {result.map((item, i) => <PoruthCard key={item.id} item={item} idx={i + 1} />)}
                </div>
              </div>

              {/* Print CTA */}
              <div className="flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-5">
                <Printer className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-800 text-sm">Ready to print or share this report?</p>
                  <p className="text-xs text-amber-600">A beautifully formatted A4 report with all 10 poruthams and details.</p>
                </div>
                <button onClick={() => setShowReport(true)}
                  className="ml-auto shrink-0 flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-600 transition-colors">
                  <Printer className="h-4 w-4" /> View Report
                </button>
              </div>

              <p className="text-xs text-muted-foreground text-center border-t border-border pt-4">
                This calculator uses traditional Tamil Jyotish rules. For important decisions, please consult a qualified astrologer.
              </p>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />

      {/* Print report modal */}
      {showReport && result && (
        <PrintReport boy={boy} girl={girl} result={result} score={score} onClose={() => setShowReport(false)} />
      )}
    </>
  )
}
