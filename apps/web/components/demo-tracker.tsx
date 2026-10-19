"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { track } from "@/lib/analytics"

/** Records the first time someone uses a demo (once per page view), and each milestone it reaches. */
export function DemoTracker({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const seen = React.useRef<string | null>(null)
  // Demos announce milestones as DOM events, so the same code works as a block anywhere.
  React.useEffect(() => {
    const onMilestone = (event: Event) => {
      const { demo, action } = (event as CustomEvent<{ demo: string; action: string }>).detail
      track("demo_complete", { demo, action })
    }
    window.addEventListener("bevel:demo", onMilestone)
    return () => window.removeEventListener("bevel:demo", onMilestone)
  }, [])
  const onFirstUse = () => {
    if (seen.current === pathname) return
    seen.current = pathname
    track("demo_interaction", { demo: pathname.replace("/demo/", "") || "index" })
  }
  return (
    <div onPointerDownCapture={onFirstUse} onKeyDownCapture={onFirstUse}>
      {children}
    </div>
  )
}
