"use client"

import { useMemo } from "react"
import {
  FALLBACK_TASK,
  MOCK_USER_STATE,
  type DecisionTrace,
  type UserState,
  resolveNextTaskWithTrace,
} from "@/lib/navigation-priority"

/**
 * Reactively compute the highest-priority task for the given user
 * state. Defaults to the mock state so components can use this hook
 * without threading props. In production, pass a state object derived
 * from the authenticated session.
 *
 * Always returns a decision trace — never throws. If resolution fails
 * for any reason, the fallback task is returned and `isFallback` is true.
 */
export function useNextTask(state: UserState = MOCK_USER_STATE): DecisionTrace {
  return useMemo(() => {
    try {
      return resolveNextTaskWithTrace(state)
    } catch (err) {
      console.error("[v0] useNextTask resolver failed; using fallback:", err)
      return {
        winner: FALLBACK_TASK,
        isFallback: true,
        entries: [],
        explanation:
          "Resolver threw unexpectedly; falling back to the safe destination.",
      }
    }
  }, [state])
}
