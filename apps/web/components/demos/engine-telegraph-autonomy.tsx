"use client"

import * as React from "react"
import {
  EngineTelegraph,
  EngineTelegraphDial,
  EngineTelegraphOrder,
  EngineTelegraphOrders,
  EngineTelegraphStatus,
} from "@workspace/ui/components/engine-telegraph"

/**
 * Set how much the agent may do on its own. The agent finishes its current
 * step before it answers, so the red pointer follows a moment later.
 */
export function EngineTelegraphAutonomy() {
  const [value, setValue] = React.useState("ask")
  const [confirmed, setConfirmed] = React.useState("ask")

  React.useEffect(() => {
    if (value === confirmed) return
    const timer = setTimeout(() => setConfirmed(value), 1800)
    return () => clearTimeout(timer)
  }, [value, confirmed])

  return (
    <EngineTelegraph aria-label="Agent autonomy" value={value} onValueChange={setValue} confirmed={confirmed}>
      <EngineTelegraphDial />
      <EngineTelegraphOrders>
        <EngineTelegraphOrder value="stop">Stop</EngineTelegraphOrder>
        <EngineTelegraphOrder value="plan">Plan</EngineTelegraphOrder>
        <EngineTelegraphOrder value="ask">Ask</EngineTelegraphOrder>
        <EngineTelegraphOrder value="act">Act</EngineTelegraphOrder>
        <EngineTelegraphOrder value="auto">Auto</EngineTelegraphOrder>
      </EngineTelegraphOrders>
      <EngineTelegraphStatus />
    </EngineTelegraph>
  )
}
