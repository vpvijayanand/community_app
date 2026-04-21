/**
 * Maratha Matrimony — Database Models Index
 *
 * All TypeScript interfaces representing the database schema.
 * These map 1:1 to backend database tables.
 *
 * ┌─────────────────────────────────────────────────────┐
 * │  ENTITY RELATIONSHIP OVERVIEW                       │
 * │                                                     │
 * │  User ──┬── Profile ──┬── ProfileSibling            │
 * │         │             ├── ProfilePhoto               │
 * │         │             ├── ProfileExpectation          │
 * │         │             └── AstrologyDetails            │
 * │         │                  └── PlanetPosition         │
 * │         │                                            │
 * │         ├── UserSubscription ── Payment              │
 * │         ├── UsageTracking                            │
 * │         ├── OAuthAccount                             │
 * │         ├── Session                                  │
 * │         ├── Notification                             │
 * │         ├── NotificationPreference                   │
 * │         │                                            │
 * │         ├── Interest (from/to)                       │
 * │         ├── Shortlist                                │
 * │         ├── Block                                    │
 * │         ├── Report                                   │
 * │         ├── ProfileView                              │
 * │         │                                            │
 * │         ├── Conversation ── Message                  │
 * │         │     └── ConversationParticipant            │
 * │         │                                            │
 * │  MatchScore (profile ↔ profile)                     │
 * │  CompatibilityResult (profile ↔ profile)            │
 * │                                                     │
 * │  NewsPost, LearningArticle, Ad (admin-managed)      │
 * │  PlatformSetting, AdminAuditLog, AnalyticsSnapshot  │
 * │  SubscriptionPlan                                   │
 * └─────────────────────────────────────────────────────┘
 */

// Auth & Users
export type { User, OAuthAccount, Session } from "./user"

// Profile (8-step wizard)
export type { Profile, ProfileSibling, ProfilePhoto, ProfileExpectation } from "./profile"

// Astrology
export type {
  AstrologyDetails,
  PlanetPosition,
  PlanetCode,
  CompatibilityResult,
  PoruthamResult,
  PoruthamName,
} from "./astrology"

// Subscriptions & Payments
export type {
  SubscriptionPlan,
  UserSubscription,
  Payment,
  UsageTracking,
} from "./subscription"

// Matching & Social
export type {
  Interest,
  Shortlist,
  ProfileView,
  MatchScore,
  Block,
  Report,
} from "./match"

// Chat
export type { Conversation, Message, ConversationParticipant } from "./chat"

// Content
export type { NewsPost, LearningArticle, Ad } from "./content"

// Notifications
export type { Notification, NotificationType, NotificationPreference } from "./notification"

// Admin
export type { PlatformSetting, AdminAuditLog, AnalyticsSnapshot } from "./admin"
