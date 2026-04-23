"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import {
  ArrowLeft,
  ArrowUp,
  Calendar,
  ChevronRight,
  Clock,
  Eye,
  Facebook,
  Link2,
  Share2,
  Tag,
  Twitter,
  Type as TypeIcon,
} from "lucide-react"

import { CATEGORY_META } from "@/lib/news-data"
import {
  lookupArticle,
  relatedArticles,
  type DisplayArticle,
} from "@/lib/article-lookup"
import { useArticles } from "@/lib/news-store"
import { readerStore, useProgress } from "@/lib/reader-store"
import { cn } from "@/lib/utils"

import { ReadingProgressBar } from "./reading-progress-bar"
import { ArticleBody } from "./article-body"
import { RelatedArticles } from "./related-articles"
import { SaveButton } from "./save-button"

const FONT_STEPS = [0.9375, 1, 1.0625, 1.125] as const
const DEFAULT_FONT_INDEX = 1

export function ArticleReader({ slug }: { slug: string }) {
  // Re-run lookup whenever the admin store changes so user-published articles
  // become reachable immediately after publish.
  const storeArticles = useArticles()
  const article = useMemo(() => lookupArticle(slug), [slug, storeArticles])
  const related = useMemo<DisplayArticle[]>(
    () => (article ? relatedArticles(article.slug, article.category, 3) : []),
    [article, storeArticles],
  )

  if (!article) {
    return <NotFoundState slug={slug} />
  }
  return <Reader article={article} related={related} />
}

/* ---------------------------- Main reader ---------------------------- */

