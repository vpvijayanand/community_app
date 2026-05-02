"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth, ROLE_LABELS } from "@/lib/auth-context"
import {
  LogOut,
  LayoutDashboard,
  Heart,
  MessageCircle,
  Star,
  Newspaper,
  Settings,
  Crown,
  Sparkles,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const USER_NAV = [
  { href: "/dashboard",    label: "Dashboard",       labelTa: "முகப்பு",         icon: LayoutDashboard },
  { href: "/matches",      label: "Browse Matches",  labelTa: "பொருத்தங்கள்",    icon: Heart },
  { href: "/chat",         label: "Messages",        labelTa: "செய்திகள்",        icon: MessageCircle },
  { href: "/porutham",     label: "Porutham",        labelTa: "பொருத்தம்",        icon: Sparkles },
  { href: "/astrology",    label: "Astrology",       labelTa: "ஜோதிடம்",         icon: Star },
  { href: "/news",         label: "Community",       labelTa: "சமூகம்",           icon: Newspaper },
  { href: "/subscription", label: "Subscription",   labelTa: "சந்தா",            icon: Crown },
  { href: "/settings",     label: "Settings",        labelTa: "அமைப்புகள்",       icon: Settings },
]

type Props = {
  children: ReactNode
  title?: string
}

export function UserLayout({ children, title }: Props) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const roleInfo = user ? ROLE_LABELS[user.role] : null

  const NavLinks = () => (
    <>
      {USER_NAV.map(({ href, label, labelTa, icon: Icon }) => {
        const isActive = pathname === href || (href !== "/dashboard" && pathname?.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex flex-col leading-tight">
              <span>{label}</span>
              <span className="font-tamil text-[10px] opacity-70">{labelTa}</span>
            </span>
          </Link>
        )
      })}
    </>
  )

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/dashboard" className="font-serif text-lg font-semibold tracking-wide text-foreground">
            Maratha{" "}
            <span className="font-tamil text-base font-normal text-muted-foreground">மராத்தா</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Role badge */}
          {roleInfo && (
            <span className={`hidden sm:inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ${roleInfo.color}`}>
              {roleInfo.label}
            </span>
          )}

          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-foreground leading-tight">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>

          {user && (
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${roleInfo?.color ?? "bg-slate-500"}`}>
              {user.firstName[0]}
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar (desktop) ── */}
        <aside className="w-56 shrink-0 border-r border-border bg-card hidden md:flex flex-col">
          <nav className="p-3 space-y-0.5 flex-1">
            <NavLinks />
          </nav>
          <div className="p-4 border-t border-border">
            <p className="text-[11px] text-muted-foreground">Maratha Matrimony v2</p>
          </div>
        </aside>

        {/* ── Mobile sidebar overlay ── */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex flex-col shadow-xl">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <span className="font-serif font-semibold text-foreground">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="p-3 space-y-0.5 flex-1 overflow-y-auto">
                <NavLinks />
              </nav>
              <div className="p-4 border-t border-border">
                <p className="text-[11px] text-muted-foreground">Maratha Matrimony v2</p>
              </div>
            </aside>
          </div>
        )}

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
