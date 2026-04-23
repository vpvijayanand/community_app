"use client"

import { cn } from "@/lib/utils"
import { useState, memo } from "react"
import { 
  PlanetPosition, 
  groupPlanetsByHouse, 
  getRasiName, 
  getPlanetTamilAbbr, 
  rasiForHouse 
} from "@/lib/astrology-utils"

type KoduGridProps = {
  planetPositions: PlanetPosition[]
  lagnaHouse: number
  lagnaRasi?: number
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

/** House number → CSS grid position (1-indexed) */
const HOUSE_COORDS: Record<number, { r: number, c: number }> = {
  1:  { r: 1, c: 2 },
  2:  { r: 1, c: 3 },
  3:  { r: 1, c: 4 },
  4:  { r: 2, c: 4 },
  5:  { r: 3, c: 4 },
  6:  { r: 4, c: 4 },
  7:  { r: 4, c: 3 },
  8:  { r: 4, c: 2 },
  9:  { r: 4, c: 1 },
  10: { r: 3, c: 1 },
  11: { r: 2, c: 1 },
  12: { r: 1, c: 1 },
}

/**
 * South-Indian style Horoscope Grid.
 * Exact 4x4 mapping with a merged 2x2 center.
 * House 1 is always Mesh (Aries) statically at row 0, col 1.
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
  showToggle = true,
  onHouseClick,
}: KoduGridProps) {
  const [internalMode, setInternalMode] = useState<'rasi' | 'navamsa'>(mode)
  const activeMode = internalMode
  const grouped = groupPlanetsByHouse(planetPositions)
  const w = SIZE_MAP[size]

  return (
    <div
      style={{ width: w }}
      role="img"
      aria-label={personName ? `${personName} ஜாதக கட்டம்` : "ஜாதக கட்டம்"}
    >
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
        {/* 12 house cells */}
        {Object.entries(HOUSE_COORDS).map(([hStr, { r, c }]) => {
          const h = parseInt(hStr, 10)
          const planets = grouped[h] || []
          const rasi = rasiForHouse(h, lagnaHouse, lagnaRasi)
          const isLagna = h === lagnaHouse

          return (
            <div
              key={h}
              onClick={() => onHouseClick?.(h, rasi)}
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
                  e.preventDefault();
                  onHouseClick(h, rasi);
                }
              }}
            >
              {isLoading ? (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 2,
                    background: "#F0C8C0",
                    animation: "shimmer 1.5s ease-in-out infinite",
                  }}
                />
              ) : (
                <>
                  {/* House number */}
                  <span
                    style={{
                      position: "absolute",
                      top: 2,
                      left: 3,
                      fontSize: 9,
                      color: "#7A3A3A",
                      opacity: 0.7,
                    }}
                  >
                    {h}
                  </span>

                  {/* Planets */}
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                    }}
                  >
                    {planets.map((p, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: 12,
                          fontWeight: "bold",
                          color: "#CD1C18",
                        }}
                      >
                        {getPlanetTamilAbbr(p)}
                      </span>
                    ))}
                  </div>

                  {/* Rasi name */}
                  <span
                    style={{
                      position: "absolute",
                      bottom: 2,
                      left: 3,
                      fontSize: 8,
                      color: "#7A3A3A",
                    }}
                  >
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
          }}
        >
          {isLoading ? (
            <div
              style={{
                width: "60%",
                height: 14,
                borderRadius: 2,
                background: "#F0C8C0",
                animation: "shimmer 1.5s ease-in-out infinite",
              }}
            />
          ) : (
            <>
              <span style={{ fontSize: 11, color: "#CD1C18", fontWeight: 500 }}>
                ஜாதகம்
              </span>
              {personName && (
                <span style={{ fontSize: 10, color: "#1A0203" }}>
                  {personName}
                </span>
              )}
              {dob && (
                <span style={{ fontSize: 9, color: "#7A3A3A" }}>{dob}</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Shimmer keyframes */}
      <style>{`@keyframes shimmer{0%,100%{opacity:.5}50%{opacity:1}}`}</style>

      {/* Toggle pills */}
      {showToggle && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 0,
            marginTop: 8,
          }}
        >
          {(["rasi", "navamsa"] as const).map((m) => {
            const active = activeMode === m
            return (
              <button
                key={m}
                type="button"
                onClick={() => setInternalMode(m)}
                style={{
                  padding: "4px 14px",
                  fontSize: 12,
                  fontWeight: 500,
                  borderRadius: 999,
                  cursor: "pointer",
                  border: active ? "none" : "0.5px solid #F0C8C0",
                  background: active ? "#CD1C18" : "transparent",
                  color: active ? "#fff" : "#7A3A3A",
                }}
              >
                {m === "rasi" ? "ராசி" : "நவாம்சம்"}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
})

export default KoduGrid
