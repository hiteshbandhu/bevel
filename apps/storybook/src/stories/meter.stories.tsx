import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn } from "storybook/test"
import {
  Meter,
  MeterButton,
  MeterFlag,
  MeterFooter,
  MeterHeader,
  MeterLabel,
  MeterReading,
  MeterUnit,
} from "@workspace/ui/components/meter"

const meta = {
  title: "Money/Meter",
  component: Meter,
  args: { state: "idle", variant: "brass", "aria-label": "Usage" },
  argTypes: {
    state: { control: "inline-radio", options: ["idle", "running", "stopped"] },
    variant: { control: "inline-radio", options: ["brass", "graphite"] },
  },
  parameters: { layout: "centered" },
  render: (args) => (
    <Meter {...args} className="w-80">
      <MeterHeader>
        <MeterLabel>This turn</MeterLabel>
        <MeterFlag />
      </MeterHeader>
      <div className="flex items-baseline gap-2">
        <MeterReading value={0.142} currency="USD" format={{ minimumFractionDigits: 3 }} />
        <MeterUnit>so far</MeterUnit>
      </div>
    </Meter>
  ),
} satisfies Meta<typeof Meter>

export default meta
type Story = StoryObj<typeof meta>

export const Idle: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("group", { name: "Usage" })).toBeVisible()
    await expect(canvas.getByText("Ready")).toBeVisible()
  },
}

/** While running, the reading is silent to screen readers; it speaks once stopped. */
export const Running: Story = {
  args: { state: "running" },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText("Running")).toBeVisible()
    await expect(canvasElement.querySelector("[data-meter-reading] .sr-only")).toHaveAttribute("aria-live", "off")
  },
}

export const Stopped: Story = {
  args: { state: "stopped", variant: "graphite" },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("[data-meter-reading] .sr-only")).toHaveAttribute("aria-live", "polite")
  },
}

export const WithButtons: Story = {
  args: { onClick: fn() } as never,
  render: (args) => (
    <Meter aria-label="Prepaid" className="w-80">
      <MeterLabel>Prepaid credit</MeterLabel>
      <MeterReading value={24.6} currency="USD" />
      <MeterFooter>
        <MeterButton onClick={(args as unknown as { onClick: () => void }).onClick}>Add $10</MeterButton>
        <MeterButton disabled>Withdraw</MeterButton>
      </MeterFooter>
    </Meter>
  ),
  play: async ({ args, canvas, userEvent }) => {
    canvas.getByRole("button", { name: "Add $10" }).focus()
    await userEvent.keyboard("{Enter}")
    await expect((args as unknown as { onClick: () => void }).onClick).toHaveBeenCalledOnce()
    await expect(canvas.getByRole("button", { name: "Withdraw" })).toBeDisabled()
  },
}
