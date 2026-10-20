"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Autocomplete } from "@base-ui/react/autocomplete"
import { Dialog } from "@base-ui/react/dialog"
import { Search } from "lucide-react"
import { track } from "@/lib/analytics"
import type { SearchEntry, SearchGroup } from "@/lib/search"

/**
 * Scores an entry against the query: the title counts most, then where it
 * sits, then its description. Every word of the query has to land somewhere;
 * a title that only contains the letters in order still counts, barely.
 */
function score(entry: SearchEntry, query: string) {
  const title = entry.title.toLowerCase()
  const context = entry.context?.toLowerCase() ?? ""
  const description = entry.description.toLowerCase()
  const wordStart = (text: string, word: string) => text.startsWith(word) || text.includes(` ${word}`)

  let total = title === query ? 1000 : 0
  for (const word of query.split(/\s+/)) {
    if (title.startsWith(word)) total += 100
    else if (wordStart(title, word)) total += 70
    else if (title.includes(word)) total += 50
    else if (context.includes(word)) total += 20
    else if (wordStart(description, word)) total += 15
    else if (description.includes(word)) total += 10
    else if (isSubsequence(word, title)) total += 5
    else return 0
  }
  return total
}

function isSubsequence(needle: string, haystack: string) {
  let i = 0
  for (const char of haystack) if (char === needle[i]) i++
  return i === needle.length
}

function rank(index: SearchGroup[], raw: string): SearchGroup[] {
  const query = raw.trim().toLowerCase()
  if (!query) return index
  return index
    .map((group) => ({
      ...group,
      items: group.items
        .map((item) => ({ item, score: score(item, query) }))
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((r) => r.item),
    }))
    .filter((group) => group.items.length > 0)
}

const subscribe = () => () => {}
const isApple = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)

/** The ⌘K / Ctrl+K palette: components, guides, demos and posts, by name first. */
export function SiteSearch({ index }: { index: SearchGroup[] }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const results = React.useMemo(() => rank(index, query), [index, query])
  const apple = React.useSyncExternalStore(subscribe, isApple, () => true)
  const hintId = React.useId()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey) && !event.altKey) {
        event.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  function select(entry: SearchEntry) {
    track("search", { search_term: query.trim(), destination: entry.href })
    setOpen(false)
    router.push(entry.href)
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={setOpen}
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen) setQuery("")
      }}
    >
      <Dialog.Trigger
        className="ml-auto inline-flex size-9 items-center justify-center gap-2 rounded-md text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring sm:h-8 sm:w-48 sm:justify-start sm:border sm:bg-muted/40 sm:px-2.5"
      >
        <Search className="size-4 shrink-0" aria-hidden />
        <span className="sr-only sm:not-sr-only">Search…</span>
        <kbd
          aria-hidden
          className="ml-auto hidden rounded-sm border bg-background px-1.5 font-mono text-xs leading-5 sm:inline"
        >
          {apple ? "⌘K" : "Ctrl K"}
        </kbd>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/30 transition-opacity duration-(--bevel-duration-small) ease-(--bevel-ease-out) data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none dark:bg-black/60" />
        <Dialog.Viewport className="fixed inset-0 flex items-start justify-center px-4 pt-[12vh] pb-4">
          <Dialog.Popup
            aria-label="Search the docs"
            className="flex max-h-[min(32rem,calc(100dvh-14vh-1rem))] w-full max-w-xl flex-col overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-2xl outline-none transition-[opacity,scale] duration-(--bevel-duration-small) ease-(--bevel-ease-out) data-ending-style:scale-98 data-ending-style:opacity-0 data-starting-style:scale-98 data-starting-style:opacity-0 motion-reduce:transition-none"
          >
            <Autocomplete.Root
              open
              inline
              items={index}
              filteredItems={results}
              itemToStringValue={(entry: SearchEntry) => entry.title}
              value={query}
              onValueChange={setQuery}
              autoHighlight="always"
              keepHighlight
            >
              <Autocomplete.InputGroup className="flex items-center gap-2 border-b px-3">
                <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <Autocomplete.Input
                  aria-label="Search components, guides and demos"
                  aria-describedby={hintId}
                  placeholder="Search components, guides, demos…"
                  className="h-12 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm"
                />
                <Dialog.Close className="shrink-0 rounded-sm border px-1.5 font-mono text-xs leading-5 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
                  <span aria-hidden>Esc</span>
                  <span className="sr-only">Close search</span>
                </Dialog.Close>
              </Autocomplete.InputGroup>
              <span id={hintId} className="sr-only">
                Use the arrow keys to move through results and Enter to open one.
              </span>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 [scroll-padding-block:0.5rem]">
                <Autocomplete.Empty>
                  <p className="px-3 py-10 text-center text-sm text-muted-foreground">
                    Nothing matches “{query.trim()}”.
                  </p>
                </Autocomplete.Empty>
                <Autocomplete.List>
                  {(group: SearchGroup) => (
                    <Autocomplete.Group key={group.value} items={group.items} className="not-last:mb-2">
                      <Autocomplete.GroupLabel className="px-3 pt-2 pb-1 text-xs font-medium text-muted-foreground">
                        {group.value}
                      </Autocomplete.GroupLabel>
                      <Autocomplete.Collection>
                        {(entry: SearchEntry) => (
                          <Autocomplete.Item
                            key={entry.href}
                            value={entry}
                            onClick={() => select(entry)}
                            className="flex cursor-default flex-col gap-0.5 rounded-md px-3 py-2 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                          >
                            <span className="flex min-w-0 items-baseline gap-2">
                              <span className="truncate font-medium">{entry.title}</span>
                              {entry.context && (
                                <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                                  {entry.context}
                                </span>
                              )}
                            </span>
                            <span className="truncate text-muted-foreground">{entry.description}</span>
                          </Autocomplete.Item>
                        )}
                      </Autocomplete.Collection>
                    </Autocomplete.Group>
                  )}
                </Autocomplete.List>
              </div>
            </Autocomplete.Root>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
