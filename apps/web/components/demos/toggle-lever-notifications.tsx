"use client"

import * as React from "react"
import { ToggleLever, ToggleLeverDescription, ToggleLeverField, ToggleLeverLabel } from "@workspace/ui/components/toggle-lever"

const settings = [
  { id: "failures", label: "Run failures", description: "The moment an agent run fails.", on: true },
  { id: "approvals", label: "Approvals waiting", description: "When an agent stops to ask you.", on: true },
  { id: "digest", label: "Weekly digest", description: "Runs, spend and failures, every Monday.", on: false },
  { id: "product", label: "Product news", description: "New models and features, about monthly.", on: false },
]

/** Notification settings: one lever per row, and a master lever that silences them all. */
export function ToggleLeverNotifications() {
  const [paused, setPaused] = React.useState(false)
  return (
    <div className="flex w-full flex-col gap-4 rounded-xl border bg-card p-5">
      <ToggleLeverField>
        <ToggleLeverLabel className="font-semibold">Email notifications</ToggleLeverLabel>
        <ToggleLeverDescription>{paused ? "Paused. Nothing will be sent." : "Sent to you@acme.com."}</ToggleLeverDescription>
        <ToggleLever checked={!paused} onCheckedChange={(on) => setPaused(!on)} />
      </ToggleLeverField>
      <div className="flex flex-col gap-4 border-t pt-4">
        {settings.map((s) => (
          <ToggleLeverField key={s.id} name={s.id} disabled={paused}>
            <ToggleLeverLabel>{s.label}</ToggleLeverLabel>
            <ToggleLeverDescription>{s.description}</ToggleLeverDescription>
            <ToggleLever size="sm" defaultChecked={s.on} />
          </ToggleLeverField>
        ))}
      </div>
    </div>
  )
}
