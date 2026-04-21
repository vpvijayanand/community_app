/**
 * Admin & Platform Settings Models
 *
 * Table: platform_settings
 */
export interface PlatformSetting {
  id: string
  key: string                       // unique, indexed
  value: string                     // JSON-encoded value
  description?: string
  updatedBy?: string                // FK → users.id (admin)
  updatedAt: string
}

/**
 * Known platform setting keys:
 *  - "chat_limit_basic"       → 0
 *  - "chat_limit_silver"      → 10
 *  - "chat_limit_gold"        → 50
 *  - "profile_view_limit_basic"   → 5
 *  - "profile_view_limit_silver"  → 10
 *  - "profile_view_limit_gold"    → 50
 *  - "max_photos_per_profile"     → 5
 *  - "auto_approve_profiles"      → false
 *  - "maintenance_mode"           → false
 */

/**
 * Table: admin_audit_log
 */
export interface AdminAuditLog {
  id: string
  adminUserId: string               // FK → users.id
  action: string                    // "approve_profile", "ban_user", etc.
  targetType: "user" | "profile" | "news" | "ad" | "subscription" | "setting"
  targetId: string
  details?: Record<string, unknown> // JSON
  ipAddress?: string
  createdAt: string
}

/**
 * Table: analytics_snapshots
 * Daily aggregated stats for the admin dashboard
 */
export interface AnalyticsSnapshot {
  id: string
  date: string                      // YYYY-MM-DD
  totalUsers: number
  activeUsersThisMonth: number
  newUsersThisWeek: number
  pendingApprovals: number
  totalBasic: number
  totalSilver: number
  totalGold: number
  totalRevenue: number              // INR for the month
  totalMatches: number
  totalMessages: number
  createdAt: string
}
