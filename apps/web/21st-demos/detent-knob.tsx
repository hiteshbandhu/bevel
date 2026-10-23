"use client"

import * as React from "react"
import {
  DetentKnob,
  DetentKnobStop,
} from "@workspace/ui/components/detent-knob"

const what: Record<string, string> = {
  low: "Quick answers. Fastest and cheapest.",
  medium: "Thinks before answering. The default.",
  high: "Works through hard problems step by step.",
  max: "Takes as long as it needs.",
}

/** How hard the model thinks, on a knob that clicks into each setting. Drag, scroll or use the arrow keys. */
export function DetentKnobEffort() {
  const [effort, setEffort] = React.useState("high")
  return (
    <div className="flex w-[22rem] flex-col items-center gap-5 rounded-2xl border bg-card px-8 py-7 shadow-sm">
      <p className="self-start text-sm font-semibold">Reasoning effort</p>
      <div className="scale-[1.7] py-12">
        <DetentKnob
          aria-label="Reasoning effort"
          value={effort}
          onValueChange={setEffort}
        >
          <DetentKnobStop value="low">Low</DetentKnobStop>
          <DetentKnobStop value="medium">Medium</DetentKnobStop>
          <DetentKnobStop value="high">High</DetentKnobStop>
          <DetentKnobStop value="max">Max</DetentKnobStop>
        </DetentKnob>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        {what[effort]}
      </p>
    </div>
  )
}
