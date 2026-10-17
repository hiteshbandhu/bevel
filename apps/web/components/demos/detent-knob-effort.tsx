"use client"

import * as React from "react"
import { DetentKnob, DetentKnobStop } from "@workspace/ui/components/detent-knob"

const what: Record<string, string> = {
  low: "Quick answers. Fastest and cheapest.",
  medium: "Thinks before answering. The default.",
  high: "Works through hard problems step by step.",
  max: "Takes as long as it needs. Slowest and most expensive.",
}

/** How hard the model thinks, on a switch that clicks into place. */
export function DetentKnobEffort() {
  const [effort, setEffort] = React.useState("medium")
  return (
    <div className="flex flex-col items-center gap-2">
      <DetentKnob aria-label="Reasoning effort" value={effort} onValueChange={setEffort}>
        <DetentKnobStop value="low">Low</DetentKnobStop>
        <DetentKnobStop value="medium">Medium</DetentKnobStop>
        <DetentKnobStop value="high">High</DetentKnobStop>
        <DetentKnobStop value="max">Max</DetentKnobStop>
      </DetentKnob>
      <p className="max-w-64 text-center text-sm text-muted-foreground">{what[effort]}</p>
    </div>
  )
}
