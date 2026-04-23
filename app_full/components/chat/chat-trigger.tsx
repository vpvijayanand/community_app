"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatPanel } from "@/components/chat/chat-panel"

type ChatTriggerProps = {
  partnerId: string
  partnerName: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

/**
 * Button that opens a slide-over ChatPanel.
 * Drop this into any profile page or card.
 */
export function ChatTrigger({
  partnerId,
  partnerName,
  variant = "outline",
  size = "default",
  className,
}: ChatTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="mr-2 h-4 w-4" aria-hidden />
        Send message
      </Button>

      <ChatPanel
        partnerId={partnerId}
        partnerName={partnerName}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
