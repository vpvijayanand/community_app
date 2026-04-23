"use client"

import { useEffect, useRef, useState } from "react"
import { readerStore } from "@/lib/reader-store"

export function ReadingProgressBar({
  slug,
  targetRef,
}: {
  slug: string
  targetRef: React.RefObject<HTMLElement | null>
}) {
  const [percent, setPercent] = useState(0)
  const rafRef = useRef<number | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const compute = () => {
      const el = targetRef.current
      if (!el) return 0
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const total = el.offsetHeight - vh
      if (total <= 0) return 100
      const scrolled = Math.min(total, Math.max(0, -rect.top))
      return Math.round((scrolled / total) * 100)
    }

    const onScroll = () => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        const p = compute()
        setPercent(p)
        rafRef.current = null

        // Debounce persisting progress to the store
        if (saveTimer.current) clearTimeout(saveTimer.current)
        saveTimer.current = setTimeout(() => {
          readerStore.saveProgress(slug, p)
        }, 400)
      })
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [slug, targetRef])

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-16 z-40 h-0.5 bg-transparent"
      aria-hidden
    >
      <div
        className="h-full bg-accent transition-[width] duration-150 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
