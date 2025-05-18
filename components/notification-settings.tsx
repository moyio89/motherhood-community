"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"

export function NotificationSettings() {
  const [settings, setSettings] = useState({
    email_new_topics: true,
    email_new_questions: true,
    email_comments: true,
    email_subscription: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    async function loadSettings() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data, error } = await supabase
            .from("user_notification_settings")
            .select("*")
            .eq("user_id", user.id)
            .single()

          if (data) {
            setSettings({
              email_new_topics: data.email_new_topics,
              email_new_questions: data.email_new_questions,
              email_comments: data.email_comments,
              email_subscription: data.email_subscription,
            })
          }
        }
      } catch (error) {
        console.error("Error loading notification settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [supabase])

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Check if settings exist
        const { data: existingSettings } = await supabase
          .from("user_notification_settings")
          .select("id")
          .eq("user_id", user.id)
          .single()

        if (existingSettings) {
          // Update existing settings
          await supabase.from("user_notification_settings").update(settings).eq("user_id", user.id)
        } else {
          // Create new settings
          await supabase.from("user_notification_settings").insert({
            user_id: user.id,
            ...settings,
          })
        }

        toast({
          title: "تم الحفظ",
          description: "تم حفظ إعدادات الإشعارات بنجاح",
        })
      }
    } catch (error) {
      console.error("Error saving notification settings:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ الإعدادات",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>إعدادات الإشعارات</CardTitle>
          <CardDescription>تحميل الإعدادات...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات الإشعارات</CardTitle>
        <CardDescription>تحكم في الإشعارات التي تصلك عبر البريد الإلكتروني</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email_new_topics">مواضيع جديدة</Label>
            <p className="text-sm text-muted-foreground">إشعارات عند نشر مواضيع جديدة في المجتمع</p>
          </div>
          <Switch
            id="email_new_topics"
            checked={settings.email_new_topics}
            onCheckedChange={(checked) => setSettings({ ...settings, email_new_topics: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email_new_questions">أسئلة جديدة</Label>
            <p className="text-sm text-muted-foreground">إشعارات عند طرح أسئلة جديدة في المجتمع</p>
          </div>
          <Switch
            id="email_new_questions"
            checked={settings.email_new_questions}
            onCheckedChange={(checked) => setSettings({ ...settings, email_new_questions: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email_comments">تعليقات على منشوراتك</Label>
            <p className="text-sm text-muted-foreground">إشعارات عند التعليق على مواضيعك أو أسئلتك</p>
          </div>
          <Switch
            id="email_comments"
            checked={settings.email_comments}
            onCheckedChange={(checked) => setSettings({ ...settings, email_comments: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email_subscription">إشعارات الاشتراك</Label>
            <p className="text-sm text-muted-foreground">إشعارات متعلقة باشتراكك وتجديده</p>
          </div>
          <Switch
            id="email_subscription"
            checked={settings.email_subscription}
            onCheckedChange={(checked) => setSettings({ ...settings, email_subscription: checked })}
          />
        </div>

        <Button onClick={saveSettings} disabled={isSaving} className="mt-4">
          {isSaving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </Button>
      </CardContent>
    </Card>
  )
}
