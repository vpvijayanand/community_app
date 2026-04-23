import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Settings | Maratha Matrimony",
}

export default function SettingsPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 py-10 px-4 sm:px-6 mx-auto max-w-4xl w-full">
        <h1 className="font-serif text-3xl font-medium text-foreground mb-8">Settings</h1>
        
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1 border-r border-border pr-4 hidden md:block">
            <nav className="space-y-1">
              <Link href="/settings" className="block px-3 py-2 rounded-md bg-secondary/20 text-foreground font-medium">Account</Link>
              <Link href="/settings/privacy" className="block px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary/10 hover:text-foreground">Privacy</Link>
              <Link href="/notifications" className="block px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary/10 hover:text-foreground">Notifications</Link>
              <Link href="/subscription" className="block px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary/10 hover:text-foreground">Subscription</Link>
            </nav>
          </aside>
          
          {/* Mobile Nav */}
          <div className="md:hidden flex space-x-2 overflow-x-auto pb-2 mb-4 border-b border-border">
            <Link href="/settings" className="px-4 py-2 bg-secondary/20 rounded-full text-sm font-medium whitespace-nowrap">Account</Link>
            <Link href="/settings/privacy" className="px-4 py-2 text-muted-foreground rounded-full text-sm font-medium whitespace-nowrap">Privacy</Link>
            <Link href="/notifications" className="px-4 py-2 text-muted-foreground rounded-full text-sm font-medium whitespace-nowrap">Notifications</Link>
          </div>

          {/* Content */}
          <section className="md:col-span-3 space-y-8">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-xl font-serif mb-4">Personal Information</h2>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Email Address</label>
                  <input type="email" defaultValue="user@example.com" disabled className="w-full flex h-10 rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-foreground/50" />
                  <p className="text-xs text-muted-foreground mt-1">To change your email, please contact support.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Phone Number</label>
                  <input type="tel" defaultValue="+91 98765 43210" className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
                <Button>Save Changes</Button>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 border-destructive/20">
              <h2 className="text-xl font-serif mb-2 text-destructive">Danger Zone</h2>
              <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back. Please be certain.</p>
              <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">Delete Account</Button>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
