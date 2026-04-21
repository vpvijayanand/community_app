/**
 * Subscription Model
 *
 * Table: subscription_plans
 */
export interface SubscriptionPlan {
  id: string
  name: "basic" | "silver" | "gold"
  nameTamil: string                 // "அடிப்படை", "வெள்ளி", "தங்கம்"
  priceMonthly: number              // INR
  priceYearly: number               // INR
  profileViewsPerMonth: number      // 5, 10, 50
  chatConversationsPerMonth: number // 0, 10, 50
  canViewAstrology: boolean
  canViewPhotos: boolean            // unblurred
  canViewSalary: boolean
  canViewContact: boolean
  priorityInSearch: boolean
  showBadge: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Table: user_subscriptions
 */
export interface UserSubscription {
  id: string
  userId: string                    // FK → users.id
  planId: string                    // FK → subscription_plans.id
  tier: "basic" | "silver" | "gold"
  status: "active" | "expired" | "cancelled" | "pending"
  startDate: string                 // ISO
  endDate: string                   // ISO
  autoRenew: boolean
  paymentId?: string                // FK → payments.id
  createdAt: string
  updatedAt: string
}

/**
 * Table: payments
 */
export interface Payment {
  id: string
  userId: string                    // FK → users.id
  subscriptionId: string            // FK → user_subscriptions.id
  amount: number                    // INR
  currency: string                  // "INR"
  gateway: "razorpay" | "stripe" | "manual"
  gatewayPaymentId?: string
  gatewayOrderId?: string
  status: "pending" | "success" | "failed" | "refunded"
  receiptUrl?: string
  paidAt?: string
  createdAt: string
}

/**
 * Table: usage_tracking
 * Monthly usage counters per user
 */
export interface UsageTracking {
  id: string
  userId: string                    // FK → users.id
  month: string                     // "2026-04"
  profileViews: number              // count this month
  chatInitiations: number           // conversations started this month
  interestsSent: number
  createdAt: string
  updatedAt: string
}
