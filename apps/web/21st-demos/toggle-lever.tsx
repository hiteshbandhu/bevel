"use client"

import * as React from "react"
import {
  ToggleLever,
  ToggleLeverDescription,
  ToggleLeverField,
  ToggleLeverLabel,
} from "@workspace/ui/components/toggle-lever"

const settings = [
  {
    id: "failures",
    label: "Run failures",
    description: "The moment a run fails.",
    on: true,
  },
  {
    id: "approvals",
    label: "Approvals waiting",
    description: "When an agent stops to ask.",
    on: true,
  },
  {
    id: "digest",
    label: "Weekly digest",
    description: "Every Monday.",
    on: false,
  },
]

/** Notification settings on metal toggle levers, with a master lever that silences them all. */
export function ToggleLeverNotifications() {
  const [paused, setPaused] = React.useState(false)
  return (
    <div className="flex w-[24rem] flex-col gap-5 rounded-2xl border bg-card p-6 shadow-sm">
      <ToggleLeverField>
        <ToggleLeverLabel className="font-semibold">
          Email notifications
        </ToggleLeverLabel>
        <ToggleLeverDescription>
          {paused ? "Paused. Nothing will be sent." : "Sent to you@acme.com."}
        </ToggleLeverDescription>
        <ToggleLever
          checked={!paused}
          onCheckedChange={(on) => setPaused(!on)}
        />
      </ToggleLeverField>
      <div className="flex flex-col gap-5 border-t pt-5">
        {settings.map((s) => (
          <ToggleLeverField key={s.id} name={s.id} disabled={paused}>
            <ToggleLeverLabel>{s.label}</ToggleLeverLabel>
            <ToggleLeverDescription>{s.description}</ToggleLeverDescription>
            <ToggleLever defaultChecked={s.on} />
          </ToggleLeverField>
        ))}
      </div>
    </div>
  )
}
