"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Share2, ClipboardCopy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ShareButtonProps {
  title: string
  url?: string
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function ShareButton({
  title,
  url = typeof window !== "undefined" ? window.location.href : "",
  size = "sm",
  variant = "ghost",
}: ShareButtonProps) {
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [shareUrl, setShareUrl] = useState(url)
  const { toast } = useToast()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Update URL if window is defined (client-side)
    if (typeof window !== "undefined") {
      setShareUrl(url || window.location.href)
    }
  }, [url])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowShareOptions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const shareOptions = [
    {
      name: "نسخ الرابط",
      icon: <ClipboardCopy className="h-4 w-4 ml-2" />,
      action: () => {
        navigator.clipboard.writeText(shareUrl)
        toast({
          title: "تم النسخ",
          description: "تم نسخ الرابط بنجاح",
          variant: "default",
        })
        setShowShareOptions(false)
      },
    },
    {
      name: "واتساب",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-2"
        >
          <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
          <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
          <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
          <path d="M9.5 13.5c.5 1 1.5 1 2.5 1s2-.5 2.5-1" />
        </svg>
      ),
      action: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(title + "\n" + shareUrl)}`, "_blank")
        setShowShareOptions(false)
      },
    },
    {
      name: "تيليجرام",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-2"
        >
          <path d="M21.5 15.5a2.5 2.5 0 0 1-2.5 2.5h-14a2.5 2.5 0 0 1-2.5-2.5v-12a2.5 2.5 0 0 1 2.5-2.5h14a2.5 2.5 0 0 1 2.5 2.5v12Z" />
          <path d="m7.5 12 3 3 6-6" />
        </svg>
      ),
      action: () => {
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
          "_blank",
        )
        setShowShareOptions(false)
      },
    },
    {
      name: "تويتر",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-2"
        >
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
        </svg>
      ),
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
          "_blank",
        )
        setShowShareOptions(false)
      },
    },
    {
      name: "فيسبوك",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-2"
        >
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank")
        setShowShareOptions(false)
      },
    },
  ]

  // Check if Web Share API is available
  const canUseNativeShare = typeof navigator !== "undefined" && navigator.share

  const handleNativeShare = async () => {
    if (canUseNativeShare) {
      try {
        await navigator.share({
          title: title,
          url: shareUrl,
        })
      } catch (error) {
        // Fallback to menu if share was cancelled or failed
        setShowShareOptions(true)
      }
    } else {
      setShowShareOptions(!showShareOptions)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant={variant}
        size={size}
        className="flex items-center gap-1"
        onClick={canUseNativeShare ? handleNativeShare : () => setShowShareOptions(!showShareOptions)}
      >
        <Share2 className="h-4 w-4" />
        مشاركة
      </Button>

      {showShareOptions && (
        <div className="absolute left-0 bottom-full mb-2 bg-white dark:bg-gray-800 shadow-lg rounded-md p-2 min-w-[200px] z-10">
          <div className="flex flex-col space-y-1">
            {shareOptions.map((option, index) => (
              <Button key={index} variant="ghost" size="sm" className="justify-start" onClick={option.action}>
                {option.icon}
                {option.name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
