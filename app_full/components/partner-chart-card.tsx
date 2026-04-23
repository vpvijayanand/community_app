"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { KoduGrid } from "@/components/kodu-grid"
import { RASIS, type Partner } from "@/lib/astrology-data"
import { convertChartToPositions } from "@/lib/astrology-utils"
import { cn } from "@/lib/utils"

type PartnerChartCardProps = {
  partner: Partner
  role: "Groom" | "Bride"
  roleTamil: string
  accentTone?: "primary" | "accent"
}

export function PartnerChartCard({
  partner,
  role,
  roleTamil,
  accentTone = "primary",
}: PartnerChartCardProps) {
  const [tab, setTab] = useState<"rasi" | "navamsa">("rasi")

  const chart = tab === "rasi" ? partner.rasiChart : partner.navamsaChart
  const centerLabel = tab === "rasi" ? "Rasi" : "Navamsa"
  const centerSublabel = tab === "rasi" ? "ராசி" : "நவாம்சம்"

  return (
    <article
      className={cn(
        "flex flex-col gap-5 rounded-lg border border-border bg-card p-6",
      )}
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex h-5 items-center rounded-full px-2 text-[10px] font-medium uppercase tracking-wider",
                accentTone === "primary"
                  ? "bg-primary/10 text-primary"
                  : "bg-accent/30 text-accent-foreground",
              )}
            >
              {role}
            </span>
            <span className="font-tamil text-xs text-muted-foreground">
              {roleTamil}
            </span>
          </div>
          <h3 className="mt-3 font-serif text-2xl font-medium leading-tight text-foreground">
            {partner.name}
          </h3>
          <p className="font-tamil mt-1 text-sm text-muted-foreground">
            {partner.tamilName}
          </p>
        </div>

        <div className="text-right text-xs text-muted-foreground">
          <p className="font-medium text-foreground">
            {partner.ageYears} yrs
          </p>
          <p className="mt-1">{partner.birthDetails.place}</p>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-3 rounded-md bg-secondary/50 p-3 text-xs">
        <div>
          <dt className="text-muted-foreground">Birth</dt>
          <dd className="mt-0.5 font-medium text-foreground tabular-nums">
            {partner.birthDetails.date}
          </dd>
          <dd className="text-muted-foreground tabular-nums">
            {partner.birthDetails.time}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Nakshatra</dt>
          <dd className="mt-0.5 font-medium text-foreground">
            {partner.star.english}
          </dd>
          <dd className="font-tamil text-muted-foreground">
            {partner.star.tamil}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Rasi (Moon)</dt>
          <dd className="mt-0.5 font-medium text-foreground">
            {partner.rasi}
          </dd>
          <dd className="font-tamil text-muted-foreground">
            {RASIS[partner.rasi].tamil}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Lagnam</dt>
          <dd className="mt-0.5 font-medium text-foreground">
            {partner.lagna}
          </dd>
          <dd className="font-tamil text-muted-foreground">
            {RASIS[partner.lagna].tamil}
          </dd>
        </div>
      </dl>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as "rasi" | "navamsa")}
        className="gap-3"
      >
        <TabsList className="w-full bg-secondary/70 p-0.5">
          <TabsTrigger value="rasi" className="flex-1 gap-1.5">
            <span>Rasi</span>
            <span className="font-tamil text-xs opacity-70">ராசி</span>
          </TabsTrigger>
          <TabsTrigger value="navamsa" className="flex-1 gap-1.5">
            <span>Navamsa</span>
            <span className="font-tamil text-xs opacity-70">நவாம்சம்</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rasi">
          <KoduGrid
            planetPositions={convertChartToPositions(partner.rasiChart)}
            lagnaHouse={RASIS[partner.lagna]?.number}
            mode="rasi"
            personName={partner.name}
            hideToggle={true}
          />
        </TabsContent>
        <TabsContent value="navamsa">
          <KoduGrid
            planetPositions={convertChartToPositions(partner.navamsaChart)}
            lagnaHouse={RASIS[partner.lagna]?.number}
            mode="navamsa"
            personName={partner.name}
            hideToggle={true}
          />
        </TabsContent>
      </Tabs>
    </article>
  )
}

function LegendDot({
  className,
  label,
}: {
  className?: string
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn("inline-block h-2.5 w-2.5 rounded-sm border border-border", className)}
      />
      <span>{label}</span>
    </span>
  )
}
