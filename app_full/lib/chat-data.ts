// ─── Chat Data Types ────────────────────────────────────────────────────────

export type SubscriptionTier = "basic" | "silver" | "gold"

export type ReadReceipt = "sent" | "delivered" | "read"

export interface ChatUser {
  id: string
  name: string
  nameTamil: string
  initials: string
  online: boolean
  lastSeen?: string // ISO
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string   // "me" = current user
  text: string
  sentAt: string     // ISO
  receipt: ReadReceipt
}

export interface Conversation {
  id: string
  partner: ChatUser
  lastMessage: string
  lastMessageAt: string // ISO
  unreadCount: number
}

// ─── Chat Limit Config ───────────────────────────────────────────────────────

export const CHAT_LIMITS: Record<SubscriptionTier, number> = {
  basic: 0,
  silver: 10,
  gold: 50,
}

// ─── Mock Current User ───────────────────────────────────────────────────────

export const CURRENT_USER_SUBSCRIPTION: SubscriptionTier = "silver"
export const CURRENT_USER_CHATS_USED = 4
export const CURRENT_USER_ID = "me"

// ─── Mock Conversations ──────────────────────────────────────────────────────

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    partner: {
      id: "u1",
      name: "Priya Subramaniam",
      nameTamil: "பிரியா சுப்பிரமணியம்",
      initials: "PS",
      online: true,
    },
    lastMessage: "நலமா? நான் உங்கள் சுயவிவரம் பார்த்தேன், மிகவும் நல்லாயிருந்தது.",
    lastMessageAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    unreadCount: 2,
  },
  {
    id: "conv-2",
    partner: {
      id: "u2",
      name: "Ananya Krishnamurthy",
      nameTamil: "அனன்யா கிருஷ்ணமூர்த்தி",
      initials: "AK",
      online: false,
      lastSeen: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    lastMessage: "Saturday families meeting confirm ஆகிவிட்டது!",
    lastMessageAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
  },
  {
    id: "conv-3",
    partner: {
      id: "u3",
      name: "Deepika Rajan",
      nameTamil: "தீபிகா ராஜன்",
      initials: "DR",
      online: false,
      lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    lastMessage: "Thank you for the interest. Let me discuss with my parents.",
    lastMessageAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
  },
  {
    id: "conv-4",
    partner: {
      id: "u4",
      name: "Meenakshi Iyer",
      nameTamil: "மீனாட்சி ஐயர்",
      initials: "MI",
      online: true,
    },
    lastMessage: "Our rasi porutham is 8/10, very good match!",
    lastMessageAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    unreadCount: 1,
  },
]

// ─── Mock Messages per conversation ──────────────────────────────────────────

export const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  "conv-1": [
    {
      id: "m1",
      conversationId: "conv-1",
      senderId: "u1",
      text: "வணக்கம்! உங்கள் சுயவிவரம் பார்த்தேன், மிகவும் நல்லாயிருந்தது.",
      sentAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      receipt: "read",
    },
    {
      id: "m2",
      conversationId: "conv-1",
      senderId: "me",
      text: "வணக்கம்! நன்றி. உங்கள் சுயவிவரமும் மிகவும் அழகாக இருந்தது. நம் இருவருக்கும் நல்ல பொருத்தம் இருக்கிறது.",
      sentAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      receipt: "read",
    },
    {
      id: "m3",
      conversationId: "conv-1",
      senderId: "u1",
      text: "ஆமா, 8/10 பொருத்தம் இருக்கு. நம் பெற்றோர்கள் பேசலாம் என்று நினைக்கிறேன்.",
      sentAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      receipt: "read",
    },
    {
      id: "m4",
      conversationId: "conv-1",
      senderId: "me",
      text: "நல்ல யோசனை! இந்த வாரம் எந்த நேரத்தில் வசதியாக இருக்கும்?",
      sentAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      receipt: "delivered",
    },
    {
      id: "m5",
      conversationId: "conv-1",
      senderId: "u1",
      text: "நலமா? நான் உங்கள் சுயவிவரம் பார்த்தேன், மிகவும் நல்லாயிருந்தது.",
      sentAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      receipt: "sent",
    },
  ],
  "conv-2": [
    {
      id: "m10",
      conversationId: "conv-2",
      senderId: "me",
      text: "வணக்கம் அனன்யா! Weekend meeting confirm பண்ண முடியுமா?",
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      receipt: "read",
    },
    {
      id: "m11",
      conversationId: "conv-2",
      senderId: "u2",
      text: "Saturday families meeting confirm ஆகிவிட்டது!",
      sentAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      receipt: "delivered",
    },
  ],
  "conv-3": [
    {
      id: "m20",
      conversationId: "conv-3",
      senderId: "me",
      text: "வணக்கம்! உங்கள் சுயவிவரம் பார்த்து ஆர்வமாக இருந்தேன்.",
      sentAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
      receipt: "read",
    },
    {
      id: "m21",
      conversationId: "conv-3",
      senderId: "u3",
      text: "Thank you for the interest. Let me discuss with my parents.",
      sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      receipt: "delivered",
    },
  ],
  "conv-4": [
    {
      id: "m30",
      conversationId: "conv-4",
      senderId: "u4",
      text: "Our rasi porutham is 8/10, very good match!",
      sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      receipt: "delivered",
    },
  ],
}

// Helper: find conv by partner userId
export function findConversationByUserId(userId: string): Conversation | undefined {
  return MOCK_CONVERSATIONS.find((c) => c.partner.id === userId)
}

export function getConversationPartner(userId: string): ChatUser | undefined {
  return MOCK_CONVERSATIONS.find((c) => c.partner.id === userId)?.partner
}
