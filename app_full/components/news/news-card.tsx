"use client"

import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, Eye } from "lucide-react"

import { type Article, CATEGORY_META } from "@/lib/news-data"
import { useProgress } from "@/lib/reader-store"
import { SaveButton } from "@/components/news/detail/save-button"

export function NewsCard({ article }: { article: Article }) {
  const meta = CATEGORY_META[article.category]
  const progress = useProgress(article.slug)
  const percent = progress?.percent ?? 0
  const inProgress = percent > 5 && percent < 95
  const finished = percent >= 95

  return (
    <article className="group relative flex gap-4 rounded-lg border border-border-light bg-bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[0_8px_24px_-10px_rgba(109,33,27,0.15)]">
      {/* Stretched link covers the whole card */}
      <Link
        href={`/news/${article.slug}`}
        className="absolute inset-0 z-[1] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        aria-label={article.titleEnglish}
      >
        <span className="sr-only">{article.titleEnglish}</span>
      </Link>

      <div
        className="relative z-0 h-24 w-24 shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-28"
        style={{ backgroundColor: meta.thumbBg }}
      >
        {article.image ? (
          <Image
            src={article.image}
            alt={article.titleEnglish}
            fill
            sizes="112px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center font-tamil text-xs font-semibold"
            style={{ color: meta.textColor }}
          >
            {meta.tamilLabel}
          </div>
        )}

        {/* Progress overlay (bottom of thumbnail) */}
        {(inProgress || finished) && (
          <div
            className="absolute inset-x-0 bottom-0 h-1 bg-black/15"
            aria-hidden
          >
            <div
              className="h-full bg-accent"
              style={{ width: `${finished ? 100 : percent}%` }}
            />
          </div>
        )}
      </div>

      {/* Save toggle - above the stretched link */}
      <SaveButton
        slug={article.slug}
        title={article.titleEnglish}
        variant="icon"
        className="absolute right-3 top-3 z-[2] h-8 w-8 shadow-sm"
      />

      <div className="relative z-0 min-w-0 flex-1 pr-10">
        <div className="flex items-center gap-2">
          <span
            className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{ backgroundColor: meta.badgeBg, color: meta.textColor }}
          >
            {meta.label}
          </span>
          {inProgress ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
              Continue · {percent}%
            </span>
          ) : finished ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-success">
              Finished
            </span>
          ) : null}
        </div>

        {article.titleTamil && (
          <h3 className="mt-1.5 font-tamil text-[15px] font-semibold leading-snug text-text-primary line-clamp-2 group-hover:text-primary">
            {article.titleTamil}
          </h3>
        )}
        <p className="mt-0.5 text-sm font-medium text-text-secondary line-clamp-2 sm:text-[15px]">
          {article.titleEnglish}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-muted">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {article.date}
          </span>
          <span className="h-1 w-1 rounded-full bg-border-strong" />
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {article.views.toLocaleString()} views
          </span>
          <span className="h-1 w-1 rounded-full bg-border-strong" />
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.readMinutes} min read
          </span>
        </div>
      </div>
    </article>
  )
}
