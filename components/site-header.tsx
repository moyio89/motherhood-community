"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserCircle } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function SiteHeader() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState({ username: "", avatar_url: "" })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClientComponentClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUser(user)
        const { data } = await supabase.from("user_profiles").select("username, avatar_url").eq("id", user.id).single()

        if (data) {
          setProfile({
            username: data.username || "",
            avatar_url: data.avatar_url || "",
          })
        }
      }

      setIsLoading(false)
    }

    fetchUser()
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/motherhood-logo-qunMHbphVKqXlODOdKhLneaTuWZME4.webp"
              alt="مجتمع الدعم التربوي"
              className="h-10"
            />
          </Link>
          <nav className="flex gap-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              الرئيسية
            </Link>
            <Link href="/خدماتنا" className="text-sm font-medium transition-colors hover:text-primary">
              خدماتنا
            </Link>
            <Link href="/مجلس" className="text-sm font-medium transition-colors hover:text-primary">
              المجلس
            </Link>
            <Link href="/تواصل" className="text-sm font-medium transition-colors hover:text-primary">
              تواصل معنا
            </Link>
            <Link href="/community" className="text-sm font-medium transition-colors hover:text-primary">
              المجتمع
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          {user ? (
            <Button variant="ghost" className="gap-2" asChild>
              <Link href="/community/profile">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile.avatar_url} alt={profile.username || "Profile"} />
                  <AvatarFallback>
                    {profile.username ? profile.username[0]?.toUpperCase() : <UserCircle className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
                <span>الملف الشخصي</span>
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" className="gap-2" asChild>
              <Link href="/auth/login">
                <UserCircle className="h-5 w-5" />
                <span>تسجيل الدخول</span>
              </Link>
            </Button>
          )}
          <Button>احجزي موعدك</Button>
        </div>
      </div>
    </header>
  )
}
