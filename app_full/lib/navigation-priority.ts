import type { LucideIcon } from "lucide-react"
import {
  ShieldCheck,
  Camera,
  UserCog,
  Sparkles,
  Heart,
  BellRing,
  BadgeCheck,
  Search,
} from "lucide-react"

/**
 * Priority-based navigation system for Maratha.
 *
 * Each "task" represents a page a user may need to visit. Tasks declare
 * their priority, availability predicate, completion predicate, and
 * fallback metadata. The resolver returns the single highest-priority
 * task that is currently available and not yet complete.
 *
 * Priority scale (higher = more urgent):
 *   90-100  Blocking: account cannot be used meaningfully without this
 *   70-89   Critical: required to contact or be contacted
 *   50-69   Important: required for quality matches
 *   30-49   Recommended: improves experience
 *    1-29   Optional: nice-to-have
 *      0    Unspecified / lowest (assigned when priority is missing)
 */

export type UserState = {
  // Identity
  isEmailVerified: boolean
  isPhoneVerified: boolean
  // Profile
  hasPhoto: boolean
  hasBasicProfile: boolean
  hasHoroscope: boolean
  hasPreferences: boolean
  // Engagement
  hasBrowsedMatches: boolean
  hasSentFirstInterest: boolean
  // Account
  isPremium: boolean
}

export type NavigationTask = {
  id: string
  priority: number
  href: string
  title: string
  titleTamil: string
  description: string
  icon: LucideIcon
  /** True if this task can currently be shown to the user. */
  isAvailable: (state: UserState) => boolean
  /** True if this task is already finished and should be skipped. */
  isComplete: (state: UserState) => boolean
  /** Optional category for grouping in the UI. */
  category: "account" | "profile" | "preferences" | "engagement"
  /** Estimated time to complete, for UI hints. */
  estimateMinutes: number
}

/**
 * The registry is a plain array so new tasks can be added, removed, or
 * re-prioritized without touching consumer code. Order here does not
 * matter — the resolver always sorts by priority.
 */
export const NAVIGATION_TASKS: NavigationTask[] = [
  {
    id: "verify-phone",
    priority: 95,
    href: "/onboarding/verify-phone",
    title: "Verify your phone number",
    titleTamil: "தொலைபேசி எண்ணை சரிபார்க்கவும்",
    description:
      "Required to contact matches and receive important alerts about your profile.",
    icon: ShieldCheck,
    category: "account",
    estimateMinutes: 2,
    isAvailable: () => true,
    isComplete: (s) => s.isPhoneVerified,
  },
  {
    id: "verify-email",
    priority: 80,
    href: "/onboarding/verify-email",
    title: "Confirm your email address",
    titleTamil: "மின்னஞ்சலை உறுதிசெய்க",
    description: "We’ll send match updates and weekly horoscope digests here.",
    icon: BadgeCheck,
    category: "account",
    estimateMinutes: 1,
    isAvailable: () => true,
    isComplete: (s) => s.isEmailVerified,
  },
  {
    id: "complete-basic-profile",
    priority: 75,
    href: "/profile/create",
    title: "Complete your basic profile",
    titleTamil: "உங்கள் அடிப்படை சுயவிவரத்தை நிறைவு செய்க",
    description:
      "Height, community, education, and profession help us surface compatible matches.",
    icon: UserCog,
    category: "profile",
    estimateMinutes: 6,
    // Depends on account being verified first — not strictly required,
    // but we hold it back until at least one verification has happened.
    isAvailable: (s) => s.isPhoneVerified || s.isEmailVerified,
    isComplete: (s) => s.hasBasicProfile,
  },
  {
    id: "upload-photo",
    priority: 70,
    href: "/onboarding/photo",
    title: "Add a profile photo",
    titleTamil: "சுயவிவர படத்தைச் சேர்க்கவும்",
    description: "Profiles with a photo receive 8× more interest on Maratha.",
    icon: Camera,
    category: "profile",
    estimateMinutes: 2,
    isAvailable: (s) => s.hasBasicProfile,
    isComplete: (s) => s.hasPhoto,
  },
  {
    id: "add-horoscope",
    priority: 60,
    href: "/onboarding/horoscope",
    title: "Add your horoscope details",
    titleTamil: "ஜாதக விவரங்களைச் சேர்க்கவும்",
    description:
      "Enables 10-Porutham compatibility scoring against every match.",
    icon: Sparkles,
    category: "profile",
    estimateMinutes: 4,
    isAvailable: (s) => s.hasBasicProfile,
    isComplete: (s) => s.hasHoroscope,
  },
  {
    id: "set-preferences",
    priority: 55,
    href: "/onboarding/preferences",
    title: "Set your partner preferences",
    titleTamil: "துணை விருப்பங்களை அமைக்கவும்",
    description:
      "Tell us about age range, community, diet, and location you’re open to.",
    icon: Heart,
    category: "preferences",
    estimateMinutes: 3,
    isAvailable: (s) => s.hasBasicProfile,
    isComplete: (s) => s.hasPreferences,
  },
  {
    id: "browse-matches",
    priority: 35,
    href: "/matches",
    title: "Browse your curated matches",
    titleTamil: "பரிந்துரைக்கப்பட்ட பொருத்தங்களைப் பார்க்கவும்",
    description: "We’ve lined up profiles that meet your preferences.",
    icon: Search,
    category: "engagement",
    estimateMinutes: 5,
    isAvailable: (s) => s.hasPreferences && s.hasPhoto,
    isComplete: (s) => s.hasBrowsedMatches,
  },
  {
    id: "send-first-interest",
    priority: 25,
    href: "/matches",
    title: "Send your first interest",
    titleTamil: "முதல் ஆர்வத்தை அனுப்பவும்",
    description:
      "Express interest in a profile to start a conversation when they accept.",
    icon: BellRing,
    category: "engagement",
    estimateMinutes: 1,
    isAvailable: (s) => s.hasBrowsedMatches,
    isComplete: (s) => s.hasSentFirstInterest,
  },
]

