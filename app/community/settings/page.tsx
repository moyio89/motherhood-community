"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import ProtectedRoute from "@/components/protected-route"
import { NotificationSettings } from "@/components/notification-settings"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    email_notifications: false,
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
      return
    }

    const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", user.id).single()

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch settings",
        variant: "destructive",
      })
    } else if (data) {
      setSettings((prevSettings) => ({
        ...prevSettings,
        email_notifications: data.email_notifications,
      }))
    }
    setIsLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
      return
    }

    // Update email notifications setting
    const { error: settingsError } = await supabase
      .from("user_settings")
      .upsert({ user_id: user.id, email_notifications: settings.email_notifications })

    if (settingsError) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Change password if provided
    if (settings.password) {
      if (settings.password !== settings.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const { error: passwordError } = await supabase.auth.updateUser({
        password: settings.password,
      })

      if (passwordError) {
        toast({
          title: "Error",
          description: "Failed to update password",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }
    }

    toast({
      title: "Success",
      description: "Settings updated successfully",
    })
    setSettings((prev) => ({ ...prev, password: "", confirmPassword: "" }))
    setIsLoading(false)
  }

  if (isLoading) {
    return <div>جاري التحميل...</div>
  }

  return (
    <ProtectedRoute>
      <div className="container py-8 animate-fadeIn">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">إعدادات الحساب</CardTitle>
            <CardDescription>قم بتحديث إعدادات حسابك هنا</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email_notifications" className="text-right">
                  تفعيل إشعارات البريد الإلكتروني
                </Label>
                <Switch
                  id="email_notifications"
                  name="email_notifications"
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) =>
                    handleInputChange({ target: { name: "email_notifications", type: "checkbox", checked } } as any)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-right block">
                  كلمة المرور الجديدة
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={settings.password}
                  onChange={handleInputChange}
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-right block">
                  تأكيد كلمة المرور الجديدة
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={settings.confirmPassword}
                  onChange={handleInputChange}
                  className="text-right"
                />
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
              حفظ التغييرات
            </Button>
          </CardFooter>
        </Card>
        <div className="mt-8">
          <NotificationSettings />
        </div>
      </div>
    </ProtectedRoute>
  )
}
