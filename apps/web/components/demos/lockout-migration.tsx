"use client"

import * as React from "react"
import { Lockout, LockoutAction, LockoutHasp, LockoutLock } from "@workspace/ui/components/lockout"

const start = [
  { id: "priya", owner: "Priya", reason: "Restoring a backup" },
  { id: "you", owner: "You", reason: "Reviewing the schema" },
  { id: "sam", owner: "Sam", reason: "Load test running" },
]

/** The migration waits for every lock. Remove yours; the others come off as their work finishes. */
export function LockoutMigration() {
  const [locks, setLocks] = React.useState(start)
  const [ran, setRan] = React.useState(false)
  const remove = (id: string) => setLocks((l) => l.filter((x) => x.id !== id))

  React.useEffect(() => {
    if (locks.some((l) => l.id === "you")) return
    const others = locks.filter((l) => l.id !== "you")
    if (!others.length) return
    const timer = setTimeout(() => remove(others[0]!.id), 1600)
    return () => clearTimeout(timer)
  }, [locks])

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <Lockout aria-label="Database migration">
        <LockoutHasp>
          {locks.map((l) => (
            <LockoutLock
              key={l.id}
              id={l.id}
              owner={l.owner}
              reason={l.reason}
              onRemove={l.id === "you" ? () => remove("you") : undefined}
            />
          ))}
        </LockoutHasp>
        <LockoutAction onClick={() => setRan(true)}>{ran ? "Migration started" : "Run migration"}</LockoutAction>
      </Lockout>
      <button
        type="button"
        onClick={() => {
          setLocks(start)
          setRan(false)
        }}
        className="h-9 rounded-md border px-3 text-sm font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        Reset
      </button>
    </div>
  )
}
