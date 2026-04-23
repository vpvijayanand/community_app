import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Topic | Maratha Learning Center",
}

export default function LearnTopicPage({ params }: { params: { id: string } }) {
  // Use params.id to fetch course content
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 py-12 px-4 sm:px-6 mx-auto max-w-3xl w-full">
        <Link href="/learn" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Courses
        </Link>
        <article>
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary mb-6">
            Lesson 1
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-foreground mb-6 leading-tight capitalize">
            {params.id.replace("-", " ")}
          </h1>
          <div className="prose prose-stone dark:prose-invert max-w-none mt-8">
            <p className="lead text-lg text-muted-foreground">
              This module covers the essential elements of {params.id.replace("-", " ")}. Let's explore the fundamental concepts.
            </p>
            <p>
              In traditional matchmaking, the alignment of stars and natural elements plays a pivotal role. It provides a framework for understanding compatibility beyond surface-level traits.
            </p>
            <div className="p-6 bg-secondary/10 rounded-xl border border-secondary/20 my-8">
              <h3 className="!mt-0 text-foreground font-serif">Key Takeaway</h3>
              <p className="!mb-0 text-muted-foreground">Always ensure the time of birth is accurate to the minute to avoid mismatches in celestial alignments.</p>
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}