function Reader({
  article,
  related,
}: {
  article: DisplayArticle
  related: DisplayArticle[]
}) {
  const articleRef = useRef<HTMLElement>(null)
  const [fontIndex, setFontIndex] = useState<number>(DEFAULT_FONT_INDEX)
  const [showTopBtn, setShowTopBtn] = useState(false)
  const progress = useProgress(article.slug)

  const meta = CATEGORY_META[article.category]

  // "Show back-to-top" after 600px scroll
  useEffect(() => {
    const onScroll = () => setShowTopBtn(window.scrollY > 600)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Resume reading prompt — if the user has meaningful progress stored,
  // offer to jump them back to where they left off.
  const resumeShownRef = useRef(false)
  useEffect(() => {
    if (resumeShownRef.current) return
    if (!progress || progress.percent < 10 || progress.percent > 90) return
    resumeShownRef.current = true

    toast("Pick up where you left off", {
      description: `You were ${progress.percent}% through this article.`,
      duration: 7000,
      action: {
        label: "Resume",
        onClick: () => {
          const el = articleRef.current
          if (!el) return
          const total = el.offsetHeight - window.innerHeight
          const target = el.offsetTop + (total * progress.percent) / 100
          window.scrollTo({ top: target, behavior: "smooth" })
        },
      },
    })
    // Only evaluate once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied", {
        description: "Share it with a family member or chapter lead.",
      })
    } catch {
      toast.error("Could not copy the link from your browser.")
    }
  }

  const nativeShare = async () => {
    const data = {
      title: article.titleEnglish,
      text: article.excerpt,
      url: typeof window !== "undefined" ? window.location.href : "",
    }
    if (navigator.share) {
      try {
        await navigator.share(data)
      } catch {
        /* user dismissed */
      }
    } else {
      copyLink()
    }
  }

  return (
    <>
      <ReadingProgressBar slug={article.slug} targetRef={articleRef} />

      <article
        ref={articleRef}
        className="mx-auto max-w-[1100px] px-4 pb-16 pt-6 md:px-8 md:pt-10"
      >
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-text-muted"
        >
          <Link href="/news" className="hover:text-primary">
            News
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="capitalize text-text-secondary">{meta.label}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate text-text-secondary">
            {article.titleEnglish}
          </span>
        </nav>

        {/* Back link */}
        <Link
          href="/news"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          All articles
        </Link>

        <div className="mt-5 grid gap-10 lg:grid-cols-[1fr_260px]">
          {/* Main column */}
          <div className="min-w-0">
            {/* Title block */}
            <header>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]"
                  style={{
                    backgroundColor: meta.badgeBg,
                    color: meta.textColor,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: meta.textColor }}
                    aria-hidden
                  />
                  {meta.label}
                </span>
                {article.isPremium ? (
                  <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary-deep">
                    Premium · {article.priceLabel}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-success/40 bg-success/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-success">
                    Free to read
                  </span>
                )}
              </div>

              {article.titleTamil ? (
                <h1 className="mt-4 font-tamil text-3xl font-bold leading-[1.15] text-text-primary md:text-[44px] text-balance">
                  {article.titleTamil}
                </h1>
              ) : null}
              <p className="mt-2 text-xl font-semibold leading-snug text-text-secondary md:text-2xl text-balance">
                {article.titleEnglish}
              </p>

              {article.excerpt ? (
                <p className="mt-5 border-l-[3px] border-accent bg-bg-subtle/60 py-2 pl-4 text-[15px] leading-relaxed text-text-secondary">
                  {article.excerpt}
                </p>
              ) : null}
            </header>

            {/* Byline */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-border-light py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {article.author.initials}
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-text-primary">
                    {article.author.name}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {article.date}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-border-strong" />
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {article.readMinutes} min read
                    </span>
                    <span className="h-1 w-1 rounded-full bg-border-strong" />
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {article.views.toLocaleString()} views
                    </span>
                  </div>
                </div>
              </div>

              {/* Inline actions on larger screens */}
              <div className="hidden items-center gap-2 md:flex">
                <FontSizeControl
                  index={fontIndex}
                  onChange={setFontIndex}
                />
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-border-medium bg-bg-white px-4 text-sm font-semibold text-text-primary transition-colors hover:border-primary hover:text-primary"
                >
                  <Link2 className="h-4 w-4" />
                  Copy link
                </button>
                <SaveButton
                  slug={article.slug}
                  title={article.titleEnglish}
                  variant="pill"
                />
              </div>
            </div>

            {/* Cover image */}
            {article.image ? (
              <figure className="mt-6 overflow-hidden rounded-2xl border border-border-light">
                <div className="relative aspect-[16/9] w-full bg-bg-subtle">
                  <Image
                    src={article.image}
                    alt={article.titleEnglish}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 820px"
                    className="object-cover"
                  />
                </div>
              </figure>
            ) : null}

            {/* Mobile action bar */}
            <div className="mt-6 flex items-center gap-2 md:hidden">
              <FontSizeControl index={fontIndex} onChange={setFontIndex} />
              <SaveButton
                slug={article.slug}
                title={article.titleEnglish}
                variant="pill"
                className="flex-1 justify-center"
              />
              <button
                type="button"
                onClick={nativeShare}
                aria-label="Share article"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-medium bg-bg-white text-text-primary hover:border-primary hover:text-primary"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="mt-4">
              <ArticleBody
                blocks={article.content}
                isPremium={article.isPremium}
                pricing={article.pricing}
                fontScale={FONT_STEPS[fontIndex]}
              />
            </div>

            {/* Tags */}
            {article.tags.length ? (
              <div className="mt-10 flex flex-wrap items-center gap-2">
                <Tag className="h-4 w-4 text-text-muted" />
                {article.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border-light bg-bg-white px-3 py-1 text-xs font-medium text-text-secondary"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            ) : null}

            {/* Footer action row */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border-light bg-bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-light text-primary-deep">
                  <Share2 className="h-5 w-5" />
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-text-primary">
                    Share this story
                  </div>
                  <div className="mt-0.5 text-xs text-text-muted">
                    Help it reach the family members who would care most.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ShareIconButton
                  label="Share on Twitter"
                  onClick={() => {
                    const u = encodeURIComponent(window.location.href)
                    const t = encodeURIComponent(article.titleEnglish)
                    window.open(
                      `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }}
                >
                  <Twitter className="h-4 w-4" />
                </ShareIconButton>
                <ShareIconButton
                  label="Share on Facebook"
                  onClick={() => {
                    const u = encodeURIComponent(window.location.href)
                    window.open(
                      `https://www.facebook.com/sharer/sharer.php?u=${u}`,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }}
                >
                  <Facebook className="h-4 w-4" />
                </ShareIconButton>
                <ShareIconButton label="Copy link" onClick={copyLink}>
                  <Link2 className="h-4 w-4" />
                </ShareIconButton>
                <SaveButton
                  slug={article.slug}
                  title={article.titleEnglish}
                  variant="pill"
                />
              </div>
            </div>

            {/* Related */}
            <RelatedArticles articles={related} />
          </div>

          {/* Sidebar (desktop only) */}
          <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
            <SidebarFacts article={article} progressPercent={progress?.percent ?? 0} />
          </aside>
        </div>
      </article>

      {/* Back-to-top */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={cn(
          "fixed bottom-6 right-6 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary-deep text-primary-foreground shadow-[0_10px_30px_-10px_rgba(109,33,27,0.5)] transition-all hover:bg-primary",
          showTopBtn
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0",
        )}
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </>
  )
}

/* ---------------------------- Sidebar facts ---------------------------- */

function SidebarFacts({
  article,
  progressPercent,
}: {
  article: DisplayArticle
  progressPercent: number
}) {
  const meta = CATEGORY_META[article.category]
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border-light bg-bg-white p-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
          Your progress
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div className="font-tamil text-3xl font-bold text-primary-deep">
            {progressPercent}%
          </div>
          <div className="text-xs text-text-muted">
            {progressPercent >= 95
              ? "Finished — well done."
              : progressPercent > 0
                ? "Saved as you scroll."
                : "Start reading to track progress."}
          </div>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-bg-subtle">
          <div
            className="h-full bg-accent transition-[width] duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-5 flex items-center gap-2">
          <SaveButton
            slug={article.slug}
            title={article.titleEnglish}
            variant="pill"
            className="w-full justify-center"
          />
        </div>
        {progressPercent > 0 ? (
          <button
            type="button"
            onClick={() => readerStore.clearProgress(article.slug)}
            className="mt-3 text-xs font-semibold text-text-muted hover:text-primary"
          >
            Reset progress
          </button>
        ) : null}
      </div>

      <div className="rounded-xl border border-border-light bg-bg-white p-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
          Story details
        </div>
        <dl className="mt-3 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-text-muted">Category</dt>
            <dd
              className="font-semibold"
              style={{ color: meta.textColor }}
            >
              {meta.label}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-text-muted">Published</dt>
            <dd className="font-semibold text-text-primary">{article.date}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-text-muted">Read time</dt>
            <dd className="font-semibold text-text-primary">
              {article.readMinutes} min
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-text-muted">Access</dt>
            <dd className="font-semibold text-text-primary">
              {article.isPremium ? article.priceLabel : "Free"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

/* ---------------------------- Small bits ---------------------------- */

function FontSizeControl({
  index,
  onChange,
}: {
  index: number
  onChange: (i: number) => void
}) {
  return (
    <div className="inline-flex h-10 items-center gap-0.5 rounded-full border border-border-medium bg-bg-white p-1">
      <TypeIcon className="ml-2 mr-1 h-3.5 w-3.5 text-text-muted" />
      {FONT_STEPS.map((_, i) => {
        const active = i === index
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            aria-pressed={active}
            aria-label={`Text size ${i + 1}`}
            className={cn(
              "h-7 w-7 rounded-full text-[11px] font-bold transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-text-muted hover:text-text-primary",
            )}
            style={{ fontSize: `${10 + i * 1.5}px` }}
          >
            A
          </button>
        )
      })}
    </div>
  )
}

function ShareIconButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-medium bg-bg-white text-text-secondary transition-colors hover:border-primary hover:text-primary"
    >
      {children}
    </button>
  )
}

/* ---------------------------- Not found ---------------------------- */

function NotFoundState({ slug }: { slug: string }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent-light text-primary-deep">
        <Tag className="h-6 w-6" />
      </div>
      <h1 className="mt-5 font-tamil text-2xl font-bold text-text-primary">
        Article not found
      </h1>
      <p className="mt-2 text-sm text-text-secondary">
        We couldn&apos;t find an article with the slug{" "}
        <code className="rounded bg-bg-subtle px-1.5 py-0.5 text-xs text-text-primary">
          {slug}
        </code>
        . It may have been moved or unpublished.
      </p>
      <Link
        href="/news"
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-primary-deep px-5 text-sm font-semibold text-primary-foreground hover:bg-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to news
      </Link>
    </div>
  )
}
