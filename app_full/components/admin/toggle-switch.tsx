"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

type ToggleProps = {
  title: string
  description?: string
  defaultOn?: boolean
  last?: boolean
  checked?: boolean
  onCheckedChange?: (next: boolean) => void
}

export function ToggleSwitch({
  title,
  description,
  defaultOn = false,
  last = false,
  checked,
  onCheckedChange,
}: ToggleProps) {
  const [internal, setInternal] = useState(defaultOn)
  const isControlled = typeof checked === "boolean"
  const on = isControlled ? (checked as boolean) : internal

  const toggle = () => {
    const next = !on
    if (!isControlled) setInternal(next)
    onCheckedChange?.(next)
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 py-4",
        !last && "border-b border-border-light",
      )}
    >
      <div className="min-w-0">
        <div className="text-sm font-medium text-text-primary">{title}</div>
        {description && (
          <div className="mt-0.5 text-[12px] text-text-muted">{description}</div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={toggle}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          on ? "bg-primary" : "bg-[#d3d1c7]",
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
            on ? "translate-x-[22px]" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  )
}
