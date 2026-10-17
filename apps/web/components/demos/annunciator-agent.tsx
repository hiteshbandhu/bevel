"use client"

import * as React from "react"
import {
  Annunciator,
  AnnunciatorAcknowledge,
  AnnunciatorPanel,
  AnnunciatorTile,
} from "@workspace/ui/components/annunciator"

const conditions = [
  { id: "budget", label: "Over budget", tone: "red" },
  { id: "tests", label: "Tests failing", tone: "amber" },
  { id: "rate", label: "Rate limited", tone: "amber" },
  { id: "context", label: "Context full", tone: "amber" },
  { id: "approval", label: "Needs approval", tone: "white" },
  { id: "deploy", label: "Deploy live", tone: "green" },
] as const

/** An agent's alert panel. Conditions come and go; each new one flashes until you acknowledge it. */
export function AnnunciatorAgent() {
  const [active, setActive] = React.useState<Record<string, boolean>>({ tests: true })

  React.useEffect(() => {
    const timer = setInterval(() => {
      const c = conditions[Math.floor(Math.random() * conditions.length)]!
      setActive((a) => ({ ...a, [c.id]: !a[c.id] }))
    }, 2600)
    return () => clearInterval(timer)
  }, [])

  return (
    <Annunciator aria-label="Agent alerts">
      <AnnunciatorPanel>
        {conditions.map((c) => (
          <AnnunciatorTile key={c.id} id={c.id} tone={c.tone} active={!!active[c.id]}>
            {c.label}
          </AnnunciatorTile>
        ))}
      </AnnunciatorPanel>
      <AnnunciatorAcknowledge />
    </Annunciator>
  )
}
