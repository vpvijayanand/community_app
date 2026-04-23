import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Community Ads | Maratha Matrimony",
}

export default function AdsPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 py-10 px-4 sm:px-6 mx-auto max-w-6xl w-full">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-foreground">
            Community Ads & Events
          </h1>
          <p className="mt-2 text-muted-foreground font-tamil">
            சமூக விளம்பரங்கள் மற்றும் நிகழ்வுகள்
          </p>
        </div>
        
        {/* Banner Carousel Placeholder */}
        <div className="w-full aspect-[21/9] md:aspect-[3/1] bg-secondary/20 rounded-3xl mb-12 flex items-center justify-center border border-border relative overflow-hidden">
          <div className="text-center p-6 bg-background/80 backdrop-blur rounded-xl border border-border">
            <h2 className="font-serif text-2xl text-foreground">Promote your business here</h2>
            <p className="text-sm text-muted-foreground mt-2">Reach thousands of families in our community</p>
            <Button variant="outline" className="mt-4">Learn More</Button>
          </div>
        </div>
        
        <div className="mb-6 flex justify-between items-center">
          <h2 className="font-serif text-2xl text-foreground">Featured Ads</h2>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium">All</button>
            <button className="px-3 py-1 bg-secondary/30 text-secondary-foreground rounded-full text-xs font-medium hover:bg-secondary/40 transition">Business</button>
            <button className="px-3 py-1 bg-secondary/30 text-secondary-foreground rounded-full text-xs font-medium hover:bg-secondary/40 transition">Events</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[1,2,3,4,5,6].map((ad) => (
            <div key={ad} className="rounded-xl border border-border bg-card overflow-hidden group">
              <div className="aspect-square bg-secondary/10 flex items-center justify-center text-muted-foreground group-hover:bg-secondary/20 transition-colors">
                <svg className="w-10 h-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Business Ad</span>
                <h3 className="font-serif font-medium mt-1">Swaraj Catering Services</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">Authentic traditional Maratha food for weddings and functions.</p>
                <a href="#" className="text-xs text-primary font-medium mt-3 inline-block">Contact Now →</a>
              </div>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
