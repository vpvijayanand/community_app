import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Payment Successful | Maratha Matrimony",
}

export default function SubscriptionSuccessPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 py-20 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-8 text-green-600">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl font-medium text-foreground mb-4">Payment Successful!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for upgrading. Your account has been upgraded and you now have access to premium features.
          </p>
          <div className="bg-card border border-border rounded-xl p-4 mb-8 text-left">
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-medium text-foreground">₹2,999</span>
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium text-primary">Gold Tier</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-medium text-foreground">TRX-89324792</span>
            </div>
          </div>
          <Link href="/dashboard">
            <Button className="w-full">Return to Dashboard</Button>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
