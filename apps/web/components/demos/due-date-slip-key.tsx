"use client"

import * as React from "react"
import { DueDateSlip, DueDateSlipRenew, DueDateSlipStatus } from "@workspace/ui/components/due-date-slip"

const NOW = new Date("2026-10-17")
const DAY = 86_400_000
const iso = (d: Date) => d.toISOString().slice(0, 10)

/** An API key that expires unless renewed. Each renewal is stamped on the slip. */
export function DueDateSlipKey() {
  const [dates, setDates] = React.useState(["2026-07-15", "2026-08-14", "2026-10-13"])
  const renew = () => {
    const last = new Date(dates.at(-1)!)
    const from = last < NOW ? NOW : last
    setDates((d) => [...d, iso(new Date(from.getTime() + 30 * DAY))])
  }
  return (
    <DueDateSlip title="Production API key · sk-…4f2a" dates={dates} now={NOW}>
      <DueDateSlipStatus />
      <DueDateSlipRenew onClick={renew} disabled={dates.length >= 6}>
        {dates.length >= 6 ? "No renewals left" : "Renew 30 days"}
      </DueDateSlipRenew>
    </DueDateSlip>
  )
}
