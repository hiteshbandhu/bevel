"use client"

import * as React from "react"
import { Vigilance, VigilanceButton, VigilanceLamps, VigilanceTimer } from "@workspace/ui/components/vigilance"

/** A supervised agent run: it keeps going only while you check in every 12 seconds. */
export function VigilanceAgent() {
  const [log, setLog] = React.useState("Agent running with supervision.")
  return (
    <div className="flex flex-col items-center gap-4">
      <Vigilance
        aria-label="Supervision"
        interval={12000}
        onTrip={() => setLog("No check-in: the agent paused before its next action.")}
        onResume={() => setLog("Resumed. The agent carries on.")}
        onCheckIn={() => setLog("Checked in.")}
      >
        <VigilanceLamps />
        <VigilanceTimer />
        <VigilanceButton />
      </Vigilance>
      <p className="max-w-xs text-center text-sm text-muted-foreground">{log}</p>
    </div>
  )
}
