"use client"

import { NAKSHATRAS, RASIS } from "@/lib/porutham"

// Helper functions for names
const rasiName = (id: string | number)  => RASIS.find(r => r.id === Number(id))
const nakName  = (id: string | number)  => NAKSHATRAS.find(n => n.id === Number(id))

export function PoruthamA4Report({ match, score, verdict, barColor, dateStr, fmtDate }: any) {
  const resultItems = match.result_json.items || []
  const matched   = resultItems.filter((p: any) => p.match).length
  const unmatched = resultItems.filter((p: any) => !p.match).length

  return (
    <div style={{ width: "210mm", background: "#fff", padding: "10mm", fontFamily: "sans-serif", fontSize: "9pt", lineHeight: 1.35, color: "#111", boxSizing: "border-box" }}>
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
            { label: "மணமகன் — GROOM", 
              data: { name: match.boy_name, dob: match.boy_dob, time: match.boy_time_of_birth, place: match.boy_place }, 
              bg: "#eff6ff", border: "#bfdbfe" 
            },
            { label: "மணமகள் — BRIDE", 
              data: { name: match.girl_name, dob: match.girl_dob, time: match.girl_time_of_birth, place: match.girl_place }, 
              bg: "#fdf2f8", border: "#f9a8d4" 
            },
          ].map(({ label, data, bg, border }) => (
            <div key={label} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontWeight: 800, fontSize: "8.5pt", color: "#374151", borderBottom: `1px solid ${border}`, paddingBottom: 4, marginBottom: 6, letterSpacing: 0.5 }}>{label}</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8pt" }}>
                <tbody>
                  {[
                    ["Name", data.name || "—"],
                    ["Date of Birth", fmtDate(data.dob)],
                    ["Time of Birth", data.time || "—"],
                    ["Place of Birth", data.place || "—"],
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
            {resultItems.map((item: any, i: number) => (
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
          <span>Report Date: {dateStr}</span>
          <span>For important decisions, consult a qualified Jyotish astrologer.</span>
        </div>
      </div>
    </div>
  )
}
