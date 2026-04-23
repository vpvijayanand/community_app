import { Search } from "lucide-react"

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-primary-deep text-white">
      <div className="absolute inset-0 kolam-dots opacity-60" aria-hidden />
      {/* soft saffron glow top-right */}
      <div
        className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[860px] px-4 py-14 text-center md:py-20">
        {/* Live badge */}
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          Live — Community Feed
        </span>

        <h1 className="mt-5 font-tamil text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          மாதத் சமூக <span className="text-accent">செய்திகள்</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-balance text-sm leading-relaxed text-white/70 md:text-base">
          Latest news, events and announcements from your community — curated
          with care, written for family.
        </p>

        {/* Stats */}
        <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-8">
          {[
            { n: "24", l: "Articles" },
            { n: "6", l: "Events" },
            { n: "1.2k", l: "Readers" },
          ].map((s, i) => (
            <div key={s.l} className="flex items-center gap-8">
              <div className="text-center">
                <div className="font-tamil text-2xl font-bold text-accent md:text-3xl">
                  {s.n}
                </div>
                <div className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-white/55">
                  {s.l}
                </div>
              </div>
              {i < 2 && <span className="h-8 w-px bg-white/10" />}
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mx-auto mt-8 max-w-xl">
          <label className="relative block">
            <span className="sr-only">Search news</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
            <input
              type="search"
              placeholder="Search news, events, announcements..."
              className="h-12 w-full rounded-full border border-white/20 bg-white/10 pl-11 pr-4 text-sm text-white placeholder:text-white/50 backdrop-blur-sm transition-colors focus:border-accent/70 focus:bg-white/15 focus:outline-none"
            />
          </label>
        </div>
      </div>
    </section>
  )
}
