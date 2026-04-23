"use client"

import { useState, useRef, useEffect, useCallback, type FormEvent } from "react"
import { X, Send, Lock } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { MessageList } from "@/components/chat/message-bubble"
import { useChatLimit } from "@/hooks/use-chat-limit"
import { useChatStore } from "@/hooks/use-chat-store"
import {
  CURRENT_USER_ID,
  getConversationPartner,
  type ChatMessage,
} from "@/lib/chat-data"
import { cn } from "@/lib/utils"

const MAX_CHARS = 500

type ChatPanelProps = {
  partnerId: string
  partnerName: string
  isOpen: boolean
  onClose: () => void
}

/**
 * Slide-over chat panel, triggered from a profile page.
 * Renders as a right-side overlay with backdrop.
 */
export function ChatPanel({ partnerId, partnerName, isOpen, onClose }: ChatPanelProps) {
  const { canSendMore, canAccessChat, isAtLimit } = useChatLimit()
  const { conversations, messages, sendMessage } = useChatStore()
  const [draft, setDraft] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  // Find conversation for this partner
  const conv = conversations.find((c) => c.partner.id === partnerId)
  const convId = conv?.id ?? ""
  const chatMessages = convId ? messages[convId] ?? [] : []

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatMessages.length, isOpen])

  const handleSend = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault()
      const text = draft.trim()
      if (!text || !canSendMore) return
      sendMessage(partnerId, text)
      setDraft("")
    },
    [draft, canSendMore, sendMessage, partnerId],
  )

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl",
          "animate-in slide-in-from-right duration-300",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="font-serif text-base font-medium text-foreground">{partnerName}</h3>
            <p className="font-tamil text-[11px] text-muted-foreground">செய்தி அனுப்பவும்</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {!canAccessChat ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
              <Lock className="h-10 w-10 text-muted-foreground" />
              <p className="font-tamil text-sm text-muted-foreground">
                இந்த வசதி Silver/Gold உறுப்பினர்களுக்கு மட்டுமே
              </p>
              <Button asChild size="sm">
                <a href="/pricing">Upgrade Plan</a>
              </Button>
            </div>
          ) : chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <p className="font-tamil text-sm text-muted-foreground">
                முதல் செய்தியை அனுப்புங்கள்!
              </p>
              <p className="text-xs text-muted-foreground">
                Send your first message to start the conversation.
              </p>
            </div>
          ) : (
            <MessageList messages={chatMessages} />
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {canAccessChat && (
          <form onSubmit={handleSend} className="border-t border-border px-4 py-3">
            {isAtLimit && (
              <p className="mb-2 text-xs text-destructive font-tamil">
                இந்த மாத உரையாடல் வரம்பு முடிந்தது
              </p>
            )}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, MAX_CHARS))}
                disabled={!canSendMore}
                placeholder={canSendMore ? "Type a message…" : "Limit reached"}
                className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!draft.trim() || !canSendMore}
                className="h-10 w-10 shrink-0 rounded-full"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {draft.length > 0 && (
              <p className="mt-1 text-right text-[10px] text-muted-foreground">
                {draft.length}/{MAX_CHARS}
              </p>
            )}
          </form>
        )}
      </div>
    </>
  )
}
