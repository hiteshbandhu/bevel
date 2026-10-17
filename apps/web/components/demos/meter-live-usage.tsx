"use client"

import * as React from "react"
import { Pause, Play } from "lucide-react"
import {
  Meter,
  MeterButton,
  MeterFlag,
  MeterFooter,
  MeterHeader,
  MeterLabel,
  MeterReading,
  MeterUnit,
} from "@workspace/ui/components/meter"

/** A chat turn's cost, ticking while the model writes. */
export function MeterLiveUsage() {
  const [running, setRunning] = React.useState(false)
  const [spent, setSpent] = React.useState(0)

  React.useEffect(() => {
    if (!running) return
    const timer = setInterval(() => setSpent((s) => s + 0.001 + Math.random() * 0.003), 400)
    return () => clearInterval(timer)
  }, [running])

  return (
    <Meter state={running ? "running" : spent > 0 ? "stopped" : "idle"} aria-label="This turn's cost">
      <MeterHeader>
        <MeterLabel>This turn</MeterLabel>
        <MeterFlag />
      </MeterHeader>
      <div className="flex items-baseline gap-2">
        <MeterReading value={spent} currency="USD" format={{ minimumFractionDigits: 3 }} />
        <MeterUnit>so far</MeterUnit>
      </div>
      <MeterFooter>
        <MeterButton onClick={() => setRunning((r) => !r)}>
          {running ? <Pause /> : <Play />}
          {running ? "Stop" : "Run"}
        </MeterButton>
        <MeterButton disabled={running || spent === 0} onClick={() => setSpent(0)}>
          Clear
        </MeterButton>
      </MeterFooter>
    </Meter>
  )
}
