import { Lock, ShieldCheck } from "lucide-react"
import type { Pricing } from "@/lib/news-store"
import { formatPrice } from "@/lib/news-store"

export function PaywallCard({
  pricing,
  supportNote,
}: {
  pricing: Pricing
  supportNote?: string
}) {
  const accessLabel =
    pricing.access === "life-members"
      ? "Life members only"
      : pricing.access === "paid-members"
        ? "Paid members only"
        : "All members"

  return (
    <div className="relative my-10 overflow-hidden rounded-2xl border border-accent/40 bg-gradient-to-b from-accent-light to-bg-white p-8 text-center">
      <div className="absolute inset-0 kolam-dots opacity-40" aria-hidden />
      <div className="relative">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary-deep text-primary-foreground">
          <Lock className="h-5 w-5" />
        </span>
        <h3 className="mt-4 font-tamil text-2xl font-bold text-text-primary">
          தொடர்ந்து படிக்க — Continue Reading
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-text-secondary">
          {supportNote?.trim()
            ? supportNote
            : "The rest of this article is reserved for our community supporters. Your contribution keeps the editorial desk independent and the archive open."}
        </p>

        <div className="mx-auto mt-6 flex max-w-sm items-center justify-between rounded-xl border border-border-light bg-bg-white px-5 py-4 text-left">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
              Single article
            </div>
            <div className="mt-0.5 font-tamil text-2xl font-bold text-primary-deep">
              {formatPrice(pricing)}
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-accent-light px-3 py-1 text-[11px] font-semibold text-primary-deep">
            <ShieldCheck className="h-3.5 w-3.5" />
            {accessLabel}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            className="inline-flex h-11 items-center rounded-full bg-primary-deep px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary"
          >
            Unlock for {formatPrice(pricing)}
          </button>
          <button
            type="button"
            className="inline-flex h-11 items-center rounded-full border border-border-medium bg-bg-white px-6 text-sm font-semibold text-text-primary transition-colors hover:border-primary hover:text-primary"
          >
            Become a member
          </button>
        </div>

        <p className="mt-4 text-[11px] text-text-muted">
          Secure checkout · Support independent Tamil community journalism
        </p>
      </div>
    </div>
  )
}
