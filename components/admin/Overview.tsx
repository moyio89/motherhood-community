"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function Overview() {
  const [data, setData] = useState([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchMonthlyData() {
      const endDate = new Date()
      const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 5, 1)

      const { data: monthlyData, error } = await supabase
        .from("topics")
        .select("created_at")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())

      if (error) {
        console.error("Error fetching monthly data:", error)
        return
      }

      const monthlyCount = {}
      const monthNames = [
        "يناير",
        "فبراير",
        "مارس",
        "أبريل",
        "مايو",
        "يونيو",
        "يوليو",
        "أغسطس",
        "سبتمبر",
        "أكتوبر",
        "نوفمبر",
        "ديسمبر",
      ]

      for (let i = 0; i < 6; i++) {
        const date = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1)
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`
        monthlyCount[monthKey] = {
          name: monthNames[date.getMonth()],
          total: 0,
        }
      }

      monthlyData.forEach((item) => {
        const date = new Date(item.created_at)
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`
        if (monthlyCount[monthKey]) {
          monthlyCount[monthKey].total++
        }
      })

      setData(Object.values(monthlyCount).reverse())
    }

    fetchMonthlyData()
  }, [supabase])

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
