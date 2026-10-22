"use client"

import { PresetTabs, PresetTabsList, PresetTabsPanel, PresetTabsTab } from "@workspace/ui/components/preset-keys"

const code = `<PresetTabs defaultValue="preview">
  <PresetTabsList size="sm" aria-label="Example">
    <PresetTabsTab value="preview">Preview</PresetTabsTab>
    <PresetTabsTab value="code">Code</PresetTabsTab>
  </PresetTabsList>
  <PresetTabsPanel value="preview">…</PresetTabsPanel>
  <PresetTabsPanel value="code">…</PresetTabsPanel>
</PresetTabs>`

/** Preview and Code for a docs example: the small keys, over the panels they switch. */
export function PresetKeysExample() {
  return (
    <PresetTabs defaultValue="preview" className="w-full">
      <PresetTabsList size="sm" aria-label="Example">
        <PresetTabsTab value="preview">Preview</PresetTabsTab>
        <PresetTabsTab value="code">Code</PresetTabsTab>
      </PresetTabsList>
      <PresetTabsPanel value="preview" className="grid h-40 place-items-center rounded-xl border bg-card text-sm text-muted-foreground">
        The component, live.
      </PresetTabsPanel>
      <PresetTabsPanel value="code" className="h-40 overflow-auto rounded-xl border bg-muted p-3">
        <pre className="font-mono text-xs leading-relaxed">{code}</pre>
      </PresetTabsPanel>
    </PresetTabs>
  )
}
