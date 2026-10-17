"use client"

import * as React from "react"
import {
  DelegationAgent,
  DelegationBoard,
  DelegationProgress,
  DelegationSlot,
  DelegationTask,
  type DelegationStatus,
} from "@workspace/ui/components/delegation-board"
import { NameTag, NameTagName } from "@workspace/ui/components/name-tag"

type Agent = { name: string; task: string; progress: number; status: DelegationStatus }

const start: Agent[] = [
  { name: "Research", task: "Find cases on notice by email", progress: 35, status: "active" },
  { name: "Drafting", task: "Redline clause 9.2", progress: 60, status: "active" },
  { name: "Review", task: "Check the redline against the playbook", progress: 0, status: "pending" },
  { name: "Citations", task: "Verify every authority cited", progress: 20, status: "active" },
]

/** A coordinator's subagents at work. Drafting stops to ask you something. */
export function DelegationBoardAgents() {
  const [agents, setAgents] = React.useState(start)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setAgents((list) =>
        list.map((a) => {
          if (a.status !== "active") return a
          const progress = Math.min(100, a.progress + 8 + Math.round(Math.random() * 8))
          if (a.name === "Drafting" && progress >= 80) return { ...a, progress: 80, status: "awaiting" }
          return { ...a, progress, status: progress >= 100 ? "complete" : "active" }
        })
      )
    }, 900)
    return () => clearInterval(timer)
  }, [])

  const answer = () =>
    setAgents((list) =>
      list.map((a) =>
        a.name === "Drafting"
          ? { ...a, status: "active" }
          : a.name === "Review" && a.status === "pending"
            ? { ...a, status: "active" }
            : a
      )
    )

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-4">
      <DelegationBoard aria-label="Subagents">
        {agents.map((a) => (
          <DelegationSlot key={a.name} status={a.status}>
            <DelegationAgent>
              <NameTag variant="plain">
                <NameTagName>{a.name}</NameTagName>
              </NameTag>
            </DelegationAgent>
            <DelegationTask>
              {a.status === "awaiting" ? "Should email count as written notice?" : a.task}
            </DelegationTask>
            <DelegationProgress value={a.progress} aria-label={`${a.name} progress`} />
          </DelegationSlot>
        ))}
      </DelegationBoard>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!agents.some((a) => a.status === "awaiting")}
          onClick={answer}
          className="h-9 rounded-md border px-3 text-sm font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
        >
          Answer: no, written only
        </button>
        <button
          type="button"
          onClick={() => setAgents(start)}
          className="h-9 rounded-md border px-3 text-sm font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          Restart
        </button>
      </div>
    </div>
  )
}
