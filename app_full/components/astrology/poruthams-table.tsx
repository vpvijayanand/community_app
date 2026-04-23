"use client"

import React, { useState, useEffect } from "react"
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { getPoruthamsLabel } from "@/lib/astrology-utils"

export type Porutham = {
  tamilName: string
  englishName: string
  result: boolean
  points: number
  description: string
}

type PoruthamsTableProps = {
  poruthams: Porutham[]
  totalScore: number
}



export const PoruthamsTable = React.memo(function PoruthamsTable({ poruthams, totalScore }: PoruthamsTableProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    // Simple mount animation for the score bar, functioning essentially like Framer Motion's layout animations
    const tm = setTimeout(() => {
      setAnimatedScore(totalScore)
    }, 100)
    return () => clearTimeout(tm)
  }, [totalScore])

  const labelData = getPoruthamsLabel(totalScore)

  return (
    <div className="w-full rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 font-medium text-muted-foreground w-[40px]"></th>
              <th className="px-4 py-3 font-tamil font-medium text-muted-foreground">பொருத்தம் (Tamil)</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Match (English)</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-center">Result</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {poruthams.map((p, idx) => {
              const isExpanded = expandedRow === idx
              const isPass = p.result
              return (
                <React.Fragment key={idx}>
                  <tr
                    className={cn(
                      "group cursor-pointer transition-colors",
                      isPass ? "bg-[#F0FFF0]" : "bg-[#FFF0F0]"
                    )}
                    onClick={() => setExpandedRow(isExpanded ? null : idx)}
                  >
                    <td className="px-4 py-3 text-muted-foreground text-center w-[40px]">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </td>
                    <td className="px-4 py-3 font-tamil font-semibold text-foreground/90">
                      {p.tamilName}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground/80">
                      {p.englishName}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isPass ? (
                        <div className="mx-auto inline-flex items-center justify-center rounded-full bg-blue-100 p-1 text-blue-600">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="mx-auto inline-flex items-center justify-center rounded-full bg-red-100 p-1 text-red-600">
                          <XCircle className="h-4 w-4" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-foreground">
                      {p.points} / 1
                    </td>
                  </tr>
                  
                  {isExpanded && (
                    <tr className="bg-background">
                      <td colSpan={5} className="px-6 py-4 text-sm text-muted-foreground">
                        <div className="animate-in fade-in slide-in-from-top-2">
                          <p className="leading-relaxed border-l-2 border-primary/40 pl-3">
                            <span className="font-medium text-foreground">Significance:</span> {p.description}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
      
      {/* Footer row with score */}
      <div className="border-t border-border bg-background p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-foreground">மொத்தம் | Total:</span>
            <div className="px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: labelData.color + "22", color: labelData.color }}>
              {labelData.label}
            </div>
          </div>
          <span className="font-black text-xl text-foreground">
            {totalScore} / 10
          </span>
        </div>
        
        {/* Animated Progress Bar */}
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-secondary">
          <div 
            className="h-full bg-primary transition-all duration-1000 ease-out"
            style={{ width: `${(animatedScore / 10) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
})
