"use client"

import { Check, CheckCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChatMessage, ReadReceipt } from "@/lib/chat-data"
import { KoduGrid } from "@/components/kodu-grid"
import { GROOM, BRIDE } from "@/lib/astrology-data"
import { convertChartToPositions } from "@/lib/astrology-utils"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("ta-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  } catch {
    return ""
  }
}

function formatDateSeparator(iso: string): string {
  try {
    const d = new Date(iso)
    const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / 86_400_000)
    if (diff === 0) return "இன்று"
    if (diff === 1) return "நேற்று"
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
  } catch {
    return ""
  }
}

// ─── Read Receipt Icon ────────────────────────────────────────────────────────

function ReceiptIcon({ receipt }: { receipt: ReadReceipt }) {
  if (receipt === "sent") {
    return <Check className="h-3.5 w-3.5 text-foreground/50" aria-label="Sent" />
  }
  if (receipt === "delivered") {
    return <CheckCheck className="h-3.5 w-3.5 text-foreground/60" aria-label="Delivered" />
  }
  // read
  return <CheckCheck className="h-3.5 w-3.5 text-blue-500" aria-label="Read" />
}

// ─── Date Separator ───────────────────────────────────────────────────────────

export function DateSeparator({ iso }: { iso: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div className="flex-1 border-t border-border" />
      <span suppressHydrationWarning className="font-tamil rounded-full border border-border bg-card px-3 py-0.5 text-[11px] text-muted-foreground">
        {formatDateSeparator(iso)}
      </span>
      <div className="flex-1 border-t border-border" />
    </div>
  )
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: ChatMessage
  /** Whether this message is pending (optimistic, not yet confirmed by server) */
  isPending?: boolean
}

export function MessageBubble({ message, isPending }: MessageBubbleProps) {
  const isSent = message.senderId === "me"
  const time = formatTime(message.sentAt)

  return (
    <div
      className={cn(
        "flex w-full",
        isSent ? "justify-end pl-12 sm:pl-20" : "justify-start pr-12 sm:pr-20",
      )}
    >
      <div
        className={cn(
          "relative max-w-[85%] px-4 py-2.5 text-sm leading-relaxed shadow-sm",
          isSent
            ? "rounded-[18px_18px_4px_18px] bg-[#f5deda] text-foreground"
            : "rounded-[18px_18px_18px_4px] border border-border bg-white text-foreground",
          isPending && "opacity-60",
        )}
      >
        {/* Text or Special Widget */}
        {message.text === "[CHART_SHARE]" ? (
          <div className="flex flex-col gap-2 min-w-[200px]">
            <div className="flex items-center gap-1.5 font-tamil text-[11px] uppercase tracking-wider text-foreground/80">
              <span aria-hidden>🌟</span>
              <span>ஜாதக கட்டம் / Astrology Chart</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 overflow-x-auto rounded-lg bg-background p-2 border border-border">
              <KoduGrid 
                planetPositions={isSent ? convertChartToPositions(GROOM.rasiChart) : convertChartToPositions(BRIDE.rasiChart)}
                mode="rasi"
                hideToggle={true}
                dense={true}
                className="w-full sm:w-[240px] shrink-0"
              />
              <KoduGrid 
                planetPositions={isSent ? convertChartToPositions(GROOM.navamsaChart) : convertChartToPositions(BRIDE.navamsaChart)}
                mode="navamsa"
                hideToggle={true}
                dense={true}
                className="w-full sm:w-[240px] shrink-0"
              />
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
        )}

        {/* Timestamp + receipt */}
        <div
          className={cn(
            "mt-1 flex items-center gap-1",
            isSent ? "justify-end" : "justify-start",
          )}
        >
          <span
            suppressHydrationWarning
            className={cn(
              "text-[10px]",
              isSent ? "text-foreground/60" : "text-muted-foreground",
            )}
          >
            {time}
          </span>
          {isSent && <ReceiptIcon receipt={message.receipt} />}
        </div>
      </div>
    </div>
  )
}

// ─── Messages Group (date-separated list) ────────────────────────────────────

interface MessageListProps {
  messages: ChatMessage[]
  pendingIds?: Set<string>
}

export function MessageList({ messages, pendingIds }: MessageListProps) {
  const seen = new Set<string>()

  return (
    <div className="flex flex-col gap-2 px-2 py-4">
      {messages.map((msg, idx) => {
        // Insert date separator only once per day
        const dayKey = new Date(msg.sentAt).toDateString()
        const showSeparator = !seen.has(dayKey)
        if (showSeparator) seen.add(dayKey)

        return (
          <div key={msg.id}>
            {showSeparator && <DateSeparator iso={msg.sentAt} />}
            <MessageBubble
              message={msg}
              isPending={pendingIds?.has(msg.id)}
            />
          </div>
        )
      })}
    </div>
  )
}
