import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Advanced Search",
  description: "Find your perfect match with advanced filters.",
}

export default function SearchPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 py-10 px-4 sm:px-6 mx-auto max-w-6xl w-full">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-medium text-foreground">
            Advanced Search
          </h1>
          <p className="mt-2 text-muted-foreground font-tamil">
            மேம்பட்ட தேடல்
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="col-span-1 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-serif text-lg text-foreground mb-4">Filters</h2>
              <div className="space-y-4 text-sm text-foreground/80">
                <div>
                  <label className="block mb-2 font-medium">Age Range</label>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Min" className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                    <input type="number" placeholder="Max" className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                  </div>
                </div>
                <div>
                  <label className="block mb-2 font-medium">Marital Status</label>
                  <select className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option>Any</option>
                    <option>Never Married</option>
                    <option>Divorced</option>
                    <option>Widowed</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 font-medium">Education</label>
                  <select className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option>Any</option>
                    <option>Bachelors</option>
                    <option>Masters</option>
                    <option>Doctorate</option>
                  </select>
                </div>
                <Button className="w-full mt-2">Apply Filters</Button>
              </div>
            </div>
          </aside>
          
          {/* Results Grid */}
          <section className="col-span-1 md:col-span-3">
            <div className="rounded-2xl border border-border bg-card p-10 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 mb-4 rounded-full bg-secondary/30 flex items-center justify-center text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <h3 className="text-xl font-serif text-foreground">Begin your search</h3>
              <p className="mt-2 text-muted-foreground max-w-sm">
                Adjust the filters on the left to find profiles that meet your specific criteria.
              </p>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
