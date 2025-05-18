"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Calendar, BarChart } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function AdminStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTopics: 0,
    upcomingWorkshops: 0,
    engagementRate: 0,
  })

  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchStats() {
      // Fetch total users
      const { count: userCount } = await supabase.from("user_profiles").select("*", { count: "exact", head: true })

      // Fetch total topics
      const { count: topicCount } = await supabase.from("topics").select("*", { count: "exact", head: true })

      // Fetch upcoming workshops
      const { count: workshopCount } = await supabase
        .from("workshops")
        .select("*", { count: "exact", head: true })
        .gte("date", new Date().toISOString())

      // Calculate engagement rate (example: percentage of users who have created a topic)
      const { count: activeUserCount } = await supabase
        .from("topics")
        .select("user_id", { count: "exact", head: true })
        .not("user_id", "is", null)

      const engagementRate = userCount > 0 ? (activeUserCount / userCount) * 100 : 0

      setStats({
        totalUsers: userCount || 0,
        totalTopics: topicCount || 0,
        upcomingWorkshops: workshopCount || 0,
        engagementRate: Math.round(engagementRate * 10) / 10, // Round to 1 decimal place
      })
    }

    fetchStats()
  }, [supabase])

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي المواضيع</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTopics}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ورش العمل القادمة</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.upcomingWorkshops}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">معدل التفاعل</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.engagementRate}%</div>
        </CardContent>
      </Card>
    </div>
  )
}
