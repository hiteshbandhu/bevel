"use client"

import * as React from "react"
import {
  PatchBay,
  PatchBayJack,
  PatchBayPanel,
  PatchBayRoutes,
  PatchBayRow,
  type PatchBayRoute,
} from "@workspace/ui/components/patch-bay"

const events = ["invoice.paid", "charge.failed", "trial.ending", "sub.deleted"]
const handlers = [
  { value: "receipt", label: "Send receipt" },
  { value: "ledger", label: "Update ledger" },
  { value: "slack", label: "Slack #billing" },
  { value: "dunning", label: "Dunning email" },
  { value: "seats", label: "Revoke seats" },
]

/** Route a billing provider's webhook events to your handlers. Press an event, then a handler. */
export function PatchBayWebhooks() {
  const [routes, setRoutes] = React.useState<PatchBayRoute[]>([
    ["invoice.paid", "receipt"],
    ["invoice.paid", "ledger"],
    ["charge.failed", "dunning"],
  ])
  const unrouted = events.filter((e) => !routes.some(([from]) => from === e))
  return (
    <PatchBay aria-label="Webhook routing" value={routes} onValueChange={setRoutes} className="max-w-xl">
      <PatchBayPanel>
        <PatchBayRow side="source" label="Stripe events">
          {events.map((e) => (
            <PatchBayJack key={e} value={e}>
              {e}
            </PatchBayJack>
          ))}
        </PatchBayRow>
        <PatchBayRow side="destination" label="Handlers">
          {handlers.map((h) => (
            <PatchBayJack key={h.value} value={h.value}>
              {h.label}
            </PatchBayJack>
          ))}
        </PatchBayRow>
      </PatchBayPanel>
      <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
        <p className="text-sm font-semibold">
          {routes.length} route{routes.length === 1 ? "" : "s"}
          {unrouted.length > 0 && (
            <span className="font-normal text-muted-foreground">
              {" "}
              · {unrouted.join(", ")} {unrouted.length === 1 ? "goes" : "go"} nowhere
            </span>
          )}
        </p>
        <PatchBayRoutes />
      </div>
    </PatchBay>
  )
}
