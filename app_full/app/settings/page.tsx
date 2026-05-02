"use client"

import { useState } from "react"
import { UserLayout } from "@/components/user-layout"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  const { user } = useAuth()
  const [phone, setPhone] = useState(user?.phone ?? "")
  const [saved, setSaved] = useState(false)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    // TODO: wire to real API PUT /api/profile/phone or /api/users/me
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <UserLayout title="Settings">
      <div className="max-w-3xl space-y-8">
        {/* Personal Information */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-serif mb-1 text-foreground">Personal Information</h2>
          <p className="text-sm text-muted-foreground mb-6">Update your contact details.</p>

          <form onSubmit={handleSave} className="space-y-5 max-w-md">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email ?? ""}
                disabled
                className="w-full flex h-10 rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-foreground/50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                To change your email, please contact support.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`}
                disabled
                className="w-full flex h-10 rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-foreground/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setSaved(false) }}
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit">Save Changes</Button>
              {saved && (
                <span className="text-sm text-green-600 font-medium">✓ Saved</span>
              )}
            </div>
          </form>
        </div>

        {/* Password */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-serif mb-1 text-foreground">Password</h2>
          <p className="text-sm text-muted-foreground mb-4">Change your account password.</p>
          <Button variant="outline">Change Password</Button>
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl border border-destructive/20 bg-card p-6">
          <h2 className="text-xl font-serif mb-2 text-destructive">Danger Zone</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            Delete Account
          </Button>
        </div>
      </div>
    </UserLayout>
  )
}
