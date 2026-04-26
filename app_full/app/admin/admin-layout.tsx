"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

const NAV = [
  { href: "/admin",                   label: "Dashboard"      },
  { href: "/admin/users",             label: "Users"          },
  { href: "/admin/profiles",          label: "Approvals"      },
  { href: "/admin/astrology",         label: "Astrology ✦"    },
  { href: "/admin/astrology/history", label: "  ↳ History"    },
  { href: "/admin/astrology/deleted", label: "  ↳ Deleted"    },
  { href: "/porutham",                label: "Porutham ✦"    },
  { href: "/admin/porutham/history",  label: "  ↳ History"    },
  { href: "/admin/news",              label: "News"           },
  { href: "/admin/ads",               label: "Ads"            },
  { href: "/admin/subscriptions",     label: "Subscriptions"  },
  { href: "/admin/settings",          label: "Settings"       },
]

type Props = {
  children: ReactNode
  activeHref: string
  title: string
}

/**
 * Shared Admin Layout — uses the main app's CSS design tokens
 * (bg-background, bg-card, text-primary, border-border, font-serif)
 * so the admin panel visually matches the main Maratha app.
 */
export function AdminLayout({ children, activeHref, title }: Props) {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* ── Header ── */}
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="font-serif text-xl font-semibold tracking-wide text-foreground">
            Maratha{" "}
            <span className="text-primary">Admin</span>
          </Link>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            Admin Panel
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-foreground">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          {user && (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              {user.firstName[0]}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ── */}
        <aside className="w-56 shrink-0 border-r border-border bg-card hidden md:flex flex-col">
          <nav className="p-3 space-y-0.5 flex-1">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  href === activeHref
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-border">
            <p className="text-[11px] text-muted-foreground">Maratha Admin v2</p>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 overflow-y-auto">
          {title && (
            <div className="border-b border-border bg-card/60 px-6 py-4">
              <h1 className="font-serif text-2xl font-semibold text-foreground">{title}</h1>
            </div>
          )}
          <div className={title ? "p-6" : ""}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
