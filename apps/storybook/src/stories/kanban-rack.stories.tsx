import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect } from "storybook/test"
import { KanbanRack, KanbanRackPockets, KanbanRackStatus, KanbanRackTake } from "@workspace/ui/components/kanban-rack"

function Harness({ capacity = 2, start = [] as string[] }) {
  const [inUse, setInUse] = React.useState(start)
  return (
    <KanbanRack aria-label="Agent runs" capacity={capacity} inUse={inUse}>
      <KanbanRackPockets />
      <KanbanRackTake onClick={() => setInUse((u) => [...u, `Run ${u.length + 1}`])}>Start a run</KanbanRackTake>
      <KanbanRackStatus />
    </KanbanRack>
  )
}

const meta: Meta<typeof Harness> = {
  title: "Coordination/Kanban Rack",
  component: Harness,
  parameters: { layout: "centered" },
}

export default meta
type Story = StoryObj<typeof Harness>

export const Default: Story = { args: { capacity: 3, start: ["Fix login"] } }

/** Each start takes a card; with none left, the button is disabled and says why. */
export const TakingCards: Story = {
  play: async ({ canvas, userEvent }) => {
    const take = canvas.getByRole("button", { name: "Start a run" })
    await expect(take).toHaveAccessibleDescription("2 of 2 free")
    await userEvent.tab()
    await expect(take).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    await expect(take).toHaveAccessibleDescription("1 of 2 free")
    await expect(canvas.getByText("Run 1")).toBeVisible()
    await userEvent.keyboard("{Enter}")
    await expect(take).toHaveAttribute("aria-disabled", "true")
    await expect(take).toHaveAccessibleDescription("No cards free. Finish something to start more.")
  },
}

export const Full: Story = { args: { capacity: 3, start: ["Fix login", "Refactor billing", "Write tests"] } }
export const Dark: Story = { args: { capacity: 3, start: ["Fix login"] }, globals: { theme: "dark" } }
