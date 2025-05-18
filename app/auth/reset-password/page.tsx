"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [email, setEmail] = useState<string>("")
  const [emailSent, setEmailSent] = useState<boolean>(false)

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })

    if (error) {
      toast({
        title: "خطأ في إرسال رابط إعادة تعيين كلمة المرور",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "تم إرسال رابط إعادة تعيين كلمة المرور",
        description: "يرجى التحقق من بريدك الإلكتروني",
      })
      setEmailSent(true)
    }

    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">إعادة تعيين كلمة المرور</CardTitle>
        <CardDescription>أدخلي بريدك الإلكتروني لإعادة تعيين كلمة المرور</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-right block">
              البريد الإلكتروني
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              required
              className="text-right"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button className="w-full" disabled={isLoading}>
            {isLoading && <Icons.spinner className="ml-2 h-4 w-4 animate-spin" />}
            إرسال رابط إعادة التعيين
          </Button>
          {emailSent && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md text-center">
              تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد الخاص بك.
            </div>
          )}
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
