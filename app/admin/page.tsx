import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/admin/Overview"
import { RecentTopics } from "@/components/admin/RecentTopics"
import { RecentUsers } from "@/components/admin/RecentUsers"
import { AdminStats } from "@/components/admin/AdminStats"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">لوحة التحكم</h1>
      <AdminStats />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>نظرة عامة</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>أحدث المواضيع</CardTitle>
            <CardDescription>آخر 5 مواضيع تمت إضافتها</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentTopics />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>المستخدمون الجدد</CardTitle>
          <CardDescription>آخر 10 مستخدمين انضموا إلى المنصة</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentUsers />
        </CardContent>
      </Card>
    </div>
  )
}
