import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect, waitFor } from "storybook/test"
import { NumberWheel } from "@workspace/ui/components/number-wheel"

const meta = {
  title: "Instruments/Number wheel",
  component: NumberWheel,
  args: { value: 1240, tone: "ivory" },
  argTypes: { tone: { control: "inline-radio", options: ["ivory", "black"] } },
  parameters: { layout: "centered" },
  render: (args) => <NumberWheel {...args} className="text-5xl" />,
} satisfies Meta<typeof NumberWheel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const wheel = canvasElement.querySelector("[data-slot=number-wheel]")!
    // Screen readers get the whole number as text, not ten drums of digits.
    await expect(wheel.querySelector(".sr-only")).toHaveTextContent("1,240")
    await expect(wheel.querySelectorAll("[data-slot=number-wheel-drum]")).toHaveLength(4)
  },
}

export const Currency: Story = { args: { value: 24.6, currency: "USD", tone: "black" } }

function Rolling() {
  const [value, setValue] = React.useState(9)
  return (
    <div className="flex flex-col items-center gap-4">
      <NumberWheel value={value} live="polite" className="text-5xl" />
      <button type="button" onClick={() => setValue((v) => v + 1)}>
        Add one
      </button>
    </div>
  )
}

/** Growing from 9 to 10 adds a drum on the left; the ones drum keeps its place. */
export const GainsADigit: Story = {
  render: () => <Rolling />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Add one" }))
    await waitFor(() =>
      expect(canvasElement.querySelectorAll("[data-slot=number-wheel-drum]")).toHaveLength(2)
    )
    await expect(canvasElement.querySelector(".sr-only")).toHaveTextContent("10")
  },
}
