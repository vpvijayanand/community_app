"use client"

import { useLang } from "@/hooks/use-lang"
import { cn } from "@/lib/utils"

/**
 * Compact pill toggle for Tamil ↔ English.
 * Saves to localStorage and updates document lang attribute.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLang()

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-card p-0.5 shadow-sm",
        className,
      )}
      role="radiogroup"
      aria-label="Language selection"
    >
      <button
        type="button"
        role="radio"
        aria-checked={lang === "ta"}
        aria-label="தமிழ்"
        onClick={() => setLang("ta")}
        className={cn(
          "rounded-full px-3 py-1.5 text-xs font-bold transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center",
          lang === "ta"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-secondary",
        )}
      >
        த
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={lang === "en"}
        aria-label="English"
        onClick={() => setLang("en")}
        className={cn(
          "rounded-full px-3 py-1.5 text-xs font-bold transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center",
          lang === "en"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-secondary",
        )}
      >
        En
      </button>
    </div>
  )
}
