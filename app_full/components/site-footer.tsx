import Link from "next/link"
import { KolamMark } from "@/components/kolam-mark"

const columns = [
  {
    heading: "Maratha",
    tamil: "மராத்தா",
    links: [
      { label: "Our story", href: "#" },
      { label: "Editorial", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
  {
    heading: "Matchmaking",
    tamil: "பொருத்தம்",
    links: [
      { label: "Browse matches", href: "#" },
      { label: "Astrology", href: "/astrology" },
      { label: "Ten Poruthams", href: "/astrology#poruthams" },
      { label: "Chat", href: "#" },
    ],
  },
  {
    heading: "Community",
    tamil: "சமூகம்",
    links: [
      { label: "Tamil diaspora", href: "#" },
      { label: "Success stories", href: "#" },
      { label: "Events", href: "#" },
      { label: "Journal", href: "#" },
    ],
  },
  {
    heading: "Support",
    tamil: "உதவி",
    links: [
      { label: "Help centre", href: "#" },
      { label: "Trust & safety", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-secondary/40">
      <div className="mx-auto w-full max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-6">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <KolamMark className="h-8 w-8" />
              <span className="font-serif text-2xl font-medium tracking-tight">
                Maratha
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A Tamil-first matrimony & community platform. Rooted in
              tradition, designed for a modern generation finding partners
              across the diaspora.
            </p>
            <p className="font-tamil mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              தமிழருக்கென வடிவமைக்கப்பட்ட நவீன திருமண தேர்வு மேடை.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-medium text-foreground">
                  {col.heading}
                </h3>
                <span className="font-tamil text-xs text-muted-foreground">
                  {col.tamil}
                </span>
              </div>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground transition hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>&copy; {new Date().getFullYear()} Maratha. Chennai & Singapore.</p>
          <p className="font-tamil">வாழ்க வளமுடன்</p>
        </div>
      </div>
    </footer>
  )
}
