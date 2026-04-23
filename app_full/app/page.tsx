import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, Compass, Heart, ScrollText, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { KolamMark } from "@/components/kolam-mark"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <Hero />
        <Philosophy />
        <AstrologyTeaser />
      </main>

      <SiteFooter />
    </div>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="absolute inset-0">
        <Image
          src="/hero-banner.jpeg"
          alt="Maratha Matrimony"
          fill
          priority
          className="object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      </div>
      <div className="kolam-dots pointer-events-none absolute inset-0 z-0 opacity-[0.18]" />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-20 md:py-32">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <KolamMark className="h-6 w-6" />
            <span className="font-tamil text-sm text-muted-foreground">
              மராத்தா — தமிழ் திருமண தேர்வு
            </span>
          </div>

          <h1 className="max-w-4xl font-serif text-5xl font-medium leading-[1.05] tracking-tight text-foreground text-balance md:text-7xl">
            Find a marriage that is aligned in{" "}
            <span className="italic text-primary">stars</span> and{" "}
            <span className="italic text-primary">values</span>.
          </h1>

          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Maratha is a Maratha-first matrimony and community platform that
            pairs classical jathaka porutham with a modern, honest way to get
            to know each other — in Tamil or English, across the diaspora.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/matches">
                Browse matches
                <ArrowUpRight className="ml-1 h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary/30 bg-background text-foreground hover:bg-secondary"
            >
              <Link href="/astrology">See a compatibility reading</Link>
            </Button>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-border/70 pt-10 md:grid-cols-4">
          <Stat label="Maratha households on Maratha" value="48k+" tamil="குடும்பங்கள்" />
          <Stat label="Verified astrologers" value="120" tamil="ஜோதிடர்கள்" />
          <Stat label="Marriages in 2025" value="3,410" tamil="திருமணங்கள்" />
          <Stat label="Countries represented" value="17" tamil="நாடுகள்" />
        </dl>
      </div>
    </section>
  )
}

function Stat({
  label,
  value,
  tamil,
}: {
  label: string
  value: string
  tamil: string
}) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-2 flex items-baseline gap-2">
        <span className="font-serif text-4xl font-medium text-foreground tabular-nums">
          {value}
        </span>
        <span className="font-tamil text-xs text-muted-foreground">
          {tamil}
        </span>
      </dd>
    </div>
  )
}

function Philosophy() {
  const items = [
    {
      icon: Compass,
      english: "Tradition",
      tamil: "பாரம்பரியம்",
      copy: "South Indian Rasi (ராசி) and Navamsa (நவாம்சம்) charts, ten Poruthams, and optional Ashtakoot — the way elders actually read a match.",
    },
    {
      icon: Heart,
      english: "Character",
      tamil: "குணம்",
      copy: "Structured prompts in Tamil and English help you understand values, family, food and faith before first contact.",
    },
    {
      icon: Sparkles,
      english: "Honesty",
      tamil: "உண்மை",
      copy: "Every profile is reviewed and every astrologer is verified. No fake photos. No ghost accounts.",
    },
    {
      icon: ScrollText,
      english: "Privacy",
      tamil: "தனியுரிமை",
      copy: "You decide when your horoscope, family and contact become visible — and to whom.",
    },
  ]

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-20">
      <div className="grid gap-12 md:grid-cols-[1.1fr_2fr]">
        <div>
          <p className="font-tamil text-sm uppercase tracking-[0.18em] text-primary/80">
            நம்முடைய வழி
          </p>
          <h2 className="mt-3 font-serif text-4xl font-medium leading-tight tracking-tight text-foreground text-balance">
            Built the way a Tamil household would build it.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty">
            Maratha began with a simple question — if we were building a
            matchmaking platform for our own cousins, what would we never cut
            corners on? The answer shaped four quiet principles that run
            through the product.
          </p>
        </div>

        <ul className="grid gap-6 sm:grid-cols-2">
          {items.map((item) => (
            <li
              key={item.english}
              className="flex gap-4 rounded-lg border border-border bg-card p-5"
            >
              <item.icon
                className="h-5 w-5 flex-shrink-0 text-primary"
                aria-hidden
              />
              <div>
                <div className="flex items-baseline gap-2">
                  <h3 className="font-serif text-lg font-medium text-foreground">
                    {item.english}
                  </h3>
                  <span className="font-tamil text-sm text-muted-foreground">
                    {item.tamil}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.copy}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function AstrologyTeaser() {
  return (
    <section className="border-t border-border/60 bg-secondary/30">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-20 md:grid-cols-[1fr_auto] md:items-center">
        <div className="max-w-2xl">
          <p className="font-tamil text-sm uppercase tracking-[0.18em] text-primary/80">
            ஜோதிட பொருத்தம்
          </p>
          <h2 className="mt-3 font-serif text-4xl font-medium leading-tight tracking-tight text-foreground text-balance">
            Read a real compatibility chart.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty">
            Every Maratha match comes with a Kodu Kattam for both horoscopes,
            a Navamsa view, and a verdict on the ten Poruthams — shown the way
            a traditional astrologer would write it, translated into plain
            English.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/astrology">
                Open the sample reading
                <ArrowUpRight className="ml-1 h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Link
              href="/astrology#poruthams"
              className="text-sm font-medium text-foreground underline decoration-primary/30 underline-offset-4 transition hover:decoration-primary"
            >
              Learn the ten Poruthams
            </Link>
          </div>
        </div>

        <KolamMark
          className="hidden h-40 w-40 text-primary/40 md:block"
          strokeWidth={0.75}
        />
      </div>
    </section>
  )
}
