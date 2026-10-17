import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn } from "storybook/test"
import { DetentKnob, DetentKnobStop } from "@workspace/ui/components/detent-knob"

const meta: Meta<typeof DetentKnob> = {
  title: "Instruments/Detent Knob",
  component: DetentKnob,
  parameters: { layout: "centered" },
  args: { "aria-label": "Reasoning effort", defaultValue: "medium", onValueChange: fn() },
  render: (args) => (
    <DetentKnob {...args}>
      <DetentKnobStop value="low">Low</DetentKnobStop>
      <DetentKnobStop value="medium">Medium</DetentKnobStop>
      <DetentKnobStop value="high">High</DetentKnobStop>
      <DetentKnobStop value="max">Max</DetentKnobStop>
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
    const knob = canvas.getByRole("slider", { name: "Reasoning effort" })
    await expect(knob).toHaveAttribute("aria-valuetext", "Medium, 2 of 4")
    await userEvent.tab()
    await expect(knob).toHaveFocus()
    await userEvent.keyboard("{ArrowRight}")
    await expect(knob).toHaveAttribute("aria-valuetext", "High, 3 of 4")
    await expect(args.onValueChange).toHaveBeenLastCalledWith("high")
    await userEvent.keyboard("{End}{ArrowRight}")
    await expect(knob).toHaveAttribute("aria-valuetext", "Max, 4 of 4")
    await expect(args.onValueChange).toHaveBeenCalledTimes(2)
    await userEvent.keyboard("{Home}")
    await expect(knob).toHaveAttribute("aria-valuetext", "Low, 1 of 4")
  },
}
