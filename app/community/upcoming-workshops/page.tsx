"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { LinkIcon, Video } from "lucide-react"
import { format, isBefore, addMinutes } from "date-fns"
import { ar } from "date-fns/locale"
import { toast } from "@/components/ui/use-toast"

// Mock data for upcoming workshops
const upcomingWorkshops = [
  {
    id: 1,
    title: "ورشة عمل: التغذية السليمة للأطفال",
    date: new Date(2024, 4, 15, 14, 0), // May 15, 2024, 14:00
    duration: 90, // minutes
    speaker: "د. سارة الخالد",
    attendees: 45,
    link: "https://zoom.us/j/1234567890",
  },
  {
    id: 2,
    title: "ندوة: التعامل مع تحديات المراهقة",
    date: new Date(2024, 4, 20, 16, 30), // May 20, 2024, 16:30
    duration: 120, // minutes
    speaker: "د. منى العتيبي",
    attendees: 32,
    link: "https://zoom.us/j/0987654321",
  },
  {
    id: 3,
    title: "لقاء مفتوح مع خبيرة الرضاعة الطبيعية",
    date: new Date(2024, 4, 25, 11, 0), // May 25, 2024, 11:00
    duration: 60, // minutes
    speaker: "أ. نورة السعيد",
    attendees: 28,
    link: "https://zoom.us/j/1122334455",
  },
]

export default function UpcomingWorkshops() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link)
    toast({
      title: "تم نسخ الرابط",
      description: "تم نسخ رابط الاجتماع إلى الحافظة",
    })
  }

  const joinMeeting = (link: string) => {
    window.open(link, "_blank")
  }

  const isWorkshopActive = (startDate: Date, duration: number) => {
    const endDate = addMinutes(startDate, duration)
    return !isBefore(currentTime, startDate) && isBefore(currentTime, endDate)
  }

  return (
    <div className="container py-8 animate-fadeIn">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-right">الورش والندوات القادمة</CardTitle>
          <CardDescription className="text-right">جدول الفعاليات القادمة عبر الإنترنت</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right font-bold">العنوان</TableHead>
                  <TableHead className="text-right font-bold">التاريخ والوقت</TableHead>
                  <TableHead className="text-right font-bold">المتحدث</TableHead>
                  <TableHead className="text-right font-bold">الحضور</TableHead>
                  <TableHead className="text-right font-bold">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingWorkshops.map((workshop) => (
                  <TableRow key={workshop.id}>
                    <TableCell className="text-right">{workshop.title}</TableCell>
                    <TableCell className="text-right">
                      <div>{format(workshop.date, "dd MMMM yyyy", { locale: ar })}</div>
                      <div>{format(workshop.date, "HH:mm", { locale: ar })}</div>
                    </TableCell>
                    <TableCell className="text-right">{workshop.speaker}</TableCell>
                    <TableCell className="text-right">{workshop.attendees}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2 space-x-reverse">
                        <Button variant="outline" size="sm" onClick={() => copyLink(workshop.link)}>
                          <LinkIcon className="h-4 w-4 ml-2" />
                          نسخ الرابط
                        </Button>
                        {isWorkshopActive(workshop.date, workshop.duration) ? (
                          <Button size="sm" onClick={() => joinMeeting(workshop.link)}>
                            <Video className="h-4 w-4 ml-2" />
                            انضمي الآن
                          </Button>
                        ) : (
                          <Badge variant={isBefore(currentTime, workshop.date) ? "secondary" : "outline"}>
                            {isBefore(currentTime, workshop.date) ? "قريباً" : "انتهى"}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
