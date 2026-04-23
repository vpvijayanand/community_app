import { cn } from "@/lib/utils"

type KolamMarkProps = {
  className?: string
  strokeWidth?: number
}

/**
 * Minimal kolam-inspired mark: a grid of dots circumscribed by an interlaced
 * diamond-and-circle motif. Used as a quiet decorative element throughout
 * the Mathat brand.
 */
export function KolamMark({ className, strokeWidth = 1 }: KolamMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={cn("text-primary", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* dot grid */}
      {Array.from({ length: 5 }).flatMap((_, r) =>
        Array.from({ length: 5 }).map((__, c) => (
          <circle
            key={`${r}-${c}`}
            cx={12 + c * 10}
            cy={12 + r * 10}
            r={0.8}
            fill="currentColor"
            stroke="none"
          />
        )),
      )}
      {/* diamond */}
      <path d="M32 6 L58 32 L32 58 L6 32 Z" opacity="0.9" />
      {/* inner circle */}
      <circle cx="32" cy="32" r="14" opacity="0.7" />
      {/* petals */}
      <path d="M32 18 C 38 24, 38 40, 32 46 C 26 40, 26 24, 32 18 Z" opacity="0.6" />
      <path
        d="M18 32 C 24 26, 40 26, 46 32 C 40 38, 24 38, 18 32 Z"
        opacity="0.6"
      />
    </svg>
  )
}
