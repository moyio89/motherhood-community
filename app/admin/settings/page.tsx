"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "نادي الأمومة",
    maintenanceMode: false,
    maxUploadSize: "5",
  })
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the settings to your backend
    console.log("Settings submitted:", settings)
    toast({
      title: "تم الحفظ",
      description: "تم حفظ الإعدادات بنجاح",
    })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">إعدادات الموقع</h1>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>الإعدادات العامة</CardTitle>
            <CardDescription>قم بتعديل الإعدادات العامة للموقع هنا.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">اسم الموقع</Label>
              <Input id="siteName" name="siteName" value={settings.siteName} onChange={handleInputChange} />
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch
                id="maintenanceMode"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, maintenanceMode: checked }))}
              />
              <Label htmlFor="maintenanceMode">وضع الصيانة</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxUploadSize">الحد الأقصى لحجم الملفات المرفوعة (ميجابايت)</Label>
              <Input
                id="maxUploadSize"
                name="maxUploadSize"
                type="number"
                value={settings.maxUploadSize}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">حفظ الإعدادات</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
