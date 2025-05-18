import type React from "react"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { MessageCircle, Users, Calendar } from "lucide-react"
import Link from "next/link"

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -mr-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-l md:sticky md:block">
          <div className="relative overflow-hidden py-6 pl-8 lg:py-8">
            <h2 className="text-lg font-semibold">المجلس</h2>
            <nav className="grid items-start gap-2 mt-4">
              <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                <Link href="/مجلس">
                  <MessageCircle className="w-4 h-4" />
                  النقاشات
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                <Link href="/مجلس/الأعضاء">
                  <Users className="w-4 h-4" />
                  الأعضاء
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                <Link href="/مجلس/الفعاليات">
                  <Calendar className="w-4 h-4" />
                  الفعاليات
                </Link>
              </Button>
            </nav>
          </div>
        </aside>
        <main className="flex w-full flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
