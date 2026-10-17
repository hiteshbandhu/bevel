"use client"

import * as React from "react"
import { Breaker, BreakerPanel, BreakerPanelTitle, BreakerRow } from "@workspace/ui/components/breaker"

/** Spending caps as breakers. A cap that's hit trips; switching it resets it. */
export function BreakerCaps() {
  const [workspace, setWorkspace] = React.useState(true)
  const [perPerson, setPerPerson] = React.useState({ on: true, tripped: true })
  const [perCase, setPerCase] = React.useState(false)

  return (
    <BreakerPanel aria-label="Spending caps">
      <BreakerPanelTitle>Spending caps</BreakerPanelTitle>
      <BreakerRow>
        <Breaker label="Workspace" description="$500 a month" checked={workspace} onCheckedChange={setWorkspace} />
        <Breaker
          label="Per person"
          description="$50 a month"
          checked={perPerson.on}
          tripped={perPerson.tripped}
          onCheckedChange={(on) => setPerPerson({ on, tripped: false })}
        />
        <Breaker label="Per case" description="$200" checked={perCase} onCheckedChange={setPerCase} />
        <Breaker label="Overage" description="Owners only" defaultChecked disabled />
      </BreakerRow>
    </BreakerPanel>
  )
}
