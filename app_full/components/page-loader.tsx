"use client"

import { cn } from "@/lib/utils"

/**
 * Branded page loader with animated kolam-style SVG pattern.
 * Used as Suspense fallback and data-fetching loading state.
 */
export function PageLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-[60vh] flex-col items-center justify-center gap-6",
        className,
      )}
      role="status"
      aria-label="Loading"
    >
      {/* Animated kolam SVG */}
      <div className="relative h-16 w-16">
        <svg
          viewBox="0 0 64 64"
          className="h-full w-full animate-spin"
          style={{ animationDuration: "3s" }}
          aria-hidden="true"
        >
          {/* Outer ring */}
          <circle
            cx="32" cy="32" r="28"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2"
            strokeDasharray="12 6"
            opacity="0.3"
          />
          {/* Inner pattern — 4 petals */}
          {[0, 90, 180, 270].map((deg) => (
            <ellipse
              key={deg}
              cx="32" cy="16"
              rx="4" ry="10"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="1.5"
              transform={`rotate(${deg} 32 32)`}
              opacity="0.6"
            />
          ))}
          {/* Center dot */}
          <circle cx="32" cy="32" r="3" fill="var(--primary)" opacity="0.8" />
          {/* Diagonal petals */}
          {[45, 135, 225, 315].map((deg) => (
            <ellipse
              key={deg}
              cx="32" cy="20"
              rx="3" ry="7"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="1"
              transform={`rotate(${deg} 32 32)`}
              opacity="0.4"
            />
          ))}
        </svg>
      </div>

      <p className="font-tamil text-sm text-muted-foreground animate-pulse">
        தயாரிக்கிறோம்...
      </p>
    </div>
  )
}
