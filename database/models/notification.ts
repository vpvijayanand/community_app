/**
 * Notification Model
 *
 * Table: notifications
 */
export interface Notification {
  id: string
  userId: string                    // FK → users.id (recipient)
  type: NotificationType
  title: string
  titleTamil: string
  message: string
  messageTamil: string
  data?: Record<string, unknown>    // JSON payload (profileId, matchId, etc.)
  isRead: boolean
  readAt?: string
  createdAt: string
}

export type NotificationType =
  | "interest_received"
  | "interest_accepted"
  | "interest_declined"
  | "new_match"
  | "new_message"
  | "profile_approved"
  | "profile_rejected"
  | "subscription_expiring"
  | "subscription_renewed"
  | "system_announcement"
  | "news_published"

/**
 * Table: notification_preferences
 */
export interface NotificationPreference {
  id: string
  userId: string                    // FK → users.id, unique
  emailInterest: boolean
  emailMatch: boolean
  emailMessage: boolean
  emailNews: boolean
  pushInterest: boolean
  pushMatch: boolean
  pushMessage: boolean
  pushNews: boolean
  updatedAt: string
}
