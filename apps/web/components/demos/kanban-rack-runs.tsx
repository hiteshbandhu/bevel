"use client"

import * as React from "react"
import { KanbanRack, KanbanRackPockets, KanbanRackStatus, KanbanRackTake } from "@workspace/ui/components/kanban-rack"

const backlog = ["Fix login redirect", "Refactor billing", "Write API tests", "Update docs", "Bump deps"]

/** At most three agent runs at once. Start one to take a card; finish one to put it back. */
export function KanbanRackRuns() {
  const [queue, setQueue] = React.useState(backlog)
  const [running, setRunning] = React.useState<string[]>([])

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <KanbanRack aria-label="Agent runs" capacity={3} inUse={running}>
        <KanbanRackPockets />
        <KanbanRackTake
          onClick={() => {
            const [next, ...rest] = queue
            if (!next) return
            setRunning((r) => [...r, next])
            setQueue(rest)
          }}
        >
          {queue[0] ? `Start “${queue[0]}”` : "Backlog empty"}
        </KanbanRackTake>
        <KanbanRackStatus />
      </KanbanRack>
      {running.length > 0 && (
        <ul aria-label="Running" className="flex w-full flex-col gap-1.5">
          {running.map((task) => (
            <li key={task} className="flex items-center justify-between gap-3 rounded-md border px-3 py-1.5 text-sm">
              <span className="truncate">{task}</span>
              <button
                type="button"
                onClick={() => setRunning((r) => r.filter((t) => t !== task))}
                className="h-7 shrink-0 rounded-md border px-2 text-xs font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                Done
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
