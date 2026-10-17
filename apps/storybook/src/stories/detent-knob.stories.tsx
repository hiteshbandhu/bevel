import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn } from "storybook/test"
import { DetentKnob, DetentKnobStop } from "@workspace/ui/components/detent-knob"

const meta: Meta<typeof DetentKnob> = {
  title: "Instruments/Detent Knob",
  component: DetentKnob,
  parameters: { layout: "centered" },
  args: { "aria-label": "Agent mode", defaultValue: "ask", onValueChange: fn() },
  render: (args) => (
    <DetentKnob {...args}>
      <DetentKnobStop value="off">Off</DetentKnobStop>
      <DetentKnobStop value="ask">Ask</DetentKnobStop>
      <DetentKnobStop value="edit">Auto-edit</DetentKnobStop>
      <DetentKnobStop value="full">Full auto</DetentKnobStop>
    </DetentKnob>
  ),
}

export default meta
type Story = StoryObj<typeof DetentKnob>

export const Default: Story = {}
export const Disabled: Story = { args: { disabled: true } }
export const Dark: Story = { globals: { theme: "dark" } }

/** Arrow keys click from position to position and stop at the ends. */
export const Keyboard: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const knob = canvas.getByRole("slider", { name: "Agent mode" })
    await expect(knob).toHaveAttribute("aria-valuetext", "Ask, 2 of 4")
    await userEvent.tab()
    await expect(knob).toHaveFocus()
    await userEvent.keyboard("{ArrowRight}")
    await expect(knob).toHaveAttribute("aria-valuetext", "Auto-edit, 3 of 4")
    await expect(args.onValueChange).toHaveBeenLastCalledWith("edit")
    await userEvent.keyboard("{End}{ArrowRight}")
    await expect(knob).toHaveAttribute("aria-valuetext", "Full auto, 4 of 4")
    await expect(args.onValueChange).toHaveBeenCalledTimes(2)
    await userEvent.keyboard("{Home}")
    await expect(knob).toHaveAttribute("aria-valuetext", "Off, 1 of 4")
  },
}
