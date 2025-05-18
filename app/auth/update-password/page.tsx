"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"

export default function UpdatePasswordPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [password, setPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const router = useRouter()

  // Check if user is authenticated with a recovery token
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        toast({
          title: "غير مصرح",
          description: "يرجى استخدام رابط إعادة تعيين كلمة المرور المرسل إلى بريدك الإلكتروني",
          variant: "destructive",
        })
        router.push("/auth/login")
      }
    }

    checkSession()
  }, [router])

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "كلمات المرور غير متطابقة",
        description: "يرجى التأكد من تطابق كلمتي المرور",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    const { data, error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      toast({
        title: "خطأ في تحديث كلمة المرور",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "تم تحديث كلمة المرور بنجاح",
        description: "يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة",
      })
      router.push("/auth/login")
    }

    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">تعيين كلمة مرور جديدة</CardTitle>
        <CardDescription>أدخلي كلمة المرور الجديدة الخاصة بك</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-right block">
              كلمة المرور الجديدة
            </Label>
            <Input
              id="password"
              type="password"
              required
              className="text-right"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-right block">
              تأكيد كلمة المرور
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              className="text-right"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button className="w-full" disabled={isLoading}>
            {isLoading && <Icons.spinner className="ml-2 h-4 w-4 animate-spin" />}
            تحديث كلمة المرور
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center">
        <div className="text-sm text-muted-foreground">
          تذكرت كلمة المرور؟{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            العودة لتسجيل الدخول
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
