"use client"

import * as React from "react"
import {
  GuardedSwitch,
  GuardedSwitchControl,
  GuardedSwitchLabel,
  GuardedSwitchStatus,
} from "@workspace/ui/components/guarded-switch"

/** A critical switch under a flip cover. Lift the cover, then flip; walk away and the cover closes, turning it off. */
export function GuardedSwitchDeploy() {
  const [live, setLive] = React.useState(false)
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-8">
        <GuardedSwitch
          checked={live}
          onCheckedChange={setLive}
          autoClose={false}
        >
          <GuardedSwitchLabel>Deploy to prod</GuardedSwitchLabel>
          <GuardedSwitchControl />
          <GuardedSwitchStatus />
        </GuardedSwitch>
        <GuardedSwitch>
          <GuardedSwitchLabel>Agent shell access</GuardedSwitchLabel>
          <GuardedSwitchControl />
          <GuardedSwitchStatus />
        </GuardedSwitch>
      </div>
      <p className="text-sm text-muted-foreground">
        {live
          ? "Production deploys are live."
          : "Lift a cover to arm a switch."}
      </p>
    </div>
  )
}
