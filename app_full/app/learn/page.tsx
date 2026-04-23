import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Learning Center | Maratha Matrimony",
  description: "Educational resources on culture, astrology, and relationships.",
}

const MODULES = [
  { id: "astrology-basics", title: "Astrology Basics", desc: "Learn about Rasi, Navamsa, and Poruthams." },
  { id: "culture-traditions", title: "Culture & Traditions", desc: "Deep dive into Maratha wedding rituals." },
  { id: "relationship-advice", title: "Relationship Advice", desc: "Tips for building a strong foundation." }
]

export default function LearnPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 py-10 px-4 sm:px-6 mx-auto max-w-5xl w-full">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-foreground">
            Learning Center
          </h1>
          <p className="mt-2 text-muted-foreground font-tamil">
            கற்றல் மையம்
          </p>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Explore our curated articles to understand astrology basics, cultural heritage, and tips for a successful marriage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MODULES.map(module => (
            <Link key={module.id} href={`/learn/${module.id}`} className="block group">
              <div className="rounded-2xl border border-border bg-card p-6 h-full flex flex-col transition-shadow hover:shadow-lg">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="font-serif text-xl font-medium text-foreground group-hover:text-primary transition-colors">
                  {module.title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground flex-1">
                  {module.desc}
                </p>
                <div className="mt-4 text-sm font-medium text-primary flex items-center">
                  Explore topics
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
