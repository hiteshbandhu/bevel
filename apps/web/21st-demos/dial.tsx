"use client"

import {
  DialMark,
  Gauge,
  GaugeLabel,
  GaugeValue,
} from "@workspace/ui/components/dial"

/** Two readings on a dashboard: days of credit left, and how full the context window is. */
export function DialDashboard() {
  return (
    <div className="flex gap-10 rounded-2xl border bg-card px-10 py-8 shadow-sm">
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
      <Gauge
        value={86}
        max={100}
        ticks={20}
        getAriaValueText={(_, value) => `Context ${value}% full`}
        marks={<DialMark value={90} tone="red" />}
      >
        <GaugeLabel>Context</GaugeLabel>
        <GaugeValue>{(_, value) => `${value}%`}</GaugeValue>
      </Gauge>
    </div>
  )
}
