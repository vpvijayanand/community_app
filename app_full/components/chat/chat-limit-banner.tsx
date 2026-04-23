"use client"

import Link from "next/link"
import { AlertTriangle, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useChatLimit } from "@/hooks/use-chat-limit"
import { cn } from "@/lib/utils"

/**
 * Monthly usage banner shown at the top of the chat list.
 * Color changes from neutral → amber (80%) → red (100%).
 */
export function ChatLimitBanner() {
  const { used, limit, percentUsed, isAtLimit, isNearLimit, tier } = useChatLimit()

  if (tier === "basic") return null

  const tierLabel = tier === "gold" ? "Gold" : "Silver"
  const barColor = isAtLimit
    ? "bg-destructive"
    : isNearLimit
    ? "bg-amber-500"
    : "bg-primary"

  return (
    <div
      className={cn(
        "flex flex-col gap-2 border-b border-border px-4 py-3 text-sm",
        isAtLimit && "bg-destructive/10",
        isNearLimit && !isAtLimit && "bg-amber-50 dark:bg-amber-900/20",
        !isNearLimit && "bg-secondary/30",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-medium text-foreground">
          {(isAtLimit || isNearLimit) && (
            <AlertTriangle
              className={cn(
                "h-3.5 w-3.5",
                isAtLimit ? "text-destructive" : "text-amber-500",
              )}
            />
          )}
          <span className={cn(isAtLimit && "text-destructive", isNearLimit && !isAtLimit && "text-amber-700 dark:text-amber-400")}>
            {/* Tamil label */}
            <span className="font-tamil">
              இந்த மாதம் {used}/{limit} உரையாடல்கள் பயன்படுத்தினீர்கள்
            </span>
          </span>
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">{tierLabel}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${Math.min(percentUsed, 100)}%` }}
        />
      </div>

      {/* Upgrade nudge at ≥80% */}
      {(isNearLimit || isAtLimit) && (
        <div className="flex items-center justify-between">
          <p className={cn("text-xs", isAtLimit ? "text-destructive" : "text-amber-700 dark:text-amber-400")}>
            {isAtLimit
              ? "நீங்கள் இந்த மாதத்திற்கான வரம்பை எட்டிவிட்டீர்கள்."
              : "வரம்பை விரைவில் எட்டுவீர்கள். தரமுயர்த்துவதை பரிசீலியுங்கள்."}
          </p>
          <Button asChild size="sm" variant="outline" className="h-6 px-2 text-xs">
            <Link href="/subscription">
              <TrendingUp className="mr-1 h-3 w-3" />
              Upgrade
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
