"use client"

import { Gift, Lock, Users, Crown, BadgeIndianRupee } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  type Pricing,
  type Currency,
  type AccessTier,
  CURRENCY_SYMBOL,
} from "@/lib/news-store"

const fieldClass =
  "w-full rounded-lg border-[1.5px] border-border-light bg-bg-page px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-primary focus:bg-bg-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
      {children}
    </span>
  )
}

const ACCESS_OPTIONS: {
  key: AccessTier
  label: string
  Icon: React.ComponentType<{ className?: string }>
  hint: string
}[] = [
  { key: "all-members", label: "All members", Icon: Users, hint: "Anyone signed in" },
  { key: "paid-members", label: "Paid members", Icon: Lock, hint: "Requires subscription" },
  { key: "life-members", label: "Life members", Icon: Crown, hint: "Lifetime supporters only" },
]

export function PricingSection({
  value,
  onChange,
  error,
}: {
  value: Pricing
  onChange: (next: Pricing) => void
  error?: string
}) {
  const isPaid = value.tier === "paid"

  const update = <K extends keyof Pricing>(key: K, v: Pricing[K]) =>
    onChange({ ...value, [key]: v })

  return (
    <div className="space-y-5">
      {/* Free / Paid segmented switch */}
      <div>
        <Label>Monetization</Label>
        <div
          role="tablist"
          aria-label="Pricing tier"
          className="grid grid-cols-2 gap-0 overflow-hidden rounded-xl border-[1.5px] border-border-light bg-bg-page p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={!isPaid}
            onClick={() => update("tier", "free")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-[13px] font-semibold transition-all",
              !isPaid
                ? "bg-bg-white text-primary shadow-sm"
                : "text-text-muted hover:text-text-primary",
            )}
          >
            <Gift className="h-4 w-4" />
            Free to read
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isPaid}
            onClick={() => update("tier", "paid")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-[13px] font-semibold transition-all",
              isPaid
                ? "bg-bg-white text-primary shadow-sm"
                : "text-text-muted hover:text-text-primary",
            )}
          >
            <BadgeIndianRupee className="h-4 w-4" />
            Paid / Premium
          </button>
        </div>
        <p className="mt-2 text-[12px] text-text-muted">
          {isPaid
            ? "Readers will see a preview, then be prompted to subscribe or pay."
            : "Every community member can read the full article at no cost."}
        </p>
      </div>

      {/* Paid controls */}
      <div
        className={cn(
          "grid gap-4 transition-all",
          isPaid ? "opacity-100" : "pointer-events-none opacity-50",
        )}
        aria-hidden={!isPaid}
      >
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_1fr]">
          <div>
            <Label>Price</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-text-muted">
                {CURRENCY_SYMBOL[value.currency]}
              </span>
              <input
                type="number"
                min={0}
                step={1}
                inputMode="decimal"
                disabled={!isPaid}
                value={value.price || ""}
                onChange={(e) => update("price", Number(e.target.value) || 0)}
                placeholder="249"
                className={cn(fieldClass, "pl-9")}
              />
            </div>
          </div>
          <div>
            <Label>Currency</Label>
            <select
              disabled={!isPaid}
              value={value.currency}
              onChange={(e) => update("currency", e.target.value as Currency)}
              className={fieldClass}
            >
              <option value="INR">INR — Indian Rupee</option>
              <option value="USD">USD — US Dollar</option>
              <option value="SGD">SGD — Singapore Dollar</option>
              <option value="MYR">MYR — Malaysian Ringgit</option>
            </select>
          </div>
          <div>
            <Label>Free preview</Label>
            <div className="flex items-center gap-3 rounded-lg border-[1.5px] border-border-light bg-bg-page px-3 py-2">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                disabled={!isPaid}
                value={value.previewPercent}
                onChange={(e) =>
                  update("previewPercent", Number(e.target.value))
                }
                className="h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-border-light accent-[var(--primary)] disabled:cursor-not-allowed"
                aria-label="Free preview percent"
              />
              <span className="w-10 text-right font-tamil text-sm font-bold text-primary">
                {value.previewPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Access tier */}
        <div>
          <Label>Who can access this article?</Label>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {ACCESS_OPTIONS.map((o) => {
              const active = value.access === o.key
              return (
                <button
                  key={o.key}
                  type="button"
                  disabled={!isPaid && o.key !== "all-members"}
                  onClick={() => update("access", o.key)}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border-[1.5px] px-3.5 py-3 text-left transition-all",
                    active
                      ? "border-primary bg-[#FCEBEB]"
                      : "border-border-light bg-bg-page hover:border-border-medium",
                    !isPaid && o.key !== "all-members" && "cursor-not-allowed opacity-50",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-bg-subtle text-text-secondary",
                    )}
                  >
                    <o.Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-text-primary">
                      {o.label}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-text-muted">
                      {o.hint}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Support note */}
        <div>
          <Label>Note to readers (optional)</Label>
          <input
            type="text"
            disabled={!isPaid}
            value={value.supportNote || ""}
            onChange={(e) => update("supportNote", e.target.value)}
            placeholder="e.g. Your contribution funds our Tamil learning programs."
            className={fieldClass}
          />
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-danger/40 bg-[#FCEBEB] px-3.5 py-2.5 text-[13px] font-medium text-danger"
        >
          {error}
        </div>
      )}
    </div>
  )
}
