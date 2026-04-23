"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Eye, EyeOff, Lock, Mail, Phone, Shield, User, Users, Zap } from "lucide-react"

import { AuthShell } from "@/components/auth-shell"
import { OAuthButtons } from "@/components/oauth-buttons"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
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
    icon: Shield,
    color: "text-rose-600 border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-500",
    activeBg: "bg-rose-50 border-rose-500 dark:bg-rose-950/30",
    firstName: "Admin", lastName: "User",
    email: "admin@maratha.com", phone: "9999999999", password: "Admin@123",
    lookingFor: "groom" as const,
  },
  {
    key: "groom" as const,
    label: "Groom",
    tamil: "மணமகன்",
    icon: User,
    color: "text-blue-600 border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-500",
    activeBg: "bg-blue-50 border-blue-500 dark:bg-blue-950/30",
    firstName: "Arun", lastName: "Velan",
    email: "arun@example.com", phone: "9123456780", password: "Groom@123",
    lookingFor: "bride" as const,
  },
  {
    key: "bride" as const,
    label: "Bride",
    tamil: "மணமகள்",
    icon: Users,
    color: "text-pink-600 border-pink-300 hover:bg-pink-50 dark:hover:bg-pink-950/30 hover:border-pink-500",
    activeBg: "bg-pink-50 border-pink-500 dark:bg-pink-950/30",
    firstName: "Meera", lastName: "Iyer",
    email: "meera@example.com", phone: "9876543210", password: "Bride@123",
    lookingFor: "groom" as const,
  },
  {
    key: "normal" as const,
    label: "Normal User",
    tamil: "பயனர்",
    icon: Zap,
    color: "text-slate-600 border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-500",
    activeBg: "bg-slate-50 border-slate-500 dark:bg-slate-800",
    firstName: "Test", lastName: "User",
    email: "test@example.com", phone: "9000000000", password: "User@123",
    lookingFor: "bride" as const,
  },
] as const

