import { useState, useEffect, useCallback } from "react"
import {
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
  CURRENT_USER_ID,
  type ChatMessage,
  type Conversation,
} from "@/lib/chat-data"

type ChatStore = {
  conversations: Conversation[]
  messages: Record<string, ChatMessage[]>
}

// Simple global state
let store: ChatStore = {
  conversations: [...MOCK_CONVERSATIONS],
  messages: { ...MOCK_MESSAGES },
}

const listeners = new Set<(state: ChatStore) => void>()

function updateStore(newState: Partial<ChatStore>) {
  store = { ...store, ...newState }
  listeners.forEach((l) => l(store))
}

export function useChatStore() {
  const [state, setState] = useState(store)

  useEffect(() => {
    listeners.add(setState)
    return () => {
      listeners.delete(setState)
    }
  }, [])

  const sendMessage = useCallback((userId: string, text: string) => {
    const conv = store.conversations.find((c) => c.partner.id === userId)
    if (!conv) return

    const convId = conv.id
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: convId,
      senderId: CURRENT_USER_ID,
      text,
      sentAt: new Date().toISOString(),
      receipt: "sent",
    }

    const updatedMessages = {
      ...store.messages,
      [convId]: [...(store.messages[convId] || []), newMsg],
    }

    const updatedConversations = store.conversations.map((c) =>
      c.id === convId
        ? {
            ...c,
            // special text preview if it's a chart share
            lastMessage: text.includes("[CHART_SHARE]") ? "Shared astrology chart 🌟" : text,
            lastMessageAt: newMsg.sentAt,
          }
        : c
    )

    updatedConversations.sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    )

    updateStore({ messages: updatedMessages, conversations: updatedConversations })

    // Simulate message delivery
    setTimeout(() => {
      updateStore({
        messages: {
          ...store.messages,
          [convId]: store.messages[convId].map((m) =>
            m.id === newMsg.id ? { ...m, receipt: "delivered" } : m
          ),
        },
      })
    }, 1000)
  }, [])

  const markAsRead = useCallback((userId: string) => {
    const updatedConversations = store.conversations.map((c) =>
      c.partner.id === userId ? { ...c, unreadCount: 0 } : c
    )
    updateStore({ conversations: updatedConversations })
  }, [])

  return { ...state, sendMessage, markAsRead }
}
