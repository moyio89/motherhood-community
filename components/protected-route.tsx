"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
      } else {
        setIsLoading(false)
      }
    }
    checkUser()
  }, [router, supabase])

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="w-full h-12 mb-4" />
        <Skeleton className="w-full h-64" />
      </div>
    )
  }

  return <>{children}</>
}
