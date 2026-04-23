import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Newspaper, LayoutDashboard, Flame } from "lucide-react"
import { SiteHeader as SiteNavbar } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-page">
      <SiteNavbar activeHref="/" />

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary-deep text-white">
        <div className="absolute inset-0 kolam-dots opacity-60" aria-hidden />
        <div
          className="absolute -right-32 -top-16 h-80 w-80 rounded-full bg-accent/20 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-[1100px] px-4 py-20 md:py-28 md:px-8">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                <Flame className="h-3 w-3" /> Mathat Community Â· Since 1972
              </span>
              <h1 className="mt-5 font-tamil text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl text-balance">
                à®¨à®®à¯ à®•à¯à®²à®®à¯. <br />
                <span className="text-accent">à®¨à®®à¯ à®•à®¤à¯ˆ.</span>
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-white/75 text-pretty">
                A quiet, elegant home for our people â€” news, culture, learning
                and matrimony, held together by warmth and tradition.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/news"
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-primary-deep transition-colors hover:bg-[#f1b85a]"
                >
                  Read the News Feed
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/admin/news"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur transition-colors hover:border-white/50 hover:bg-white/10"
                >
                  Admin Dashboard
                </Link>
              </div>
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 shadow-2xl md:aspect-[3/4]">
              <Image
                src="/images/featured-article.jpg"
                alt="Community gathering"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 440px"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary-deep/80 to-transparent p-5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
                  Featured this week
                </span>
                <p className="mt-1 font-tamil text-lg font-semibold">
                  à®®à®¾à®¤à®¤à¯ à®•à¯à®² à®®à®•à®¾à®¨à®¾à®Ÿà¯ 2025
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Routes */}
      <section className="mx-auto max-w-[1100px] px-4 py-16 md:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
              Two surfaces, one community
            </p>
            <h2 className="mt-2 font-tamil text-3xl font-bold text-text-primary">
              Explore the platform
            </h2>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {[
            {
              title: "Public News Feed",
              href: "/news",
              Icon: Newspaper,
              desc: "The front page for members â€” featured stories, categories, trending widgets and a warm ivory reading experience.",
            },
            {
              title: "Admin News Dashboard",
              href: "/admin/news",
              Icon: LayoutDashboard,
              desc: "Create, schedule and manage articles. Tamil & English fields, image uploads, toggles and a rich-text editor.",
            },
          ].map(({ title, href, Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="group relative overflow-hidden rounded-2xl border border-border-light bg-bg-white p-7 transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[0_20px_60px_-24px_rgba(109,33,27,0.25)]"
            >
              <div className="absolute inset-0 kolam-dots opacity-30" aria-hidden />
              <div className="relative">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-light text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-xl font-semibold text-text-primary">
                  {title}
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-secondary">
                  {desc}
                </p>
                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Open
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
