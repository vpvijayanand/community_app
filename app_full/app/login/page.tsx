"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Eye, EyeOff, Lock, Mail, Shield, User, Users, Zap } from "lucide-react"

import { AuthShell } from "@/components/auth-shell"
import { OAuthButtons } from "@/components/oauth-buttons"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { useAuth } from "@/lib/auth-context"

// ── Dev presets ───────────────────────────────────────────────────────────────

const DEV_PRESETS = [
  {
    key: "admin" as const,
    label: "Admin",
    tamil: "நிர்வாகி",
    email: "admin@mathat.in",
    password: "Admin@123",
    icon: Shield,
    color: "text-rose-600 border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-500",
    activeBg: "bg-rose-50 border-rose-500 dark:bg-rose-950/30",
  },
  {
    key: "groom" as const,
    label: "Groom",
    tamil: "மணமகன்",
    email: "arun@example.com",
    password: "Groom@123",
    icon: User,
    color: "text-blue-600 border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-500",
    activeBg: "bg-blue-50 border-blue-500 dark:bg-blue-950/30",
  },
  {
    key: "bride" as const,
    label: "Bride",
    tamil: "மணமகள்",
    email: "meera@example.com",
    password: "Bride@123",
    icon: Users,
    color: "text-pink-600 border-pink-300 hover:bg-pink-50 dark:hover:bg-pink-950/30 hover:border-pink-500",
    activeBg: "bg-pink-50 border-pink-500 dark:bg-pink-950/30",
  },
  {
    key: "normal" as const,
    label: "Normal User",
    tamil: "பயனர்",
    email: "test@example.com",
    password: "User@123",
    icon: Zap,
    color: "text-slate-600 border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-500",
    activeBg: "bg-slate-50 border-slate-500 dark:bg-slate-800",
  },
  {
    key: "parent" as const,
    label: "Family Demo",
    tamil: "பெற்றோர்",
    email: "family@example.com",
    password: "Family@123",
    icon: Users,
    color: "text-purple-600 border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:border-purple-500",
    activeBg: "bg-purple-50 border-purple-500 dark:bg-purple-950/30",
  },
] as const

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter()
  const { login, loginAs } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [activePreset, setActivePreset] = useState<string | null>(null)

  // Autofill form fields + remember which preset is active
  const handlePreset = (preset: typeof DEV_PRESETS[number]) => {
    setEmail(preset.email)
    setPassword(preset.password)
    setActivePreset(preset.key)
    setError(null)
  }

  // One-click sign in as preset (skips form submit)
  const handleQuickLogin = (preset: typeof DEV_PRESETS[number]) => {
    const result = loginAs(preset.key)
    if (result.success) router.push(result.destination)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const result = login(email, password)
    if (result.success) {
      router.push(result.destination)
    } else {
      setError(result.error ?? "Something went wrong.")
    }
  }

  return (
    <AuthShell
      titleTamil="மீண்டும் வருக"
      title="Welcome back to Maratha"
      subtitle="Sign in to continue finding matches, reviewing horoscopes, and saving profiles you love."
      quote={{
        english: "Two hearts, one auspicious beginning.",
        tamil: "இரு இதயங்கள், ஒரு நல்ல தொடக்கம்.",
        attribution: "Maratha · மராத்தா",
      }}
      footer={
        <p className="text-center">
          New to Maratha?{" "}
          <Link
            href="/register"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Create your profile
          </Link>
        </p>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit}>

        {/* ── Dev Quick-Login Panel ────────────────────────────────────────── */}
        <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Quick Login (Dev)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEV_PRESETS.map((preset) => {
              const Icon = preset.icon
              const isActive = activePreset === preset.key
              return (
                <div key={preset.key} className="flex gap-1">
                  {/* Autofill button */}
                  <button
                    type="button"
                    onClick={() => handlePreset(preset)}
                    className={[
                      "flex-1 flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2 text-left transition-all",
                      isActive ? preset.activeBg : "border-border bg-background",
                      preset.color,
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5" />
                      <span className="text-xs font-semibold">{preset.label}</span>
                    </div>
                    <span className="font-tamil text-[10px] opacity-70">{preset.tamil}</span>
                  </button>
                  {/* Quick sign-in arrow */}
                  <button
                    type="button"
                    title={`Sign in as ${preset.label}`}
                    onClick={() => handleQuickLogin(preset)}
                    className="flex items-center justify-center rounded-lg border border-border bg-background px-2 text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                  >
                    <span className="text-xs">→</span>
                  </button>
                </div>
              )
            })}
          </div>
          <p className="text-[10px] text-muted-foreground">
            Click a role to autofill · Click <span className="font-mono">→</span> to sign in instantly
          </p>
        </div>

        <OAuthButtons action="signin" />

        <div className="relative">
          <div aria-hidden className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="bg-background px-3 text-muted-foreground">
              or with email
            </span>
          </div>
        </div>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">
              Email address
              <span className="font-tamil ml-2 text-xs text-muted-foreground">
                மின்னஞ்சல்
              </span>
            </FieldLabel>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Mail className="h-4 w-4 text-muted-foreground" aria-hidden />
              </InputGroupAddon>
              <InputGroupInput
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setActivePreset(null) }}
                required
              />
            </InputGroup>
          </Field>

          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">
                Password
                <span className="font-tamil ml-2 text-xs text-muted-foreground">
                  கடவுச்சொல்
                </span>
              </FieldLabel>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Lock className="h-4 w-4 text-muted-foreground" aria-hidden />
              </InputGroupAddon>
              <InputGroupInput
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setActivePreset(null) }}
                required
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  size="icon-xs"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden />
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Field>

          {error && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-xs text-red-600 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400">
              {error}
            </p>
          )}

          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground">
            <Checkbox id="remember" defaultChecked />
            <span>Keep me signed in for 30 days</span>
          </label>
        </FieldGroup>

        <Button
          type="submit"
          size="lg"
          className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Sign in
        </Button>

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          By signing in you agree to Maratha&apos;s{" "}
          <Link href="/terms" className="underline-offset-4 hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline-offset-4 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  )
}
