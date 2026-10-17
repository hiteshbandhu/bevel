import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import {
  DelegationAgent,
  DelegationBoard,
  DelegationProgress,
  DelegationSlot,
  DelegationTask,
  type DelegationStatus,
} from "@workspace/ui/components/delegation-board"
import { NameTag, NameTagName } from "@workspace/ui/components/name-tag"

const agents: { name: string; status: DelegationStatus; progress: number; task: string }[] = [
  { name: "Research", status: "active", progress: 45, task: "Find cases on notice by email" },
  { name: "Drafting", status: "awaiting", progress: 80, task: "Should email count as written notice?" },
  { name: "Review", status: "pending", progress: 0, task: "Check the redline" },
  { name: "Filing", status: "error", progress: 30, task: "Upload failed: portal session expired" },
  { name: "Citations", status: "complete", progress: 100, task: "All 14 authorities verified" },
]

const meta: Meta<typeof DelegationBoard> = {
  title: "Agents/Delegation board",
  component: DelegationBoard,
  parameters: { layout: "padded" },
  render: () => (
    <DelegationBoard aria-label="Subagents" className="max-w-3xl">
      {agents.map((a) => (
        <DelegationSlot key={a.name} status={a.status}>
          <DelegationAgent>
            <NameTag variant="plain">
              <NameTagName>{a.name}</NameTagName>
            </NameTag>
          </DelegationAgent>
          <DelegationTask>{a.task}</DelegationTask>
          <DelegationProgress value={a.progress} aria-label={`${a.name} progress`} />
        </DelegationSlot>
      ))}
    </DelegationBoard>
  ),
}

export default meta
type Story = StoryObj<typeof DelegationBoard>

export const EveryStatus: Story = {
  play: async ({ canvas }) => {
    const board = canvas.getByRole("list", { name: "Subagents" })
    await expect(board.querySelectorAll(":scope > li")).toHaveLength(5)
    // Status is in words, not only the lamp colour.
    const drafting = canvas.getByText("Drafting").closest("li")!
    await expect(drafting).toHaveTextContent("Needs you")
    await expect(canvas.getByRole("progressbar", { name: "Research progress" })).toHaveAttribute("aria-valuenow", "45")
  },
}
