"use client"

import * as React from "react"
import { Tabs } from "@base-ui/react/tabs"
import { track } from "@/lib/analytics"

const tabClass =
  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-active:border-foreground data-active:bg-foreground data-active:text-background"

/**
 * A row of chips that each switch a panel in place, so the home page shows one
 * scene or one category at a time instead of every one in a column. Panels stay
 * mounted: their links are in the page for crawlers and the switch is instant.
 */
export function HomeTabs({
  label,
  items,
  trackId,
}: {
  /** Names the tab list for screen readers. */
  label: string
  trackId: string
  items: { value: string; label: string; count?: number; content: React.ReactNode }[]
}) {
  return (
    <Tabs.Root
      defaultValue={items[0]!.value}
      onValueChange={(value) => track("home_tab", { item_id: `${trackId}/${value}` })}
    >
      {/* On a phone the chips scroll sideways rather than wrap into a block. */}
      <Tabs.List
        aria-label={label}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {items.map((item) => (
          <Tabs.Tab key={item.value} value={item.value} className={tabClass}>
            {item.label}
            {item.count != null && <span className="tabular-nums opacity-60">{item.count}</span>}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {items.map((item) => (
        <Tabs.Panel key={item.value} value={item.value} keepMounted className="mt-6 outline-none data-hidden:hidden">
          {item.content}
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  )
}
