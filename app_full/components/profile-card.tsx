import Image from "next/image"
import Link from "next/link"
import { memo } from "react"
import { BadgeCheck, Sparkles, MapPin, GraduationCap, Briefcase, Star } from "lucide-react"
import type { Profile } from "@/lib/profiles-data"
import { formatHeight } from "@/lib/profiles-data"
import { cn } from "@/lib/utils"

export const ProfileCard = memo(function ProfileCard({ profile }: { profile: Profile }) {
  const scoreColor =
    profile.matchScore >= 85
      ? "bg-primary text-primary-foreground"
      : profile.matchScore >= 75
        ? "bg-accent text-accent-foreground"
        : "bg-secondary text-secondary-foreground"

  return (
    <Link
      href={`/profile/${profile.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        <Image
          src={profile.photo || "/placeholder.svg"}
          alt={`Portrait of ${profile.name}`}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />

        {/* top-left badges */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {profile.isNew && (
            <span className="rounded-full bg-background/90 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary backdrop-blur">
              New
            </span>
          )}
          {profile.isPremium && (
            <span className="flex items-center gap-1 rounded-full bg-primary/95 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary-foreground backdrop-blur">
              <Sparkles className="h-2.5 w-2.5" aria-hidden />
              Premium
            </span>
          )}
        </div>

        {/* match score */}
        <div
          className={cn(
            "absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums shadow-sm",
            scoreColor,
          )}
        >
          <Star className="h-3 w-3 fill-current" aria-hidden />
          {profile.matchScore}%
        </div>

        {/* name gradient bar */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/85 via-foreground/40 to-transparent px-4 pb-3 pt-10">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <h3 className="flex items-center gap-1.5 truncate font-serif text-lg font-medium text-background">
                {profile.name}
                {profile.isVerified && (
                  <BadgeCheck className="h-4 w-4 shrink-0 text-accent" aria-label="Verified" />
                )}
              </h3>
              <p className="font-tamil text-sm text-background/80">{profile.nameTamil}</p>
            </div>
            <span className="text-sm font-medium tabular-nums text-background/90">
              {profile.age} <span className="text-background/60">yrs</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4 text-sm">
        <div className="flex items-center gap-2 text-foreground">
          <span className="tabular-nums">{formatHeight(profile.heightCm).split(" ")[0]}</span>
          <span className="h-1 w-1 rounded-full bg-border" aria-hidden />
          <span className="truncate">{profile.community}</span>
          <span className="h-1 w-1 rounded-full bg-border" aria-hidden />
          <span className="truncate">{profile.star}</span>
        </div>

        <div className="flex items-start gap-2 text-muted-foreground">
          <GraduationCap className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="line-clamp-1">{profile.education}</span>
        </div>

        <div className="flex items-start gap-2 text-muted-foreground">
          <Briefcase className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="line-clamp-1">
            {profile.profession}
            {profile.company ? ` · ${profile.company}` : ""}
          </span>
        </div>

        <div className="flex items-start gap-2 text-muted-foreground">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate">{profile.location}</span>
        </div>
      </div>
    </Link>
  )
})
