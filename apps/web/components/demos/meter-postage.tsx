"use client"

import * as React from "react"
import {
  Meter,
  MeterButton,
  MeterFlag,
  MeterFooter,
  MeterHeader,
  MeterLabel,
  MeterReading,
} from "@workspace/ui/components/meter"

/** A prepaid balance, like a postage meter: each call stamps a little off. */
export function MeterPostage() {
  const [balance, setBalance] = React.useState(24.6)
  return (
    <Meter variant="graphite" aria-label="Prepaid balance">
      <MeterHeader>
        <MeterLabel>Prepaid credit</MeterLabel>
        <MeterFlag>{balance < 5 ? "Low" : "In credit"}</MeterFlag>
      </MeterHeader>
      <MeterReading value={balance} currency="USD" />
      <MeterFooter>
        <MeterButton disabled={balance < 0.42} onClick={() => setBalance((b) => +(b - 0.42).toFixed(2))}>
          Run a call, $0.42
        </MeterButton>
        <MeterButton onClick={() => setBalance((b) => +(b + 10).toFixed(2))}>Add $10</MeterButton>
      </MeterFooter>
    </Meter>
  )
}
