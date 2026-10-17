"use client"

import * as React from "react"
import { DetentKnob, DetentKnobStop } from "@workspace/ui/components/detent-knob"

const what: Record<string, string> = {
  off: "The agent is off.",
  ask: "The agent asks before every edit.",
  edit: "The agent edits files on its own and asks before running commands.",
  full: "The agent edits and runs commands without asking.",
}

/** The agent's permission mode, on a switch that clicks into place. */
export function DetentKnobMode() {
  const [mode, setMode] = React.useState("ask")
  return (
    <div className="flex flex-col items-center gap-2">
      <DetentKnob aria-label="Agent mode" value={mode} onValueChange={setMode}>
        <DetentKnobStop value="off">Off</DetentKnobStop>
        <DetentKnobStop value="ask">Ask</DetentKnobStop>
        <DetentKnobStop value="edit">Auto-edit</DetentKnobStop>
        <DetentKnobStop value="full">Full auto</DetentKnobStop>
      </DetentKnob>
      <p className="max-w-64 text-center text-sm text-muted-foreground">{what[mode]}</p>
    </div>
  )
}
