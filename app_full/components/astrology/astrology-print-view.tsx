"use client"

import { KoduGrid } from "@/components/kodu-grid"
import type { JyotishResult } from "@/lib/jyotish-calc"
import type { PlanetPosition } from "@/lib/astrology-utils"

interface AstrologyChartPrintViewProps {
  result: JyotishResult
  name: string
  gender: string
  dob: string
  timeOfBirth: string
  placeName: string
  createdAt?: string
}

// Mapping helpers
const RASI_EN: Record<number, string> = {
  1: "Mesham", 2: "Rishabam", 3: "Mithunam", 4: "Kadagam",
  5: "Simmam", 6: "Kanni", 7: "Thulam", 8: "Viruchigam",
  9: "Dhanusu", 10: "Magaram", 11: "Kumbam", 12: "Meenam",
}
const RASI_TA: string[] = [
  "", "மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்", "சிம்மம்",
  "கன்னி", "துலாம்", "விருச்சிகம்", "தனுசு", "மகரம்", "கும்பம்", "மீனம்"
]
const PLANET_EN: Record<string, string> = {
  Su: "Sun", Mo: "Moon", Ma: "Mars", Me: "Mercury",
  Ju: "Jupiter", Ve: "Venus", Sa: "Saturn", Ra: "Rahu", Ke: "Ketu"
}
const PLANET_TA: Record<string, string> = {
  Su: "சூரியன்", Mo: "சந்திரன்", Ma: "செவ்வாய்", Me: "புதன்",
  Ju: "குரு", Ve: "சுக்கிரன்", Sa: "சனி", Ra: "ராகு", Ke: "கேது"
}