/**
 * Category weights act as tiebreakers when two tasks share the same
 * priority. Account tasks always win, then profile, then preferences,
 * and finally engagement. Plain integers so they compose with priority.
 */
export const CATEGORY_WEIGHT: Record<NavigationTask["category"], number> = {
  account: 4,
  profile: 3,
  preferences: 2,
  engagement: 1,
}

/**
 * Canonical comparator used throughout the system.
 *
 * Decision criteria, in order:
 *   1. Higher `priority` wins.
 *   2. If tied, higher `CATEGORY_WEIGHT[category]` wins.
 *   3. If still tied, shorter `estimateMinutes` wins (quick wins first).
 *   4. If still tied, alphabetical `id` for deterministic ordering.
 *
 * Returns a negative number if `a` should come before `b`.
 */
export function comparePriority(a: NavigationTask, b: NavigationTask): number {
  const pa = normalizedPriority(a)
  const pb = normalizedPriority(b)
  if (pa !== pb) return pb - pa

  const ca = CATEGORY_WEIGHT[a.category] ?? 0
  const cb = CATEGORY_WEIGHT[b.category] ?? 0
  if (ca !== cb) return cb - ca

  const ea = Number.isFinite(a.estimateMinutes) ? a.estimateMinutes : Infinity
  const eb = Number.isFinite(b.estimateMinutes) ? b.estimateMinutes : Infinity
  if (ea !== eb) return ea - eb

  return a.id.localeCompare(b.id)
}

/** Safe fallback when no task matches — sends the user to the match list. */
export const FALLBACK_TASK: Pick<
  NavigationTask,
  "id" | "href" | "title" | "titleTamil" | "description" | "icon" | "priority"
> = {
  id: "fallback-browse",
  priority: 0,
  href: "/matches",
  title: "Browse matches",
  titleTamil: "பொருத்தங்களைப் பார்க்கவும்",
  description: "Everything looks good. Explore profiles curated for you.",
  icon: Search,
}

/**
 * Normalizes a task's priority. Missing / non-finite values become 0
 * so they sort below everything with an explicit priority.
 */
function normalizedPriority(task: Pick<NavigationTask, "priority">): number {
  const p = task.priority
  if (typeof p !== "number" || !Number.isFinite(p)) return 0
  return p
}

/**
 * Returns every incomplete, currently-available task sorted by priority
 * (highest first). Any task whose predicates throw is silently skipped
 * so a bad entry can’t break the queue for the whole app.
 */
export function resolveTaskQueue(
  state: UserState,
  tasks: NavigationTask[] = NAVIGATION_TASKS,
): NavigationTask[] {
  const candidates: NavigationTask[] = []
  for (const task of tasks) {
    try {
      if (!task.isAvailable(state)) continue
      if (task.isComplete(state)) continue
      candidates.push(task)
    } catch (err) {
      // A faulty predicate should not take down navigation for everyone.
      console.warn(`[v0] Skipping task "${task.id}" due to predicate error:`, err)
    }
  }
  return candidates.sort(comparePriority)
}

/**
 * Returns the single highest-priority task the user should handle next.
 * Falls back to FALLBACK_TASK when nothing is pending.
 */
export function resolveNextTask(
  state: UserState,
  tasks: NavigationTask[] = NAVIGATION_TASKS,
): NavigationTask | typeof FALLBACK_TASK {
  const queue = resolveTaskQueue(state, tasks)
  return queue[0] ?? FALLBACK_TASK
}

/**
 * Reason a task was excluded from the candidate pool.
 */
export type ExclusionReason =
  | "unavailable"
  | "already-complete"
  | "predicate-error"
  | "missing-priority"

