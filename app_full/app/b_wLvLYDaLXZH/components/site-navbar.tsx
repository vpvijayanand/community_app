"use client"

import Link from "next/link"
import { Bookmark, Flame, Menu, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useBookmarks } from "@/lib/reader-store"

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "News", href: "/news" },
  { label: "Matrimony", href: "/matrimony" },
  { label: "Learning", href: "/learning" },
  { label: "Events", href: "/events" },
]

export function SiteNavbar({
  activeHref = "/news",
  adminBadge = false,
}: {
  activeHref?: string
  adminBadge?: boolean
}) {
  const [open, setOpen] = useState(false)
  const bookmarks = useBookmarks()
  const savedCount = bookmarks.length

  return (
    <header className="sticky top-0 z-50 w-full bg-primary-deep text-white">
      {/* soft kolam texture */}
      <div className="absolute inset-0 kolam-dots-soft pointer-events-none" aria-hidden />
      <div className="relative mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 md:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary-deep shadow-sm">
            <Flame className="h-5 w-5" strokeWidth={2.4} />
          </div>
          <div className="leading-tight">
            <div className="font-tamil text-lg font-semibold tracking-wide">
              மாதத் சமூகம்
            </div>
            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-accent">
              Mathat Community
            </div>
          </div>
          {adminBadge && (
            <span className="ml-2 hidden rounded-full border border-accent/50 bg-accent/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent md:inline-block">
              Admin
            </span>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = link.href === activeHref
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/75 hover:text-white hover:bg-white/5",
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-2">
          <Link
            href="/news/saved"
            aria-label={
              savedCount
                ? `Saved articles (${savedCount})`
                : "Saved articles"
            }
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Bookmark className="h-4 w-4" />
            {savedCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 font-tamil text-[10px] font-bold text-primary-deep">
                {savedCount > 99 ? "99+" : savedCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/login"
            className="hidden md:inline-flex h-9 items-center rounded-full bg-accent px-5 text-sm font-semibold text-primary-deep transition-colors hover:bg-[#f1b85a]"
          >
            Login / Join
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/5 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="relative border-t border-white/10 bg-primary-deep md:hidden">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-1 px-4 py-3">
            {NAV_LINKS.map((link) => {
              const active = link.href === activeHref
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium",
                    active ? "bg-white/10 text-white" : "text-white/80",
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex h-10 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-primary-deep"
            >
              Login / Join
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
