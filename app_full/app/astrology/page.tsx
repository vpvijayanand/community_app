import Link from "next/link"
import { ArrowLeft, Download, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PartnerChartCard } from "@/components/partner-chart-card"
import { MatchScoreGauge } from "@/components/match-score-gauge"
import { PoruthamTable } from "@/components/porutham-table"
import { VerdictCard } from "@/components/verdict-card"
import { KolamMark } from "@/components/kolam-mark"
import {
  BRIDE,
  GROOM,
  MATCH_PERCENT,
  TOTAL_MAX,
  TOTAL_SCORE,
} from "@/lib/astrology-data"

export default function AstrologyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <PageHeader />
        <CompatibilitySection />
        <PoruthamSection />
        <Disclaimer />
      </main>

      <SiteFooter />
    </div>
  )
}

function PageHeader() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to Maratha
        </Link>

        <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-tamil text-sm uppercase tracking-[0.18em] text-primary/80">
              ஜாதக பொருத்தம்
            </p>
            <h1 className="mt-3 max-w-3xl font-serif text-5xl font-medium leading-[1.05] tracking-tight text-foreground text-balance md:text-6xl">
              Jathaka Porutham
              <span className="text-muted-foreground"> / </span>
              <span className="font-tamil">ஜாதக பொருத்தம்</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty">
              A sample compatibility reading between two Maratha members. You
              can see each partner&apos;s Rasi (ராசி) and Navamsa (நவாம்சம்) chart, a scored
              verdict on all ten Poruthams, and a brief astrologer&apos;s
              note.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-border bg-background text-foreground hover:bg-secondary"
            >
              <Share2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Share reading
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-border bg-background text-foreground hover:bg-secondary"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              PDF
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function CompatibilitySection() {
  return (
    <section className="border-b border-border/60 bg-secondary/20">
      <div className="mx-auto w-full max-w-7xl px-6 py-14">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
          <PartnerChartCard
            partner={GROOM}
            role="Groom"
            roleTamil="மாப்பிள்ளை"
            accentTone="primary"
          />

          <div className="flex flex-col items-center justify-center gap-4 py-4 lg:py-12">
            <MatchScoreGauge
              percent={MATCH_PERCENT}
              score={TOTAL_SCORE}
              max={TOTAL_MAX}
              size={260}
            />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <KolamMark className="h-4 w-4" strokeWidth={1} />
              <span>Computed on classical Tamil method</span>
            </div>
          </div>

          <PartnerChartCard
            partner={BRIDE}
            role="Bride"
            roleTamil="மணமகள்"
            accentTone="accent"
          />
        </div>
      </div>
    </section>
  )
}

function PoruthamSection() {
  return (
    <section id="poruthams" className="scroll-mt-20 border-b border-border/60">
      <div className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="font-tamil text-sm uppercase tracking-[0.18em] text-primary/80">
              விவரம்
            </p>
            <h2 className="mt-3 max-w-2xl font-serif text-4xl font-medium leading-tight tracking-tight text-foreground text-balance">
              How each of the ten Poruthams scored.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Each Porutham carries a traditional weight. A match is considered
            strong when the major Poruthams (Dinam, Ganam, Rasi, Rajju,
            Yoni) align — small misses are generally acceptable.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <PoruthamTable />
          <VerdictCard />
        </div>
      </div>
    </section>
  )
}

function Disclaimer() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-12">
      <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border bg-card/60 p-6 text-sm leading-relaxed text-muted-foreground md:flex-row md:items-start md:gap-6">
        <p className="font-tamil shrink-0 text-xs uppercase tracking-[0.18em] text-primary/70">
          குறிப்பு / A note
        </p>
        <p>
          The porutham score is a guide — not a verdict. Maratha encourages
          every couple to speak with a verified astrologer and, more
          importantly, with each other&apos;s families before any muhurtham
          is decided. The full algorithm, including Ashtakoot scoring for
          inter-state matches, is documented in our{" "}
          <Link
            href="#"
            className="font-medium text-foreground underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
          >
            methodology
          </Link>
          .
        </p>
      </div>
    </section>
  )
}
