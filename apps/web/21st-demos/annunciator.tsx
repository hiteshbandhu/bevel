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

/** An agent's alert panel. Steady lamps are acknowledged; a new alarm flashes until you press it. Click a lamp to raise or clear it. */
export function AnnunciatorAgent() {
  const [active, setActive] = React.useState<Record<string, boolean>>({
    budget: true,
    context: true,
    deploy: true,
  })
  const panel = React.useRef<HTMLDivElement>(null)
  // Start with the standing alarms acknowledged, then raise a fresh one.
  React.useEffect(() => {
    // After the first commit, once the button is enabled.
    const ack = setTimeout(
      () =>
        panel.current
          ?.querySelector<HTMLButtonElement>(
            "[data-slot=annunciator-acknowledge]"
          )
          ?.click(),
      150
    )
    const raise = setTimeout(
      () => setActive((a) => ({ ...a, tests: true })),
      700
    )
    return () => {
      clearTimeout(ack)
      clearTimeout(raise)
    }
  }, [])
  return (
    <div ref={panel}>
      <Annunciator aria-label="Agent alerts" className="w-[30rem]">
        <AnnunciatorPanel>
          {conditions.map((c) => (
            <AnnunciatorTile
              key={c.id}
              id={c.id}
              tone={c.tone}
              active={!!active[c.id]}
              onClick={() => setActive((a) => ({ ...a, [c.id]: !a[c.id] }))}
            >
              {c.label}
            </AnnunciatorTile>
          ))}
        </AnnunciatorPanel>
        <AnnunciatorAcknowledge />
      </Annunciator>
    </div>
  )
}
