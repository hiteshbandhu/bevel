"use client"

import { Bold, Code, Italic, Link, Strikethrough } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@workspace/ui/components/tooltip"

const tools = [
  { label: "Bold", keys: "⌘B", shortcut: "Meta+B", icon: Bold },
  { label: "Italic", keys: "⌘I", shortcut: "Meta+I", icon: Italic },
  { label: "Strikethrough", keys: "⌘⇧X", shortcut: "Meta+Shift+X", icon: Strikethrough },
  { label: "Inline code", keys: "⌘E", shortcut: "Meta+E", icon: Code },
  { label: "Add link", keys: "⌘K", shortcut: "Meta+K", icon: Link },
]

/** An editor toolbar. Hover one button, then slide along: the next label prints at once. */
export function TooltipToolbar() {
  return (
    <TooltipProvider>
      <div
        role="toolbar"
        aria-label="Formatting"
        className="flex items-center gap-0.5 rounded-(--bevel-radius-md) border bg-background p-1 shadow-xs"
      >
        {tools.map(({ label, keys, shortcut, icon: Icon }) => (
          <Tooltip key={label}>
            <TooltipTrigger
              aria-label={label}
              aria-keyshortcuts={shortcut}
              className="inline-flex size-8 items-center justify-center rounded-(--bevel-radius-sm) text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon className="size-4" aria-hidden />
            </TooltipTrigger>
            <TooltipContent>
              {label} <span className="opacity-70">{keys}</span>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
