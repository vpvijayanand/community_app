import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import Link from "next/link"

export const metadata: Metadata = {
  title: "News & Announcements | Maratha Matrimony",
  description: "Stay updated with community news and events.",
}

const NEWS_ARTICLES = [
  {
    id: "1",
    title: "Community Meetup in Mumbai",
    summary: "Join us for our annual community gathering to discuss the future of our matrimony services and connect with other families.",
    date: "August 15, 2026",
    category: "Events"
  },
  {
    id: "2",
    title: "Understanding Navamsa in Matchmaking",
    summary: "A deep dive into why Navamsa charts are crucial for long-term compatibility, written by our expert astrologers.",
    date: "August 10, 2026",
    category: "Matrimony Tips"
  },
  {
    id: "3",
    title: "New Premium Features Launched",
    summary: "We have introduced advanced filtering and unlimited chat options for our Gold tier members.",
    date: "August 5, 2026",
    category: "Community Updates"
  }
]

export default function NewsPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 py-10 px-4 sm:px-6 mx-auto max-w-4xl w-full">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-foreground">
            News & Announcements
          </h1>
          <p className="mt-2 text-muted-foreground font-tamil">
            செய்திகள் மற்றும் அறிவிப்புகள்
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {["All", "Events", "Community Updates", "Matrimony Tips"].map(cat => (
            <button key={cat} className="px-4 py-2 rounded-full border border-border text-sm font-medium hover:bg-secondary/20 transition-colors">
              {cat}
            </button>
          ))}
        </div>

        <div className="grid gap-6">
          {NEWS_ARTICLES.map(article => (
            <Link key={article.id} href={`/news/${article.id}`} className="block group">
              <article className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-secondary/30 text-xs font-medium text-secondary-foreground">
                    {article.category}
                  </span>
                  <span className="text-sm text-muted-foreground">{article.date}</span>
                </div>
                <h2 className="font-serif text-xl font-medium text-foreground group-hover:text-primary transition-colors">
                  {article.title}
                </h2>
                <p className="mt-2 text-muted-foreground line-clamp-2">
                  {article.summary}
                </p>
                <div className="mt-4 flex items-center text-sm font-medium text-primary">
                  Read article
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
