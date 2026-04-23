"use client"

import Link from "next/link"
import { Check, Info, Sparkles, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center px-6 py-16 md:py-24">
        <div className="mb-12 text-center md:mb-16">
          <p className="font-tamil text-sm uppercase tracking-[0.18em] text-primary/80">
            சந்தா திட்டங்கள்
          </p>
          <h1 className="mt-4 font-serif text-4xl font-medium leading-[1.1] tracking-tight text-foreground md:text-6xl">
            Simple, honest pricing.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            No hidden fees. Every profile is verified. Choose a plan that fits your search,
            and upgrade only when you&apos;re ready.
          </p>
        </div>

        <div className="grid w-full max-w-5xl gap-8 md:grid-cols-3">
          {/* Basic Plan */}
          <PricingCard
            name="Basic"
            tamil="அடிப்படை"
            price="Free"
            description="Perfect for exploring the community and creating your profile."
            features={[
              { name: "View 5 profiles per month", included: true },
              { name: "Create full profile with astrology", included: true },
              { name: "Receive interests", included: true },
              { name: "Clear profile photos", included: false, notice: "Photos are blurred for privacy" },
              { name: "Initiate chats", included: false },
              { name: "Priority in search results", included: false },
            ]}
            cta={{ text: "Create free profile", href: "/register", variant: "outline" }}
          />

          {/* Silver Plan */}
          <PricingCard
            name="Silver"
            tamil="வெள்ளி"
            price="₹999"
            period="/month"
            popular
            description="For those actively searching and ready to start conversations."
            features={[
              { name: "View 10 profiles per month", included: true },
              { name: "Create full profile with astrology", included: true },
              { name: "Receive interests", included: true },
              { name: "Clear profile photos", included: true },
              { name: "Initiate up to 10 chats/month", included: true },
              { name: "Priority in search results", included: false },
            ]}
            cta={{ text: "Get Silver", href: "/subscription?plan=silver", variant: "default" }}
          />

          {/* Gold Plan */}
          <PricingCard
            name="Gold"
            tamil="தங்கம்"
            price="₹2,499"
            period="/month"
            description="Maximum visibility and unlimited messaging for serious searches."
            features={[
              { name: "View 50 profiles per month", included: true },
              { name: "Create full profile with astrology", included: true },
              { name: "Receive interests", included: true },
              { name: "Clear profile photos", included: true },
              { name: "Unlimited chats", included: true },
              { name: "Priority rank in search results", included: true },
              { name: "Exclusive Gold Profile Badge", included: true },
            ]}
            cta={{ text: "Get Gold", href: "/subscription?plan=gold", variant: "default" }}
          />
        </div>

        <div className="mx-auto mt-20 max-w-3xl text-center">
          <h2 className="font-serif text-2xl font-medium text-foreground">
            Frequently asked questions
          </h2>
          <dl className="mt-8 grid gap-8 text-left md:grid-cols-2">
            <div>
              <dt className="font-medium text-foreground">Can I cancel anytime?</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Yes, there are no long-term contracts. You can cancel your subscription at any time
                from your Settings page.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Why are photos blurred in Basic?</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                To protect the privacy of our members, clear photos are only visible to paid
                subscribers who have demonstrated serious intent.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">How do I upgrade from Silver to Gold?</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                You can upgrade at any time from your dashboard. We will prorate the cost of your 
                plan for the remainder of the billing cycle.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Are there discounts for longer plans?</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Currently, we offer straightforward monthly billing to keep things simple. We may
                introduce quarterly bundles in the future.
              </dd>
            </div>
          </dl>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

function PricingCard({
  name,
  tamil,
  price,
  period,
  description,
  features,
  popular,
  cta,
}: {
  name: string
  tamil: string
  price: string
  period?: string
  description: string
  popular?: boolean
  features: Array<{ name: string; included: boolean; notice?: string }>
  cta: { text: string; href: string; variant: "default" | "outline" }
}) {
  return (
    <div
      className={[
        "relative flex flex-col rounded-3xl border bg-card p-8 shadow-sm transition hover:shadow-md",
        popular ? "border-primary shadow-primary/10" : "border-border",
      ].join(" ")}
    >
      {popular && (
        <div className="absolute -top-3 left-0 right-0 mx-auto flex w-max items-center gap-1 rounded-full border border-primary/20 bg-primary px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary-foreground shadow-sm">
          <Sparkles className="h-3 w-3" aria-hidden /> Most Popular
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h3 className="font-serif text-2xl font-medium text-foreground">{name}</h3>
          <span className="font-tamil text-sm text-muted-foreground">{tamil}</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground min-h-10">{description}</p>
      </div>

      <div className="mb-6 flex items-baseline gap-1">
        <span className="text-4xl font-semibold tracking-tight text-foreground">{price}</span>
        {period && <span className="text-sm text-muted-foreground">{period}</span>}
      </div>

      <Button
        asChild
        variant={cta.variant}
        className={
          cta.variant === "default"
            ? "w-full bg-primary text-primary-foreground hover:bg-primary/90"
            : "w-full border-border hover:bg-secondary"
        }
      >
        <Link href={cta.href}>{cta.text}</Link>
      </Button>

      <div className="mt-8 flex flex-1 flex-col justify-start">
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          What&apos;s included
        </p>
        <ul className="space-y-3.5 text-sm">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              {feature.included ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              ) : (
                <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" aria-hidden />
              )}
              <span
                className={
                  feature.included ? "text-foreground/90" : "text-muted-foreground"
                }
              >
                {feature.name}
              </span>
              {feature.notice && (
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger type="button" className="ml-auto">
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="sr-only">Notice</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{feature.notice}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
