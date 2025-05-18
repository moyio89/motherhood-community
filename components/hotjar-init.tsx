"use client"

import { useEffect } from "react"
import Hotjar from "@hotjar/browser"

export function HotjarInit() {
  useEffect(() => {
    // Initialize Hotjar
    const siteId = 5361669
    const hotjarVersion = 6

    Hotjar.init(siteId, hotjarVersion)
  }, []) // Empty dependency array ensures this runs once on mount

  // This component doesn't render anything
  return null
}
