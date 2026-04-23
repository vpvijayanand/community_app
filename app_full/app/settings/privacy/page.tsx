import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Privacy Settings | Maratha Matrimony",
}

export default function PrivacySettingsPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 py-10 px-4 sm:px-6 mx-auto max-w-4xl w-full">
        <h1 className="font-serif text-3xl font-medium text-foreground mb-8">Settings</h1>
        
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1 border-r border-border pr-4 hidden md:block">
            <nav className="space-y-1">
              <Link href="/settings" className="block px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary/10 hover:text-foreground">Account</Link>
              <Link href="/settings/privacy" className="block px-3 py-2 rounded-md bg-secondary/20 text-foreground font-medium">Privacy</Link>
              <Link href="/notifications" className="block px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary/10 hover:text-foreground">Notifications</Link>
              <Link href="/subscription" className="block px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary/10 hover:text-foreground">Subscription</Link>
            </nav>
          </aside>
          
          {/* Content */}
          <section className="md:col-span-3 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-xl font-serif mb-4">Profile Visibility</h2>
              <div className="space-y-6">
                
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">Blur Photos to Non-Premium Users</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">Only Gold members and matches you have accepted can see your unblurred photos.</p>
                  </div>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary flex-shrink-0 cursor-pointer">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                  </div>
                </div>

                <div className="h-px w-full bg-border" />

                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">Hide Salary Information</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">Keep your precise income private. Broad ranges will still be used to match you accurately.</p>
                  </div>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-secondary/40 flex-shrink-0 cursor-pointer">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                  </div>
                </div>
                
                <div className="h-px w-full bg-border" />

                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">Profile Discoverability</h3>
                    <p className="text-sm text-muted-foreground mt-1">Who can find your profile in search?</p>
                  </div>
                  <select className="flex h-10 rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-foreground">
                    <option>Everyone</option>
                    <option>Matches Only</option>
                    <option>Nobody (Hidden)</option>
                  </select>
                </div>

              </div>
            </div>
            <div className="flex justify-end">
              <Button>Save Preferences</Button>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
