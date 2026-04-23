import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { AdminLayout } from "../admin-layout"
export const metadata: Metadata = { title: "Platform Settings | Admin" }

export default function AdminSettingsPage() {
  return (
    <AdminLayout activeHref="/admin/settings" title="Platform Settings">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Configure global platform behaviour.</p>
      </div>


          <div className="space-y-6 max-w-2xl">
            {/* General */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">General</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Platform Name</label>
                  <input defaultValue="Maratha Matrimony" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Support Email</label>
                  <input defaultValue="support@maratha.in" type="email" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Default Language</label>
                  <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="ta">Tamil (Default)</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Feature Toggles</h3>
              <div className="space-y-4">
                {[
                  { label: "Require Admin Approval for New Profiles", enabled: true },
                  { label: "Enable Chat for Silver & Gold Members", enabled: true },
                  { label: "Enable Astrology Module", enabled: true },
                  { label: "Enable Ad Banners on Dashboard", enabled: true },
                  { label: "Allow Social Media Registration", enabled: false },
                ].map((toggle) => (
                  <div key={toggle.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm font-medium text-foreground">{toggle.label}</span>
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${toggle.enabled ? "bg-primary" : "bg-secondary"}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${toggle.enabled ? "translate-x-6" : "translate-x-1"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Save All Changes</Button>
              <Button variant="outline" className="border-border text-foreground">Reset to Defaults</Button>
            </div>
          </div>
    </AdminLayout>
  )
}
