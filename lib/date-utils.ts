import { format } from "date-fns"
import { ar } from "date-fns/locale"

/**
 * Formats a date in Gregorian calendar for Arabic locale
 * This ensures consistent date display across all platforms including iOS/Mac
 *
 * @param dateString - The date string to format
 * @param formatStr - Optional format string (defaults to 'dd MMMM yyyy')
 * @returns Formatted date string in Arabic with Gregorian calendar
 */
export function formatArabicDate(dateString: string | Date, formatStr = "dd MMMM yyyy"): string {
  try {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString
    return format(date, formatStr, { locale: ar })
  } catch (error) {
    console.error("Error formatting date:", error)
    return typeof dateString === "string" ? dateString : dateString.toString()
  }
}

/**
 * Formats a date relative to current time (today, yesterday, etc.)
 *
 * @param dateString - The date string to format
 * @returns Relative date string in Arabic
 */
export function formatRelativeArabicDate(dateString: string | Date): string {
  try {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return "اليوم"
    } else if (diffDays === 1) {
      return "الأمس"
    } else if (diffDays < 7) {
      return `منذ ${diffDays} أيام`
    } else {
      return format(date, "dd MMMM yyyy", { locale: ar })
    }
  } catch (error) {
    console.error("Error formatting relative date:", error)
    return typeof dateString === "string" ? dateString : dateString.toString()
  }
}

/**
 * Formats a date and time
 *
 * @param dateString - The date string to format
 * @returns Formatted date and time string in Arabic
 */
export function formatArabicDateTime(dateString: string | Date): string {
  try {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString
    return format(date, "dd MMMM yyyy HH:mm", { locale: ar })
  } catch (error) {
    console.error("Error formatting date and time:", error)
    return typeof dateString === "string" ? dateString : dateString.toString()
  }
}

/**
 * Directly formats a workshop date from YYYY-MM-DD format
 * This bypasses any potential date parsing issues on different platforms
 *
 * @param dateString - The date string in YYYY-MM-DD format
 * @returns Formatted date string in Arabic
 */
export function formatWorkshopDate(dateString: string): string {
  try {
    if (!dateString || !dateString.includes("-")) {
      return dateString || ""
    }

    // Directly extract day, month, year from the string
    const [year, month, day] = dateString.split("-").map(Number)

    // Create a date object with explicit parts to avoid any parsing issues
    const date = new Date(year, month - 1, day, 12, 0, 0)

    // Format using date-fns with Arabic locale
    return format(date, "dd MMMM yyyy", { locale: ar })
  } catch (error) {
    console.error("Error formatting workshop date:", error)
    return dateString
  }
}
