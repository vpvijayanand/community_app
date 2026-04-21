/**
 * User Model — Authentication & account-level data
 *
 * Table: users
 */
export interface User {
  id: string                        // UUID primary key
  email: string                     // unique, indexed
  phone?: string                    // optional, unique
  passwordHash?: string             // null for OAuth-only users
  role: "guest" | "user" | "admin"
  isActive: boolean                 // soft-disable
  isEmailVerified: boolean
  lastLoginAt?: string              // ISO datetime
  lastActiveAt?: string             // ISO datetime
  languagePreference: "ta" | "en"
  createdAt: string                 // ISO datetime
  updatedAt: string                 // ISO datetime
}

/**
 * Table: oauth_accounts
 * One user can have multiple OAuth providers
 */
export interface OAuthAccount {
  id: string
  userId: string                    // FK → users.id
  provider: "google" | "facebook"
  providerAccountId: string         // unique per provider
  accessToken?: string
  refreshToken?: string
  expiresAt?: string
  createdAt: string
}

/**
 * Table: sessions
 */
export interface Session {
  id: string
  userId: string                    // FK → users.id
  token: string                     // JWT or opaque token, indexed
  deviceInfo?: string               // user-agent string
  ipAddress?: string
  expiresAt: string
  createdAt: string
}
