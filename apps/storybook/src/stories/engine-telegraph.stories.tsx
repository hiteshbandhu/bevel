import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect } from "storybook/test"
import {
  EngineTelegraph,
  EngineTelegraphDial,
  EngineTelegraphOrder,
  EngineTelegraphOrders,
  EngineTelegraphStatus,
} from "@workspace/ui/components/engine-telegraph"

function Harness({ start = "ask", answered = "ask" }) {
  const [value, setValue] = React.useState(start)
  const [confirmed, setConfirmed] = React.useState(answered)
  return (
    <div className="flex w-80 flex-col items-center gap-4">
      <EngineTelegraph aria-label="Agent autonomy" value={value} onValueChange={setValue} confirmed={confirmed}>
        <EngineTelegraphDial />
        <EngineTelegraphOrders>
          <EngineTelegraphOrder value="stop">Stop</EngineTelegraphOrder>
          <EngineTelegraphOrder value="ask">Ask</EngineTelegraphOrder>
          <EngineTelegraphOrder value="act">Act</EngineTelegraphOrder>
          <EngineTelegraphOrder value="auto">Auto</EngineTelegraphOrder>
        </EngineTelegraphOrders>
        <EngineTelegraphStatus />
      </EngineTelegraph>
      <button type="button" onClick={() => setConfirmed(value)}>
        Confirm
      </button>
    </div>
  )
}

const meta: Meta<typeof Harness> = {
  title: "Instruments/Engine Telegraph",
  component: Harness,
  parameters: { layout: "centered" },
}

export default meta
type Story = StoryObj<typeof Harness>

export const Default: Story = {}
export const Pending: Story = { args: { start: "auto", answered: "ask" } }
export const Dark: Story = { args: { start: "act", answered: "ask" }, globals: { theme: "dark" } }

/** Arrow keys set the order; it stays pending until the other side confirms. */
export const OrderAndConfirm: Story = {
  play: async ({ canvas, userEvent }) => {
    const status = canvas.getByRole("status")
    await expect(status).toHaveTextContent("Confirmed: Ask.")
    await userEvent.tab()
    await expect(canvas.getByRole("radio", { name: "Ask" })).toHaveFocus()
    await userEvent.keyboard("{ArrowRight}")
    await expect(canvas.getByRole("radio", { name: "Act" })).toBeChecked()
    await expect(status).toHaveTextContent("Ordered: Act. Waiting for confirmation (now at Ask).")
    await expect(canvas.getByRole("radiogroup")).toHaveAccessibleDescription(/Waiting for confirmation/)
    await userEvent.click(canvas.getByRole("button", { name: "Confirm" }))
    await expect(status).toHaveTextContent("Confirmed: Act.")
  },
}
