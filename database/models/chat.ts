/**
 * Chat Models
 *
 * Table: conversations
 */
export interface Conversation {
  id: string
  participant1Id: string            // FK → users.id
  participant2Id: string            // FK → users.id
  lastMessageId?: string            // FK → messages.id
  lastMessageAt?: string
  isBlocked: boolean                // either party blocked
  createdAt: string
  updatedAt: string
}

/**
 * Table: messages
 */
export interface Message {
  id: string
  conversationId: string            // FK → conversations.id
  senderId: string                  // FK → users.id
  text: string
  receipt: "sent" | "delivered" | "read"
  readAt?: string
  isDeleted: boolean                // soft delete
  createdAt: string
}

/**
 * Table: conversation_participants
 * Tracks per-user state for each conversation
 */
export interface ConversationParticipant {
  id: string
  conversationId: string            // FK → conversations.id
  userId: string                    // FK → users.id
  unreadCount: number
  isMuted: boolean
  lastReadMessageId?: string        // FK → messages.id
  updatedAt: string
}
