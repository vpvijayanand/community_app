// TODO: REMOVE — This file is part of the b_wLvLYDaLXZH prototype. Safe to delete with the whole directory.
"use client"

import { useSyncExternalStore } from "react"

/* ----------------------------- Types ----------------------------- */

export type ReadingProgress = {
  percent: number // 0–100
  updatedAt: number
}

type State = {
  bookmarks: string[] // slugs, newest first
  progress: Record<string, ReadingProgress>
}

type Listener = () => void

/* ------------------------- Vanilla Store ------------------------- */

let state: State = { bookmarks: [], progress: {} }
const listeners = new Set<Listener>()

function emit() {
  listeners.forEach((l) => l())
}

function subscribe(l: Listener) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

/* ---------------------------- Public ---------------------------- */

export const readerStore = {
  getSnapshot: () => state,
  subscribe,

  isBookmarked(slug: string) {
    return state.bookmarks.includes(slug)
  },

  toggleBookmark(slug: string): boolean {
    const has = state.bookmarks.includes(slug)
    state = has
      ? { ...state, bookmarks: state.bookmarks.filter((s) => s !== slug) }
      : { ...state, bookmarks: [slug, ...state.bookmarks] }
    emit()
    return !has // returns new state
  },

  saveProgress(slug: string, percent: number) {
    // Ignore trivial scroll events so we don't mark a quick glance as "reading".
    const clamped = Math.max(0, Math.min(100, Math.round(percent)))
    const prev = state.progress[slug]
    // Only write if it moved by at least 2% or content finished.
    if (prev && Math.abs(prev.percent - clamped) < 2 && clamped < 95) return
    state = {
      ...state,
      progress: {
        ...state.progress,
        [slug]: { percent: clamped, updatedAt: Date.now() },
      },
    }
    emit()
  },

  clearProgress(slug: string) {
    if (!state.progress[slug]) return
    const next = { ...state.progress }
    delete next[slug]
    state = { ...state, progress: next }
    emit()
  },
}

/* ----------------------------- Hooks ----------------------------- */

const EMPTY_BOOKMARKS: string[] = []
const EMPTY_PROGRESS: Record<string, ReadingProgress> = {}

export function useBookmarks(): string[] {
  return useSyncExternalStore(
    subscribe,
    () => state.bookmarks,
    () => EMPTY_BOOKMARKS,
  )
}

export function useIsBookmarked(slug: string): boolean {
  return useSyncExternalStore(
    subscribe,
    () => state.bookmarks.includes(slug),
    () => false,
  )
}

export function useProgress(slug: string): ReadingProgress | null {
  return useSyncExternalStore(
    subscribe,
    () => state.progress[slug] ?? null,
    () => null,
  )
}

export function useProgressMap(): Record<string, ReadingProgress> {
  return useSyncExternalStore(
    subscribe,
    () => state.progress,
    () => EMPTY_PROGRESS,
  )
}
