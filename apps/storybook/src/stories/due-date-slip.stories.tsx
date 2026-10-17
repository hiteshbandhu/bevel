import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect } from "storybook/test"
import { DueDateSlip, DueDateSlipRenew, DueDateSlipStatus } from "@workspace/ui/components/due-date-slip"

const NOW = "2026-10-17"

function Harness({ start = ["2026-08-01", "2026-09-01", "2026-10-29"] }) {
  const [dates, setDates] = React.useState(start)
  return (
    <DueDateSlip title="Production API key" dates={dates} now={NOW}>
      <DueDateSlipStatus />
      <DueDateSlipRenew
        onClick={() => {
          const last = new Date(dates.at(-1)!)
          const from = last < new Date(NOW) ? new Date(NOW) : last
          setDates([...dates, new Date(from.getTime() + 30 * 86_400_000).toISOString().slice(0, 10)])
        }}
      >
        Renew 30 days
      </DueDateSlipRenew>
    </DueDateSlip>
  )
}

const meta: Meta<typeof Harness> = {
  title: "Records/Due Date Slip",
  component: Harness,
  parameters: { layout: "centered" },
}

export default meta
type Story = StoryObj<typeof Harness>

export const Default: Story = {}
export const Overdue: Story = { args: { start: ["2026-09-01", "2026-10-14"] } }
export const Empty: Story = { args: { start: [] } }
export const Dark: Story = { globals: { theme: "dark" } }

/** Renewing stamps the next line, and the status says the new date. */
export const Renew: Story = {
  args: { start: ["2026-09-01", "2026-10-14"] },
  play: async ({ canvas, userEvent }) => {
    const status = canvas.getByRole("status")
    await expect(status).toHaveTextContent("Overdue by 3 days. Was due 14 Oct 2026.")
    await userEvent.tab()
    const renew = canvas.getByRole("button", { name: "Renew 30 days" })
    await expect(renew).toHaveFocus()
    await expect(renew).toHaveAccessibleDescription(/Overdue by 3 days/)
    await userEvent.keyboard("{Enter}")
    await expect(status).toHaveTextContent("Due 16 Nov 2026, in 30 days.")
    await expect(canvas.getAllByRole("listitem")).toHaveLength(3)
  },
}
