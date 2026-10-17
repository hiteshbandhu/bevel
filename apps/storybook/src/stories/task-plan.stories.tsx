import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import {
  TaskPlan,
  TaskPlanHeader,
  TaskPlanProgress,
  TaskPlanStep,
  TaskPlanSteps,
  TaskPlanTitle,
} from "@workspace/ui/components/task-plan"

const meta: Meta<typeof TaskPlan> = {
  title: "Agents/Task plan",
  component: TaskPlan,
  parameters: { layout: "centered" },
  render: () => (
    <TaskPlan className="w-[28rem]">
      <TaskPlanHeader>
        <TaskPlanTitle>Review the Harbor Street lease</TaskPlanTitle>
        <TaskPlanProgress value={2} max={5} />
      </TaskPlanHeader>
      <TaskPlanSteps>
        <TaskPlanStep status="done">Read the lease and schedules</TaskPlanStep>
        <TaskPlanStep status="done">List every notice clause</TaskPlanStep>
        <TaskPlanStep status="current">Check notice periods against the playbook</TaskPlanStep>
        <TaskPlanStep status="pending">Draft a redline</TaskPlanStep>
        <TaskPlanStep status="pending">Summarise for Priya</TaskPlanStep>
      </TaskPlanSteps>
    </TaskPlan>
  ),
}

export default meta
type Story = StoryObj<typeof TaskPlan>

export const Running: Story = {
  play: async ({ canvas }) => {
    const steps = canvas.getAllByRole("listitem")
    await expect(steps[2]).toHaveAttribute("aria-current", "step")
    // Status is spoken, not just drawn.
    await expect(steps[0]).toHaveTextContent(/^Done:/)
    await expect(steps[3]).toHaveTextContent(/^Not started:/)
    const progress = canvas.getByRole("progressbar", { name: "Plan progress" })
    await expect(progress).toHaveAttribute("aria-valuetext", "2 of 5 done")
  },
}

export const WithFailureAndSkip: Story = {
  render: () => (
    <TaskPlan className="w-[28rem]">
      <TaskPlanHeader>
        <TaskPlanTitle>File the response</TaskPlanTitle>
        <TaskPlanProgress value={1} max={4} />
      </TaskPlanHeader>
      <TaskPlanSteps>
        <TaskPlanStep status="done">Draft the response</TaskPlanStep>
        <TaskPlanStep status="error">Upload to the court portal: session expired</TaskPlanStep>
        <TaskPlanStep status="skipped">Email opposing counsel</TaskPlanStep>
        <TaskPlanStep status="pending">Calendar the hearing</TaskPlanStep>
      </TaskPlanSteps>
    </TaskPlan>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/session expired/).closest("li")).toHaveTextContent(/^Failed:/)
  },
}

/** A step long enough to wrap keeps writing on the rules. */
export const LongStep: Story = {
  render: () => (
    <TaskPlan className="w-72">
      <TaskPlanSteps>
        <TaskPlanStep status="current">
          Compare every indemnity clause in the four supplier agreements against the firm&apos;s fallback positions
        </TaskPlanStep>
      </TaskPlanSteps>
    </TaskPlan>
  ),
}
