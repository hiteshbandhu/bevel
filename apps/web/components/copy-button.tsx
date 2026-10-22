"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { IconKey } from "@workspace/ui/components/icon-key"
import { track } from "@/lib/analytics"

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])

  return (
    <IconKey
      variant="ghost"
      size="sm"
      aria-label={copied ? "Copied" : "Copy code"}
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
    >
      {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </IconKey>
  )
}
