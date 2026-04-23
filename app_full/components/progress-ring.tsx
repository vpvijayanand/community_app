type Props = {
  percent: number
  completed: number
  total: number
  size?: number
}

export function ProgressRing({ percent, completed, total, size = 120 }: Props) {
  const safe = Math.min(100, Math.max(0, percent))
  const stroke = 10
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dash = (safe / 100) * circumference

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Profile setup ${safe}% complete, ${completed} of ${total} steps done`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          className="transition-[stroke-dasharray] duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-2xl font-medium tabular-nums text-foreground">
          {safe}%
        </span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {completed}/{total}
        </span>
      </div>
    </div>
  )
}
