"use client"

import * as React from "react"
import { Autocomplete } from "@base-ui/react/autocomplete"
import { Search } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog"

const commands = [
  "New document",
  "Open recent",
  "Share page",
  "Copy link",
  "Toggle dark mode",
  "Go to settings",
  "Invite a teammate",
  "Sign out",
]

/** A ⌘K command palette hosted in the dialog: top-aligned, no padding, no corner ×. */
export function DialogCommand() {
  const [open, setOpen] = React.useState(false)
  const [ran, setRan] = React.useState<string | null>(null)

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <div className="flex flex-col items-center gap-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="inline-flex h-8 w-56 max-w-full items-center gap-2 rounded-(--bevel-radius-sm) border bg-background px-2.5 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
          <Search className="size-4" aria-hidden />
          Run a command…
          <kbd aria-hidden className="ml-auto rounded-sm border px-1.5 font-mono text-xs">
            ⌘K
          </kbd>
        </DialogTrigger>
        <DialogContent align="top" fasteners="none" showCloseButton={false} className="max-w-lg">
          <DialogTitle className="sr-only">Command palette</DialogTitle>
          <Autocomplete.Root open inline items={commands} autoHighlight="always" keepHighlight>
            <div className="flex items-center gap-2 border-b border-current/10 px-4">
              <Search className="size-4 shrink-0 opacity-60" aria-hidden />
              <Autocomplete.Input
                aria-label="Search commands"
                placeholder="Search commands…"
                className="h-12 w-full min-w-0 bg-transparent text-base outline-none placeholder:opacity-60 sm:text-sm"
              />
            </div>
            <div className="max-h-72 overflow-y-auto overscroll-contain p-2">
              <Autocomplete.Empty>
                <p className="px-3 py-8 text-center text-sm opacity-60">No commands match.</p>
              </Autocomplete.Empty>
              <Autocomplete.List>
                {(command: string) => (
                  <Autocomplete.Item
                    key={command}
                    value={command}
                    onClick={() => {
                      setRan(command)
                      setOpen(false)
                    }}
                    className="flex h-9 cursor-default items-center rounded-(--bevel-radius-sm) px-3 text-sm outline-none select-none data-highlighted:bg-current/8"
                  >
                    {command}
                  </Autocomplete.Item>
                )}
              </Autocomplete.List>
            </div>
          </Autocomplete.Root>
        </DialogContent>
      </Dialog>
      <p role="status" className="text-sm text-muted-foreground">
        {ran ? `Ran “${ran}”.` : "Press ⌘K or Ctrl K."}
      </p>
    </div>
  )
}
