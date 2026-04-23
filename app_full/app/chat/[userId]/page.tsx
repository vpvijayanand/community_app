import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { ChatSubscriptionGate } from "@/components/chat/chat-subscription-gate"
import { ChatLimitBanner } from "@/components/chat/chat-limit-banner"
import { ConversationList } from "@/components/chat/conversation-list"
import { ChatWindow } from "@/components/chat/chat-window"
import {
  MOCK_CONVERSATIONS,
  CURRENT_USER_SUBSCRIPTION,
  getConversationPartner,
} from "@/lib/chat-data"

interface ChatThreadPageProps {
  params: Promise<{ userId: string }>
}

export async function generateMetadata({ params }: ChatThreadPageProps): Promise<Metadata> {
  const { userId } = await params
  const partner = getConversationPartner(userId)
  return {
    title: partner ? `${partner.name} — Messages | Maratha` : "Chat | Maratha",
    description: "Send and receive messages with your match.",
  }
}

/**
 * /chat/:userId
 *
 * Desktop: two-panel (list left, window right)
 * Mobile: window only (full-screen), with back arrow returning to /chat
 */
export default async function ChatThreadPage({ params }: ChatThreadPageProps) {
  const isBasicUser = CURRENT_USER_SUBSCRIPTION === "basic"
  const { userId } = await params

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />

      <div
        className="relative flex flex-1 overflow-hidden"
        style={{ height: "calc(100dvh - 64px)" }}
      >
        {isBasicUser ? (
          <ChatSubscriptionGate />
        ) : (
          <>
            {/* ── LEFT: conversation list (desktop only) ── */}
            <aside className="hidden w-80 flex-col border-r border-border bg-card md:flex lg:w-96">
              <div className="flex items-center justify-between border-b border-border px-4 py-4">
                <div>
                  <h1 className="font-serif text-lg font-medium text-foreground">Messages</h1>
                  <p className="font-tamil text-[11px] text-muted-foreground">செய்திகள்</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {MOCK_CONVERSATIONS.length}
                </span>
              </div>
              <ChatLimitBanner />
              <ConversationList
                activeUserId={userId}
              />
            </aside>

            {/* ── RIGHT: chat window ── */}
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Mobile-only limit banner */}
              <div className="md:hidden">
                <ChatLimitBanner />
              </div>
              <ChatWindow userId={userId} showBack />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
