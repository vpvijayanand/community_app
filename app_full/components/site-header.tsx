"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { KolamMark } from "@/components/kolam-mark"
import { LanguageToggle } from "@/components/language-toggle"
import { useAuth, ROLE_LABELS } from "@/lib/auth-context"
import { LogOut, LayoutDashboard, ShieldCheck } from "lucide-react"

const nav = [
  { href: "/", english: "Home", tamil: "முகப்பு" },
  { href: "/matches", english: "Matches", tamil: "பொருத்தங்கள்" },
  { href: "/porutham", english: "Porutham", tamil: "பொருத்தம்" },
  { href: "/astrology", english: "Astrology", tamil: "ஜோதிடம்" },
  { href: "/chat", english: "Messages", tamil: "செய்திகள்" },
  { href: "/news", english: "Community", tamil: "சமூகம்" },
]

export function SiteHeader() {
  const { user, isLoggedIn, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const roleInfo = user ? ROLE_LABELS[user.role] : null

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <KolamMark className="h-7 w-7" />
          <span className="font-serif text-xl font-medium tracking-tight text-foreground">
            Maratha
          </span>
          <span className="font-tamil ml-1 text-base text-muted-foreground">
            மராத்தா
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col text-sm leading-tight text-foreground/80 transition hover:text-primary"
            >
              <span>{item.english}</span>
              <span className="font-tamil text-[11px] text-muted-foreground group-hover:text-primary/70">
                {item.tamil}
              </span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle className="mr-1" />

          {isLoggedIn && user ? (
            <>
              {/* Role badge */}
              {roleInfo && (
                <span className={`hidden sm:inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>
              )}

              {/* User initial avatar */}
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${roleInfo?.color ?? "bg-slate-500"}`}>
                {user.firstName[0]}
              </div>

              {/* Admin panel shortcut */}
              {user.role === "admin" && (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="hidden text-rose-600 hover:bg-rose-50 sm:inline-flex"
                >
                  <Link href="/admin">
                    <ShieldCheck className="mr-1.5 h-4 w-4" />
                    Admin
                  </Link>
                </Button>
              )}

              {/* Dashboard link */}
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden text-foreground/80 hover:bg-secondary sm:inline-flex"
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-1.5 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>

              {/* Sign out */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden text-foreground/80 hover:bg-secondary sm:inline-flex"
              >
                <Link href="/login">Sign in</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link href="/register">Join Maratha</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
