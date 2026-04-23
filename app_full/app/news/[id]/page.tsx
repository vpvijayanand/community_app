import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Article | Maratha Matrimony",
  description: "Read the latest news from Maratha Matrimony.",
}

export default function NewsArticlePage({ params }: { params: { id: string } }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 py-12 px-4 sm:px-6 mx-auto max-w-3xl w-full">
        <Link href="/news" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to News
        </Link>
        
        <article>
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-block px-3 py-1 rounded-full bg-secondary/30 text-xs font-medium text-secondary-foreground">
              Community Updates
            </span>
            <span className="text-sm text-muted-foreground">August 15, 2026</span>
          </div>
          
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-foreground mb-6 leading-tight">
            Community Meetup in Mumbai
          </h1>
          
          <div className="aspect-video w-full rounded-2xl bg-secondary/20 mb-8 overflow-hidden flex items-center justify-center text-muted-foreground">
            Feature Image Placeholder
          </div>
          
          <div className="prose prose-stone dark:prose-invert max-w-none">
            <p className="lead text-lg text-muted-foreground">
              Join us for our annual community gathering to discuss the future of our matrimony services and connect with other families.
            </p>
            <p>
              This event will feature speeches from our founders, expert astrologers discussing compatibility metrics, and success stories from couples who met on our platform.
            </p>
            <h3>Agenda</h3>
            <ul>
              <li>10:00 AM - Welcome and Introduction</li>
              <li>11:00 AM - The Importance of Poruthams</li>
              <li>1:00 PM - Lunch & Networking</li>
              <li>3:00 PM - Matchmaking Session for Gold Members</li>
            </ul>
            <p>
              Please RSVP by August 10th to secure your spot. We look forward to seeing you there!
            </p>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}
