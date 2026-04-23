"use client"

import Link from "next/link"
import { MessageSquarePlus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Conversation } from "@/lib/chat-data"

interface ConversationRowProps {
  conversation: Conversation
  isActive?: boolean
}

function getRelativeTime(iso: string): string {
  try {
    const d = new Date(iso)
    const now = Date.now()
    const diffMs = now - d.getTime()
    const diffMins = Math.floor(diffMs / 60_000)
    const diffHours = Math.floor(diffMs / 3_600_000)
    const diffDays = Math.floor(diffMs / 86_400_000)

    if (diffMins < 1) return "இப்போது"
    if (diffMins < 60) return `${diffMins} நிமிடம் முன்`
    if (diffHours < 24) return `${diffHours} மணி முன்`
    if (diffDays === 1) return "நேற்று"
    return `${diffDays} நாள் முன்`
  } catch {
    return ""
  }
}

export function ConversationRow({ conversation, isActive }: ConversationRowProps) {
  const { partner, lastMessage, lastMessageAt, unreadCount, id } = conversation
  const preview = lastMessage.length > 42 ? lastMessage.slice(0, 42) + "…" : lastMessage
  const timeLabel = getRelativeTime(lastMessageAt)
  const hasUnread = unreadCount > 0

  return (
    <Link
      href={`/chat/${partner.id}`}
      className={cn(
        "flex items-start gap-3 border-b border-border px-4 py-4 transition-colors hover:bg-secondary/40",
        isActive && "bg-primary/5 border-l-2 border-l-primary",
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold",
            "bg-primary/10 text-primary",
          )}
        >
          {partner.initials}
        </div>
        {partner.online && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-green-500" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className={cn(
              "truncate text-sm",
              hasUnread ? "font-semibold text-foreground" : "font-medium text-foreground/80",
            )}
          >
            {partner.name}
          </span>
          <span suppressHydrationWarning className="shrink-0 text-[11px] text-muted-foreground">{timeLabel}</span>
        </div>
        <p className={cn("mt-0.5 truncate text-xs", hasUnread ? "text-foreground/80" : "text-muted-foreground")}>
          {preview}
        </p>
      </div>

      {/* Unread badge */}
      {hasUnread && (
        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
          {unreadCount}
        </span>
      )}
    </Link>
  )
}

import { useChatStore } from "@/hooks/use-chat-store"

interface ConversationListProps {
  activeUserId?: string
}

export function ConversationList({ activeUserId }: ConversationListProps) {
  const { conversations } = useChatStore()

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 px-6 text-center">
        <MessageSquarePlus className="h-12 w-12 text-border" />
        <div>
          <p className="font-serif text-base font-medium text-foreground">No conversations yet</p>
          <p className="font-tamil mt-1 text-sm text-muted-foreground leading-relaxed">
            இன்னும் உரையாடல்கள் இல்லை. யாரையாவது தேடி தொடர்பு கொள்ளுங்கள்!
          </p>
        </div>
        <Link
          href="/matches"
          className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Browse Matches
        </Link>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conv) => (
        <ConversationRow
          key={conv.id}
          conversation={conv}
          isActive={activeUserId === conv.partner.id}
        />
      ))}
    </div>
  )
}
