import type React from "react"
import type { Metadata } from "next"
import Image from "next/image"

export const metadata: Metadata = {
  title: "مجتمع الدعم التربوي",
  description: "منصة تعليمية وتربوية للأمهات",
}

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2 rtl">
      {/* Form side - Visible on all devices */}
      <div className="flex items-center justify-center p-4 sm:p-8">
        {/* Mobile Logo - Only visible on mobile */}
        <div className="absolute top-4 left-0 right-0 flex justify-center md:hidden">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/motherhood-logo0000-removebg-preview-sAzmBcfpsdciCNpfitUjwE1a8jBi8P.png"
            alt="شعار مجتمع الدعم التربوي"
            width={80}
            height={80}
          />
        </div>

        {/* Add padding for mobile to ensure form doesn't overlap with logo */}
        <div className="w-full max-w-md mt-16 md:mt-0">{children}</div>
      </div>

      {/* Decorative side - Hidden on mobile */}
      <div className="relative hidden flex-col bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 p-10 text-white md:flex">
        {/* Decorative pattern overlay */}
        <div
          className="absolute inset-0 bg-white opacity-10"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4H-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-20 flex h-full flex-col items-center justify-center text-center">
          <div className="mb-4">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/motherhood-logo0000-removebg-preview-sAzmBcfpsdciCNpfitUjwE1a8jBi8P.png"
              alt="شعار مجتمع الدعم التربوي"
              width={100}
              height={100}
              className="mb-6"
            />
          </div>
          <blockquote className="space-y-2">
            <p className="text-4xl font-bold">مجتمع الدعم التربوي</p>
            <p className="text-lg">منصة تعليمية وتربوية للأمهات تقدم الدعم والمشورة في مجال تربية الأطفال</p>
          </blockquote>
        </div>
        <div className="relative z-20 mt-auto text-center w-full">
          <p className="text-lg">&copy; {new Date().getFullYear()} مجتمع الدعم التربوي. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </div>
  )
}
