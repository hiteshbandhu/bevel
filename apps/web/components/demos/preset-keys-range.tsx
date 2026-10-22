"use client"

import * as React from "react"
import { PresetKey, PresetKeys } from "@workspace/ui/components/preset-keys"

const ranges = {
  "24h": { label: "Last 24 hours", runs: [4, 7, 3, 9, 12, 8, 6, 10, 14, 9, 5, 7] },
  "7d": { label: "Last 7 days", runs: [52, 61, 48, 70, 66, 31, 28] },
  "30d": { label: "Last 30 days", runs: [210, 260, 240, 300, 280, 330, 310, 350, 290, 320] },
  "90d": { label: "Last 90 days", runs: [800, 950, 1100, 1020, 1240, 1180, 1300, 1420, 1390, 1500, 1610, 1580] },
} as const

type Range = keyof typeof ranges

/** A time-range picker over a usage chart: one range is always down. */
export function PresetKeysRange() {
  const [range, setRange] = React.useState<Range>("7d")
  const { label, runs } = ranges[range]
  const max = Math.max(...runs)
  const total = runs.reduce((a, b) => a + b, 0)
  return (
    <div className="flex w-full flex-col gap-4 rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Agent runs</p>
          <p className="text-xs text-muted-foreground">
            {label}: {total.toLocaleString("en-US")}
          </p>
        </div>
        <PresetKeys<Range> aria-label="Range" size="sm" value={range} onValueChange={setRange}>
          {(Object.keys(ranges) as Range[]).map((r) => (
            <PresetKey<Range> key={r} value={r}>
              {r}
            </PresetKey>
          ))}
        </PresetKeys>
      </div>
      <div aria-hidden className="flex h-24 items-end gap-1">
        {runs.map((n, i) => (
          <span key={i} className="flex-1 rounded-sm bg-foreground/15" style={{ height: `${(n / max) * 100}%` }} />
        ))}
      </div>
    </div>
  )
}
