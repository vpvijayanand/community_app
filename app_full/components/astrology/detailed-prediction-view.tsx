"use client"

import { type DetailedPrediction } from "@/lib/jyotish-predictions"
import { Sparkles, Sun, Star, Briefcase, Heart, Coins, Focus, Eye } from "lucide-react"

export function DetailedPredictionView({ data }: { data: DetailedPrediction }) {
  if (!data) return null

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Lagna Analysis */}
      <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Lagna Analysis (Ascendant)
            </h2>
            <p className="font-tamil text-sm text-primary">{data.lagnaAnalysis.title}</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground mb-4">
          {data.lagnaAnalysis.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {data.lagnaAnalysis.traits.map(t => (
            <span key={t} className="rounded-full bg-background border border-border px-3 py-1 text-xs font-medium text-foreground">
              {t}
            </span>
          ))}
        </div>
        <div className="rounded-xl bg-background border border-border px-4 py-3 text-sm text-muted-foreground">
          <strong>Lagna Lord:</strong> {data.lagnaAnalysis.lordStatus}
        </div>
      </section>

      {/* 2. D1 and D9 Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sun className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold text-foreground">{data.rasiGeneral.title}</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {data.rasiGeneral.overview}
          </p>
        </section>
        
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Focus className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-foreground">{data.navamsaInsights.title}</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {data.navamsaInsights.description}
          </p>
        </section>
      </div>

      {/* 3. Planets */}
      <section>
        <h2 className="font-serif text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" /> Planetary Positional Strength
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.planetaryPositions.map((p, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 transition hover:shadow-md">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-foreground">{p.planetEnglish}</h4>
                  <p className="font-tamil text-xs text-muted-foreground">{p.planetTamil} in {p.rasi}</p>
                </div>
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold ${
                  p.status === "Exalted" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" :
                  p.status === "Debilitated" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" :
                  p.status === "Own House" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                  "bg-secondary text-secondary-foreground"
                }`}>
                  {p.status}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground mt-2 border-t border-border pt-2">
                {p.prediction}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Yogas */}
      <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
        <h2 className="font-serif text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" /> Prominent Yogas
        </h2>
        <div className="space-y-4">
          {data.yogas.map((yoga, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <h4 className="font-medium text-foreground">{yoga.name}</h4>
              </div>
              <p className="text-sm text-muted-foreground pl-3.5">
                {yoga.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Life Areas */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30">
            <Briefcase className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Career & Profession</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{data.career}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
            <Coins className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Wealth & Assets</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{data.wealth}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 dark:bg-pink-900/30">
            <Heart className="h-5 w-5 text-pink-600 dark:text-pink-400" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Marriage & Life Path</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{data.marriage}</p>
          <div className="mt-4 border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">Overall Path</span>
            </div>
            <p className="text-xs text-muted-foreground">{data.lifePath}</p>
          </div>
        </div>
      </section>
      
    </div>
  )
}

function User(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
