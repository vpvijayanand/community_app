"use client"

import Link from "next/link"
import { BadgeCheck } from "lucide-react"

import { AuthShell } from "@/components/auth-shell"
import { Button } from "@/components/ui/button"

export default function VerifyEmailPage() {
  return (
    <AuthShell
      titleTamil="மின்னஞ்சலை உறுதிசெய்க"
      title="Confirm your email address"
      subtitle="We sent a magic link to your email address. Click the link to securely confirm your account."
      quote={{
        english: "Communication is the bridge between confusion and clarity.",
        tamil: "தெளிவான தகவல்தொடர்பு உறவை வலுப்பெறச் செய்கிறது.",
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
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <BadgeCheck className="h-10 w-10 text-primary" />
          </div>
          <p className="text-center text-sm text-muted-foreground leading-relaxed max-w-sm">
            We&apos;ve sent an email to your registered address. 
            Please check your inbox (and spam folder) and click the provided link.
          </p>
        </div>

        <Link href="/dashboard" className="w-full">
          <Button
            size="lg"
            className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            I have verified my email
          </Button>
        </Link>
        
        <div className="text-center mt-4">
          <button type="button" className="text-sm font-medium text-primary hover:underline underline-offset-4">
            Resend Email
          </button>
        </div>
      </div>
    </AuthShell>
  )
}
