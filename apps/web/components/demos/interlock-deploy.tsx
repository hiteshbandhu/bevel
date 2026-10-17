"use client"

import { Interlock, InterlockLever } from "@workspace/ui/components/interlock"

/** Promote stays locked until migrations and the canary are done, and holds them while it's pulled. */
export function InterlockDeploy() {
  return (
    <Interlock aria-label="Release levers">
      <InterlockLever id="migrations" number={1} label="Migrations applied" tone="black" />
      <InterlockLever id="canary" number={2} label="Canary healthy" tone="black" />
      <InterlockLever id="freeze" number={3} label="Freeze lifted" tone="blue" />
      <InterlockLever
        id="promote"
        number={4}
        label="Promote to prod"
        tone="red"
        requires={["migrations", "canary", "freeze"]}
      />
    </Interlock>
  )
}
