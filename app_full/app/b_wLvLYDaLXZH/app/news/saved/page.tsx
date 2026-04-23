import type { Metadata } from "next"

import { SiteHeader as SiteNavbar } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { SavedArticlesList } from "@/components/news/saved-articles-list"

export const metadata: Metadata = {
  title: "Your saved articles Â· Mathat Community",
  description:
    "Articles you've saved to read later, with your reading progress preserved.",
}

export default function SavedPage() {
  return (
    <div className="min-h-screen bg-bg-page">
      <SiteNavbar activeHref="/news" />

      <section className="relative overflow-hidden border-b border-border-light bg-bg-white">
        <div
          className="absolute inset-0 kolam-dots-soft opacity-60"
          aria-hidden
        />
        <div className="relative mx-auto max-w-[1100px] px-4 py-10 md:px-8 md:py-14">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            à®‰à®™à¯à®•à®³à¯ à®µà®¾à®šà®¿à®ªà¯à®ªà¯ à®ªà®Ÿà¯à®Ÿà®¿à®¯à®²à¯
          </div>
          <h1 className="mt-2 font-tamil text-3xl font-bold leading-tight text-text-primary md:text-4xl text-balance">
            Your reading list
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary md:text-[15px]">
            Articles you&apos;ve bookmarked to finish later. We keep track of
            how far you&apos;ve read, so you can resume at the right paragraph.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-[1100px] px-4 py-10 md:px-8">
        <SavedArticlesList />
      </main>

      <SiteFooter />
    </div>
  )
}
