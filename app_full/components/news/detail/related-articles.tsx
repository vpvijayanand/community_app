import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Clock } from "lucide-react"
import type { DisplayArticle } from "@/lib/article-lookup"
import { CATEGORY_META } from "@/lib/news-data"
import { SaveButton } from "./save-button"

export function RelatedArticles({
  articles,
}: {
  articles: DisplayArticle[]
}) {
  if (!articles.length) return null
  return (
    <section className="mt-14 border-t border-border-light pt-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            தொடர்ந்து படிக்க
          </div>
          <h2 className="mt-1 font-tamil text-2xl font-bold text-text-primary">
            Related Articles
          </h2>
        </div>
        <Link
          href="/news"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark"
        >
          Back to all news
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {articles.map((a) => {
          const meta = CATEGORY_META[a.category]
          return (
            <article
              key={a.slug}
              className="group relative overflow-hidden rounded-xl border border-border-light bg-bg-white transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[0_10px_30px_-12px_rgba(109,33,27,0.18)]"
            >
              <Link
                href={`/news/${a.slug}`}
                className="absolute inset-0 z-[1] focus-visible:outline-none"
              >
                <span className="sr-only">{a.titleEnglish}</span>
              </Link>

              <div
                className="relative h-36 w-full overflow-hidden"
                style={{ backgroundColor: meta.thumbBg }}
              >
                {a.image ? (
                  <Image
                    src={a.image}
                    alt={a.titleEnglish}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center font-tamil text-sm font-semibold"
                    style={{ color: meta.textColor }}
                  >
                    {meta.tamilLabel}
                  </div>
                )}
                <SaveButton
                  slug={a.slug}
                  title={a.titleEnglish}
                  variant="icon"
                  className="absolute right-2 top-2 z-[2]"
                />
                {a.isPremium ? (
                  <span className="absolute left-2 top-2 z-[2] rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-deep">
                    Premium · {a.priceLabel}
                  </span>
                ) : null}
              </div>

              <div className="p-4">
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
                  style={{ backgroundColor: meta.badgeBg, color: meta.textColor }}
                >
                  {meta.label}
                </span>
                {a.titleTamil ? (
                  <h3 className="mt-2 font-tamil text-base font-semibold leading-snug text-text-primary line-clamp-2 group-hover:text-primary">
                    {a.titleTamil}
                  </h3>
                ) : null}
                <p className="mt-1 text-sm font-medium text-text-secondary line-clamp-2">
                  {a.titleEnglish}
                </p>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-text-muted">
                  <Clock className="h-3 w-3" />
                  {a.readMinutes} min read
                  <span className="h-1 w-1 rounded-full bg-border-strong" />
                  {a.date}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
