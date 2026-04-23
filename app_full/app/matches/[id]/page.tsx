import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, BadgeCheck, Heart, MapPin, Star } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { CompatibilityView } from "@/components/astrology/compatibility-view"
import { MatchScoreGauge } from "@/components/match-score-gauge"
import { ChatTrigger } from "@/components/chat/chat-trigger"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { PROFILES, formatHeight, getProfileById } from "@/lib/profiles-data"

export function generateStaticParams() {
  return PROFILES.map((p) => ({ id: p.id }))
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = getProfileById(id)
  if (!profile) notFound()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 md:py-12">
        {/* Back */}
        <Link
          href="/matches"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to matches
        </Link>

        {/* Hero section */}
        <div className="flex flex-col gap-8 md:flex-row md:gap-10">
          {/* Left: photo + gauge */}
          <div className="shrink-0 md:w-72">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-border bg-muted">
              <Image
                src={profile.photo || "/placeholder.svg"}
                alt={profile.name}
                fill
                sizes="(min-width: 768px) 288px, 100vw"
                className="object-cover"
                priority
              />
            </div>

            {/* Score gauge */}
            <div className="mt-6 flex justify-center">
              <MatchScoreGauge
                percent={profile.matchScore}
                score={profile.matchScore}
                max={100}
                size={180}
              />
            </div>
          </div>

          {/* Right: identity + CTAs */}
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
              <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5">
                {profile.community}
              </span>
              <span className="font-tamil normal-case tracking-normal text-muted-foreground">
                {profile.communityTamil}
              </span>
            </div>

            <h1 className="mt-3 flex items-baseline gap-3 font-serif text-3xl font-medium text-foreground md:text-4xl">
              {profile.name}
              {profile.isVerified && (
                <BadgeCheck className="h-5 w-5 text-accent" aria-label="Verified" />
              )}
            </h1>
            <p className="font-tamil mt-1 text-lg text-muted-foreground">{profile.nameTamil}</p>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-foreground">
              <span>{profile.age} yrs</span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span>{formatHeight(profile.heightCm)}</span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {profile.location}
              </span>
            </div>

            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-foreground/90">
              {profile.about}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Heart className="mr-2 h-4 w-4" />
                Express interest
              </Button>
              <ChatTrigger partnerId={profile.id} partnerName={profile.name} />
              <Button variant="ghost" size="icon" aria-label="Save">
                <Star className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick astro facts */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { label: "நட்சத்திரம்", value: profile.starTamil || profile.star },
                { label: "ராசி", value: profile.rasiTamil || profile.rasi },
                { label: "Match Score", value: `${profile.matchScore}/100` },
              ].map((f) => (
                <div key={f.label} className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-center">
                  <p className="font-tamil text-[10px] text-muted-foreground">{f.label}</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-10" />

        {/* Astrology compatibility section */}
        <section>
          <div className="mb-6">
            <h2 className="font-serif text-2xl font-medium text-foreground">
              Astrology Compatibility
            </h2>
            <p className="font-tamil text-sm text-muted-foreground mt-1">
              10 பொருத்த ஒப்பீடு · ஜாதக கட்டம்
            </p>
          </div>

          <CompatibilityView viewerId="current-user" profileId={profile.id} />
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
