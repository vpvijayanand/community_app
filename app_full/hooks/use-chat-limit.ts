"use client"

import { useMemo } from "react"
import {
  CHAT_LIMITS,
  CURRENT_USER_CHATS_USED,
  CURRENT_USER_SUBSCRIPTION,
  type SubscriptionTier,
} from "@/lib/chat-data"

export interface ChatLimitResult {
  used: number
  limit: number
  canSendMore: boolean
  percentUsed: number
  isAtLimit: boolean
  isNearLimit: boolean    // ≥80%
  tier: SubscriptionTier
  canAccessChat: boolean  // false for basic
}

/**
 * useChatLimit
 * Returns the current user's monthly chat usage stats.
 * In production: swap `used` / `tier` with data from React Query /chat/limit.
 */
export function useChatLimit(): ChatLimitResult {
  const tier = CURRENT_USER_SUBSCRIPTION
  const used = CURRENT_USER_CHATS_USED
  const limit = CHAT_LIMITS[tier]

  return useMemo(() => {
    const percentUsed = limit === 0 ? 100 : Math.round((used / limit) * 100)
    const canSendMore = tier !== "basic" && used < limit
    return {
      used,
      limit,
      canSendMore,
      percentUsed,
      isAtLimit: tier !== "basic" && used >= limit,
      isNearLimit: percentUsed >= 80 && !( used >= limit ),
      tier,
      canAccessChat: tier !== "basic",
    }
  }, [tier, used, limit])
}
