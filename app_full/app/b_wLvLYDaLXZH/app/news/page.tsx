import { SiteHeader as SiteNavbar } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { HeroBanner } from "@/components/news/hero-banner"
import { CategoryFilterBar } from "@/components/news/category-filter-bar"
import { FeaturedArticleCard } from "@/components/news/featured-article-card"
import { NewsCard } from "@/components/news/news-card"
import { Pagination } from "@/components/news/pagination"
import {
  AdBanner,
  CategoryWidget,
  CommunityStatsWidget,
  TrendingWidget,
} from "@/components/news/sidebar-widgets"
import { ARTICLES, FEATURED } from "@/lib/news-data"

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-bg-page">
      <SiteNavbar activeHref="/news" />
      <HeroBanner />
      <CategoryFilterBar />

      <main className="mx-auto max-w-[1280px] px-4 py-10 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Feed column */}
          <div className="min-w-0">
            <FeaturedArticleCard article={FEATURED} />

            <div className="mt-10 flex items-center justify-between">
              <div>
                <h2 className="font-tamil text-2xl font-bold text-text-primary">
                  à®šà®®à¯€à®ªà®¤à¯à®¤à®¿à®¯ à®šà¯†à®¯à¯à®¤à®¿à®•à®³à¯
                </h2>
                <p className="mt-1 text-sm text-text-muted">
                  Latest news Â· updated daily by the editorial desk
                </p>
              </div>
              <div className="hidden items-center gap-2 text-xs text-text-muted md:flex">
                <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
                Live feed
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {ARTICLES.map((a) => (
                <NewsCard key={a.id} article={a} />
              ))}
            </div>

            <Pagination />
          </div>

          {/* Sidebar */}
          <aside className="space-y-0 lg:sticky lg:top-32 lg:self-start">
            <TrendingWidget />
            <CommunityStatsWidget />
            <CategoryWidget />
            <AdBanner />
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
