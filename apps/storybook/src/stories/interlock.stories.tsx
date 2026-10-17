import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { Interlock, InterlockLever } from "@workspace/ui/components/interlock"

const meta: Meta<typeof Interlock> = {
  title: "Safety/Interlock",
  component: Interlock,
  parameters: { layout: "centered" },
  render: () => (
    <Interlock aria-label="Release levers">
      <InterlockLever id="migrations" number={1} label="Migrations applied" />
      <InterlockLever id="canary" number={2} label="Canary healthy" />
      <InterlockLever id="promote" number={3} label="Promote to prod" tone="red" requires={["migrations", "canary"]} />
    </Interlock>
  ),
}

export default meta
type Story = StoryObj<typeof Interlock>

/** Locked levers say why; pulling the dependencies frees them; a pulled lever holds what it depends on. */
export const LocksAndHolds: Story = {
  play: async ({ canvas, userEvent }) => {
    const promote = canvas.getByRole("switch", { name: "Promote to prod" })
    await expect(promote).toHaveAttribute("aria-disabled", "true")
    await expect(promote).toHaveAccessibleDescription("Locked until: Migrations applied, Canary healthy")
    await userEvent.click(canvas.getByRole("switch", { name: "Migrations applied" }))
    await expect(promote).toHaveAccessibleDescription("Locked until: Canary healthy")
    await userEvent.click(canvas.getByRole("switch", { name: "Canary healthy" }))
    await expect(promote).not.toHaveAttribute("aria-disabled", "true")
    await userEvent.click(promote)
    await expect(promote).toBeChecked()
    const migrations = canvas.getByRole("switch", { name: "Migrations applied" })
    await expect(migrations).toHaveAttribute("aria-disabled", "true")
    await expect(migrations).toHaveAccessibleDescription("Held by: Promote to prod")
  },
}

export const KeyboardOnly: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab()
    await userEvent.keyboard(" ")
    await expect(canvas.getByRole("switch", { name: "Migrations applied" })).toBeChecked()
  },
}
