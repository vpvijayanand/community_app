"use client"

import { Bookmark, BookmarkCheck } from "lucide-react"
import { toast } from "sonner"
import { readerStore, useIsBookmarked } from "@/lib/reader-store"
import { cn } from "@/lib/utils"

type Variant = "pill" | "icon" | "inline"

export function SaveButton({
  slug,
  title,
  variant = "pill",
  className,
}: {
  slug: string
  title?: string
  variant?: Variant
  className?: string
}) {
  const saved = useIsBookmarked(slug)

  const handle = (e: React.MouseEvent) => {
    // Cards often wrap SaveButton inside a stretched-link; stop both.
    e.preventDefault()
    e.stopPropagation()
    const nowSaved = readerStore.toggleBookmark(slug)
    if (nowSaved) {
      toast.success("Saved to your reading list", {
        description: title ?? "You can continue reading anytime from Saved.",
        action: {
          label: "View saved",
          onClick: () => {
            window.location.href = "/news/saved"
          },
        },
      })
    } else {
      toast("Removed from saved", {
        description: title ?? "This article is no longer in your list.",
      })
    }
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handle}
        aria-pressed={saved}
        aria-label={saved ? "Remove from saved" : "Save for later"}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur transition-colors",
          saved
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border-medium bg-bg-white text-text-secondary hover:border-primary hover:text-primary",
          className,
        )}
      >
        {saved ? (
          <BookmarkCheck className="h-4 w-4" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
      </button>
    )
  }

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={handle}
        aria-pressed={saved}
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-semibold transition-colors",
          saved ? "text-primary" : "text-text-muted hover:text-primary",
          className,
        )}
      >
        {saved ? (
          <BookmarkCheck className="h-3.5 w-3.5" />
        ) : (
          <Bookmark className="h-3.5 w-3.5" />
        )}
        {saved ? "Saved" : "Save"}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handle}
      aria-pressed={saved}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
        saved
          ? "border-primary bg-primary text-primary-foreground hover:bg-primary-dark"
          : "border-border-medium bg-bg-white text-text-primary hover:border-primary hover:text-primary",
        className,
      )}
    >
      {saved ? (
        <>
          <BookmarkCheck className="h-4 w-4" />
          Saved
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" />
          Save for later
        </>
      )}
    </button>
  )
}
