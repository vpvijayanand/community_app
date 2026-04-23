"use client"

import Link from "next/link"
import { Crown } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Subscription gate overlay — shown to Basic users on /chat and /chat/:userId.
 * Renders a blurred background with centred lock message.
 */
export function ChatSubscriptionGate() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-20 text-center">
      {/* Decorative blurred chat preview behind the gate */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-30"
        style={{ filter: "blur(6px)" }}
      >
        <div className="flex h-full flex-col gap-4 p-8">
          {[40, 60, 35, 70, 50].map((w, i) => (
            <div
              key={i}
              className={`h-10 rounded-2xl bg-primary/40 ${i % 2 === 0 ? "self-end" : "self-start"}`}
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      </div>

      {/* Lock card */}
      <div className="relative z-10 flex max-w-sm flex-col items-center gap-5 rounded-2xl border border-border bg-card px-8 py-10 shadow-xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Crown className="h-8 w-8" aria-hidden />
        </div>

        <div className="space-y-2">
          <p className="font-serif text-xl font-medium text-foreground">
            Members Chat
          </p>
          <p className="font-tamil text-base leading-relaxed text-muted-foreground">
            இந்த வசதி Silver/Gold உறுப்பினர்களுக்கு மட்டுமே
          </p>
          <p className="text-sm text-muted-foreground">
            Upgrade your plan to start messaging matches directly.
          </p>
        </div>

        {/* Tier comparison pills */}
        <div className="flex w-full gap-3">
          <div className="flex flex-1 flex-col items-center gap-1 rounded-lg border border-border bg-secondary/30 p-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Silver
            </span>
            <span className="font-serif text-lg font-medium text-foreground">10</span>
            <span className="text-[10px] text-muted-foreground">chats / month</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 rounded-lg border-2 border-primary/40 bg-primary/5 p-3">
            <span className="text-xs font-medium uppercase tracking-wider text-primary">
              Gold ✦
            </span>
            <span className="font-serif text-lg font-medium text-primary">50</span>
            <span className="text-[10px] text-primary/70">chats / month</span>
          </div>
        </div>

        <Button asChild size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/subscription">
            <span className="font-tamil">இப்போதே தரமுயர்த்துங்கள்</span>
          </Link>
        </Button>
        <p className="font-tamil text-xs text-muted-foreground">
          தரமுயர்த்தி அதிகமான பொருத்தங்களை தொடர்பு கொள்ளுங்கள்
        </p>
      </div>
    </div>
  )
}
