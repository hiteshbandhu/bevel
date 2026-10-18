"use client"

import { Pause, Play } from "lucide-react"
import { PanelKey } from "../shared/environment"

/** The product's own line, printed along the top edge of the desk: name, account, the clock and the traffic key. */
export function MeterlineHeader({
  clock,
  running,
  canStart,
  onTraffic,
}: {
  clock: string
  running: boolean
  canStart: boolean
  onTraffic: () => void
}) {
  return (
    <header className="mx-auto font-[family-name:var(--font-ledger)] flex max-w-[1440px] flex-wrap items-center gap-x-6 gap-y-3 px-4 pt-6 pb-5 sm:px-8">
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-1">
        <p className="text-[26px] leading-none font-bold text-[#EADFC8] [text-shadow:0_1px_0_rgb(0_0_0/0.5)]">
          Meterline
        </p>
        <p className="text-[17px] text-[#B8AA8E]">Halvorsen Labs, pay as you go</p>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <p className="text-[17px] text-[#B8AA8E]">
          17 Oct, <span className="text-[#EADFC8] tabular-nums">{clock}</span>
        </p>
        <PanelKey
          tone={running ? "plain" : "go"}
          onClick={onTraffic}
          disabled={!running && !canStart}
          className="gap-2 [&_svg]:size-4"
        >
          {running ? <Pause aria-hidden /> : <Play aria-hidden />}
          {running ? "Pause traffic" : "Start traffic"}
        </PanelKey>
      </div>
    </header>
  )
}
