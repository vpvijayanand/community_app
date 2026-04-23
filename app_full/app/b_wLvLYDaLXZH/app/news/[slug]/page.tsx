import type { Metadata } from "next"

import { SiteHeader as SiteNavbar } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ArticleReader } from "@/components/news/detail/article-reader"
import { ARTICLES, FEATURED } from "@/lib/news-data"

/* ----------------------- Server-side metadata ----------------------- */

function seedLookup(slug: string) {
  if (FEATURED.slug === slug) return FEATURED
  return ARTICLES.find((a) => a.slug === slug) ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const seed = seedLookup(slug)
  if (!seed) {
    return {
      title: "Article Â· Mathat Community",
      description: "Read the latest news from the Mathat community.",
    }
  }
  return {
    title: `${seed.titleEnglish} Â· Mathat Community`,
    description: seed.excerpt,
    openGraph: {
      title: seed.titleEnglish,
      description: seed.excerpt,
      images: seed.image ? [seed.image] : undefined,
      type: "article",
    },
  }
}

/* ----------------------------- Page ----------------------------- */

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return (
    <div className="min-h-screen bg-bg-page">
      <SiteNavbar activeHref="/news" />
      <ArticleReader slug={slug} />
      <SiteFooter />
    </div>
  )
}
