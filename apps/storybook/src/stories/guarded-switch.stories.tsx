import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, waitFor } from "storybook/test"
import {
  GuardedSwitch,
  GuardedSwitchControl,
  GuardedSwitchLabel,
  GuardedSwitchStatus,
} from "@workspace/ui/components/guarded-switch"

const meta: Meta<typeof GuardedSwitch> = {
  title: "Coordination/Guarded switch",
  component: GuardedSwitch,
  parameters: { layout: "centered" },
  args: { onCheckedChange: fn() },
  render: (args) => (
    <GuardedSwitch {...args}>
      <GuardedSwitchLabel>Deploy to prod</GuardedSwitchLabel>
      <GuardedSwitchControl />
      <GuardedSwitchStatus />
    </GuardedSwitch>
  ),
}

export default meta
type Story = StoryObj<typeof GuardedSwitch>

/** Two deliberate steps: lift the cover, then flip. Closing the cover turns it back off. */
export const LiftFlipClose: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const sw = canvas.getByRole("switch", { name: "Deploy to prod" })
    await expect(sw).toHaveAttribute("aria-disabled", "true")
    const cover = canvas.getByRole("button", { name: "Lift the cover" })
    await userEvent.click(cover)
    await expect(cover).toHaveAttribute("aria-expanded", "true")
    await userEvent.click(sw)
    await expect(sw).toBeChecked()
    await expect(canvas.getByRole("status")).toHaveTextContent("On")
    await userEvent.click(canvas.getByRole("button", { name: "Close the cover" }))
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(false)
    await expect(sw).not.toBeChecked()
  },
}

export const KeyboardOnly: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab()
    await userEvent.keyboard("{Enter}")
    await userEvent.tab()
    const sw = canvas.getByRole("switch", { name: "Deploy to prod" })
    await expect(sw).toHaveFocus()
    await userEvent.keyboard(" ")
    await expect(sw).toBeChecked()
  },
}

/** Left alone, the cover closes itself and the switch returns to safe. */
export const ClosesItself: Story = {
  render: (args) => (
    <GuardedSwitch {...args} style={{ ["--guarded-switch-close-after" as string]: "400ms" }}>
      <GuardedSwitchLabel>Kill switch</GuardedSwitchLabel>
      <GuardedSwitchControl />
      <GuardedSwitchStatus />
    </GuardedSwitch>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Lift the cover" }))
    await userEvent.click(canvas.getByRole("switch"))
    await expect(canvas.getByRole("switch")).toBeChecked()
    await waitFor(() => expect(canvas.getByRole("switch")).not.toBeChecked(), { timeout: 3000 })
    await expect(canvas.getByRole("button", { name: "Lift the cover" })).toHaveAttribute("aria-expanded", "false")
  },
}

/** Locked: the cover won't lift, and the status says so. */
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Lift the cover" })).toBeDisabled()
    await expect(canvas.getByRole("switch")).toHaveAttribute("aria-disabled", "true")
    await expect(canvas.getByRole("status")).toHaveTextContent("Locked")
  },
}
