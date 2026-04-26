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
    day: "2-digit", month: "long", year: "numeric", weekday: "long"
  })
  const generatedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })

  const borderColor = "#8B1C10"
  const headerBg = "#8B1C10"
  const accentBg = "#FFFBF8"
  const dividerColor = "#D4A88A"

  return (
    <div
      id="astrology-print-content"
      className="mx-auto bg-white text-black"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "12mm 14mm",
        fontFamily: "'Noto Serif', 'Times New Roman', serif",
        boxSizing: "border-box",
        position: "relative",
        fontSize: "10px",
      }}
    >
      {/* Global Print Styles */}
      <style>{`
        @page { size: A4; margin: 0; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          #astrology-print-content { box-shadow: none !important; }
        }
      `}</style>

      {/* ── Outer Decorative Borders ── */}
      <div style={{ position: "absolute", inset: "5mm", border: "2.5px double " + borderColor, borderRadius: 4, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", inset: "7mm", border: "0.5px solid " + borderColor, borderRadius: 2, opacity: 0.4, pointerEvents: "none", zIndex: 0 }} />

      {/* Content wrapper above borders */}
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", borderBottom: "1.5px solid " + borderColor, paddingBottom: "7px", marginBottom: "10px" }}>
          <div style={{ fontSize: "9px", color: borderColor, letterSpacing: "4px", fontFamily: "sans-serif", marginBottom: "2px" }}>✦ ✦ ✦</div>
          <div style={{ fontSize: "21px", fontWeight: "bold", color: "#1A1A1A", letterSpacing: "1px" }}>Maratha Jathagam</div>
          <div style={{ fontFamily: "'Noto Sans Tamil', sans-serif", fontSize: "13px", color: borderColor, marginTop: "1px" }}>மாரத்தா ஜாதகம்</div>
          <div style={{ fontSize: "8px", color: "#666", marginTop: "3px", letterSpacing: "2px", fontFamily: "sans-serif" }}>HOROSCOPE — ஜாதக விவரம்</div>
        </div>

        {/* ── Personal Details Box ── */}
        <div style={{ border: "1px solid " + dividerColor, borderRadius: 5, padding: "8px 12px", marginBottom: "10px", background: accentBg }}>
          <div style={{ fontSize: "8px", color: borderColor, fontFamily: "sans-serif", letterSpacing: "2px", marginBottom: "5px" }}>BIRTH DETAILS — பிறப்பு விவரங்கள்</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 20px", fontSize: "10px" }}>
            <DetailRow label="பெயர் / Name" value={name} />
            <DetailRow label="பாலினம் / Gender" value={gender === "male" ? "Male / ஆண்" : gender === "female" ? "Female / பெண்" : "Other"} />
            <DetailRow label="பிறந்த தேதி / Date of Birth" value={dobFormatted} />
            <DetailRow label="பிறந்த நேரம் / Time" value={`${timeOfBirth} IST`} />
            <DetailRow label="பிறந்த இடம் / Place" value={placeName} />
            <DetailRow label="அயனாம்சம் / Ayanamsa" value="லஹிரி (Lahiri)" />
          </div>
        </div>

        {/* ── Summary: Rasi / Nakshatra / Lagnam ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", border: "1px solid " + dividerColor, borderRadius: 5, marginBottom: "10px", overflow: "hidden", background: accentBg }}>
          <SummaryCell label="ராசி / Rasi" tamil={result.moonRasiTamil} english={result.moonRasiEnglish} />
          <SummaryCell label="நட்சத்திரம் / Nakshatra" tamil={`${result.natchathiramTamil} (பாதம் ${result.pada})`} english={`${result.natchathiramEnglish} (Pada ${result.pada})`} borderLeft borderRight />
          <SummaryCell label="லக்னம் / Lagnam" tamil={result.lagnamTamil} english={result.lagnamEnglish} />
        </div>

        {/* ── Panchang ── */}
        <div style={{ border: "1px solid " + dividerColor, borderRadius: 5, marginBottom: "10px", overflow: "hidden", background: accentBg }}>
          <div style={{ background: "#1A3A6A", color: "#fff", textAlign: "center", padding: "4px", fontSize: "8px", letterSpacing: "1px", fontFamily: "sans-serif" }}>
            பிறந்த தேதி பஞ்சாங்கம் — BIRTH DAY PANCHANG
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", fontSize: "9px" }}>
            {[
              { label: "வாரம்", value: result.weekday },
              { label: "நட்சத்திரம்", value: `${result.natchathiramTamil} (பாதம் ${result.pada})` },
              { label: "திதி", value: `${result.tithiTamil} (${result.tithiPaksha})` },
              { label: "யோகம்", value: result.yogam },
              { label: "கரணம்", value: result.karanam },
              { label: "தமிழ் தேதி", value: result.tamilDate },
              { label: "சூரியோதயம்", value: result.sunriseIST },
              { label: "சூரியஸ்தமம்", value: result.sunsetIST },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: "4px 8px", borderBottom: "0.5px solid " + dividerColor, borderRight: "0.5px solid " + dividerColor }}>
                <div style={{ fontSize: "7px", color: borderColor, fontFamily: "sans-serif", letterSpacing: "0.5px", marginBottom: "1px" }}>{label}</div>
                <div style={{ fontFamily: "'Noto Sans Tamil', sans-serif", fontWeight: 600, color: "#1A1A1A" }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Charts side by side ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
          {/* Rasi Chart */}
          <div style={{ border: "1px solid " + dividerColor, borderRadius: 5, overflow: "hidden", background: accentBg }}>
            <div style={{ background: headerBg, color: "#fff", textAlign: "center", padding: "4px", fontSize: "8px", letterSpacing: "1px", fontFamily: "sans-serif" }}>
              ராசி கட்டம் — RASI CHART
            </div>
            <div style={{ padding: "6px", display: "flex", justifyContent: "center" }}>
              <KoduGrid planetPositions={rasiPositions} lagnaHouse={lagnaHouse} mode="rasi" personName={name} dob={dob} size="sm" showToggle={false} />
            </div>
          </div>
          {/* Navamsa Chart */}
          <div style={{ border: "1px solid " + dividerColor, borderRadius: 5, overflow: "hidden", background: accentBg }}>
            <div style={{ background: "#4A3B10", color: "#fff", textAlign: "center", padding: "4px", fontSize: "8px", letterSpacing: "1px", fontFamily: "sans-serif" }}>
              நவாம்சம் கட்டம் — NAVAMSA CHART
            </div>
            <div style={{ padding: "6px", display: "flex", justifyContent: "center" }}>
              <KoduGrid planetPositions={navamsaPositions} lagnaHouse={lagnaHouse} mode="navamsa" personName={name} dob={dob} size="sm" showToggle={false} />
            </div>
          </div>
        </div>

        {/* ── Planetary Positions Table ── */}
        <div style={{ border: "1px solid " + dividerColor, borderRadius: 5, overflow: "hidden", background: accentBg, marginBottom: "10px" }}>
          <div style={{ background: "#2C1A4A", color: "#fff", textAlign: "center", padding: "4px", fontSize: "8px", letterSpacing: "1px", fontFamily: "sans-serif" }}>
            கிரக நிலைகள் — PLANETARY POSITIONS
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5px" }}>
            <thead>
              <tr style={{ background: "#F5EDE6", borderBottom: "1px solid " + dividerColor }}>
                {["கிரகம் / Planet", "நிலை (Long.)", "ராசி / Rasi", "நட்சத்திரம் / Star", "நவாம்சம்", "நிலை"].map((h) => (
                  <th key={h} style={{ padding: "3px 6px", textAlign: "left", fontFamily: "sans-serif", fontWeight: 600, color: "#3A2010", fontSize: "7.5px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.planets.map((p, i) => {
                const degInRasi = p.siderealLong % 30
                return (
                  <tr key={p.code} style={{ borderBottom: "0.5px solid #E8D8C8", background: i % 2 === 0 ? "#fff" : "#FDF9F5" }}>
                    <td style={{ padding: "3px 6px" }}>
                      <span style={{ fontWeight: 600 }}>{PLANET_EN[p.code]}</span>
                      <span style={{ color: "#666", marginLeft: 4, fontFamily: "'Noto Sans Tamil', sans-serif", fontSize: "8px" }}>{PLANET_TA[p.code]}</span>
                    </td>
                    <td style={{ padding: "3px 6px", fontFamily: "monospace", fontSize: "8px" }}>
                      {Math.floor(p.siderealLong)}° {degInRasi.toFixed(0)}&apos;
                    </td>
                    <td style={{ padding: "3px 6px" }}>
                      <span>{RASI_EN[p.rasi]}</span>
                      <span style={{ color: "#888", marginLeft: 3, fontFamily: "'Noto Sans Tamil', sans-serif", fontSize: "8px" }}>{RASI_TA[p.rasi]}</span>
                    </td>
                    <td style={{ padding: "3px 6px", fontFamily: "'Noto Sans Tamil', sans-serif", fontSize: "8px" }}>
                      {/* Leave blank — star per planet would need extended data */}—
                    </td>
                    <td style={{ padding: "3px 6px" }}>{RASI_EN[p.navamsa]}</td>
                    <td style={{ padding: "3px 6px" }}>
                      <span style={{ padding: "1px 5px", borderRadius: 999, fontSize: "7.5px", background: p.isRetrograde ? "#FEF3C7" : "#DCFCE7", color: p.isRetrograde ? "#92400E" : "#166534" }}>
                        {p.isRetrograde ? "℞ Retro" : "Direct"}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {/* Lagnam */}
              <tr style={{ background: "#FDF0EE", borderTop: "1px solid " + dividerColor }}>
                <td style={{ padding: "3px 6px", fontWeight: 600, color: borderColor }}>
                  Lagnam <span style={{ fontFamily: "'Noto Sans Tamil', sans-serif", fontSize: "8px" }}>லக்னம்</span>
                </td>
                <td style={{ padding: "3px 6px", color: "#999", fontSize: "8px" }}>—</td>
                <td style={{ padding: "3px 6px", color: borderColor }}>
                  {RASI_EN[result.lagnamRasi]}
                  <span style={{ fontFamily: "'Noto Sans Tamil', sans-serif", fontSize: "8px", marginLeft: 3 }}>{result.lagnamTamil}</span>
                </td>
                <td colSpan={3} style={{ padding: "3px 6px", color: "#999", fontSize: "7.5px" }}>Ascendant — லக்னம்</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Basic Details (அடிப்படை விவரங்கள்) ── */}
        <div style={{ border: "1px solid " + dividerColor, borderRadius: 5, overflow: "hidden", background: accentBg, marginBottom: "10px" }}>
          <div style={{ background: "#2A4A1A", color: "#fff", textAlign: "center", padding: "4px", fontSize: "8px", letterSpacing: "1px", fontFamily: "sans-serif" }}>
            அடிப்படை விவரங்கள் — BASIC DETAILS
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", fontSize: "9px" }}>
            {[
              { label: "நட்சத்திரம்", value: `${result.natchathiramTamil} (பாதம் ${result.pada})` },
              { label: "ராசி", value: result.moonRasiTamil },
              { label: "வாரம்", value: result.weekday },
              { label: "ராசி அதிபதி", value: result.rasiLordTamil },
              { label: "திதி", value: `${result.tithiTamil} (${result.tithiPaksha})` },
              { label: "லக்கினம்", value: result.lagnamTamil },
              { label: "யோகம்", value: result.yogam },
              { label: "லக்கின அதிபதி", value: result.lagnaLordTamil },
              { label: "கரணம்", value: result.karanam },
              { label: "மரம்", value: result.treeTamil },
              { label: "நட்சத்திர அதிபதி", value: result.natchathiramLordTamil },
              { label: "கணம்", value: result.ganamTamil },
              { label: "நட்சத்திர தேவதை", value: result.natchathiramDeityTamil },
              { label: "பறவை", value: result.natchathiramBirdTamil },
              { label: "மிருகம்", value: result.natchathiramAnimalTamil },
              { label: "யோனி", value: result.yoniTamil },
              { label: "சூரியோதயம்", value: result.sunriseIST },
              { label: "சூரியஸ்தமம்", value: result.sunsetIST },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: "4px 8px", borderBottom: "0.5px solid " + dividerColor, borderRight: "0.5px solid " + dividerColor }}>
                <span style={{ color: borderColor, fontSize: "7px", fontFamily: "sans-serif" }}>{label} </span>
                <span style={{ fontFamily: "'Noto Sans Tamil', sans-serif", fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ textAlign: "center", marginTop: "8px", fontSize: "7px", color: "#AAA", fontFamily: "sans-serif" }}>
          Generated by Maratha — மாரத்தா | maratha.app &nbsp;|&nbsp; Generated on: {generatedDate}
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
      <span style={{ color: "#8B1C10", fontSize: "7.5px", fontFamily: "sans-serif", letterSpacing: "0.5px" }}>{label}</span>
      <div style={{ fontWeight: 600, color: "#1A1A1A", fontSize: "10px", fontFamily: "'Noto Sans Tamil', sans-serif" }}>{value}</div>
    </div>
  )
}

function SummaryCell({ label, tamil, english, borderLeft, borderRight }: {
  label: string; tamil: string; english: string;
  borderLeft?: boolean; borderRight?: boolean;
}) {
  return (
    <div style={{
      padding: "8px 10px", textAlign: "center",
      borderLeft: borderLeft ? "1px solid #D4A88A" : undefined,
      borderRight: borderRight ? "1px solid #D4A88A" : undefined,
    }}>
      <div style={{ fontSize: "7px", color: "#8B1C10", letterSpacing: "1px", fontFamily: "sans-serif", marginBottom: "3px" }}>{label}</div>
      <div style={{ fontFamily: "'Noto Sans Tamil', sans-serif", fontSize: "13px", fontWeight: "bold", color: "#1A1A1A" }}>{tamil}</div>
      <div style={{ fontSize: "9px", color: "#555" }}>{english}</div>
    </div>
  )
}
