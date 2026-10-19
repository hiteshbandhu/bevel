"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { track } from "@/lib/analytics"

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value)
        // Install commands say which component or block; anything else is code.
        const install = value.match(/^npx shadcn@\S+ add (.+)$/)
        track("select_content", {
          content_type: install ? "install_command" : "code",
          item_id: install ? install[1]!.split(" ").map((s) => s.split("/").pop()!.replace(".json", "")).join(",") : "",
        })
        setCopied(true)
      }}
      className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
      <span className="sr-only">{copied ? "Copied" : "Copy code"}</span>
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </button>
  )
}