export function AstrologyChartPrintView({
  result, name, gender, dob, timeOfBirth, placeName, createdAt
}: AstrologyChartPrintViewProps) {
  const rasiPositions: PlanetPosition[] = result.rasiPositions.map((p) => ({
    planet: p.planet as any, house: p.house, isRetrograde: p.isRetrograde,
  }))
  const navamsaPositions: PlanetPosition[] = result.navamsaPositions.map((p) => ({
    planet: p.planet as any, house: p.house, isRetrograde: p.isRetrograde,
  }))
  const lagnaHouse = result.lagnamRasi

  const dobFormatted = new Date(dob).toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric"
  })
  const generatedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })

  return (
    <div
      id="astrology-print-content"
      className="mx-auto bg-white text-black"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "14mm",
        fontFamily: "'Noto Serif', 'Times New Roman', serif",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* ── Outer Decorative Border ── */}
      <div style={{
        position: "absolute", inset: "6mm",
        border: "2.5px double #8B1C10",
        borderRadius: "4px",
        pointerEvents: "none",
        zIndex: 0,
      }} />
      <div style={{
        position: "absolute", inset: "8mm",
        border: "0.5px solid #8B1C10",
        borderRadius: "2px",
        opacity: 0.4,
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* Content wrapper above borders */}
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", borderBottom: "1.5px solid #8B1C10", paddingBottom: "8px", marginBottom: "12px" }}>
          <div style={{ fontSize: "10px", color: "#8B1C10", letterSpacing: "4px", fontFamily: "sans-serif", marginBottom: "4px" }}>
            ✦ ✦ ✦
          </div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#1A1A1A", letterSpacing: "1px" }}>
            Maratha Jathagam
          </div>
          <div style={{ fontFamily: "'Noto Sans Tamil', sans-serif", fontSize: "15px", color: "#8B1C10", marginTop: "2px" }}>
            மாரத்தா ஜாதகம்
          </div>
          <div style={{ fontSize: "9px", color: "#666", marginTop: "4px", letterSpacing: "2px", fontFamily: "sans-serif" }}>
            HOROSCOPE — ஜாதக விவரம்
          </div>
        </div>

        {/* ── Personal Details Box ── */}
        <div style={{
          border: "1px solid #D4A88A",
          borderRadius: "6px",
          padding: "10px 14px",
          marginBottom: "14px",
          background: "#FFFBF8",
        }}>
          <div style={{ fontSize: "10px", color: "#8B1C10", fontFamily: "sans-serif", letterSpacing: "2px", marginBottom: "6px" }}>
            BIRTH DETAILS — பிறப்பு விவரங்கள்
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 20px", fontSize: "11px" }}>
            <DetailRow label="Name / பெயர்" value={name} />
            <DetailRow label="Gender / பாலினம்" value={gender === "male" ? "Male / ஆண்" : gender === "female" ? "Female / பெண்" : "Other"} />
            <DetailRow label="Date of Birth / பிறந்த தேதி" value={dobFormatted} />
            <DetailRow label="Time of Birth / பிறந்த நேரம்" value={`${timeOfBirth} IST`} />
            <DetailRow label="Place / ஊர்" value={placeName} />
            <DetailRow label="Generated / உருவாக்கிய தேதி" value={generatedDate} />
          </div>
        </div>

        {/* ── Summary: Rasi / Nakshatra / Lagnam ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          border: "1px solid #D4A88A",
          borderRadius: "6px",
          marginBottom: "14px",
          overflow: "hidden",
          background: "#FFFBF8",
        }}>
          <SummaryCell
            label="ராசி / Rasi"
            tamil={result.moonRasiTamil}
            english={result.moonRasiEnglish}
          />
          <SummaryCell
            label="நட்சத்திரம் / Nakshatra"
            tamil={`${result.natchathiramTamil} (பாதம் ${result.pada})`}
            english={`${result.natchathiramEnglish} (Pada ${result.pada})`}
            borderLeft borderRight
          />
          <SummaryCell
            label="லக்னம் / Lagnam"
            tamil={result.lagnamTamil}
            english={result.lagnamEnglish}
          />
        </div>

      {/* Global Print Styles */}
      <style>{`
        @page {
          size: A4;
          margin: 0;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          #astrology-print-content {
            box-shadow: none !important;
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* ── Charts side by side ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
        {/* Rasi Chart */}
        <div style={{ border: "1px solid #D4A88A", borderRadius: "6px", overflow: "hidden", background: "#FFFBF8" }}>
          <div style={{
            background: "#8B1C10", color: "#fff", textAlign: "center",
            padding: "4px", fontSize: "10px", letterSpacing: "1px", fontFamily: "sans-serif"
          }}>
            ராசி கட்டம் — RASI CHART
          </div>
          <div style={{ padding: "8px", display: "flex", justifyContent: "center" }}>
            <KoduGrid
              planetPositions={rasiPositions}
              lagnaHouse={lagnaHouse}
              mode="rasi"
              personName={name}
              dob={dob}
              size="sm"
              showToggle={false}
            />
          </div>
        </div>

        {/* Navamsa Chart */}
        <div style={{ border: "1px solid #D4A88A", borderRadius: "6px", overflow: "hidden", background: "#FFFBF8" }}>
          <div style={{
            background: "#4A3B10", color: "#fff", textAlign: "center",
            padding: "4px", fontSize: "10px", letterSpacing: "1px", fontFamily: "sans-serif"
          }}>
            நவாம்சம் கட்டம் — NAVAMSA CHART
          </div>
          <div style={{ padding: "8px", display: "flex", justifyContent: "center" }}>
            <KoduGrid
              planetPositions={navamsaPositions}
              lagnaHouse={lagnaHouse}
              mode="navamsa"
              personName={name}
              dob={dob}
              size="sm"
              showToggle={false}
            />
          </div>
        </div>
      </div>

        {/* ── Planetary Positions Table ── */}
        <div style={{ border: "1px solid #D4A88A", borderRadius: "6px", overflow: "hidden", background: "#FFFBF8" }}>
          <div style={{
            background: "#2C1A4A", color: "#fff", textAlign: "center",
            padding: "5px", fontSize: "11px", letterSpacing: "1px", fontFamily: "sans-serif"
          }}>
            கிரக நிலை — PLANETARY POSITIONS
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
            <thead>
              <tr style={{ background: "#F5EDE6", borderBottom: "1px solid #D4A88A" }}>
                {["Planet / கிரகம்", "Rasi / ராசி", "Long.°", "Navamsa", "Status"].map((h) => (
                  <th key={h} style={{ padding: "5px 8px", textAlign: "left", fontFamily: "sans-serif", fontWeight: 600, color: "#3A2010" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.planets.map((p, i) => (
                <tr key={p.code} style={{ borderBottom: "0.5px solid #E8D8C8", background: i % 2 === 0 ? "#fff" : "#FDF9F5" }}>
                  <td style={{ padding: "4px 8px" }}>
                    <span style={{ fontWeight: 600, color: "#1A1A1A" }}>{PLANET_EN[p.code]}</span>
                    <span style={{ color: "#666", marginLeft: "6px", fontFamily: "'Noto Sans Tamil', sans-serif", fontSize: "9px" }}>{PLANET_TA[p.code]}</span>
                  </td>
                  <td style={{ padding: "4px 8px" }}>
                    <span>{RASI_EN[p.rasi]}</span>
                    <span style={{ color: "#888", marginLeft: "4px", fontFamily: "'Noto Sans Tamil', sans-serif", fontSize: "9px" }}>{RASI_TA[p.rasi]}</span>
                  </td>
                  <td style={{ padding: "4px 8px", fontFamily: "monospace" }}>{p.siderealLong.toFixed(2)}°</td>
                  <td style={{ padding: "4px 8px" }}>{RASI_EN[p.navamsa]}</td>
                  <td style={{ padding: "4px 8px" }}>
                    <span style={{
                      padding: "1px 6px", borderRadius: "999px", fontSize: "9px",
                      background: p.isRetrograde ? "#FEF3C7" : "#DCFCE7",
                      color: p.isRetrograde ? "#92400E" : "#166534",
                    }}>
                      {p.isRetrograde ? "℞ Retro" : "Direct"}
                    </span>
                  </td>
                </tr>
              ))}
              {/* Lagnam */}
              <tr style={{ background: "#FDF0EE", borderTop: "1px solid #D4A88A" }}>
                <td style={{ padding: "4px 8px", fontWeight: 600, color: "#8B1C10" }}>
                  Lagnam <span style={{ fontFamily: "'Noto Sans Tamil', sans-serif", fontSize: "9px", color: "#8B1C10" }}>லக்னம்</span>
                </td>
                <td style={{ padding: "4px 8px", color: "#8B1C10" }}>
                  {RASI_EN[result.lagnamRasi]}
                  <span style={{ fontFamily: "'Noto Sans Tamil', sans-serif", fontSize: "9px", marginLeft: "4px" }}>{result.lagnamTamil}</span>
                </td>
                <td colSpan={3} style={{ padding: "4px 8px", color: "#999", fontSize: "9px" }}>Ascendant — லக்னம்</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Footer ── */}
        <div style={{ textAlign: "center", marginTop: "12px", fontSize: "8px", color: "#AAA", fontFamily: "sans-serif" }}>
          Generated by Maratha — மாரத்தா | maratha.app
          <br />
          This horoscope is generated using Lahiri Ayanamsa (Chitrapaksha). For detailed consultations, consult a certified Jyotishi.
        </div>
      </div>
    </div>
  )
}

// Helper sub-components (inline for print self-containment)
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span style={{ color: "#8B1C10", fontSize: "9px", fontFamily: "sans-serif", letterSpacing: "0.5px" }}>{label}</span>
      <div style={{ fontWeight: 600, color: "#1A1A1A", fontSize: "11.5px" }}>{value}</div>
    </div>
  )
}

function SummaryCell({ label, tamil, english, borderLeft, borderRight }: {
  label: string; tamil: string; english: string;
  borderLeft?: boolean; borderRight?: boolean;
}) {
  return (
    <div style={{
      padding: "10px",
      textAlign: "center",
      borderLeft: borderLeft ? "1px solid #D4A88A" : undefined,
      borderRight: borderRight ? "1px solid #D4A88A" : undefined,
    }}>
      <div style={{ fontSize: "8px", color: "#8B1C10", letterSpacing: "1px", fontFamily: "sans-serif", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontFamily: "'Noto Sans Tamil', sans-serif", fontSize: "16px", fontWeight: "bold", color: "#1A1A1A" }}>{tamil}</div>
      <div style={{ fontSize: "10px", color: "#555" }}>{english}</div>
    </div>
  )
}
