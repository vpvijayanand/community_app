"use client"

import { useState } from "react"
import Link from "next/link"
import { ShieldCheck, Phone, ArrowRight } from "lucide-react"

import { AuthShell } from "@/components/auth-shell"
import { Button } from "@/components/ui/button"

export default function VerifyPhonePage() {
  const [step, setStep] = useState<"phone" | "code">("phone")
  const [phone, setPhone] = useState("")

  return (
    <AuthShell
      titleTamil="தொலைபேசி எண்ணை சரிபார்க்கவும்"
      title="Verify your phone number"
      subtitle={
        step === "phone"
          ? "Please enter your mobile number to receive a verification code."
          : `We sent a 6-digit code to ${phone || 'your phone'}. Enter it below.`
      }
      quote={{
        english: "Trust is the foundation of every meaningful relationship.",
        tamil: "நம்பிக்கையே ஒவ்வொரு அர்த்தமுள்ள உறவின் அடித்தளம்.",
        attribution: "Maratha · மராத்தா",
      }}
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Need help?{" "}
          <Link href="/support" className="font-medium text-primary underline-offset-4 hover:underline">
            Contact Support
          </Link>
        </p>
      }
    >
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault()
          if (step === "phone") {
            setStep("code")
          } else {
            window.location.href = "/dashboard"
          }
        }}
      >
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <p className="text-center text-sm text-muted-foreground max-w-xs">
            {step === "phone"
              ? "We'll send a secure VIP code to verify your identity."
              : "Enter the VIP code sent to your mobile number below."}
          </p>
        </div>

        {step === "phone" ? (
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium text-foreground">
              Mobile Number
              <span className="font-tamil ml-2 text-xs text-muted-foreground">
                கைபேசி எண்
              </span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex h-12 w-full rounded-md border border-input bg-transparent pl-10 pr-3 py-2 text-lg shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter 10-digit number"
                maxLength={10}
                required
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="mb-4 text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm font-medium">
                {phone}
                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="text-xs text-primary hover:underline"
                >
                  Edit
                </button>
              </span>
            </div>
            <label htmlFor="code" className="text-sm font-medium text-foreground flex justify-between">
              <span>
                Verification Code
                <span className="font-tamil ml-2 text-xs text-muted-foreground">
                  சரிபார்ப்பு குறியீடு
                </span>
              </span>
            </label>
            <input
              id="code"
              type="text"
              className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-2 text-center tracking-widest text-lg shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="0 0 0 0 0 0"
              maxLength={6}
              autoFocus
              required
            />
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {step === "phone" ? (
            <>
              Send Code <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            "Verify Phone Number"
          )}
        </Button>

        {step === "code" && (
          <div className="text-center">
            <button
              type="button"
              className="text-sm font-medium text-primary hover:underline underline-offset-4"
            >
              Resend Code
            </button>
          </div>
        )}
      </form>
    </AuthShell>
  )
}

