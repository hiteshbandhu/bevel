"use client"

import * as React from "react"
import { Check, Copy, Share } from "lucide-react"
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@workspace/ui/components/popover"

/** Share a page: a link to copy, and who can see it. */
export function PopoverShare({ url = "https://bevel-ui.vercel.app/components/popover" }: { url?: string }) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<number | undefined>(undefined)
  const inputId = React.useId()
  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  async function copy() {
    await navigator.clipboard?.writeText(url).catch(() => {})
    setCopied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Popover>
      <PopoverTrigger className="inline-flex h-8 items-center gap-1.5 rounded-(--bevel-radius-sm) border bg-background px-3 text-sm font-medium outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-muted">
        <Share className="size-4" aria-hidden />
        Share
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Share this page</PopoverTitle>
          <PopoverDescription>Anyone with the link can view it.</PopoverDescription>
          <PopoverClose />
        </PopoverHeader>
        <div className="flex items-center gap-2">
          <label htmlFor={inputId} className="sr-only">
            Link
          </label>
          <input
            id={inputId}
            readOnly
            value={url}
            onFocus={(event) => event.currentTarget.select()}
            className="h-8 min-w-0 flex-1 rounded-(--bevel-radius-sm) border border-current/15 bg-transparent px-2 font-mono text-xs text-ellipsis shadow-(--bevel-depth-pressed) outline-none focus-visible:ring-2 focus-visible:ring-(--bevel-pen-blue)/50"
          />
          <button
            type="button"
            onClick={copy}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-(--bevel-radius-sm) bg-foreground px-3 text-xs font-medium text-background outline-none focus-visible:ring-2 focus-visible:ring-(--bevel-pen-blue)/50 focus-visible:ring-offset-1"
          >
            {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p role="status" className="sr-only">
          {copied ? "Link copied" : ""}
        </p>
      </PopoverContent>
    </Popover>
  )
}
