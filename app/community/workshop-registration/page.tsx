"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function WorkshopRegistration() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    attendanceType: "",
    childrenCount: "",
    specialRequirements: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Here you would typically send the data to your backend
    // After successful submission, redirect to a confirmation page
    router.push("/community")
  }

  return (
    <div className="container py-8 animate-fadeIn">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-right">تسجيل حضور ورشة العمل</CardTitle>
          <CardDescription className="text-right">ورشة عمل: التغذية السليمة للأطفال</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-right block">
                الاسم
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="text-right"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-right block">
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="text-right"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-right block">
                رقم الهاتف
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="text-right"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-right block">نوع الحضور</Label>
              <RadioGroup
                name="attendanceType"
                value={formData.attendanceType}
                onValueChange={(value) => handleSelectChange("attendanceType", value)}
                className="flex flex-row-reverse justify-end space-x-4 space-x-reverse"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="inPerson" id="inPerson" />
                  <Label htmlFor="inPerson">حضوري</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="online" id="online" />
                  <Label htmlFor="online">عن بعد</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="childrenCount" className="text-right block">
                عدد الأطفال
              </Label>
              <Select
                name="childrenCount"
                value={formData.childrenCount}
                onValueChange={(value) => handleSelectChange("childrenCount", value)}
              >
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="اختاري العدد" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, "5+"].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialRequirements" className="text-right block">
                متطلبات خاصة
              </Label>
              <Textarea
                id="specialRequirements"
                name="specialRequirements"
                value={formData.specialRequirements}
                onChange={handleInputChange}
                className="text-right"
                placeholder="أي متطلبات أو ملاحظات خاصة"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between flex-row-reverse">
          <Button type="submit" onClick={handleSubmit}>
            تأكيد التسجيل
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            إلغاء
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
