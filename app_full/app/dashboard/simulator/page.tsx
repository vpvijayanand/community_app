"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowUpRight, Crown } from "lucide-react"
import {
  MOCK_USER_STATE,
  type UserState,
} from "@/lib/navigation-priority"
import { useNextTask } from "@/hooks/use-next-task"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { SimulatorStatePanel } from "@/components/simulator-state-panel"
import { DecisionTraceView } from "@/components/decision-trace"
import { PriorityCriteria } from "@/components/priority-criteria"
import { Button } from "@/components/ui/button"

export default function SimulatorPage() {
  const [state, setState] = useState<UserState>(MOCK_USER_STATE)
  const trace = useNextTask(state)
  const winner = trace.winner

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Priority navigator
          </p>
          <h1 className="mt-3 font-serif text-3xl font-medium leading-tight text-foreground sm:text-4xl">
            Watch the system choose your next page{" "}
            <span className="font-tamil block text-xl text-muted-foreground sm:text-2xl">
              அடுத்த பக்கத்தை தானாக தேர்ந்தெடுக்கும் அமைப்பு
            </span>
          </h1>
          <p className="mt-4 max-w-prose text-pretty text-base leading-relaxed text-foreground/75">
            Flip any flag on the left and the resolver instantly re-ranks the
            queue, picks the highest-priority incomplete task, and routes there.
            Everything you see is driven by the registry in{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 text-[0.85em] text-foreground">
              lib/navigation-priority.ts
            </code>
            .
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)_320px]">
          {/* State toggles */}
          <div className="order-2 lg:order-1">
            <SimulatorStatePanel
              state={state}
              onChange={setState}
              onReset={() => setState(MOCK_USER_STATE)}
            />
          </div>

          {/* Live winner */}
          <div className="order-1 flex flex-col gap-6 lg:order-2">
            <section
              aria-label="Selected destination"
              className="relative overflow-hidden rounded-3xl border border-primary/30 bg-primary/[0.04] p-8"
            >
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
                <Crown className="h-4 w-4" aria-hidden />
                {trace.isFallback ? "Safe fallback" : "Winning task"}
              </div>

              <h2 className="mt-4 font-serif text-3xl font-medium leading-tight text-foreground sm:text-4xl">
                {winner.title}
              </h2>
              <p className="font-tamil mt-1 text-base text-muted-foreground">
                {winner.titleTamil}
              </p>
              <p className="mt-4 max-w-prose text-pretty text-sm leading-relaxed text-foreground/75">
                {winner.description}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Link href={winner.href}>
                    Navigate now
                    <ArrowUpRight className="ml-1 h-4 w-4" aria-hidden />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-primary/30 bg-background hover:bg-secondary"
                >
                  <Link href="/continue">
                    Try /continue redirect
                    <ArrowUpRight className="ml-1 h-4 w-4" aria-hidden />
                  </Link>
                </Button>
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-primary/15 pt-5 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                    Destination
                  </dt>
                  <dd className="mt-0.5 truncate font-mono text-xs text-foreground">
                    {winner.href}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                    Priority
                  </dt>
                  <dd className="mt-0.5 font-serif text-lg tabular-nums text-foreground">
                    {"priority" in winner ? winner.priority : 0}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                    Source
                  </dt>
                  <dd className="mt-0.5 text-sm text-foreground">
                    {trace.isFallback ? "Fallback route" : "Registry"}
                  </dd>
                </div>
              </dl>
            </section>

            <DecisionTraceView trace={trace} />
          </div>

          {/* Criteria */}
          <div className="order-3">
            <PriorityCriteria />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
