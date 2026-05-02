"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { UserLayout } from "@/components/user-layout"
import { Loader2, Newspaper } from "lucide-react"

type NewsArticle = {
  id: number
  title: string
  content: string
  category?: string
  image_url?: string
  created_at: string
  author?: string
}

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("maratha_token") : null
    fetch("http://localhost:5000/api/news", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Server error ${r.status}`)
        return r.json()
      })
      .then((data: NewsArticle[]) => setArticles(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <UserLayout>
      <div className="mx-auto max-w-4xl w-full px-4 py-10 sm:px-6">
        <div className="mb-10">
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-foreground">
            News &amp; Announcements
          </h1>
          <p className="mt-2 text-muted-foreground font-tamil">
            செய்திகள் மற்றும் அறிவிப்புகள்
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading articles…
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            Failed to load news: {error}
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Newspaper className="h-7 w-7 text-primary" />
            </div>
            <h2 className="font-serif text-xl font-medium text-foreground">No articles yet</h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              Check back soon. Community news and announcements will appear here.
            </p>
          </div>
        )}

        {!loading && !error && articles.length > 0 && (
          <div className="grid gap-6">
            {articles.map((article) => (
              <Link key={article.id} href={`/news/${article.id}`} className="block group">
                <article className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    {article.category && (
                      <span className="inline-block px-3 py-1 rounded-full bg-secondary/30 text-xs font-medium text-secondary-foreground">
                        {article.category}
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground ml-auto">
                      {new Date(article.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h2 className="font-serif text-xl font-medium text-foreground group-hover:text-primary transition-colors">
                    {article.title}
                  </h2>
                  <p className="mt-2 text-muted-foreground line-clamp-2 text-sm">
                    {article.content}
                  </p>
                  {article.author && (
                    <p className="mt-3 text-xs text-muted-foreground">By {article.author}</p>
                  )}
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
        )}
      </div>
    </UserLayout>
  )
}
