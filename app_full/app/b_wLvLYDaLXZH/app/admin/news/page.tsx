import { SiteHeader as SiteNavbar } from "@/components/site-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { StatsRow } from "@/components/admin/stats-row"
import { AdminTabs } from "@/components/admin/admin-tabs"
import { Plus } from "lucide-react"

export default function AdminNewsPage() {
  return (
    <div className="min-h-screen bg-bg-page">
      <SiteNavbar activeHref="/admin/news" adminBadge />
      <div className="flex">
        <AdminSidebar activeHref="/admin/news" />
        <main className="flex-1 min-w-0">
          {/* Page header */}
          <div className="border-b border-border-light bg-bg-white px-4 py-6 md:px-8 md:py-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                  Editorial Workspace
                </p>
                <h1 className="mt-1 font-tamil text-3xl font-bold text-text-primary">
                  News Management
                </h1>
                <p className="mt-1 max-w-lg text-sm text-text-secondary">
                  Create, schedule and manage community articles â€” in Tamil,
                  English, or both.
                </p>
              </div>
              <button
                type="button"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-dark"
              >
                <Plus className="h-4 w-4" />
                Create Article
              </button>
            </div>

            <div className="mt-6">
              <StatsRow />
            </div>
          </div>

          <div className="pt-5">
            <AdminTabs />
          </div>
        </main>
      </div>
    </div>
  )
}