export type DecisionTraceEntry = {
  task: NavigationTask
  included: boolean
  reason: ExclusionReason | "winner" | "runner-up"
  normalizedPriority: number
}

export type DecisionTrace = {
  /** The task that was picked, or the fallback if none qualified. */
  winner: NavigationTask | typeof FALLBACK_TASK
  /** Whether the winner came from the registry (true) or FALLBACK_TASK (false). */
  isFallback: boolean
  /** Ordered entries showing how each task was evaluated. */
  entries: DecisionTraceEntry[]
  /** A human-readable explanation of why the winner was chosen. */
  explanation: string
}

/**
 * Same as `resolveNextTask` but returns a full decision trace for
 * debugging, analytics, or rendering a "why did I land here?" UI.
 * Wrapped in try/catch end-to-end so a malformed registry can never
 * leave the app without a destination.
 */
export function resolveNextTaskWithTrace(
  state: UserState,
  tasks: NavigationTask[] = NAVIGATION_TASKS,
): DecisionTrace {
  const entries: DecisionTraceEntry[] = []
  const candidates: NavigationTask[] = []

  try {
    for (const task of tasks) {
      const normalized = normalizedPriority(task)
      const hasMissingPriority =
        typeof task.priority !== "number" || !Number.isFinite(task.priority)

      try {
        if (!task.isAvailable(state)) {
          entries.push({
            task,
            included: false,
            reason: "unavailable",
            normalizedPriority: normalized,
          })
          continue
        }
        if (task.isComplete(state)) {
          entries.push({
            task,
            included: false,
            reason: "already-complete",
            normalizedPriority: normalized,
          })
          continue
        }
        if (hasMissingPriority) {
          console.warn(
            `[v0] Task "${task.id}" has missing or invalid priority; defaulting to 0.`,
          )
          entries.push({
            task,
            included: true,
            reason: "missing-priority",
            normalizedPriority: 0,
          })
        } else {
          entries.push({
            task,
            included: true,
            reason: "runner-up",
            normalizedPriority: normalized,
          })
        }
        candidates.push(task)
      } catch (err) {
        console.warn(`[v0] Skipping task "${task.id}" due to predicate error:`, err)
        entries.push({
          task,
          included: false,
          reason: "predicate-error",
          normalizedPriority: normalized,
        })
      }
    }
  } catch (err) {
    // Complete safety net: the registry itself failed us.
    console.error("[v0] Priority resolver crashed, using fallback:", err)
    return {
      winner: FALLBACK_TASK,
      isFallback: true,
      entries,
      explanation:
        "An unexpected error occurred while evaluating priorities. Routed to the safe fallback.",
    }
  }

  candidates.sort(comparePriority)

  if (candidates.length === 0) {
    return {
      winner: FALLBACK_TASK,
      isFallback: true,
      entries,
      explanation:
        "Every registered task is either unavailable or already complete. Routed to the fallback page.",
    }
  }

  const [winner, ...rest] = candidates
  // Mark the winner in the trace so UIs can highlight it.
  for (const entry of entries) {
    if (entry.task.id === winner.id && entry.included) {
      entry.reason = "winner"
    }
  }

  const runnerUp = rest[0]
  const explanation = runnerUp
    ? `"${winner.title}" won with priority ${normalizedPriority(winner)} (category: ${winner.category}). ` +
      `Runner-up "${runnerUp.title}" had priority ${normalizedPriority(runnerUp)}.`
    : `"${winner.title}" is the only pending task (priority ${normalizedPriority(winner)}).`

  return { winner, isFallback: false, entries, explanation }
}

/**
 * Overall onboarding progress across the registry, for display.
 * Uses only tasks that are currently available to the user so the
 * percentage reflects what they can actually act on today.
 */
export function computeProgress(
  state: UserState,
  tasks: NavigationTask[] = NAVIGATION_TASKS,
): { completed: number; total: number; percent: number } {
  let completed = 0
  let total = 0
  for (const task of tasks) {
    try {
      if (!task.isAvailable(state)) continue
      total += 1
      if (task.isComplete(state)) completed += 1
    } catch {
      // ignore broken predicates in progress calc too
    }
  }
  const percent = total === 0 ? 100 : Math.round((completed / total) * 100)
  return { completed, total, percent }
}

/**
 * Mock current-user state. In production this comes from the authenticated
 * session / profile API. Tweak these flags to watch the dashboard re-rank.
 */
export const MOCK_USER_STATE: UserState = {
  isEmailVerified: true,
  isPhoneVerified: false, // highest-priority pending task
  hasPhoto: false,
  hasBasicProfile: true,
  hasHoroscope: false,
  hasPreferences: false,
  hasBrowsedMatches: false,
  hasSentFirstInterest: false,
  isPremium: false,
}

export const MOCK_USER = {
  firstName: "Aarthi",
  firstNameTamil: "ஆர்த்தி",
}
