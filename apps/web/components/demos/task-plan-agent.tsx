"use client"

import * as React from "react"
import {
  TaskPlan,
  TaskPlanHeader,
  TaskPlanProgress,
  TaskPlanStep,
  TaskPlanSteps,
  TaskPlanTitle,
  type TaskPlanStatus,
} from "@workspace/ui/components/task-plan"

const steps = [
  "Read the lease and schedules",
  "List every notice clause",
  "Check notice periods against the playbook",
  "Draft a redline",
  "Summarise for Priya",
]

/** An agent working down its plan. Each step is ticked in ink as it finishes. */
export function TaskPlanAgent() {
  const [done, setDone] = React.useState(1)

  React.useEffect(() => {
    if (done >= steps.length) return
    const timer = setTimeout(() => setDone((d) => d + 1), 1600)
    return () => clearTimeout(timer)
  }, [done])

  const statusOf = (i: number): TaskPlanStatus => (i < done ? "done" : i === done ? "current" : "pending")

  return (
    <div className="flex flex-col items-center gap-4">
      <TaskPlan>
        <TaskPlanHeader>
          <TaskPlanTitle>Review the Harbor Street lease</TaskPlanTitle>
          <TaskPlanProgress value={done} max={steps.length} />
        </TaskPlanHeader>
        <TaskPlanSteps>
          {steps.map((step, i) => (
            <TaskPlanStep key={step} status={statusOf(i)}>
              {step}
            </TaskPlanStep>
          ))}
        </TaskPlanSteps>
      </TaskPlan>
      <button
        type="button"
        disabled={done < steps.length}
        onClick={() => setDone(0)}
        className="h-9 rounded-md border px-3 text-sm font-medium hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
      >
        Run again
      </button>
    </div>
  )
}
