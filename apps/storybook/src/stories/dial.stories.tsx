import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn } from "storybook/test"
import { Dial, DialMark, Gauge, GaugeLabel, GaugeValue } from "@workspace/ui/components/dial"

const meta = {
  title: "Instruments/Gauge and dial",
  component: Gauge,
  args: { value: 12, max: 30 },
  parameters: { layout: "centered" },
  render: (args) => (
    <Gauge {...args} ticks={30} marks={<DialMark value={5} tone="amber" />}>
      <GaugeLabel>Runway</GaugeLabel>
      <GaugeValue>{(_, value) => `${value} days`}</GaugeValue>
    </Gauge>
  ),
} satisfies Meta<typeof Gauge>

export default meta
type Story = StoryObj<typeof meta>

export const GaugeReading: Story = {
  play: async ({ canvas }) => {
    const meter = canvas.getByRole("meter", { name: "Runway" })
    await expect(meter).toHaveAttribute("aria-valuenow", "12")
    await expect(canvas.getByText("12 days")).toBeVisible()
  },
}

export const GaugeEmpty: Story = { args: { value: 0 } }
export const GaugeFull: Story = { args: { value: 30 } }

export const AdjustableDial: Story = {
  args: { onValueChange: fn() } as never,
  render: (args) => (
    <Dial
      label="Keep balance above"
      defaultValue={30}
      max={100}
      step={5}
      currency="USD"
      format={{ maximumFractionDigits: 0 }}
      onValueChange={(args as unknown as { onValueChange: (v: number) => void }).onValueChange}
    />
  ),
  play: async ({ args, canvas, userEvent }) => {
    const dial = canvas.getByRole("slider", { name: "Keep balance above" })
    await expect(dial).toHaveAttribute("aria-valuetext", "$30")
    dial.focus()
    await userEvent.keyboard("{ArrowUp}")
    await expect(dial).toHaveAttribute("aria-valuenow", "35")
    await userEvent.keyboard("{PageUp}")
    await expect(dial).toHaveAttribute("aria-valuenow", "45")
    await userEvent.keyboard("{End}")
    await expect(dial).toHaveAttribute("aria-valuenow", "100")
    await userEvent.keyboard("{Home}")
    await expect(dial).toHaveAttribute("aria-valuetext", "$0")
    await expect((args as unknown as { onValueChange: () => void }).onValueChange).toHaveBeenCalled()
  },
}

export const DisabledDial: Story = {
  render: () => <Dial label="Locked" defaultValue={40} disabled />,
  play: async ({ canvas, userEvent }) => {
    const dial = canvas.getByRole("slider", { name: "Locked" })
    await expect(dial).toHaveAttribute("aria-disabled", "true")
    dial.focus()
    await userEvent.keyboard("{ArrowUp}")
    await expect(dial).toHaveAttribute("aria-valuenow", "40")
  },
}
