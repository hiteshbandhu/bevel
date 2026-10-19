import { sendGAEvent } from "@next/third-parties/google"

/** The GA4 measurement ID. Set only in production on Vercel, so local and preview traffic isn't counted. */
export const gaId = process.env.NEXT_PUBLIC_GA_ID

/**
 * Records a custom event in Google Analytics. Does nothing on the server
 * or when analytics is off. Names follow GA4's recommended events where
 * one fits (`select_content`), and are snake_case otherwise.
 */
export function track(event: string, params: Record<string, string | number> = {}) {
  if (!gaId || typeof window === "undefined") return
  sendGAEvent("event", event, params)
}
