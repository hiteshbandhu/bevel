import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect } from "storybook/test"
import {
  TakeANumber,
  TakeANumberDispenser,
  TakeANumberSign,
  TakeANumberStatus,
} from "@workspace/ui/components/take-a-number"

function Harness({ start = 41, next = 44, held = null as number | null }) {
  const [serving, setServing] = React.useState(start)
  const [ticket, setTicket] = React.useState(held)
  return (
    <div className="flex flex-col items-center gap-4">
      <TakeANumber aria-label="Support queue" serving={serving} ticket={ticket}>
        <TakeANumberSign />
        <TakeANumberDispenser onClick={() => setTicket(next)} />
        <TakeANumberStatus />
      </TakeANumber>
      <button type="button" onClick={() => setServing((s) => s + 1)}>
        Serve next
      </button>
    </div>
  )
}

const meta: Meta<typeof Harness> = {
  title: "Coordination/Take a Number",
  component: Harness,
  parameters: { layout: "centered" },
}

export default meta
type Story = StoryObj<typeof Harness>

export const Default: Story = {}
export const Holding: Story = { args: { held: 44 } }
export const YourTurn: Story = { args: { start: 44, held: 44 } }
export const Dark: Story = { args: { held: 44 }, globals: { theme: "dark" } }

/** Take a ticket, then hear each number served until it's yours. */
export const Queueing: Story = {
  args: { start: 42, next: 44 },
  play: async ({ canvas, userEvent }) => {
    const status = canvas.getByRole("status")
    await expect(status).toHaveTextContent("Now serving 42. Take a number to join the queue.")
    await userEvent.tab()
    const take = canvas.getByRole("button", { name: "Take a number" })
    await expect(take).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    await expect(take).toHaveAttribute("aria-disabled", "true")
    await expect(status).toHaveTextContent("You're 44: 2 ahead of you.")
    const serve = canvas.getByRole("button", { name: "Serve next" })
    await userEvent.click(serve)
    await userEvent.click(serve)
    await expect(status).toHaveTextContent("Now serving 44. It's your turn.")
  },
}
