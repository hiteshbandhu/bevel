"use client"

import * as React from "react"
import {
  GuardedSwitch,
  GuardedSwitchControl,
  GuardedSwitchLabel,
  GuardedSwitchStatus,
} from "@workspace/ui/components/guarded-switch"

/** Two critical switches. Lift a cover, then flip. Leave it and the cover closes, turning it off. */
export function GuardedSwitchDeploy() {
  const [shell, setShell] = React.useState(false)
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap justify-center gap-6">
        <GuardedSwitch checked={shell} onCheckedChange={setShell}>
          <GuardedSwitchLabel>Agent shell access</GuardedSwitchLabel>
          <GuardedSwitchControl />
          <GuardedSwitchStatus />
        </GuardedSwitch>
        <GuardedSwitch>
          <GuardedSwitchLabel>Deploy to prod</GuardedSwitchLabel>
          <GuardedSwitchControl />
          <GuardedSwitchStatus />
        </GuardedSwitch>
      </div>
      <p className="max-w-xs text-center text-sm text-muted-foreground">
        {shell ? "The agent can run shell commands without asking." : "The agent asks before running shell commands."}
      </p>
    </div>
  )
}
