"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles, CreditCard } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"

function SubscriptionContent() {
  const searchParams = useSearchParams()
  const planQuery = searchParams.get("plan") // "silver" or "gold"
  
  // In a real app, this comes from the user session/API
  const currentPlan = "basic"
  
  const targetPlan = planQuery === "gold" ? "Gold" : planQuery === "silver" ? "Silver" : "Silver"
  const price = targetPlan === "Gold" ? "₹2,499" : "₹999"
  
  // Handle mock checkout
  const handleUpgrade = (e: React.FormEvent) => {
    e.preventDefault()
    // Mocking an immediate redirect to success page
    window.location.href = "/subscription/success"
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <Link
          href="/pricing"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to plans
        </Link>

        <div className="mb-8">
          <p className="text-xs uppercase tracking-wider text-primary">Upgrade your account</p>
          <h1 className="mt-2 font-serif text-3xl font-medium text-foreground">
            Complete your upgrade
          </h1>
        </div>

        <div className="grid gap-8 md:grid-cols-[1fr_minmax(0,320px)]">
          {/* Checkout column */}
          <div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="font-serif text-lg font-medium text-foreground mb-4">Payment Details</h2>
              
              <form onSubmit={handleUpgrade} className="space-y-4">
                <div className="rounded-xl border border-border bg-secondary/30 p-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Mock Payment Gateway</p>
                      <p className="text-xs text-muted-foreground">In production, this integrates with Razorpay/Stripe.</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4">
                  <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Pay {price}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" /> Secure 256-bit SSL encryption
                  </p>
                </div>
              </form>
            </div>
            
            <div className="mt-6 flex gap-3 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>
                Your subscription will renew automatically every month. You can cancel 
                at any time from your settings before the next billing cycle.
              </p>
            </div>
          </div>

          {/* Summary column */}
          <div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="font-serif text-lg font-medium text-foreground mb-4">Summary</h2>
              
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="font-medium text-foreground">Maratha {targetPlan}</p>
                  <p className="text-sm text-muted-foreground">Monthly billing</p>
                </div>
                <p className="font-semibold">{price}</p>
              </div>
              
              <div className="pt-4">
                <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">You&apos;ll get instantly:</p>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                    <span className="text-foreground/80">View up to {targetPlan === "Gold" ? "50" : "10"} profiles/mo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                    <span className="text-foreground/80">Clear profile photos unlocked</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                    <span className="text-foreground/80">{targetPlan === "Gold" ? "Unlimited messages" : "10 new conversations/mo"}</span>
                  </li>
                  {targetPlan === "Gold" && (
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                      <span className="text-foreground/80">Priority placement in search</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<div>Loading upgrade flow...</div>}>
      <SubscriptionContent />
    </Suspense>
  )
}
