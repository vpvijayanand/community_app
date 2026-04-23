import { cn } from "@/lib/utils"

type MatchScoreGaugeProps = {
  percent: number
  score: number
  max: number
  size?: number
  className?: string
}

export function MatchScoreGauge({
  percent,
  score,
  max,
  size = 240,
  className,
}: MatchScoreGaugeProps) {
  const stroke = 14
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  // Gauge spans 270° (3/4 of a circle), starting at 135° (bottom-left).
  const gaugeFraction = 0.75
  const gaugeLength = circumference * gaugeFraction
  const progress = Math.max(0, Math.min(1, percent / 100))
  const dashProgress = gaugeLength * progress
  const dashRemainder = circumference - dashProgress

  const label =
    percent >= 80
      ? { english: "Strong match", tamil: "சிறந்த பொருத்தம்" }
      : percent >= 60
        ? { english: "Favourable", tamil: "ஏற்றம்" }
        : percent >= 40
          ? { english: "Consider carefully", tamil: "கவனமாக" }
          : { english: "Weak match", tamil: "பொருத்தமற்றது" }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-[135deg]"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${gaugeLength} ${circumference}`}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dashProgress} ${dashRemainder}`}
          style={{ transition: "stroke-dasharray 900ms ease-out" }}
        />
        {/* Tick marks */}
        {Array.from({ length: 11 }).map((_, i) => {
          const angle = (i / 10) * gaugeFraction * 2 * Math.PI
          const x1 = size / 2 + Math.cos(angle) * (radius + stroke / 2 + 4)
          const y1 = size / 2 + Math.sin(angle) * (radius + stroke / 2 + 4)
          const x2 = size / 2 + Math.cos(angle) * (radius + stroke / 2 + 10)
          const y2 = size / 2 + Math.sin(angle) * (radius + stroke / 2 + 10)
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="var(--border)"
              strokeWidth={1}
            />
          )
        })}
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-tamil text-xs uppercase tracking-[0.18em] text-muted-foreground">
          பத்து பொருத்தம்
        </span>
        <span className="mt-2 font-serif text-6xl font-medium leading-none text-foreground tabular-nums">
          {percent}
          <span className="text-2xl align-top text-muted-foreground">%</span>
        </span>
        <span className="mt-2 text-sm font-medium text-primary">
          {label.english}
        </span>
        <span className="mt-1 text-xs text-muted-foreground tabular-nums">
          {score} of {max} points
        </span>
      </div>
    </div>
  )
}
