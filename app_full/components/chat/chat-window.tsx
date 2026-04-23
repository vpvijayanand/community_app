"use client"

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type FormEvent,
  type KeyboardEvent,
} from "react"
import Link from "next/link"
import { ArrowLeft, MoreVertical, Send, Lock } from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MessageList } from "@/components/chat/message-bubble"
import { useChatLimit } from "@/hooks/use-chat-limit"
import {
  CURRENT_USER_ID,
  getConversationPartner,
  type ChatMessage,
} from "@/lib/chat-data"
import { useChatStore } from "@/hooks/use-chat-store"
import { cn } from "@/lib/utils"

const MAX_CHARS = 500
const WARN_AT = 400

// ─── Report / Block Modal ─────────────────────────────────────────────────────

const REPORT_REASONS = [
  "Inappropriate content",
  "Fake profile",
  "Harassment",
  "Spam",
  "Other",
]

function ReportModal({
  partnerId,
  onClose,
}: {
  partnerId: string
  onClose: () => void
}) {
  const [reason, setReason] = useState("")
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    // In production: POST /users/:id/report
    setSubmitted(true)
    setTimeout(() => {
      toast.success("Report submitted. Our team will review it within 24 hours.")
      onClose()
    }, 600)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              ✓
            </div>
            <p className="font-serif text-lg text-foreground">Report submitted</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-foreground">Report User</h2>
            <p className="text-sm text-muted-foreground">What's the reason for your report?</p>
            <div className="space-y-2">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r}
                  className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3 hover:bg-secondary/30 transition-colors"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="accent-primary"
                  />
                  <span className="text-sm text-foreground">{r}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!reason}
              >
                Submit Report
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Chat Input ───────────────────────────────────────────────────────────────

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
  disabledReason?: string
}

