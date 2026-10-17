import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect, waitFor } from "storybook/test"
import {
  ActivityLog,
  ActivityLogEntries,
  ActivityLogEntry,
  ActivityLogTitle,
} from "@workspace/ui/components/activity-log"

const meta: Meta<typeof ActivityLog> = {
  title: "Agents/Activity log",
  component: ActivityLog,
  parameters: { layout: "centered" },
  render: () => (
    <ActivityLog aria-label="Research agent activity" className="w-[32rem]">
      <ActivityLogTitle>Research agent</ActivityLogTitle>
      <ActivityLogEntries>
        <ActivityLogEntry kind="thought" time="14:02">The notice clause is probably in section 9.</ActivityLogEntry>
        <ActivityLogEntry kind="action" time="14:02">Opened lease.pdf, page 14</ActivityLogEntry>
        <ActivityLogEntry kind="question" time="14:03">Should I treat email as written notice?</ActivityLogEntry>
        <ActivityLogEntry kind="response" time="14:05">Found three notice clauses; summary attached.</ActivityLogEntry>
        <ActivityLogEntry kind="error" time="14:06">Couldn&apos;t open schedule-b.pdf: file is password protected.</ActivityLogEntry>
      </ActivityLogEntries>
    </ActivityLog>
  ),
}

export default meta
type Story = StoryObj<typeof ActivityLog>

export const AllKinds: Story = {
  play: async ({ canvas }) => {
    // A live region: screen readers hear new entries without losing their place.
    await expect(canvas.getByRole("log")).toBeInTheDocument()
    await expect(canvas.getByText(/email as written notice/).closest("[data-slot=activity-log-entry]")).toHaveTextContent(/Question/)
  },
}

function Streaming() {
  const [entries, setEntries] = React.useState(["Opened lease.pdf"])
  return (
    <div className="flex flex-col items-center gap-3">
      <ActivityLog aria-label="Agent activity" className="w-[28rem]">
        <ActivityLogEntries className="[--activity-log-height:8rem]">
          {entries.map((text, i) => (
            <ActivityLogEntry key={i} time={`14:0${i}`}>
              {text}
            </ActivityLogEntry>
          ))}
        </ActivityLogEntries>
      </ActivityLog>
      <button type="button" onClick={() => setEntries((e) => [...e, `Step ${e.length + 1}`])}>
        Add entry
      </button>
    </div>
  )
}

/** New entries print in, and the log follows them while you're at the bottom. */
export const StaysAtBottom: Story = {
  render: () => <Streaming />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    for (let i = 0; i < 6; i++) await userEvent.click(canvas.getByRole("button", { name: "Add entry" }))
    const log = canvasElement.querySelector("[role=log]")!
    await waitFor(() => expect(log.scrollHeight - log.scrollTop - log.clientHeight).toBeLessThan(8))
    const last = [...canvasElement.querySelectorAll("[data-slot=activity-log-entry]")].at(-1)!
    await expect(last).toHaveAttribute("data-enter")
  },
}
