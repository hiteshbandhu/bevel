import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn } from "storybook/test"
import {
  DipSwitch,
  DipSwitchBank,
  DipSwitchLegend,
  DipSwitchReadout,
  DipSwitchToggle,
} from "@workspace/ui/components/dip-switch"

const flags = [
  ["streaming", "Streamed replies"],
  ["search", "Web search tool"],
  ["memory", "Long-term memory"],
  ["batch", "Batch API"],
] as const

const meta: Meta<typeof DipSwitch> = {
  title: "Instruments/DIP switches",
  component: DipSwitch,
  parameters: { layout: "centered" },
  args: { "aria-label": "Feature flags", defaultValue: ["streaming"], onValueChange: fn() },
  render: (args) => (
    <DipSwitch {...args}>
      <DipSwitchBank>
        {flags.map(([value, label]) => (
          <DipSwitchToggle key={value} value={value}>
            {label}
          </DipSwitchToggle>
        ))}
      </DipSwitchBank>
      <DipSwitchLegend className="w-56" />
      <p className="flex gap-3 text-sm">
        <DipSwitchReadout format="hex" />
        <DipSwitchReadout format="binary" />
        <DipSwitchReadout format="decimal" />
      </p>
    </DipSwitch>
  ),
}

export default meta
type Story = StoryObj<typeof DipSwitch>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("switch", { name: "1: Streamed replies" })).toBeChecked()
    await expect(canvas.getByRole("switch", { name: "4: Batch API" })).not.toBeChecked()
    await expect(canvas.getByText("0x1")).toBeInTheDocument()
    await expect(canvas.getByText("0b0001")).toBeInTheDocument()
  },
}

export const Blue: Story = { args: { variant: "blue" } }
export const Black: Story = { args: { variant: "black" } }

/** Click switches on; the readout is the bank as a number, switch 1 lowest. */
export const Flip: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("switch", { name: "3: Long-term memory" }))
    await expect(args.onValueChange).toHaveBeenLastCalledWith(["streaming", "memory"])
    await expect(canvas.getByText("0x5")).toBeInTheDocument()
    await expect(canvas.getByText("0b0101")).toBeInTheDocument()
    await expect(canvas.getByText("5")).toBeInTheDocument()
  },
}

/** Tab to the bank, arrow along it, Space to flip. */
export const Keyboard: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.tab()
    await expect(canvas.getByRole("switch", { name: "1: Streamed replies" })).toHaveFocus()
    await userEvent.keyboard("{ArrowRight}")
    const search = canvas.getByRole("switch", { name: "2: Web search tool" })
    await expect(search).toHaveFocus()
    await userEvent.keyboard(" ")
    await expect(search).toBeChecked()
    await expect(args.onValueChange).toHaveBeenLastCalledWith(["streaming", "search"])
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}")
    await expect(canvas.getByRole("switch", { name: "1: Streamed replies" })).toHaveFocus()
  },
}

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas, userEvent }) => {
    const first = canvas.getByRole("switch", { name: "1: Streamed replies" })
    await expect(first).toHaveAttribute("aria-disabled", "true")
    await userEvent.click(first)
    await expect(first).toBeChecked()
  },
}

/** One switch locked, the rest free. */
export const OneLocked: Story = {
  render: (args) => (
    <DipSwitch {...args}>
      <DipSwitchBank>
        <DipSwitchToggle value="streaming">Streamed replies</DipSwitchToggle>
        <DipSwitchToggle value="sso" disabled>
          Enforce SSO
        </DipSwitchToggle>
        <DipSwitchToggle value="memory">Long-term memory</DipSwitchToggle>
      </DipSwitchBank>
      <DipSwitchReadout />
    </DipSwitch>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("switch", { name: "2: Enforce SSO" })).toHaveAttribute("aria-disabled", "true")
    await expect(canvas.getByRole("switch", { name: "3: Long-term memory" })).not.toHaveAttribute("aria-disabled")
  },
}

/** Sixteen switches: a whole config word. */
export const SixteenBits: Story = {
  render: (args) => (
    <DipSwitch {...args} defaultValue={["b0", "b3", "b15"]}>
      <DipSwitchBank>
        {Array.from({ length: 16 }, (_, i) => (
          <DipSwitchToggle key={i} value={`b${i}`}>{`Bit ${i}`}</DipSwitchToggle>
        ))}
      </DipSwitchBank>
      <DipSwitchReadout />
    </DipSwitch>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("0x8009")).toBeInTheDocument()
  },
}

export const Dark: Story = { globals: { theme: "dark" } }

/** With reduced motion the sliders jump instead of sliding. */
export const ReducedMotion: Story = {
  play: async ({ canvasElement }) => {
    for (const actuator of canvasElement.querySelectorAll('[data-slot="dip-switch-actuator"]')) {
      await expect(actuator.className).toContain("motion-reduce:transition-none")
    }
  },
}
