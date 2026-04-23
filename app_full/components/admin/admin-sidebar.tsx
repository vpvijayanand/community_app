"use client"

import Link from "next/link"
import {
  LayoutDashboard,
  Newspaper,
  GraduationCap,
  Megaphone,
  Users,
  HeartHandshake,
  Settings,
  LifeBuoy,
} from "lucide-react"
import { cn } from "@/lib/utils"

const ITEMS = [
  { label: "Dashboard", href: "/admin", Icon: LayoutDashboard },
  { label: "News", href: "/admin/news", Icon: Newspaper },
  { label: "Learning", href: "/admin/learning", Icon: GraduationCap },
  { label: "Advertisements", href: "/admin/ads", Icon: Megaphone },
  { label: "Users", href: "/admin/users", Icon: Users },
  { label: "Matrimony", href: "/admin/matrimony", Icon: HeartHandshake },
  { label: "Settings", href: "/admin/settings", Icon: Settings },
]

export function AdminSidebar({ activeHref = "/admin/news" }: { activeHref?: string }) {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-border-light bg-bg-surface md:block">
      <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto px-3 py-6">
        <div className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
          Admin Panel
        </div>
        <nav className="space-y-1">
          {ITEMS.map(({ label, href, Icon }) => {
            const active = href === activeHref
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent-light text-primary border-r-[3px] border-primary rounded-r-none font-semibold"
                    : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary",
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-8 rounded-xl border border-border-light bg-bg-white p-4">
          <div className="flex items-center gap-2">
            <LifeBuoy className="h-4 w-4 text-accent" />
            <span className="text-xs font-semibold text-text-primary">
              Need help?
            </span>
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-text-muted">
            Reach the editorial council at{" "}
            <span className="text-primary">council@mathat.org</span>
          </p>
        </div>
      </div>
    </aside>
  )
}
