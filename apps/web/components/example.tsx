"use client"

import * as React from "react"
import { PresetTabs, PresetTabsList, PresetTabsPanel, PresetTabsTab } from "@workspace/ui/components/preset-keys"
import { track } from "@/lib/analytics"

/** One example: the live component in its tray, and the code that renders it. */
export function Example({
  id,
  trackId,
  title,
  description,
  code,
  wide,
  children,
}: {
  wide?: boolean
  id: string
  /** Names the example in analytics: "<component>/<example>". */
  trackId?: string
  title: string
  description: string
  code: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 max-w-prose text-muted-foreground">{description}</p>
      <PresetTabs
        defaultValue="preview"
        className="mt-4"
        onValueChange={(tab) => tab === "code" && track("view_code", { item_id: trackId ?? id })}
      >
        <PresetTabsList size="sm">
          <PresetTabsTab value="preview">Preview</PresetTabsTab>
          <PresetTabsTab value="code">Code</PresetTabsTab>
        </PresetTabsList>
        <PresetTabsPanel value="preview" keepMounted>
          <div className="tray flex min-h-96 items-center justify-center rounded-(--bevel-radius-xl) px-4 py-12 sm:px-10">
            <div className={wide ? "flex w-full justify-center" : "w-full max-w-sm"}>{children}</div>
          </div>
        </PresetTabsPanel>
        <PresetTabsPanel value="code">{code}</PresetTabsPanel>
      </PresetTabs>
    </section>
  )
}
