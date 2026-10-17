"use client"

import {
  DialMark,
  Gauge,
  GaugeLabel,
  GaugeValue,
} from "@workspace/ui/components/dial"

/** Days of credit left, with the auto top-up level marked in amber. */
export function DialRunway() {
  return (
    <div className="flex flex-col items-center gap-2">
      <Gauge
        value={12}
        max={30}
        ticks={30}
        getAriaValueText={(_, value) =>
          `${value} days left; auto top-up at 5 days`
        }
        marks={<DialMark value={5} tone="amber" />}
      >
        <GaugeLabel>Runway</GaugeLabel>
        <GaugeValue>{(_, value) => `${value} days`}</GaugeValue>
      </Gauge>
      <p className="text-xs text-muted-foreground">
        Amber mark: auto top-up at 5 days
      </p>
    </div>
  )
}
