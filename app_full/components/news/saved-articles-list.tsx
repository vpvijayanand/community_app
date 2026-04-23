"use client"

import Link from "next/link"
import { useMemo } from "react"
import { Bookmark, BookmarkX, Clock } from "lucide-react"

import { listAllArticles } from "@/lib/article-lookup"
import { CATEGORY_META } from "@/lib/news-data"
import { useArticles } from "@/lib/news-store"
import { useBookmarks, useProgressMap, readerStore } from "@/lib/reader-store"
import { NewsCard } from "@/components/news/news-card"
import { toast } from "sonner"

export function SavedArticlesList() {
  const bookmarks = useBookmarks()
  const progressMap = useProgressMap()
  const storeArticles = useArticles()

  // Resolve display articles for every saved slug, preserving save order.
  const saved = useMemo(() => {
    const all = listAllArticles()
    const bySlug = new Map(all.map((a) => [a.slug, a]))
    return bookmarks.map((s) => bySlug.get(s)).filter(Boolean) as ReturnType<
      typeof listAllArticles
    >
  }, [bookmarks, storeArticles])

  const inProgress = saved.filter(
    (a) => (progressMap[a.slug]?.percent ?? 0) > 5 && (progressMap[a.slug]?.percent ?? 0) < 95,
  )
  const finished = saved.filter((a) => (progressMap[a.slug]?.percent ?? 0) >= 95)

  if (!bookmarks.length) {
    return <EmptyState />
  }

  return (
    <div className="space-y-10">
      {/* Summary strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border-light bg-bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-light text-primary-deep">
            <Bookmark className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-text-primary">
              {saved.length} saved{" "}
              {saved.length === 1 ? "article" : "articles"}
            </div>
            <div className="mt-0.5 text-xs text-text-muted">
              {inProgress.length} in progress · {finished.length} finished
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            bookmarks.forEach((s) => readerStore.toggleBookmark(s))
            toast("Cleared your saved list", {
              description: "You can re-save any article from its page.",
            })
          }}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border-medium bg-bg-white px-4 text-sm font-semibold text-text-secondary transition-colors hover:border-danger hover:text-danger"
        >
          <BookmarkX className="h-4 w-4" />
          Clear all
        </button>
      </div>

      {/* In-progress */}
      {inProgress.length ? (
        <section>
          <SectionHeader
            tamil="தொடர்ந்து படிக்க"
            english="Continue reading"
            count={inProgress.length}
          />
          <div className="grid gap-3">
            {inProgress.map((a) => (
              <ContinueCard
                key={a.slug}
                slug={a.slug}
                titleEnglish={a.titleEnglish}
                titleTamil={a.titleTamil}
                category={a.category}
                image={a.image}
                date={a.date}
                readMinutes={a.readMinutes}
                percent={progressMap[a.slug]?.percent ?? 0}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* All saved */}
      <section>
        <SectionHeader
          tamil="சேமித்த கட்டுரைகள்"
          english="All saved articles"
          count={saved.length}
        />
        <div className="grid gap-3">
          {saved.map((a) => (
            <NewsCard
              key={a.slug}
              article={{
                id: a.slug,
                slug: a.slug,
                titleTamil: a.titleTamil,
                titleEnglish: a.titleEnglish,
                excerpt: a.excerpt,
                category: a.category,
                image: a.image,
                author: a.author,
                date: a.date,
                readMinutes: a.readMinutes,
                views: a.views,
              }}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

/* ----------------------------- Bits ----------------------------- */

function SectionHeader({
  tamil,
  english,
  count,
}: {
  tamil: string
  english: string
  count: number
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
          {tamil}
        </div>
        <h2 className="mt-1 font-tamil text-xl font-bold text-text-primary">
          {english}
        </h2>
      </div>
      <span className="rounded-full bg-bg-subtle px-3 py-1 text-xs font-semibold text-text-secondary">
        {count}
      </span>
    </div>
  )
}

function ContinueCard({
  slug,
  titleEnglish,
  titleTamil,
  category,
  image,
  date,
  readMinutes,
  percent,
}: {
  slug: string
  titleEnglish: string
  titleTamil?: string
  category: keyof typeof CATEGORY_META
  image?: string
  date: string
  readMinutes: number
  percent: number
}) {
  const meta = CATEGORY_META[category]
  const minutesLeft = Math.max(
    1,
    Math.round(readMinutes * (1 - percent / 100)),
  )
  return (
    <Link
      href={`/news/${slug}`}
      className="group relative overflow-hidden rounded-xl border border-accent/40 bg-gradient-to-br from-accent-light to-bg-white p-5 transition-colors hover:border-accent"
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-tamil text-sm font-bold"
          style={{ backgroundColor: meta.thumbBg, color: meta.textColor }}
        >
          {percent}%
        </div>
        <div className="min-w-0 flex-1">
          <span
            className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{ backgroundColor: meta.badgeBg, color: meta.textColor }}
          >
            {meta.label}
          </span>
          {titleTamil ? (
            <h3 className="mt-1.5 font-tamil text-base font-semibold leading-snug text-text-primary line-clamp-1 group-hover:text-primary">
              {titleTamil}
            </h3>
          ) : null}
          <p className="mt-0.5 text-sm font-medium text-text-secondary line-clamp-1">
            {titleEnglish}
          </p>
          <div className="mt-2 flex items-center gap-3 text-[11px] text-text-muted">
            <span>{date}</span>
            <span className="h-1 w-1 rounded-full bg-border-strong" />
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              About {minutesLeft} min left
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-bg-white">
            <div
              className="h-full bg-accent"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
      {image ? (
        <div
          className="absolute right-4 top-4 hidden h-16 w-16 overflow-hidden rounded-lg sm:block"
          aria-hidden
        >
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover opacity-80"
          />
        </div>
      ) : null}
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border-medium bg-bg-white p-12 text-center">
      <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent-light text-primary-deep">
        <Bookmark className="h-6 w-6" />
      </div>
      <h2 className="mt-5 font-tamil text-2xl font-bold text-text-primary">
        Your reading list is empty
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-text-secondary">
        Tap the bookmark on any article to save it here. We&apos;ll keep your
        reading progress, so you can pick up exactly where you left off.
      </p>
      <Link
        href="/news"
        className="mt-6 inline-flex h-10 items-center rounded-full bg-primary-deep px-5 text-sm font-semibold text-primary-foreground hover:bg-primary"
      >
        Browse the news
      </Link>
    </div>
  )
}
