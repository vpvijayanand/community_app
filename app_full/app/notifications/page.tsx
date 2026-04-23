import type { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
  title: "Notifications | Maratha Matrimony",
}

export default function NotificationsPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 py-10 px-4 sm:px-6 mx-auto max-w-3xl w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl font-medium text-foreground">Notifications</h1>
          <button className="text-xs font-medium text-primary hover:underline">Mark all as read</button>
        </div>

        <div className="space-y-4">
          {/* Unread */}
          <div className="rounded-xl border border-border bg-secondary/10 p-4 flex gap-4 items-start relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">New Interest Received!</p>
              <p className="text-sm text-muted-foreground mt-1">Sneha P. has expressed interest in your profile. You have an 8/10 porutham match.</p>
              <div className="mt-3 flex gap-2">
                 <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium">View Profile</button>
                 <button className="px-3 py-1.5 bg-background border border-border text-foreground rounded-md text-xs font-medium bg-card">Dismiss</button>
              </div>
            </div>
            <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">2m ago</span>
          </div>

          {/* Read */}
          <div className="rounded-xl border border-border bg-card p-4 flex gap-4 items-start opacity-75">
            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-secondary/30 flex items-center justify-center text-secondary-foreground">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Welcome to Maratha Matrimony</p>
              <p className="text-sm text-muted-foreground mt-1">Your account has been created. The next step is to complete your profile details for better matches.</p>
            </div>
            <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">2h ago</span>
          </div>
          
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
