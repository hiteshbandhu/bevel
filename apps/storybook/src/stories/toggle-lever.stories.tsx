import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn } from "storybook/test"
import {
  ToggleLever,
  ToggleLeverDescription,
  ToggleLeverField,
  ToggleLeverLabel,
} from "@workspace/ui/components/toggle-lever"

const meta: Meta<typeof ToggleLever> = {
  title: "Essentials/Toggle lever",
  component: ToggleLever,
  parameters: { layout: "centered" },
  args: { "aria-label": "Notifications", onCheckedChange: fn() },
}

export default meta
type Story = StoryObj<typeof ToggleLever>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("switch", { name: "Notifications" })).not.toBeChecked()
  },
}

export const On: Story = { args: { defaultChecked: true } }

/** Lever and lamp only, for dense rows. */
export const Small: Story = { args: { size: "sm", defaultChecked: true } }

/** Click to throw it. */
export const Throw: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const lever = canvas.getByRole("switch", { name: "Notifications" })
    await userEvent.click(lever)
    await expect(lever).toBeChecked()
    await expect(lever).toHaveAttribute("data-checked")
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true, expect.anything())
  },
}

/** Tab to it, Space throws it and throws it back. */
export const Keyboard: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab()
    const lever = canvas.getByRole("switch", { name: "Notifications" })
    await expect(lever).toHaveFocus()
    await userEvent.keyboard(" ")
    await expect(lever).toBeChecked()
    await userEvent.keyboard(" ")
    await expect(lever).not.toBeChecked()
  },
}

export const Disabled: Story = {
  args: { disabled: true, defaultChecked: true },
  play: async ({ canvas, userEvent }) => {
    const lever = canvas.getByRole("switch", { name: "Notifications" })
    await userEvent.click(lever)
    await expect(lever).toBeChecked()
  },
}

/** A settings row: the label names the switch, the description describes it, and clicking the label throws it. */
export const SettingsRow: Story = {
  render: (args) => (
    <ToggleLeverField className="w-80">
      <ToggleLeverLabel>Email digests</ToggleLeverLabel>
      <ToggleLeverDescription>A summary of the week's runs, every Monday.</ToggleLeverDescription>
      <ToggleLever size={args.size} onCheckedChange={args.onCheckedChange} />
    </ToggleLeverField>
  ),
  play: async ({ canvas, userEvent }) => {
    const lever = canvas.getByRole("switch", { name: "Email digests" })
    await expect(lever).toHaveAccessibleDescription("A summary of the week's runs, every Monday.")
    await userEvent.click(canvas.getByText("Email digests"))
    await expect(lever).toBeChecked()
  },
}

export const Dark: Story = { globals: { theme: "dark" }, args: { defaultChecked: true } }

/** With reduced motion the bat jumps instead of swinging. */
export const ReducedMotion: Story = {
  play: async ({ canvasElement }) => {
    const bat = canvasElement.querySelector('[data-slot="toggle-lever-bat"]')!
    await expect(bat.className).toContain("motion-reduce:transition-none")
  },
}
