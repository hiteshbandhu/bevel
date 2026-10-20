"use client"

import * as React from "react"
import {
  DipSwitch,
  DipSwitchBank,
  DipSwitchLegend,
  DipSwitchReadout,
  DipSwitchToggle,
} from "@workspace/ui/components/dip-switch"

const flags = [
  { value: "new-editor", label: "New editor" },
  { value: "streaming", label: "Streamed replies" },
  { value: "web-search", label: "Web search tool" },
  { value: "memory", label: "Long-term memory" },
  { value: "batch-api", label: "Batch API" },
  { value: "sso", label: "Enforce SSO" },
  { value: "audit-export", label: "Audit log export" },
  { value: "beta-models", label: "Beta models" },
]

/** A workspace's feature flags on a bank of DIP switches. The bank is also the config value you ship. */
export function DipSwitchFlags() {
  const [on, setOn] = React.useState(["new-editor", "streaming", "sso"])
  return (
    <DipSwitch
      aria-label="Feature flags"
      value={on}
      onValueChange={setOn}
      className="w-full max-w-lg rounded-xl border bg-card p-5"
    >
      <div>
        <p className="text-sm font-semibold">Feature flags: acme-staging</p>
        <p id="flags-locked" className="text-xs text-muted-foreground">
          Enforce SSO is locked on by your organisation.
        </p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <DipSwitchBank>
          {flags.map((flag) => (
            <DipSwitchToggle
              key={flag.value}
              value={flag.value}
              disabled={flag.value === "sso"}
              aria-describedby={flag.value === "sso" ? "flags-locked" : undefined}
            >
              {flag.label}
            </DipSwitchToggle>
          ))}
        </DipSwitchBank>
        <DipSwitchLegend className="grid w-full grid-cols-1 gap-x-6 sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-4" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs">
        <span className="text-muted-foreground">
          {on.length} of {flags.length} on
        </span>
        <code className="flex gap-3 rounded-md bg-muted px-2 py-1">
          <span>
            FLAGS=<DipSwitchReadout format="hex" className="text-xs" />
          </span>
          <DipSwitchReadout format="binary" className="text-xs text-muted-foreground" />
        </code>
      </div>
    </DipSwitch>
  )
}
