"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { MoreHorizontal, Search, RefreshCw, ExternalLink, Info, CreditCard, User } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"

type Subscription = {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string | null
  status: string
  plan_type: string
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
  user_name?: string
  user_email?: string
}

export function SubscriptionsManagement({ subscriptions: initialSubscriptions }: { subscriptions: Subscription[] }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [userDetails, setUserDetails] = useState<any>(null)
  const [loadingUserDetails, setLoadingUserDetails] = useState(false)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    console.log("Initial subscriptions:", initialSubscriptions)
    setSubscriptions(initialSubscriptions)
  }, [initialSubscriptions])

  const fetchUserDetails = async (userId: string) => {
    setLoadingUserDetails(true)
    try {
      console.log("Fetching user details for:", userId)

      // Try to get user from user_profiles table
      const { data: userProfileData, error: userProfileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single()

      // Try to get user from auth.users using the admin API
      const response = await fetch(`/api/admin/get-user?userId=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      let authUser = null
      if (response.ok) {
        const data = await response.json()
        authUser = data.user
        console.log("Auth user data:", authUser)
      } else {
        console.warn("Error fetching auth user:", await response.text())
      }

      // Combine the data
      const combinedData = {
        ...userProfileData,
        auth: authUser
          ? {
              email: authUser.email,
              emailConfirmed: authUser.email_confirmed_at,
              lastSignIn: authUser.last_sign_in_at,
              metadata: authUser.user_metadata,
              createdAt: authUser.created_at,
            }
          : null,
      }

      console.log("Combined user data:", combinedData)
      setUserDetails(combinedData)
      return combinedData
    } catch (error) {
      console.error("Error fetching user details:", error)
      setUserDetails({ id: userId, error: "حدث خطأ أثناء جلب بيانات المستخدم" })
      return null
    } finally {
      setLoadingUserDetails(false)
    }
  }

  const refreshSubscriptions = async () => {
    setIsLoading(true)
    try {
      // Get all subscriptions
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from("user_subscriptions")
        .select("*")
        .order("created_at", { ascending: false })

      if (subscriptionsError) {
        throw subscriptionsError
      }

      // Get all user profiles in one query
      const { data: allUserProfiles, error: userProfilesError } = await supabase
        .from("user_profiles")
        .select("id, username, email")

      if (userProfilesError) {
        console.error("Error fetching user profiles:", userProfilesError)
      }

      // Create a map of user profiles by ID
      const userProfilesMap = new Map()
      if (allUserProfiles) {
        allUserProfiles.forEach((profile) => {
          userProfilesMap.set(profile.id, profile)
        })
      }

      // Enhance subscriptions with user data
      const enhancedSubscriptions = subscriptionsData.map((subscription) => {
        const userProfile = userProfilesMap.get(subscription.user_id)

        if (userProfile) {
          return {
            ...subscription,
            user_name: userProfile.username || "مستخدم بدون اسم",
            user_email: userProfile.email || subscription.user_id,
          }
        } else {
          return {
            ...subscription,
            user_name: "مستخدم غير معروف",
            user_email: subscription.user_id,
          }
        }
      })

      console.log("Refreshed subscriptions:", enhancedSubscriptions)
      setSubscriptions(enhancedSubscriptions || [])
      toast({
        title: "تم التحديث",
        description: "تم تحديث بيانات الاشتراكات بنجاح",
      })
    } catch (error) {
      console.error("Error refreshing subscriptions:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث بيانات الاشتراكات",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (!searchTerm) return true

    const searchString = searchTerm.toLowerCase()
    return (
      sub.user_email?.toLowerCase().includes(searchString) ||
      sub.user_name?.toLowerCase().includes(searchString) ||
      sub.user_id?.toLowerCase().includes(searchString) ||
      sub.stripe_customer_id?.toLowerCase().includes(searchString) ||
      sub.status?.toLowerCase().includes(searchString) ||
      sub.plan_type?.toLowerCase().includes(searchString)
    )
  })

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "غير محدد"
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">نشط</Badge>
      case "inactive":
        return <Badge variant="outline">غير نشط</Badge>
      case "canceled":
        return <Badge variant="destructive">ملغي</Badge>
      case "trialing":
        return <Badge className="bg-blue-500">تجريبي</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const showSubscriptionDetails = async (subscription: Subscription) => {
    setSelectedSubscription(subscription)
    setShowDetailsDialog(true)

    // Fetch user details when showing the dialog
    if (subscription.user_id) {
      await fetchUserDetails(subscription.user_id)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>الاشتراكات</CardTitle>
              <CardDescription>إجمالي الاشتراكات: {subscriptions.length}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={refreshSubscriptions} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              تحديث
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 opacity-50" />
            <Input
              placeholder="بحث عن مستخدم أو اشتراك..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المستخدم</TableHead>
                <TableHead>نوع الاشتراك</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ البدء</TableHead>
                <TableHead>تاريخ الانتهاء</TableHead>
                <TableHead>التجديد التلقائي</TableHead>
                <TableHead>معرف العميل في Stripe</TableHead>
                <TableHead>خيارات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.length > 0 ? (
                filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{subscription.user_name || subscription.user_id}</div>
                        <div className="text-sm text-muted-foreground">
                          {subscription.user_email || "بدون بريد إلكتروني"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{subscription.plan_type === "monthly" ? "شهري" : "سنوي"}</TableCell>
                    <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                    <TableCell>{formatDate(subscription.current_period_start)}</TableCell>
                    <TableCell>{formatDate(subscription.current_period_end)}</TableCell>
                    <TableCell>
                      {subscription.cancel_at_period_end ? (
                        <Badge variant="outline" className="bg-yellow-100">
                          لا
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800">نعم</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono">{subscription.stripe_customer_id}</span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">فتح القائمة</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => showSubscriptionDetails(subscription)}>
                            <Info className="mr-2 h-4 w-4" />
                            عرض التفاصيل
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={async () => {
                              await fetchUserDetails(subscription.user_id)
                              toast({
                                title: "معلومات المستخدم",
                                description: `معرف المستخدم: ${subscription.user_id}`,
                              })
                            }}
                          >
                            <User className="mr-2 h-4 w-4" />
                            فحص بيانات المستخدم
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              if (subscription.stripe_customer_id) {
                                window.open(
                                  `https://dashboard.stripe.com/customers/${subscription.stripe_customer_id}`,
                                  "_blank",
                                )
                              }
                            }}
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            فتح العميل في Stripe
                          </DropdownMenuItem>
                          {subscription.stripe_subscription_id && (
                            <DropdownMenuItem
                              onClick={() => {
                                if (subscription.stripe_subscription_id) {
                                  window.open(
                                    `https://dashboard.stripe.com/subscriptions/${subscription.stripe_subscription_id}`,
                                    "_blank",
                                  )
                                }
                              }}
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              فتح الاشتراك في Stripe
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">
                    {searchTerm ? "لا توجد اشتراكات مطابقة لبحثك" : "لا توجد اشتراكات حالياً"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Subscription Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent dir="rtl" className="sm:max-w-[550px] p-0 overflow-hidden">
          <DialogHeader className="bg-gradient-to-l from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 px-6 py-4 border-b">
            <div className="flex justify-between items-start">
              <DialogTitle className="text-xl flex items-center gap-2">
                <Info className="h-5 w-5 text-pink-500" />
                تفاصيل الاشتراك
              </DialogTitle>
              <button
                onClick={() => setShowDetailsDialog(false)}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
                <span className="sr-only">إغلاق</span>
              </button>
            </div>
            <DialogDescription dir="ltr" className="text-right">
              معلومات مفصلة عن اشتراك المستخدم والبيانات المرتبطة به
            </DialogDescription>
          </DialogHeader>

          {selectedSubscription && (
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              {/* User Information Section */}
              <div className="mb-6 bg-pink-50/50 dark:bg-pink-950/10 rounded-lg p-4 border border-pink-100 dark:border-pink-900/20">
                <h3 className="text-base font-semibold mb-3 text-pink-700 dark:text-pink-300 flex items-center">
                  <User className="ml-2 h-4 w-4" />
                  بيانات المستخدم
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">معرف المستخدم</h4>
                    <p className="text-sm font-mono mt-1 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-md overflow-x-auto">
                      {selectedSubscription.user_id}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex flex-col">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">اسم المستخدم</h4>
                    <p className="text-sm font-medium mt-1">{selectedSubscription.user_name || "غير محدد"}</p>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">البريد الإلكتروني</h4>
                    <p className="text-sm font-medium mt-1 break-all">
                      {selectedSubscription.user_email || "غير محدد"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subscription Information Section */}
              <div className="mb-6 bg-blue-50/50 dark:bg-blue-950/10 rounded-lg p-4 border border-blue-100 dark:border-blue-900/20">
                <h3 className="text-base font-semibold mb-3 text-blue-700 dark:text-blue-300 flex items-center">
                  <CreditCard className="ml-2 h-4 w-4" />
                  بيانات الاشتراك
                </h3>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="flex flex-col">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">نوع الاشتراك</h4>
                    <p className="text-sm font-medium mt-1">
                      {selectedSubscription.plan_type === "monthly" ? "شهري" : "سنوي"}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">الحالة</h4>
                    <div className="mt-1">{getStatusBadge(selectedSubscription.status)}</div>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">تاريخ البدء</h4>
                    <p className="text-sm font-medium mt-1">{formatDate(selectedSubscription.current_period_start)}</p>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">تاريخ الانتهاء</h4>
                    <p className="text-sm font-medium mt-1">{formatDate(selectedSubscription.current_period_end)}</p>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">التجديد التلقائي</h4>
                    <div className="mt-1">
                      {selectedSubscription.cancel_at_period_end ? (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          لا
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 border-green-200">نعم</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">تاريخ الإنشاء</h4>
                    <p className="text-sm font-medium mt-1">{formatDate(selectedSubscription.created_at)}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-blue-100 dark:border-blue-900/30">
                  <div className="flex flex-col">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">معرف العميل في Stripe</h4>
                    <div className="flex items-center mt-1">
                      <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-1.5 rounded-md flex-grow overflow-x-auto">
                        {selectedSubscription.stripe_customer_id}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mr-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => {
                          window.open(
                            `https://dashboard.stripe.com/customers/${selectedSubscription.stripe_customer_id}`,
                            "_blank",
                          )
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {selectedSubscription.stripe_subscription_id && (
                    <div className="flex flex-col mt-3">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">معرف الاشتراك في Stripe</h4>
                      <div className="flex items-center mt-1">
                        <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-1.5 rounded-md flex-grow overflow-x-auto">
                          {selectedSubscription.stripe_subscription_id}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mr-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => {
                            window.open(
                              `https://dashboard.stripe.com/subscriptions/${selectedSubscription.stripe_subscription_id}`,
                              "_blank",
                            )
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* User Details Section */}
              {loadingUserDetails ? (
                <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">جاري تحميل بيانات المستخدم...</p>
                </div>
              ) : userDetails ? (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-base font-semibold mb-3 text-gray-700 dark:text-gray-300 flex items-center">
                    <Info className="ml-2 h-4 w-4" />
                    بيانات المستخدم التفصيلية
                  </h3>

                  {userDetails.auth ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">البريد الإلكتروني</h4>
                          <p className="text-sm font-medium mt-1">{userDetails.auth.email || "غير محدد"}</p>
                        </div>
                        <div className="flex flex-col">
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            تأكيد البريد الإلكتروني
                          </h4>
                          <p className="text-sm font-medium mt-1">
                            {userDetails.auth.emailConfirmed ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200">تم التأكيد</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                لم يتم التأكيد
                              </Badge>
                            )}
                          </p>
                        </div>
                        <div className="flex flex-col">
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">تاريخ الإنشاء</h4>
                          <p className="text-sm font-medium mt-1">
                            {userDetails.auth.createdAt
                              ? new Date(userDetails.auth.createdAt).toLocaleString("ar-SA")
                              : "غير محدد"}
                          </p>
                        </div>
                        <div className="flex flex-col">
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">آخر تسجيل دخول</h4>
                          <p className="text-sm font-medium mt-1">
                            {userDetails.auth.lastSignIn
                              ? new Date(userDetails.auth.lastSignIn).toLocaleString("ar-SA")
                              : "غير محدد"}
                          </p>
                        </div>
                      </div>

                      {userDetails.auth.metadata && Object.keys(userDetails.auth.metadata).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            البيانات الإضافية
                          </h4>
                          <pre className="text-xs overflow-auto max-h-32 p-3 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-mono">
                            {JSON.stringify(userDetails.auth.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        بيانات المستخدم الكاملة
                      </h4>
                      <pre className="text-xs overflow-auto max-h-40 p-3 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-mono">
                        {JSON.stringify(userDetails, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 border-t">
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              إغلاق
            </Button>
            {selectedSubscription && selectedSubscription.stripe_customer_id && (
              <Button
                onClick={() => {
                  window.open(
                    `https://dashboard.stripe.com/customers/${selectedSubscription?.stripe_customer_id}`,
                    "_blank",
                  )
                }}
                className="bg-gradient-to-l from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
              >
                <ExternalLink className="ml-2 h-4 w-4" />
                فتح في Stripe
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
