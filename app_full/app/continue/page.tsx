import { redirect } from "next/navigation"
import {
  MOCK_USER_STATE,
  resolveNextTaskWithTrace,
} from "@/lib/navigation-priority"

/**
 * Automatic priority-based navigation endpoint.
 *
 * Evaluates the current user's state against the task registry, picks
 * the highest-priority pending task, and redirects there. On any error
 * it falls back to a safe destination (/matches) instead of crashing.
 *
 * This is the single entry point the app uses whenever it wants to
 * "send the user to the right place" — e.g. after login, after email
 * verification, or from a generic "Continue" CTA.
 */
export default function ContinuePage() {
  let href = "/matches"
  try {
    const trace = resolveNextTaskWithTrace(MOCK_USER_STATE)
    href = trace.winner.href
  } catch (err) {
    console.error("[v0] /continue resolver failed; using fallback:", err)
    href = "/matches"
  }
  redirect(href)
}
