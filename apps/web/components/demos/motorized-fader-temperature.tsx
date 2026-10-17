"use client"

import * as React from "react"
import { MotorizedFader, MotorizedFaderReadout } from "@workspace/ui/components/motorized-fader"

const format = (v: number) => (v / 100).toFixed(2)

/**
 * The agent tunes its own temperature as it works, and the fader follows.
 * Grab it and the setting is yours until you hand it back.
 */
export function MotorizedFaderTemperature() {
  const [value, setValue] = React.useState(70)
  const [changedBy, setChangedBy] = React.useState("Agent")

  React.useEffect(() => {
    if (changedBy !== "Agent") return
    const timer = setInterval(() => setValue(10 + Math.round(Math.random() * 18) * 5), 2200)
    return () => clearInterval(timer)
  }, [changedBy])

  return (
    <div className="flex flex-col items-center gap-3">
      <MotorizedFader
        aria-label="Temperature"
        value={value}
        changedBy={changedBy}
        format={format}
        onValueChange={(v) => {
          setValue(v)
          setChangedBy("You")
        }}
      />
      <MotorizedFaderReadout value={format(value)} changedBy={changedBy} />
      <button
        type="button"
        disabled={changedBy === "Agent"}
        onClick={() => setChangedBy("Agent")}
        className="h-9 rounded-md border px-3 text-sm font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
      >
        Hand back to the agent
      </button>
    </div>
  )
}
