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
  { value: "editor", label: "New editor" },
  { value: "streaming", label: "Streamed replies" },
  { value: "search", label: "Web search" },
  { value: "memory", label: "Memory" },
  { value: "batch", label: "Batch API" },
  { value: "sso", label: "Enforce SSO" },
  { value: "audit", label: "Audit export" },
  { value: "beta", label: "Beta models" },
]

/** Feature flags on a bank of DIP switches. The bank is also the config value you ship. */
export function DipSwitchFlags() {
  const [on, setOn] = React.useState(["editor", "streaming", "sso", "beta"])
  return (
    <DipSwitch
      aria-label="Feature flags"
      value={on}
      onValueChange={setOn}
      className="w-[26rem] rounded-2xl border bg-card p-6 shadow-sm"
    >
      <p className="text-sm font-semibold">Feature flags</p>
      <div className="flex flex-col items-center gap-5">
        <div className="scale-125 py-3">
          <DipSwitchBank>
            {flags.map((flag) => (
              <DipSwitchToggle key={flag.value} value={flag.value}>
                {flag.label}
              </DipSwitchToggle>
            ))}
          </DipSwitchBank>
        </div>
        <DipSwitchLegend className="grid w-full grid-flow-col grid-cols-2 grid-rows-4 gap-x-6" />
      </div>
      <code className="flex justify-between rounded-md bg-muted px-3 py-1.5 text-xs">
        <span>
          FLAGS=
          <DipSwitchReadout format="hex" className="text-xs" />
        </span>
        <DipSwitchReadout
          format="binary"
          className="text-xs text-muted-foreground"
        />
      </code>
    </DipSwitch>
  )
}
