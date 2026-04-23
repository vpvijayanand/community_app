import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { AdminLayout } from "../admin-layout"

export const metadata: Metadata = { title: "Ads Manager | Admin" }

export default function AdminAdsPage() {
  return (
    <AdminLayout activeHref="/admin/ads" title="Ads Manager">
      <div className="mb-8 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage community ads, invitations, and greetings.</p>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">+ Create Ad</Button>
      </div>

      {/* Create Ad Form */}
      <div className="rounded-2xl border border-border bg-card p-6 mb-8">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Create New Ad</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Title</label>
            <input className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Ad title..." />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Type</label>
            <select className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option>Business Ad</option>
              <option>Wedding Invitation</option>
              <option>Festival Greeting</option>
              <option>Community Event</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Start Date</label>
            <input type="date" className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">End Date</label>
            <input type="date" className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Description</label>
            <textarea rows={3} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Ad description..." />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Click-through URL (optional)</label>
            <input type="url" className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="https://..." />
          </div>
          <div className="md:col-span-2">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Publish Ad</Button>
          </div>
        </div>
      </div>

      {/* Active ads */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-serif font-semibold text-foreground">Active Ads</h3>
          <span className="text-sm text-muted-foreground">6 ads running</span>
        </div>
        <div className="divide-y divide-border">
          {[
            { title: "Swaraj Catering Services",  type: "Business",         ends: "Apr 30, 2026", status: "Active" },
            { title: "Murugan Wedding Invitation", type: "Wedding Invitation", ends: "May 5, 2026",  status: "Active" },
            { title: "Puthandu Greetings",         type: "Festival Greeting", ends: "Apr 15, 2026", status: "Expired" },
          ].map((ad) => (
            <div key={ad.title} className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                {ad.type.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">{ad.title}</p>
                <p className="text-xs text-muted-foreground">{ad.type} · Ends {ad.ends}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ad.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-secondary text-muted-foreground"}`}>
                {ad.status}
              </span>
              <div className="flex gap-3">
                <button className="text-xs font-semibold text-primary hover:underline">Edit</button>
                <button className="text-xs font-semibold text-destructive hover:underline">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
