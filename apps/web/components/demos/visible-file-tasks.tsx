"use client"

import * as React from "react"
import { VisibleFile, VisibleFileRow, VisibleFileSignal } from "@workspace/ui/components/visible-file"

const stages = ["Queued", "Plan", "Build", "Test", "Review", "Done"]

const start = [
  { title: "Fix login redirect", agent: "Coder", stage: 3, blocked: false },
  { title: "Billing refactor", agent: "Coder", stage: 2, blocked: false },
  { title: "API reference", agent: "Writer", stage: 1, blocked: false },
  { title: "Flaky checkout test", agent: "Tester", stage: 3, blocked: true },
  { title: "Bump dependencies", agent: "Coder", stage: 0, blocked: false },
]

/** A tray of agent tasks. Signals slide along each card as its task moves through the stages. */
export function VisibleFileTasks() {
  const [tasks, setTasks] = React.useState(start)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTasks((all) => {
        const open = all.filter((t) => t.stage < stages.length - 1 && !t.blocked)
        const pick = open[Math.floor(Math.random() * open.length)]
        if (!pick) return start
        return all.map((t) => (t === pick ? { ...t, stage: t.stage + 1 } : t))
      })
    }, 1600)
    return () => clearInterval(timer)
  }, [])

  return (
    <VisibleFile aria-label="Agent tasks" scale={stages} className="max-w-2xl">
      {tasks.map((t) => (
        <VisibleFileRow key={t.title} title={t.title} detail={t.agent}>
          <VisibleFileSignal
            value={t.stage}
            label={t.blocked ? "Blocked at" : "Stage"}
            tone={t.blocked ? "red" : t.stage === stages.length - 1 ? "green" : "blue"}
          />
        </VisibleFileRow>
      ))}
    </VisibleFile>
  )
}