function ChatInput({ onSend, disabled, disabledReason }: ChatInputProps) {
  const [text, setText] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const remaining = MAX_CHARS - text.length
  const showCounter = text.length >= WARN_AT
  const canSend = text.trim().length > 0 && !disabled && remaining >= 0

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`
  }, [text])

  function handleSubmit() {
    if (!canSend) return
    onSend(text.trim())
    setText("")
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t border-border bg-card px-4 py-3">
      {disabledReason && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <Lock className="h-3.5 w-3.5 shrink-0" />
          <span className="font-tamil">{disabledReason}</span>
        </div>
      )}
      <div className="flex items-end gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onSend("[CHART_SHARE]")}
          disabled={disabled}
          title="Share Astrology Chart"
          className="shrink-0 rounded-full h-11 w-11 hover:text-primary transition-colors border-dashed"
        >
          <span aria-hidden>🌟</span>
        </Button>
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "இந்த மாதம் உரையாடல் வரம்பை எட்டிவிட்டீர்கள்" : "செய்தி அனுப்புங்கள்… (Enter to send)"}
            disabled={disabled}
            className={cn(
              "w-full resize-none rounded-2xl border border-input bg-background px-4 py-3 pl-4 text-sm text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-all duration-150",
            )}
          />
          {showCounter && (
            <span
              className={cn(
                "absolute bottom-2.5 right-3 text-[10px] font-medium",
                remaining <= 20 ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {remaining}
            </span>
          )}
        </div>
        <button
          onClick={handleSubmit}
          disabled={!canSend}
          aria-label="Send message"
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all",
            canSend
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
              : "bg-border text-muted-foreground cursor-not-allowed",
          )}
        >
          <Send className="h-4 w-4 translate-x-px" />
        </button>
      </div>
    </div>
  )
}

// ─── Chat Window ──────────────────────────────────────────────────────────────

interface ChatWindowProps {
  userId: string
  /** Whether to show back button (mobile) */
  showBack?: boolean
}

export function ChatWindow({ userId, showBack }: ChatWindowProps) {
  const partner = getConversationPartner(userId)
  const { canSendMore, isAtLimit, used, limit, tier } = useChatLimit()
  const { messages: storeMessages, sendMessage: sendToStore, markAsRead } = useChatStore()
  const bottomRef = useRef<HTMLDivElement>(null)
  const [showReport, setShowReport] = useState(false)

  // Derive conversation id simply from mock logic for now
  const convId = partner ? `conv-${userId === "u1" ? 1 : userId === "u2" ? 2 : userId === "u3" ? 3 : 4}` : ""
  const messages = storeMessages[convId] ?? []

  // Mark as read on mount or when switching users
  useEffect(() => {
    if (userId) markAsRead(userId)
  }, [userId, markAsRead])

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  const handleSend = useCallback(
    (text: string) => {
      if (!canSendMore) return
      sendToStore(userId, text)
    },
    [canSendMore, sendToStore, userId],
  )

  function handleBlock() {
    // In production: POST /users/:id/block
    toast.success("User blocked. They can no longer contact you.")
  }

  if (!partner) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
        <p>Conversation not found.</p>
        <Link href="/chat" className="text-primary hover:underline text-sm">
          ← Back to chats
        </Link>
      </div>
    )
  }

  const disabledReason = isAtLimit
    ? `இந்த மாதம் ${used}/${limit} உரையாடல்கள் முடிந்தது. Gold-க்கு மேம்படுத்துங்கள்.`
    : undefined

  return (
    <>
      {showReport && (
        <ReportModal partnerId={userId} onClose={() => setShowReport(false)} />
      )}

      <div className="flex flex-1 flex-col overflow-hidden bg-background">
        {/* ── Header ── */}
        <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 shadow-sm">
          {showBack && (
            <Link
              href="/chat"
              className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-secondary/50 transition-colors"
              aria-label="Back to chat list"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}

          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {partner.initials}
            </div>
            {partner.online && (
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-green-500" />
            )}
          </div>

          {/* Name & status */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{partner.name}</p>
            <p className="font-tamil text-[11px] text-muted-foreground">
              {partner.online ? "Online" : "Offline"}
            </p>
          </div>

          {/* View profile link */}
          <Link
            href={`/profile/${userId}`}
            className="hidden shrink-0 text-xs font-medium text-primary hover:underline sm:block"
          >
            சுயவிவரம் காண்க
          </Link>

          {/* 3-dot menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary/50 transition-colors"
                aria-label="More options"
              >
                <MoreVertical className="h-5 w-5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem asChild>
                <Link href={`/profile/${userId}`}>View Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-amber-600 focus:text-amber-600"
                onClick={() => setShowReport(true)}
              >
                Report User
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleBlock}
              >
                Block User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* ── Messages ── */}
        <div 
          className="flex-1 overflow-y-auto relative bg-slate-50 min-h-0"
          style={{
            backgroundImage: `url("/chart_message.jpeg")`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "400px",
            backgroundPosition: "center",
          }}
        >
          {/* subtle white fade to ensure message legibility if the background is strong */}
          <div className="absolute inset-0 bg-background/50 pointer-events-none" />
          <div className="relative z-10 space-y-4 pb-4">
            <MessageList messages={messages} pendingIds={new Set()} />
            <div ref={bottomRef} />
          </div>
        </div>

        {/* ── Input ── */}
        <ChatInput
          onSend={handleSend}
          disabled={!canSendMore}
          disabledReason={disabledReason}
        />
      </div>
    </>
  )
}

// ─── Empty state (no conv selected on desktop) ────────────────────────────────

export function ChatEmptyState() {
  return (
    <div 
      className="flex flex-1 flex-col items-center justify-center gap-4 text-center px-4 relative bg-slate-50 min-h-0"
      style={{
        backgroundImage: `url("/chart_message.jpeg")`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "400px",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-background/60 pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-primary/30 text-primary bg-background/50 shadow-sm backdrop-blur">
          <Send className="h-8 w-8 ml-1" />
        </div>
        <div className="bg-background/80 px-6 py-4 rounded-xl shadow-sm backdrop-blur">
          <p className="font-serif text-xl font-medium text-foreground">Select a conversation</p>
          <p className="font-tamil mt-1 text-sm text-foreground/80">
            உங்கள் உரையாடலை தொடங்குங்கள்
          </p>
        </div>
      </div>
    </div>
  )
}
