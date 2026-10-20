"use client"

import * as React from "react"
import { TimeCard, TimeCardPunch, TimeCardStatus, type TimeCardEntry } from "@workspace/ui/components/time-card"

/** A contractor's timesheet for one client. Punch in, punch out; the clock stamps the time now. */
export function TimeCardTimesheet() {
  const [entries, setEntries] = React.useState<TimeCardEntry[]>([
    { in: "2026-10-19T08:58:00Z", out: "2026-10-19T12:31:00Z" },
    { in: "2026-10-19T13:15:00Z", out: "2026-10-19T17:42:00Z" },
    { in: "2026-10-20T09:04:00Z", out: "2026-10-20T11:50:00Z" },
  ])
  return (
    <TimeCard
      title="Acme redesign · Sam Okafor · week 43"
      entries={entries}
      onPunch={({ kind, at }) =>
        setEntries((all) =>
          kind === "in" ? [...all, { in: at }] : all.map((e, i) => (i === all.length - 1 ? { ...e, out: at } : e))
        )
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TimeCardStatus />
        <TimeCardPunch disabled={entries.length >= 10} />
      </div>
    </TimeCard>
  )
}
