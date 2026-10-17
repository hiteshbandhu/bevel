"use client"

import * as React from "react"
import { SplitFlap, SplitFlapRow, SplitFlapText } from "@workspace/ui/components/split-flap"

const regions = ["US-EAST", "US-WEST", "EU-WEST", "AP-SOUTH"]
const stages = ["QUEUED", "BUILDING", "TESTING", "ROLLOUT", "LIVE"]

/** A deploy board. Each region's status flips over as its rollout moves on. */
export function SplitFlapDeploys() {
  const [at, setAt] = React.useState([4, 2, 1, 0])

  React.useEffect(() => {
    const timer = setInterval(() => {
      setAt((all) => {
        if (all.every((s) => s === stages.length - 1)) return [0, 0, 0, 0]
        const open = all.map((s, i) => (s < stages.length - 1 ? i : -1)).filter((i) => i >= 0)
        const pick = open[Math.floor(Math.random() * open.length)]!
        return all.map((s, i) => (i === pick ? s + 1 : s))
      })
    }, 2200)
    return () => clearInterval(timer)
  }, [])

  return (
    <SplitFlap aria-label="Deploys">
      {regions.map((r, i) => (
        <SplitFlapRow key={r} name={r}>
          <SplitFlapText value={r} length={8} />
          <SplitFlapText value={`V2.${14 + (at[i]! > 3 ? 1 : 0)}`} length={5} />
          <SplitFlapText value={stages[at[i]!]!} length={8} tone="amber" />
        </SplitFlapRow>
      ))}
    </SplitFlap>
  )
}
