import Link from "next/link"
import { Flame, Instagram, Facebook, Youtube } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border-light bg-bg-surface">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-14 md:grid-cols-4 md:px-8">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Flame className="h-5 w-5" strokeWidth={2.4} />
            </div>
            <div className="leading-tight">
              <div className="font-tamil text-base font-semibold text-text-primary">
                மாதத் சமூகம்
              </div>
              <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted">
                Mathat Community
              </div>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-secondary">
            A home for Tamil families — news, events, learning and matrimony,
            rooted in tradition, designed for today.
          </p>
          <div className="mt-5 flex gap-2">
            {[
              { Icon: Instagram, label: "Instagram" },
              { Icon: Facebook, label: "Facebook" },
              { Icon: Youtube, label: "YouTube" },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-light bg-bg-white text-text-secondary transition-colors hover:border-primary hover:text-primary"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {[
          {
            title: "Community",
            links: ["News", "Events", "Matrimony", "Learning"],
          },
          {
            title: "Company",
            links: ["About", "Leadership", "Careers", "Contact"],
          },
          {
            title: "Resources",
            links: ["Help Center", "Privacy", "Terms", "Guidelines"],
          },
        ].map((col) => (
          <div key={col.title}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
              {col.title}
            </div>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l}>
                  <Link
                    href="#"
                    className="text-sm text-text-secondary transition-colors hover:text-primary"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border-light">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-2 px-4 py-5 md:flex-row md:px-8">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} Mathat Community. Crafted with care in Madurai.
          </p>
          <p className="text-xs text-text-muted">
            Made for our people, from our people.
          </p>
        </div>
      </div>
    </footer>
  )
}
