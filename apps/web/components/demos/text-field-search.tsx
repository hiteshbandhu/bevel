"use client"

import * as React from "react"
import { Search } from "lucide-react"
import {
  TextField,
  TextFieldAdornment,
  TextFieldInput,
  TextFieldKbd,
  TextFieldLabel,
  TextFieldSlot,
} from "@workspace/ui/components/text-field"

const items = ["Text field", "Toggle lever", "Latch checkbox", "Preset keys", "Wallet", "Meter", "DIP switches"]

/** A site search box: ⌘K or / focuses it from anywhere on the page. */
export function TextFieldSearch() {
  const [query, setQuery] = React.useState("")
  const ref = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const typing = (event.target as HTMLElement).closest("input, textarea, [contenteditable]")
      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !typing)) {
        event.preventDefault()
        ref.current?.focus()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const matches = items.filter((item) => item.toLowerCase().includes(query.trim().toLowerCase()))

  return (
    <div className="flex w-full flex-col gap-3">
      <TextField size="sm">
        <TextFieldLabel className="sr-only">Search components</TextFieldLabel>
        <TextFieldSlot>
          <TextFieldAdornment>
            <Search aria-hidden />
          </TextFieldAdornment>
          <TextFieldInput
            ref={ref}
            type="search"
            placeholder="Search components"
            value={query}
            onValueChange={setQuery}
            aria-keyshortcuts="Meta+K /"
          />
          <TextFieldKbd>⌘K</TextFieldKbd>
        </TextFieldSlot>
      </TextField>
      <ul className="flex flex-col gap-1 text-sm" aria-live="polite">
        {matches.length ? (
          matches.map((item) => (
            <li key={item} className="rounded-md px-2 py-1 text-muted-foreground">
              {item}
            </li>
          ))
        ) : (
          <li className="px-2 py-1 text-muted-foreground">Nothing matches “{query}”.</li>
        )}
      </ul>
    </div>
  )
}
