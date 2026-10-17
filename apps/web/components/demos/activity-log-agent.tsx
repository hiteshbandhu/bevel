"use client"

import * as React from "react"
import {
  ActivityLog,
  ActivityLogEntries,
  ActivityLogEntry,
  ActivityLogTitle,
  type ActivityLogKind,
} from "@workspace/ui/components/activity-log"
import { NameTag, NameTagName } from "@workspace/ui/components/name-tag"

type Entry = { kind: ActivityLogKind; agent: string; text: string }

const script: Entry[] = [
  { kind: "thought", agent: "Research", text: "The notice clause is probably in section 9." },
  { kind: "action", agent: "Research", text: "Opened lease.pdf, page 14." },
  { kind: "response", agent: "Research", text: "Found three notice clauses." },
  { kind: "action", agent: "Drafting", text: "Started a redline of clause 9.2." },
  { kind: "question", agent: "Drafting", text: "Should email count as written notice?" },
  { kind: "error", agent: "Research", text: "Couldn't open schedule-b.pdf: it's password protected." },
  { kind: "response", agent: "Drafting", text: "Redline ready for review." },
]

/** Two agents working a matter. Entries arrive as they happen. */
export function ActivityLogAgent() {
  const [count, setCount] = React.useState(2)

  React.useEffect(() => {
    if (count >= script.length) return
    const timer = setTimeout(() => setCount((c) => c + 1), 1400)
    return () => clearTimeout(timer)
  }, [count])

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4">
      <ActivityLog aria-label="Matter activity">
        <ActivityLogTitle>Harbor Street lease</ActivityLogTitle>
        <ActivityLogEntries>
          {script.slice(0, count).map((entry, i) => (
            <ActivityLogEntry key={i} kind={entry.kind} time={`14:${String(2 + i).padStart(2, "0")}`}>
              <NameTag variant="plain">
                <NameTagName>{entry.agent}</NameTagName>
              </NameTag>
              <span>{entry.text}</span>
            </ActivityLogEntry>
          ))}
        </ActivityLogEntries>
      </ActivityLog>
      <button
        type="button"
        disabled={count < script.length}
        onClick={() => setCount(0)}
        className="h-9 rounded-md border px-3 text-sm font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
      >
        Replay
      </button>
    </div>
  )
}
