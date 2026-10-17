"use client"

import * as React from "react"
import { NumberWheel } from "@workspace/ui/components/number-wheel"

export function NumberWheelCounter() {
  const [value, setValue] = React.useState(1240)
  const buttons = [
    { label: "+1", change: 1 },
    { label: "+99", change: 99 },
    { label: "−250", change: -250 },
  ]
  return (
    <div className="flex flex-col items-center gap-6">
      <NumberWheel value={value} live="polite" className="text-5xl" />
      <NumberWheel value={value / 100} currency="USD" tone="black" className="text-2xl" />
      <div className="flex gap-2">
        {buttons.map((button) => (
          <button
            key={button.label}
            type="button"
            onClick={() => setValue((v) => Math.max(0, v + button.change))}
            className="h-9 rounded-md border px-3 text-sm font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  )
}
