"use client"

import { useEffect, useState } from "react"

export const useIntersectionObserver = (target, options) => {
  const [entry, setEntry] = useState(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setEntry(entry), options)
    if (target.current) {
      observer.observe(target.current)
    }
    return () => observer.disconnect()
  }, [target, options])

  return entry
}
