import Link from "next/link"
import { ArrowRight, BookOpen, ShieldCheck, Heart, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PORUTHAMS } from "@/lib/astrology-data"

export function VerdictCard() {
  const passed = PORUTHAMS.filter((p) => p.passed)
  const failed = PORUTHAMS.filter((p) => !p.passed)

  return (
    <div className="flex flex-col gap-6 rounded-lg border border-primary/30 bg-primary/5 p-6">
      <div>
        <p className="font-tamil text-xs uppercase tracking-[0.18em] text-primary/80">
          ஜோதிடர் குறிப்பு
        </p>
        <h3 className="mt-2 font-serif text-2xl font-medium leading-tight text-foreground text-balance">
          A broadly favourable pairing, with one remedial consideration.
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Nine of the ten Poruthams align between Uthrattathi (groom) and
          Rohini (bride). Rajju sits in a shared Pada strand — a traditional
          concern for longevity that is commonly addressed through a parihara
          at a Shiva or Navagraha sthalam before the muhurtham is finalised.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-4 border-y border-primary/20 py-4">
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted-foreground">
            Matched
          </dt>
          <dd className="mt-1 font-serif text-3xl font-medium text-primary tabular-nums">
            {passed.length}
            <span className="ml-1 text-base text-muted-foreground">/ 10</span>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted-foreground">
            Needs remedy
          </dt>
          <dd className="mt-1 font-serif text-3xl font-medium text-foreground tabular-nums">
            {failed.length}
            <span className="ml-1 text-base text-muted-foreground">
              {failed.length === 1 ? "dosha" : "doshas"}
            </span>
          </dd>
        </div>
      </dl>

      <ul className="space-y-3 text-sm">
        <li className="flex items-start gap-3">
          <ShieldCheck
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary"
            aria-hidden
          />
          <span className="text-foreground/85">
            Dinam, Ganam, Rasi and Stree Dheerkam are strong — day-to-day life,
            temperament and longevity of the bride look well-aligned.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <BookOpen
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary"
            aria-hidden
          />
          <span className="text-foreground/85">
            Rajju Dosha noted. A Maratha astrologer can walk you through the
            traditional remedies and document them in your kundali report.
          </span>
        </li>
      </ul>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
          <Heart className="mr-2 h-4 w-4" aria-hidden />
          Express interest
        </Button>
        <Button
          asChild
          variant="outline"
          className="flex-1 border-primary/30 bg-background text-foreground hover:bg-secondary"
        >
          <Link href="/chat/u1">
            <MessageCircle className="mr-2 h-4 w-4" aria-hidden />
            Send message
          </Link>
        </Button>
      </div>
    </div>
  )
}
