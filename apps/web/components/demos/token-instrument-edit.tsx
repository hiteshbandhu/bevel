"use client"

import * as React from "react"
import {
  TokenInstrument,
  TokenInstrumentAction,
  TokenInstrumentSlot,
  TokenInstrumentStatus,
} from "@workspace/ui/components/token-instrument"

/** One edit token for the lease draft. Take it to edit; Priya can take it when it's free. */
export function TokenInstrumentEdit() {
  const [holder, setHolder] = React.useState<string | null>(null)
  const [note, setNote] = React.useState("")
  return (
    <div className="flex flex-col items-center gap-4">
      <TokenInstrument
        section="Lease draft"
        holder={holder}
        you="You"
        onTake={() => setHolder("You")}
        onReturn={() => setHolder(null)}
        onRequest={(h) => {
          setNote(`Asked ${h} for the token.`)
          setTimeout(() => {
            setHolder(null)
            setNote(`${h} returned it.`)
          }, 1500)
        }}
      >
        <TokenInstrumentSlot />
        <TokenInstrumentStatus />
        <TokenInstrumentAction />
      </TokenInstrument>
      <button
        type="button"
        disabled={holder !== null}
        onClick={() => setHolder("Priya")}
        className="h-9 rounded-md border px-3 text-sm font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
      >
        Priya takes it
      </button>
      {note && <p className="text-sm text-muted-foreground">{note}</p>}
    </div>
  )
}
