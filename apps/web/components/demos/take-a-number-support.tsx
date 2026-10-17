"use client"

import * as React from "react"
import {
  TakeANumber,
  TakeANumberDispenser,
  TakeANumberSign,
  TakeANumberStatus,
} from "@workspace/ui/components/take-a-number"

/** A busy support queue. Take a number and watch the sign roll until it's yours. */
export function TakeANumberSupport() {
  const [serving, setServing] = React.useState(17)
  const [issued, setIssued] = React.useState(20)
  const [ticket, setTicket] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (ticket === null || serving >= ticket) return
    const timer = setTimeout(() => setServing((s) => s + 1), 2000)
    return () => clearTimeout(timer)
  }, [serving, ticket])

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <TakeANumber aria-label="Support queue" serving={serving} ticket={ticket}>
        <TakeANumberSign />
        <TakeANumberDispenser
          onClick={() => {
            setTicket(issued)
            setIssued((n) => n + 1)
          }}
        />
        <TakeANumberStatus />
      </TakeANumber>
      {ticket !== null && serving >= ticket && (
        <button
          type="button"
          onClick={() => {
            setTicket(null)
            setServing((s) => s + 1)
          }}
          className="h-9 rounded-md border px-3 text-sm font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          Done, leave the queue
        </button>
      )}
    </div>
  )
}
