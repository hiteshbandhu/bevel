"use client"

import * as React from "react"
import { ChessClock, ChessClockFace, ChessClockFaces, ChessClockRocker } from "@workspace/ui/components/chess-clock"

/** A review where you and the agent take turns, each with two minutes. The agent answers, then hands back. */
export function ChessClockReview() {
  const [round, setRound] = React.useState(0)
  const [active, setActive] = React.useState<0 | 1 | null>(null)
  const rocker = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (active !== 1) return
    const timer = setTimeout(() => {
      rocker.current?.querySelectorAll("button")[1]?.click()
    }, 2400)
    return () => clearTimeout(timer)
  }, [active])

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <ChessClock
        key={round}
        aria-label="Review turns"
        names={["You", "Agent"]}
        time={120_000}
        onTurn={setActive}
        onFlag={() => setActive(null)}
      >
        <ChessClockFaces>
          <ChessClockFace side={0} />
          <ChessClockFace side={1} />
        </ChessClockFaces>
        <ChessClockRocker ref={rocker} />
      </ChessClock>
      <button
        type="button"
        onClick={() => {
          setRound((r) => r + 1)
          setActive(null)
        }}
        className="h-9 rounded-md border px-3 text-sm font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        Reset
      </button>
    </div>
  )
}
