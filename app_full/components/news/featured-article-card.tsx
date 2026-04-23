import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Clock, Eye } from "lucide-react"
import { type Article, CATEGORY_META } from "@/lib/news-data"
import { SaveButton } from "@/components/news/detail/save-button"

export function FeaturedArticleCard({ article }: { article: Article }) {
  const meta = CATEGORY_META[article.category]
  return (
    <article className="group overflow-hidden rounded-xl border border-border-light bg-bg-white shadow-[0_1px_0_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_12px_40px_-12px_rgba(109,33,27,0.18)]">
      <div className="relative h-56 w-full overflow-hidden md:h-72">
        {article.image ? (
          <Image
            src={article.image}
            alt={article.titleEnglish}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 66vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary to-primary-deep" />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-t from-primary-deep/55 via-primary-deep/10 to-transparent"
          aria-hidden
        />

        <span className="absolute left-4 top-4 rounded-md bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-deep">
          ★ Featured
        </span>
        <span className="absolute right-4 top-4 rounded-md bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
          {meta.label}
        </span>

        <SaveButton
          slug={article.slug}
          title={article.titleEnglish}
          variant="icon"
          className="absolute bottom-4 right-4 h-10 w-10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)]"
        />
      </div>

      <div className="p-6 md:p-7">
        <div
          className="text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: meta.textColor }}
        >
          Community Event · {meta.tamilLabel}
        </div>

        {article.titleTamil && (
          <h2 className="mt-3 font-tamil text-2xl font-bold leading-tight text-text-primary md:text-3xl text-balance">
            {article.titleTamil}
          </h2>
        )}
        <p className="mt-1 text-lg font-semibold text-text-secondary md:text-xl text-balance">
          {article.titleEnglish}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary md:text-[15px] text-pretty">
          {article.excerpt}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {article.author.initials}
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-text-primary">
                {article.author.name}
              </div>
              <div className="mt-0.5 flex items-center gap-3 text-xs text-text-muted">
                <span>{article.date}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {article.readMinutes} min read
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {article.views.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <Link
            href={`/news/${article.slug}`}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
          >
            Read Article
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}
