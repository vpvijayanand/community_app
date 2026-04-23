import Link from "next/link"
import { Flame, Users, FileText, Sparkles } from "lucide-react"
import {
  TRENDING,
  CATEGORY_COUNTS,
  CATEGORY_META,
} from "@/lib/news-data"

function WidgetHeader({ title }: { title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className="h-4 w-1 rounded-full bg-accent" aria-hidden />
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
    </div>
  )
}

function Widget({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-xl border border-border-light bg-bg-white p-5">
      {children}
    </div>
  )
}

export function TrendingWidget() {
  return (
    <Widget>
      <WidgetHeader title="Trending This Week" />
      <ol className="space-y-3">
        {TRENDING.map((a, i) => (
          <li key={a.id}>
            <Link
              href={`/news/${a.slug}`}
              className="group flex gap-3"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-light text-[13px] font-bold text-primary">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="line-clamp-2 text-[13px] font-medium leading-snug text-text-primary group-hover:text-primary">
                  {a.titleEnglish}
                </p>
                <p className="mt-0.5 text-[11px] text-text-muted">
                  {a.views.toLocaleString()} views · {a.date}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </Widget>
  )
}

export function CommunityStatsWidget() {
  const stats = [
    { n: "1,284", l: "Members", Icon: Users },
    { n: "24", l: "Articles", Icon: FileText },
    { n: "6", l: "Events", Icon: Sparkles },
  ]
  return (
    <Widget>
      <WidgetHeader title="Community Today" />
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div
            key={s.l}
            className="rounded-lg border border-border-light bg-bg-page p-3 text-center"
          >
            <s.Icon className="mx-auto h-4 w-4 text-accent" />
            <div className="mt-2 font-tamil text-xl font-bold text-primary">
              {s.n}
            </div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wider text-text-muted">
              {s.l}
            </div>
          </div>
        ))}
      </div>
    </Widget>
  )
}

export function CategoryWidget() {
  return (
    <Widget>
      <WidgetHeader title="Browse by Category" />
      <ul className="space-y-1">
        {CATEGORY_COUNTS.map(({ category, count }) => {
          const meta = CATEGORY_META[category]
          return (
            <li key={category}>
              <Link
                href={`/news?cat=${category}`}
                className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-bg-subtle"
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: meta.textColor }}
                    aria-hidden
                  />
                  <span className="font-medium text-text-primary">
                    {meta.label}
                  </span>
                </span>
                <span className="rounded-full bg-bg-subtle px-2 py-0.5 text-[11px] font-semibold text-text-secondary">
                  {count}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </Widget>
  )
}

export function AdBanner() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-accent/40 bg-gradient-to-br from-accent-light to-bg-white p-5">
      <div className="absolute inset-0 kolam-dots opacity-40" aria-hidden />
      <div className="relative">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
            Mathat Trust
          </span>
        </div>
        <h4 className="mt-3 font-tamil text-lg font-bold text-text-primary">
          உங்கள் குலம். உங்கள் கதை.
        </h4>
        <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
          Preserve your family lineage in the community archive — free for all
          registered members.
        </p>
        <Link
          href="/archive"
          className="mt-4 inline-flex h-9 items-center rounded-full bg-primary px-4 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
        >
          Contribute your story
        </Link>
      </div>
    </div>
  )
}
