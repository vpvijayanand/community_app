import type { Metadata } from "next"
import { AdminLayout } from "../admin-layout"
import { NewsManager } from "./news-manager"

export const metadata: Metadata = { title: "News Manager | Admin" }

export default function AdminNewsPage() {
  return (
    <AdminLayout activeHref="/admin/news" title="">
      <NewsManager />
    </AdminLayout>
  )
}
