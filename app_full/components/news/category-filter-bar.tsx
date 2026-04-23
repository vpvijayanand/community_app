"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  "All",
  "Events",
  "Community Updates",
  "Culture",
  "Astrology",
  "Learning",
  "Announcements",
]

export function CategoryFilterBar() {
  const [active, setActive] = useState("All")

  return (
    <div className="sticky top-16 z-40 border-b border-border-light bg-bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-[1280px] px-4 md:px-8">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto py-3.5">
          {CATEGORIES.map((cat) => {
            const isActive = active === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActive(cat)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border-light bg-bg-subtle text-text-secondary hover:border-primary/60 hover:text-primary",
                )}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
