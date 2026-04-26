"use client"

import { cn } from "@/lib/utils"
import { memo } from "react"
import { 
  PlanetPosition, 
  getRasiName, 
  getPlanetTamilAbbr, 
} from "@/lib/astrology-utils"

type KoduGridProps = {
  planetPositions: PlanetPosition[]
  lagnaHouse: number        // This is the RASI number of lagna (1-12)
  lagnaRasi?: number        // Same as lagnaHouse — kept for compat
  mode?: 'rasi' | 'navamsa'
  isLoading?: boolean
  personName?: string
  dob?: string
  size?: 'sm' | 'md' | 'lg'
  showToggle?: boolean
  onHouseClick?: (houseNumber: number, rasiNumber: number) => void
}

/** Size map for grid dimensions */
const SIZE_MAP = { sm: 200, md: 280, lg: 360 } as const

/**
 * South-Indian (Kodu) style horoscope grid.
 *
 * The grid has 12 fixed cells.  In South-Indian style the rasi labels
 * DON'T rotate — Mesham is always in the top-row-second-col, etc.
 * The LAGNA cell is just highlighted in red.
 *
 * Cell layout (South-Indian fixed positions):
 *   col:  1        2        3        4
 * row1  Meenam   Mesham  Rishabam  Mithunam
 * row2  Kumbam   [CENTER------]    Kadagam
 * row3  Magaram  [CENTER------]    Simmam
 * row4  Dhanusu  Viruchigam Thulam  Kanni
 *
 * Rasi numbers: 1=Mesham…12=Meenam
 * Grid position for rasi R:
 */
const RASI_TO_COORD: Record<number, { r: number; c: number }> = {
  12: { r: 1, c: 1 },  // Meenam
  1:  { r: 1, c: 2 },  // Mesham
  2:  { r: 1, c: 3 },  // Rishabam
  3:  { r: 1, c: 4 },  // Mithunam
  11: { r: 2, c: 1 },  // Kumbam
  4:  { r: 2, c: 4 },  // Kadagam
  10: { r: 3, c: 1 },  // Magaram
  5:  { r: 3, c: 4 },  // Simmam
  9:  { r: 4, c: 1 },  // Dhanusu
  8:  { r: 4, c: 2 },  // Viruchigam
  7:  { r: 4, c: 3 },  // Thulam
  6:  { r: 4, c: 4 },  // Kanni
}

/**
 * South-Indian horoscope grid component.
 * Renders planets in their absolute rasi cells (fixed grid — not rotating).
 */
export const KoduGrid = memo(function KoduGrid({
  planetPositions = [],
  lagnaHouse,
  lagnaRasi,
  mode = 'rasi',
  isLoading = false,
  personName,
  dob,
  size = 'md',
  showToggle = false,
  onHouseClick,
}: KoduGridProps) {

  // The lagna rasi is whichever is set (lagnaRasi takes precedence for compat)
  const lagnaRasiNum = lagnaRasi ?? lagnaHouse

  // Group planets by their absolute rasi number
  const grouped: Record<number, string[]> = {}
  for (const pos of planetPositions) {
    const r = pos.house  // house = rasi number in our calc
    if (!grouped[r]) grouped[r] = []
    grouped[r].push(pos.planet)
  }

  const w = SIZE_MAP[size]

  return (
    <div style={{ width: w }} role="img" aria-label={personName ? `${personName} ஜாதக கட்டம்` : "ஜாதக கட்டம்"}>
      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "repeat(4, 1fr)",
          border: "1.5px solid #F0C8C0",
          borderRadius: 4,
          aspectRatio: "1 / 1",
          width: "100%",
        }}
      >
        {/* 12 rasi cells — fixed South-Indian positions */}
        {(Object.keys(RASI_TO_COORD) as unknown as number[]).map((rasiStr) => {
          const rasi = Number(rasiStr)
          const { r, c } = RASI_TO_COORD[rasi]
          const planets = grouped[rasi] || []
          const isLagna = rasi === lagnaRasiNum

          return (
            <div
              key={rasi}
              onClick={() => onHouseClick?.(rasi, rasi)}
              role={onHouseClick ? "button" : undefined}
              tabIndex={onHouseClick ? 0 : undefined}
              style={{
                gridRow: r,
                gridColumn: c,
                border: isLagna ? "2px solid #CD1C18" : "0.5px solid #F0C8C0",
                background: isLagna ? "#FFF0EE" : undefined,
                position: "relative",
                padding: 4,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                cursor: onHouseClick ? "pointer" : "default",
                transition: "background 0.2s",
              }}
              onKeyDown={(e) => {
                if (onHouseClick && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  onHouseClick(rasi, rasi)
                }
              }}
            >
              {isLoading ? (
                <div style={{ width: "100%", height: "100%", borderRadius: 2, background: "#F0C8C0", animation: "shimmer 1.5s ease-in-out infinite" }} />
              ) : (
                <>
                  {/* Rasi number (small, top-left) */}
                  <span style={{ position: "absolute", top: 2, left: 3, fontSize: 8, color: "#7A3A3A", opacity: 0.6 }}>
                    {rasi}
                  </span>

                  {/* Planet abbreviations */}
                  <div style={{ flex: 1, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 2, paddingTop: 8 }}>
                    {planets.map((p, i) => {
                      const isLa = p === "La"
                      return (
                        <span key={i} style={{ fontSize: size === "sm" ? 10 : 12, fontWeight: "bold", color: isLa ? "#059669" : "#CD1C18" }}>
                          {getPlanetTamilAbbr(p)}{i < planets.length - 1 ? " ," : ""}
                        </span>
                      )
                    })}
                  </div>

                  {/* Rasi name (small, bottom-left) */}
                  <span style={{ position: "absolute", bottom: 2, left: 3, fontSize: size === "sm" ? 7 : 8, color: "#7A3A3A" }}>
                    {getRasiName(rasi)}
                  </span>
                </>
              )}
            </div>
          )
        })}

        {/* Center cell (2×2) */}
        <div
          style={{
            gridRow: "2 / 4",
            gridColumn: "2 / 4",
            background: "#FFF8F7",
            border: "0.5px solid #F0C8C0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          {isLoading ? (
            <div style={{ width: "60%", height: 14, borderRadius: 2, background: "#F0C8C0", animation: "shimmer 1.5s ease-in-out infinite" }} />
          ) : (
            <>
              <span style={{ fontSize: 11, color: "#CD1C18", fontWeight: 500, fontFamily: "serif" }}>ஜாதகம்</span>
              {personName && <span style={{ fontSize: 10, color: "#1A0203" }}>{personName}</span>}
              {dob && <span style={{ fontSize: 9, color: "#7A3A3A" }}>{dob}</span>}
            </>
          )}
        </div>
      </div>

      {/* Shimmer keyframes */}
      <style>{`@keyframes shimmer{0%,100%{opacity:.5}50%{opacity:1}}`}</style>
    </div>
  )
})

export default KoduGrid
