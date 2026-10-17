"use client"

import * as React from "react"
import { Dial, DialMark } from "@workspace/ui/components/dial"

/** Auto top-up, set like a thermostat: the level to keep above, and how much to add. */
export function DialAutoTopUp() {
  const [threshold, setThreshold] = React.useState(30)
  const [amount, setAmount] = React.useState(10)
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap justify-center gap-8">
        <Dial
          label="Keep balance above"
          value={threshold}
          onValueChange={setThreshold}
          max={100}
          step={5}
          currency="USD"
          format={{ maximumFractionDigits: 0 }}
          marks={<DialMark value={threshold} tone="amber" />}
          className="w-40"
        />
        <Dial
          label="Top up by"
          value={amount}
          onValueChange={setAmount}
          min={5}
          max={200}
          step={5}
          currency="USD"
          format={{ maximumFractionDigits: 0 }}
          className="w-40"
        />
      </div>
      <p className="max-w-xs text-center text-sm text-muted-foreground">
        When the balance drops below ${threshold}, we add ${amount}.
      </p>
    </div>
  )
}
