import { Calendar, Clock, Edit3, XCircle } from "lucide-react"
import { CATEGORY_META } from "@/lib/news-data"

const SCHEDULED = [
  {
    id: "s1",
    title: "Chithirai Festival — Live Photo Coverage",
    category: "events" as const,
    date: "Apr 24, 2026",
    time: "06:00 AM IST",
    author: "Events Desk",
  },
  {
    id: "s2",
    title: "Monthly Astrological Outlook — Vaigasi",
    category: "astrology" as const,
    date: "May 01, 2026",
    time: "08:30 AM IST",
    author: "K. Iyer",
  },
  {
    id: "s3",
    title: "Scholarship Recipients — Full List",
    category: "announcements" as const,
    date: "May 18, 2026",
    time: "10:00 AM IST",
    author: "Trust Board",
  },
]

export function ScheduledTab() {
  return (
    <div className="px-4 pb-10 md:px-8">
      <div className="mb-4 flex items-center justify-between rounded-xl border border-accent/40 bg-accent-light/60 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary-deep">
            <Calendar className="h-4 w-4" />
          </span>
          <div>
            <div className="text-sm font-semibold text-text-primary">
              3 articles scheduled for publishing
            </div>
            <div className="text-[12px] text-text-muted">
              They will go live automatically at the set time.
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {SCHEDULED.map((s) => {
          const meta = CATEGORY_META[s.category]
          return (
            <div
              key={s.id}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-border-light bg-bg-white p-4"
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg font-tamil text-xs font-semibold"
                style={{ backgroundColor: meta.thumbBg, color: meta.textColor }}
              >
                {meta.tamilLabel}
              </div>
              <div className="min-w-0 flex-1">
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
                  style={{ backgroundColor: meta.badgeBg, color: meta.textColor }}
                >
                  {meta.label}
                </span>
                <div className="mt-1 text-sm font-semibold text-text-primary">
                  {s.title}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {s.date}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {s.time}
                  </span>
                  <span>by {s.author}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border-light bg-transparent px-3 text-[12px] font-semibold text-text-secondary transition-colors hover:border-primary hover:text-primary"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Reschedule
                </button>
                <button
                  type="button"
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border-light bg-transparent px-3 text-[12px] font-semibold text-text-secondary transition-colors hover:border-danger hover:text-danger"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Cancel
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
