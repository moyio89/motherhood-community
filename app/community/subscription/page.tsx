"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Check, Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { useSubscription } from "@/context/subscription-context"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly")
  const [isRecurring, setIsRecurring] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false)
  const [isManagingSubscription, setIsManagingSubscription] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [isUpdatingRecurring, setIsUpdatingRecurring] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const notificationSentRef = useRef(false)
  const processedSessionIdRef = useRef<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const { subscription, isSubscribed, isAdmin, checkSubscription } = useSubscription()

  // Check for success or canceled parameters in the URL
  useEffect(() => {
    const success = searchParams.get("success")
    const canceled = searchParams.get("canceled")
    const sessionId = searchParams.get("session_id")

    // Skip if we've already processed this session ID
    if (sessionId && processedSessionIdRef.current === sessionId) {
      return
    }

    const handleRedirectParams = async () => {
      if (success === "true") {
        // Store the session ID we're processing to prevent duplicate processing
        if (sessionId) {
          processedSessionIdRef.current = sessionId
        }

        setIsLoading(true)
        try {
          // If we have a session_id, manually check the subscription status with Stripe
          if (sessionId) {
            try {
              const response = await fetch(`/api/check-session-status?session_id=${sessionId}`, {
                method: "GET",
              })

              if (response.ok) {
                console.log("Session status checked successfully")
              } else {
                console.error("Failed to check session status")
              }
            } catch (error) {
              console.error("Error checking session status:", error)
            }
          }

          // Force refresh subscription status
          await checkSubscription()

          try {
            // Only send notification if it hasn't been sent yet during this session
            if (!notificationSentRef.current) {
              const {
                data: { user },
              } = await supabase.auth.getUser()

              if (user) {
                // Get user profile for username
                const { data: profile } = await supabase
                  .from("user_profiles")
                  .select("username, email")
                  .eq("id", user.id)
                  .single()

                // Get subscription details
                const { data: subData } = await supabase
                  .from("user_subscriptions")
                  .select("*")
                  .eq("user_id", user.id)
                  .order("created_at", { ascending: false })
                  .limit(1)
                  .single()

                if (subData) {
                  // Generate a unique notification ID based on subscription data
                  const notificationId = `${user.id}-${subData.id}-${subData.created_at}`

                  // Send notification about the subscription with idempotency key
                  await fetch("/api/notifications/subscription", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "X-Idempotency-Key": notificationId,
                    },
                    body: JSON.stringify({
                      userId: user.id,
                      userEmail: profile?.email || user.email,
                      username: profile?.username || "عضو",
                      planType: subData.plan_type === "yearly" ? "اشتراك سنوي" : "اشتراك شهري",
                      endDate: new Date(subData.current_period_end).toLocaleDateString("ar-SA"),
                      isRecurring: !subData.cancel_at_period_end,
                      notificationId: notificationId,
                    }),
                  })
                  console.log("Subscription notification sent with ID:", notificationId)
                  // Mark notification as sent using the ref to persist across renders
                  notificationSentRef.current = true
                }
              }
            }
          } catch (error) {
            console.error("Error sending subscription notification:", error)
            // Don't show an error to the user, just log it
          }

          toast({
            title: "تم الاشتراك بنجاح",
            description: "شكراً لاشتراكك في نادي الأمومة",
          })

          // Remove the query parameters from the URL without refreshing the page
          router.replace("/community/subscription", { scroll: false })
        } catch (error) {
          console.error("Error refreshing subscription status:", error)
        } finally {
          setIsLoading(false)
        }
      } else if (canceled === "true") {
        toast({
          title: "تم إلغاء عملية الدفع",
          description: "يمكنك المحاولة مرة أخرى في أي وقت",
          variant: "destructive",
        })
        // Remove the query parameters from the URL without refreshing the page
        router.replace("/community/subscription", { scroll: false })
      }
    }

    handleRedirectParams()
  }, [searchParams, toast, router, checkSubscription])

  // Set initial recurring state based on subscription
  useEffect(() => {
    if (subscription) {
      setIsRecurring(!subscription.cancel_at_period_end)
    }
  }, [subscription])

  const refreshSubscriptionStatus = async () => {
    setIsRefreshing(true)
    try {
      await checkSubscription()
      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة الاشتراك بنجاح",
      })
    } catch (error) {
      console.error("Error refreshing subscription status:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة الاشتراك",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleCheckout = async (planType = selectedPlan) => {
    try {
      setIsCreatingCheckout(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planType: planType,
          isRecurring: isRecurring,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Checkout error response:", errorText)
        throw new Error("Failed to create checkout session")
      }

      const data = await response.json()
      if (data.url) {
        // Reset notification sent flag when starting a new checkout
        notificationSentRef.current = false
        processedSessionIdRef.current = null
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء جلسة الدفع",
        variant: "destructive",
      })
    } finally {
      setIsCreatingCheckout(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      setIsManagingSubscription(true)
      const response = await fetch("/api/create-portal-session", {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "حدث خطأ أثناء إنشاء جلسة إدارة الاشتراك")
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error("Error creating portal session:", error)
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء جلسة إدارة الاشتراك",
        variant: "destructive",
      })
    } finally {
      setIsManagingSubscription(false)
    }
  }

  const handleCancelSubscription = async () => {
    try {
      setIsCanceling(true)
      const response = await fetch("/api/cancel-subscription", {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "حدث خطأ أثناء إلغاء الاشتراك")
      }

      await checkSubscription()
      setShowCancelDialog(false)

      toast({
        title: "تم إلغاء الاشتراك",
        description: "سيتم إلغاء اشتراكك في نهاية الفترة الحالية",
      })
    } catch (error) {
      console.error("Error canceling subscription:", error)
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إلغاء الاشتراك",
        variant: "destructive",
      })
    } finally {
      setIsCanceling(false)
    }
  }

  const handleUpdateRecurring = async () => {
    try {
      setIsUpdatingRecurring(true)
      const response = await fetch("/api/update-subscription-recurring", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isRecurring: isRecurring,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "حدث خطأ أثناء تحديث إعدادات التجديد التلقائي")
      }

      await checkSubscription()

      toast({
        title: "تم تحديث الإعدادات",
        description: isRecurring ? "تم تفعيل التجديد التلقائي للاشتراك" : "تم إلغاء التجديد التلقائي للاشتراك",
      })
    } catch (error) {
      console.error("Error updating recurring settings:", error)
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحديث إعدادات التجديد التلقائي",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingRecurring(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const monthlyFeatures = [
    "الوصول إلى جميع المناقشات والمواضيع",
    "المشاركة في المنتديات والمجموعات",
    "حضور ورش العمل والفعاليات",
    "الوصول إلى المحتوى الحصري",
  ]

  const yearlyFeatures = [
    "الوصول إلى جميع المناقشات والمواضيع",
    "المشاركة في المنتديات والمجموعات",
    "حضور ورش العمل والفعاليات",
    "الوصول إلى المحتوى الحصري",
    "استشارة تربوية مجانية",
    "موارد تربوية مجانية",
  ]

  if (isAdmin) {
    return (
      <div className="container py-8 animate-fadeIn">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">حالة الاشتراك</CardTitle>
            <CardDescription>أنت مشرف في المنصة ولديك وصول كامل إلى جميع الميزات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900/30">
              <p className="text-green-800 dark:text-green-300 font-medium flex items-center">
                <Check className="ml-2 h-5 w-5" />
                لديك صلاحيات المشرف وبإمكانك الوصول إلى جميع أقسام المجتمع
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/community")}>العودة إلى المجتمع</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 animate-fadeIn">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">اشترك فى مجتمع الدعم التربوي </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            انضم الى مجتمع الدعم التربوي واحصل على الدعم والمعرفة التي تحتاجها
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="mr-2">جاري تحديث حالة الاشتراك...</span>
          </div>
        ) : isSubscribed ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">حالة الاشتراك</CardTitle>
                <Button variant="outline" size="sm" onClick={refreshSubscriptionStatus} disabled={isRefreshing}>
                  {isRefreshing ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="ml-2 h-4 w-4" />
                  )}
                  تحديث
                </Button>
              </div>
              <CardDescription>تفاصيل اشتراكك الحالي</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900/30">
                <p className="text-green-800 dark:text-green-300 font-medium flex items-center">
                  <Check className="ml-2 h-5 w-5" />
                  اشتراكك نشط ويمكنك الوصول إلى جميع ميزات المجتمع
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">نوع الاشتراك</h3>
                  <p className="font-medium">{subscription?.plan_type === "yearly" ? "اشتراك سنوي" : "اشتراك شهري"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">الحالة</h3>
                  <p className="font-medium">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      نشط
                    </Badge>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">تاريخ بدء الفترة الحالية</h3>
                  <p className="font-medium">{formatDate(subscription?.current_period_start)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">تاريخ انتهاء الفترة الحالية</h3>
                  <p className="font-medium">{formatDate(subscription?.current_period_end)}</p>
                </div>
              </div>

              {/* Recurring Settings */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">إعدادات التجديد التلقائي</h3>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="recurring-toggle" className="text-base">
                      التجديد التلقائي للاشتراك
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {isRecurring
                        ? "سيتم تجديد اشتراكك تلقائياً في نهاية الفترة الحالية"
                        : "لن يتم تجديد اشتراكك تلقائياً وسينتهي في نهاية الفترة الحالية"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Switch
                      id="recurring-toggle"
                      checked={isRecurring}
                      onCheckedChange={setIsRecurring}
                      disabled={isUpdatingRecurring}
                    />
                  </div>
                </div>

                {subscription?.cancel_at_period_end !== !isRecurring && (
                  <div className="mt-4">
                    <Button onClick={handleUpdateRecurring} disabled={isUpdatingRecurring} size="sm">
                      {isUpdatingRecurring && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                      حفظ التغييرات
                    </Button>
                  </div>
                )}
              </div>

              {subscription?.cancel_at_period_end && (
                <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>تم إلغاء التجديد التلقائي</AlertTitle>
                  <AlertDescription>
                    سينتهي اشتراكك في {formatDate(subscription?.current_period_end)} ولن يتم تجديده تلقائياً.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => router.push("/community")} className="w-full sm:w-auto">
                العودة إلى المجتمع
              </Button>

              <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    إلغاء الاشتراك
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>تأكيد إلغاء الاشتراك</DialogTitle>
                    <DialogDescription>
                      هل أنت متأكد من رغبتك في إلغاء اشتراكك؟ ستفقد الوصول إلى المحتوى الحصري بعد انتهاء الفترة الحالية.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                    <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                      تراجع
                    </Button>
                    <Button variant="destructive" onClick={handleCancelSubscription} disabled={isCanceling}>
                      {isCanceling && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                      تأكيد الإلغاء
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ) : (
          <>
            <div className="flex justify-center mb-8">
              <Tabs
                defaultValue="monthly"
                value={selectedPlan}
                onValueChange={(value) => setSelectedPlan(value as "monthly" | "yearly")}
                className="w-full max-w-md"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="monthly">شهري</TabsTrigger>
                  <TabsTrigger value="yearly">سنوي</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className={selectedPlan === "monthly" ? "border-primary" : ""}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>الاشتراك الشهري</span>
                    {selectedPlan === "monthly" && <Badge className="bg-primary text-primary-foreground">مختار</Badge>}
                  </CardTitle>
                  <CardDescription>اشتراك شهري مرن</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">
                    $33 <span className="text-muted-foreground text-sm font-normal">/ شهرياً</span>
                  </div>

                  <ul className="space-y-2">
                    {monthlyFeatures.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="ml-2 h-4 w-4 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center space-x-2 space-x-reverse pt-4">
                    <Switch id="recurring-toggle-monthly" checked={isRecurring} onCheckedChange={setIsRecurring} />
                    <Label htmlFor="recurring-toggle-monthly">تجديد تلقائي للاشتراك</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isRecurring ? "سيتم تجديد اشتراكك تلقائياً كل شهر" : "اشتراك لمرة واحدة فقط لمدة شهر"}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleCheckout("monthly")} disabled={isCreatingCheckout} className="w-full">
                    {isCreatingCheckout && selectedPlan === "monthly" && (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    )}
                    اشتركي الآن
                  </Button>
                </CardFooter>
              </Card>

              <Card className={selectedPlan === "yearly" ? "border-primary" : ""}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex justify-between items-center">
                      <span>الاشتراك السنوي</span>
                      {selectedPlan === "yearly" && <Badge className="bg-primary text-primary-foreground">مختار</Badge>}
                    </CardTitle>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      وفري 24%
                    </Badge>
                  </div>
                  <CardDescription>اشتراك سنوي بسعر مخفض</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">
                    $250 <span className="text-muted-foreground text-sm font-normal">/ سنوياً</span>
                  </div>

                  <ul className="space-y-2">
                    {yearlyFeatures.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="ml-2 h-4 w-4 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center space-x-2 space-x-reverse pt-4">
                    <Switch id="recurring-toggle-yearly" checked={isRecurring} onCheckedChange={setIsRecurring} />
                    <Label htmlFor="recurring-toggle-yearly">تجديد تلقائي للاشتراك</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isRecurring ? "سيتم تجديد اشتراكك تلقائياً كل سنة" : "اشتراك لمرة واحدة فقط لمدة سنة"}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleCheckout("yearly")} disabled={isCreatingCheckout} className="w-full">
                    {isCreatingCheckout && selectedPlan === "yearly" && (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    )}
                    اشتركي الآن
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
