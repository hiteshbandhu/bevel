import type { TaskPlanStatus } from "@workspace/ui/components/task-plan"

/** The simulated run: a plan, how far into the current step the agent is, and what the tests said. */

export type Phase = "research" | "code" | "tests" | "docs" | "you" | "ship"

export type Step = {
  id: string
  text: string
  phase: Phase
  status: TaskPlanStatus
  /** The first run of the suite fails: a flaky clock in a test. */
  failsOnce?: boolean
  /** Passing this step clears the failing tests. */
  clearsTests?: boolean
  /** Approved by you, for when autonomy is at Ask. */
  approved?: boolean
}

export type Run = {
  steps: Step[]
  /** 0 to 1 through the current step. */
  progress: number
  testsFailing: boolean
  shipped: boolean
  notes: number
}

export const initialRun: Run = {
  steps: [
    { id: "read", text: "Read issue #217: bursts get 429s after a deploy", phase: "research", status: "done" },
    { id: "trace", text: "Trace the token bucket in gateway/limiter", phase: "research", status: "current" },
    { id: "patch", text: "Refill the bucket from a monotonic clock", phase: "code", status: "pending" },
    { id: "test", text: "Add a regression test for the burst case", phase: "tests", status: "pending" },
    { id: "suite", text: "Run the full suite", phase: "tests", status: "pending", failsOnce: true },
    { id: "docs", text: "Update the limiter section of the docs", phase: "docs", status: "pending" },
    { id: "pr", text: "Open pull request #482", phase: "docs", status: "pending" },
    { id: "ship", text: "Merge #482 into main (yours to approve)", phase: "ship", status: "pending" },
  ],
  progress: 0.3,
  testsFailing: false,
  shipped: false,
  notes: 0,
}

/** Seconds a step takes at an even share of effort. */
export const baseSeconds: Record<Phase, number> = {
  research: 7,
  code: 9,
  tests: 7,
  docs: 6,
  you: 6,
  ship: 0,
}

/** Which subagent does each kind of step. */
export const channelOf: Record<Phase, string | null> = {
  research: "Explore",
  code: "Code",
  you: "Code",
  tests: "Tests",
  docs: "Docs",
  ship: null,
}

export const voiceNotes = [
  "Keep the public limiter API unchanged",
  "Add a changelog entry",
  "Leave the billing routes alone",
  "Log the refill rate at debug level",
]

export type RunAction =
  | { type: "advance"; amount: number }
  | { type: "approve" }
  | { type: "note"; text: string }
  | { type: "ship" }

export const currentIndex = (run: Run) => run.steps.findIndex((s) => s.status === "current")

function nextPending(steps: Step[], after: number) {
  const i = steps.findIndex((s, j) => j > after && s.status === "pending")
  return i === -1 ? steps : steps.map((s, j) => (j === i ? { ...s, status: "current" as const } : s))
}

export function runReducer(run: Run, action: RunAction): Run {
  const at = currentIndex(run)
  switch (action.type) {
    case "advance": {
      const step = run.steps[at]
      if (!step || step.phase === "ship") return run
      const progress = run.progress + action.amount
      if (progress < 1) return { ...run, progress }
      if (step.failsOnce) {
        const steps = [...run.steps]
        steps[at] = { ...step, status: "error", text: "Run the full suite: 2 failed in limiter.test.ts" }
        steps.splice(
          at + 1,
          0,
          { id: "fix", text: "Fix the flaky clock in limiter.test.ts", phase: "code", status: "current" },
          { id: "rerun", text: "Run the full suite again", phase: "tests", status: "pending", clearsTests: true }
        )
        return { ...run, steps, progress: 0, testsFailing: true }
      }
      const done = run.steps.map((s, j) => (j === at ? { ...s, status: "done" as const } : s))
      return {
        ...run,
        steps: nextPending(done, at),
        progress: 0,
        testsFailing: step.clearsTests ? false : run.testsFailing,
      }
    }
    case "approve":
      if (at === -1) return run
      return { ...run, steps: run.steps.map((s, j) => (j === at ? { ...s, approved: true } : s)) }
    case "note": {
      if (at === -1 || run.shipped) return run
      const steps = [...run.steps]
      // An instruction goes next, ahead of the merge.
      const where = run.steps[at]!.phase === "ship" ? at : at + 1
      steps.splice(where, 0, {
        id: `note-${run.notes}`,
        text: `From you: ${action.text}`,
        phase: "you",
        status: "pending",
      })
      // If the merge was waiting, the instruction comes first.
      if (run.steps[at]!.phase === "ship") {
        steps[where] = { ...steps[where]!, status: "current" }
        steps[where + 1] = { ...steps[where + 1]!, status: "pending" }
      }
      return { ...run, steps, notes: run.notes + 1 }
    }
    case "ship":
      return {
        ...run,
        shipped: true,
        steps: run.steps.map((s) => (s.phase === "ship" ? { ...s, status: "done" } : s)),
      }
  }
}
