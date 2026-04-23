import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { AdminLayout } from "../admin-layout"

export const metadata: Metadata = { title: "Subscriptions | Admin" }

export default function AdminSubscriptionsPage() {
  return (
    <AdminLayout activeHref="/admin/subscriptions" title="Subscription Config">
      <p className="text-sm text-muted-foreground mb-8">Configure plan limits and view revenue overview.</p>

      {/* Revenue cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Monthly Revenue", value: "₹8.4L", change: "+12%" },
          { label: "Gold Members",    value: "1,240",  change: "+8%"  },
          { label: "Silver Members",  value: "1,884",  change: "+5%"  },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <span className="text-sm text-muted-foreground">{s.label}</span>
            <div className="mt-1 text-2xl font-bold text-foreground">{s.value}</div>
            <span className="text-xs font-medium text-emerald-600">{s.change} this month</span>
          </div>
        ))}
      </div>

      {/* Plan limits editor */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-5">Plan Limits Configuration</h3>
        <div className="space-y-4 max-w-lg">
          {[
            { plan: "Basic",    badge: "text-muted-foreground", chatLimit: 0,  viewLimit: 5  },
            { plan: "Silver",   badge: "text-blue-600",         chatLimit: 10, viewLimit: 10 },
            { plan: "Gold",     badge: "text-amber-600",        chatLimit: 50, viewLimit: 50 },
            { plan: "Platinum", badge: "text-purple-600",       chatLimit: 200,viewLimit: 200 },
          ].map((tier) => (
            <div key={tier.plan} className="rounded-xl border border-border bg-secondary/20 p-4">
              <p className={`mb-3 text-sm font-bold uppercase tracking-wider ${tier.badge}`}>{tier.plan}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Profile Views / Month</label>
                  <input defaultValue={tier.viewLimit} type="number" className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Chats / Month</label>
                  <input defaultValue={tier.chatLimit} type="number" className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Save Configuration</Button>
        </div>
      </div>
    </AdminLayout>
  )
}
