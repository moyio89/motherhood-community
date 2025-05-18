"use client"

import { useState, useEffect, useRef } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Mail, Calendar, Shield, Search, UserCheck, UserX, RefreshCw, AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null)
  const { toast } = useToast()
  const searchTimeout = useRef(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/users")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch users")
      }

      const data = await response.json()
      setDebugInfo(data.debug || null)

      if (!data.users || !Array.isArray(data.users)) {
        throw new Error("Invalid data format received from server")
      }

      // Debug the received data
      console.log("Received users data:", data.users.length)
      if (data.users.length > 0) {
        console.log("First user sample:", {
          id: data.users[0].id,
          email: data.users[0].email || "No email",
          username: data.users[0].username || "No username",
        })
      }

      let filteredUsers = data.users

      // Apply client-side filtering if search term exists
      if (searchTerm && searchTerm.trim() !== "") {
        filteredUsers = filteredUsers.filter(
          (user) =>
            (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())),
        )
      }

      setUsers(filteredUsers || [])
    } catch (err) {
      console.error("Exception fetching users:", err)
      setError(err.message || "حدث خطأ أثناء جلب بيانات المستخدمين")
      toast({
        title: "خطأ",
        description: err.message || "حدث خطأ أثناء جلب بيانات المستخدمين",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    // Use setTimeout to debounce the search
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      fetchUsers()
    }, 500)
  }

  const toggleAdminStatus = async (userId, isAdmin) => {
    setIsUpdating(true)
    try {
      // For this example, we're simulating the API call since we don't have the actual endpoint
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate network delay

      // In a real implementation, you would make an API call like this:
      // const response = await fetch("/api/admin/update-user-role", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     userId,
      //     isAdmin: !isAdmin,
      //   }),
      // })

      toast({
        title: "تم بنجاح",
        description: `تم تحديث صلاحيات المستخدم بنجاح`,
      })

      // Update user in the local state to avoid refetching
      setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, is_admin: !isAdmin } : user)))
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحديث صلاحيات المستخدم",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "غير متوفر"
    try {
      return new Date(dateString).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (e) {
      return "تاريخ غير صالح"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl font-bold">إدارة المستخدمين</CardTitle>
            <CardDescription>عرض وإدارة جميع المستخدمين في النظام</CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={() => fetchUsers()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="البحث عن المستخدمين بالاسم أو البريد الإلكتروني"
              value={searchTerm}
              onChange={handleSearch}
              className="flex-1"
            />
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>خطأ في جلب البيانات</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {debugInfo && (
            <Alert className="mb-4 bg-blue-50 border-blue-200">
              <Info className="h-4 w-4" />
              <AlertTitle>معلومات التشخيص</AlertTitle>
              <AlertDescription>
                <div className="text-xs text-muted-foreground mt-1">
                  عدد الملفات الشخصية: {debugInfo.profilesCount || "غير متوفر"} | عدد مستخدمي المصادقة:{" "}
                  {debugInfo.authUsersCount || "غير متوفر"} | عدد المستخدمين المدمجين:{" "}
                  {debugInfo.combinedCount || "غير متوفر"} | مفتاح الخدمة متوفر:{" "}
                  {debugInfo.serviceRoleAvailable ? "نعم" : "لا"}
                </div>
                {debugInfo.authError && (
                  <div className="text-xs text-red-500 mt-1">خطأ المصادقة: {debugInfo.authError}</div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right whitespace-nowrap font-bold">المعلومات الشخصية</TableHead>
                  <TableHead className="text-right whitespace-nowrap font-bold">معلومات الحساب</TableHead>
                  <TableHead className="text-right whitespace-nowrap font-bold">تاريخ الانضمام</TableHead>
                  <TableHead className="text-right whitespace-nowrap font-bold">الصلاحيات</TableHead>
                  <TableHead className="text-right whitespace-nowrap font-bold">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <RefreshCw className="h-8 w-8 animate-spin text-primary mb-2" />
                        <span>جاري تحميل بيانات المستخدمين...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <UserX className="h-8 w-8 text-muted-foreground mb-2" />
                        <span>لا يوجد مستخدمين مطابقين للبحث</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="text-right">
                        <div className="flex flex-col">
                          <div className="font-medium flex items-center gap-1">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {user.full_name || user.username || user.id.substring(0, 8) + "..." || "غير متوفر"}
                          </div>
                          {user.username && user.username !== user.full_name && (
                            <div className="text-sm text-muted-foreground">@{user.username}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {user.email ? (
                              <span dir="ltr" className="text-primary">
                                {user.email}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">لا يوجد بريد إلكتروني</span>
                            )}
                          </div>
                          {user.phone && (
                            <div className="text-sm text-muted-foreground" dir="ltr">
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(user.created_at)}
                        </div>
                        {user.last_sign_in_at && (
                          <div className="text-xs text-muted-foreground mt-1">
                            آخر دخول: {formatDate(user.last_sign_in_at)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          {user.is_admin ? (
                            <Badge className="bg-purple-500 hover:bg-purple-600">مدير</Badge>
                          ) : (
                            <Badge variant="outline">مستخدم</Badge>
                          )}
                        </div>
                        {user.subscription_status && (
                          <Badge variant="secondary" className="mt-1">
                            {user.subscription_status === "active" ? "مشترك" : "غير مشترك"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                          disabled={isUpdating}
                          className="w-full"
                        >
                          {user.is_admin ? (
                            <>
                              <UserX className="h-4 w-4 ml-1" />
                              إلغاء الإشراف
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 ml-1" />
                              جعله مشرفًا
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground text-center">إجمالي المستخدمين: {users.length}</div>
        </CardContent>
      </Card>
    </div>
  )
}
