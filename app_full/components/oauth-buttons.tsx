"use client"

import { Button } from "@/components/ui/button"

type OAuthButtonsProps = {
  action: "signin" | "signup"
}

export function OAuthButtons({ action }: OAuthButtonsProps) {
  const label = action === "signin" ? "Sign in" : "Continue"

  return (
    <div className="grid gap-3">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-11 justify-center gap-3 border-border bg-card text-foreground hover:bg-secondary"
      >
        <GoogleIcon className="h-4 w-4" />
        <span className="font-medium">{label} with Google</span>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-11 justify-center gap-3 border-border bg-card text-foreground hover:bg-secondary"
      >
        <FacebookIcon className="h-4 w-4 text-[#1877F2]" />
        <span className="font-medium">{label} with Facebook</span>
      </Button>
    </div>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.56-2.77c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M22 12a10 10 0 1 0-11.56 9.87v-6.98H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.57V12h2.78l-.45 2.89h-2.33v6.98A10 10 0 0 0 22 12Z" />
    </svg>
  )
}