const lookingForOptions = [
  { value: "bride" as const, english: "Bride", tamil: "மணமகள்" },
  { value: "groom" as const, english: "Groom", tamil: "மணமகன்" },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter()
  const { register, loginAs } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [lookingFor, setLookingFor] = useState<"bride" | "groom">("bride")
  const [accepted, setAccepted] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [activePreset, setActivePreset] = useState<string | null>(null)

  const handlePreset = (preset: typeof DEV_PRESETS[number]) => {
    setFirstName(preset.firstName)
    setLastName(preset.lastName)
    setEmail(preset.email)
    setPhone(preset.phone)
    setPassword(preset.password)
    setLookingFor(preset.lookingFor)
    setAccepted(true)
    setActivePreset(preset.key)
  }

  const handleQuickRegister = (preset: typeof DEV_PRESETS[number]) => {
    handlePreset(preset)
    const result = loginAs(preset.key)
    if (result.success) router.push(result.destination)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = register({ firstName, lastName, email, phone })
    if (result.success) {
      router.push(result.destination)
    }
  }

  return (
    <AuthShell
      titleTamil="உங்கள் பயணத்தைத் தொடங்கவும்"
      title="Begin your journey, the right way"
      subtitle="Create a verified profile with horoscope details to unlock accurate compatibility and thoughtful matches."
      quote={{
        english: "A well-matched horoscope is the first step of a happy marriage.",
        tamil: "சரியான பொருத்தம் மகிழ்ச்சியான திருமணத்தின் முதல் அடி.",
        attribution: "Tamil proverb · பழமொழி",
      }}
      footer={
        <p className="text-center">
          Already on Maratha?{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit}>

        {/* ── Dev Quick-Register Panel ─────────────────────────────────────── */}
        <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Quick Register (Dev)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEV_PRESETS.map((preset) => {
              const Icon = preset.icon
              const isActive = activePreset === preset.key
              return (
                <div key={preset.key} className="flex gap-1">
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
                  <button
                    type="button"
                    title={`Register & sign in as ${preset.label}`}
                    onClick={() => handleQuickRegister(preset)}
                    className="flex items-center justify-center rounded-lg border border-border bg-background px-2 text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                  >
                    <span className="text-xs">→</span>
                  </button>
                </div>
              )
            })}
          </div>
          <p className="text-[10px] text-muted-foreground">
            Click a role to autofill · Click <span className="font-mono">→</span> to register & sign in instantly
          </p>
        </div>

        <OAuthButtons action="signup" />

        <div className="relative">
          <div aria-hidden className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="bg-background px-3 text-muted-foreground">
              or register with email
            </span>
          </div>
        </div>

        {/* ── Profile For ─────────────────────────────────────────────────── */}
        <FieldSet>
          <FieldLegend variant="label">
            Creating a profile for
            <span className="font-tamil ml-2 text-xs text-muted-foreground">
              யாருக்கு?
            </span>
          </FieldLegend>
          <div
            role="radiogroup"
            aria-label="Creating a profile for"
            className="grid grid-cols-2 gap-3"
          >
            {lookingForOptions.map((opt) => {
              const active = lookingFor === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setLookingFor(opt.value)}
                  className={[
                    "flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition-colors",
                    active
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/40 hover:bg-secondary",
                  ].join(" ")}
                >
                  <span className="text-sm font-medium text-foreground">
                    {opt.english}
                  </span>
                  <span className="font-tamil text-xs text-muted-foreground">
                    {opt.tamil}
                  </span>
                </button>
              )
            })}
          </div>
        </FieldSet>

        <FieldGroup>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="firstName">
                First name
                <span className="font-tamil ml-2 text-xs text-muted-foreground">
                  முதல் பெயர்
                </span>
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <User className="h-4 w-4 text-muted-foreground" aria-hidden />
                </InputGroupAddon>
                <InputGroupInput
                  id="firstName"
                  autoComplete="given-name"
                  placeholder="Meera"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="lastName">
                Last name
                <span className="font-tamil ml-2 text-xs text-muted-foreground">
                  குடும்பப் பெயர்
                </span>
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="lastName"
                  autoComplete="family-name"
                  placeholder="Venkatesan"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </InputGroup>
            </Field>
          </div>

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
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </InputGroup>
          </Field>

          <Field>
            <FieldLabel htmlFor="phone">
              Mobile number
              <span className="font-tamil ml-2 text-xs text-muted-foreground">
                கைபேசி எண்
              </span>
            </FieldLabel>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Phone className="h-4 w-4 text-muted-foreground" aria-hidden />
                <span className="pl-1 text-sm text-muted-foreground">+91</span>
              </InputGroupAddon>
              <InputGroupInput
                id="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </InputGroup>
          </Field>

          <Field>
            <FieldLabel htmlFor="password">
              Password
              <span className="font-tamil ml-2 text-xs text-muted-foreground">
                கடவுச்சொல்
              </span>
            </FieldLabel>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Lock className="h-4 w-4 text-muted-foreground" aria-hidden />
              </InputGroupAddon>
              <InputGroupInput
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <p className="text-xs text-muted-foreground">
              Use 8+ characters with a mix of letters and numbers.
            </p>
          </Field>

          <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
            <Checkbox
              id="terms"
              checked={accepted}
              onCheckedChange={(v) => setAccepted(v === true)}
              className="mt-0.5"
            />
            <span>
              I agree to Maratha&apos;s{" "}
              <Link href="/terms" className="text-foreground underline-offset-4 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-foreground underline-offset-4 hover:underline">
                Privacy Policy
              </Link>
              , and confirm I am 18 or older.
            </span>
          </label>
        </FieldGroup>

        <Button
          type="submit"
          size="lg"
          disabled={!accepted}
          className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          Create my profile
        </Button>
      </form>
    </AuthShell>
  )
}
