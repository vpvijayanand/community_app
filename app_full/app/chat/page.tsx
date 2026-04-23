import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { ChatSubscriptionGate } from "@/components/chat/chat-subscription-gate"
import { ChatLimitBanner } from "@/components/chat/chat-limit-banner"
import { ConversationList } from "@/components/chat/conversation-list"
import { ChatEmptyState } from "@/components/chat/chat-window"
import { MOCK_CONVERSATIONS, CURRENT_USER_SUBSCRIPTION } from "@/lib/chat-data"

export const metadata: Metadata = {
  title: "Messages | Maratha Matrimony",
  description: "Chat with your matches. Available for Silver & Gold members.",
}

/**
 * /chat  — Two-panel layout on desktop, list-only on mobile.
 * Right panel shows an empty state prompt (selecting a conversation
 * navigates to /chat/:userId which renders the window full-screen on mobile).
 */
export default function ChatPage() {
  const isBasicUser = CURRENT_USER_SUBSCRIPTION === "basic"

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />

      {/* Full-height chat shell */}
      <div className="relative flex flex-1 overflow-hidden"
        style={{ height: "calc(100dvh - 64px)" }}>

        {isBasicUser ? (
          <ChatSubscriptionGate />
        ) : (
          <>
            {/* ── LEFT PANEL: Conversation list ── */}
            <aside className="flex w-full flex-col border-r border-border bg-card md:w-80 lg:w-96">
              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-border px-4 py-4">
                <div>
                  <h1 className="font-serif text-lg font-medium text-foreground">Messages</h1>
                  <p className="font-tamil text-[11px] text-muted-foreground">செய்திகள்</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {MOCK_CONVERSATIONS.length}
                </span>
              </div>

              {/* Limit banner */}
              <ChatLimitBanner />

              {/* Conversations */}
              <ConversationList />
            </aside>

            {/* ── RIGHT PANEL: Empty state (desktop only) ── */}
            <div className="hidden flex-1 md:flex">
              <ChatEmptyState />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
