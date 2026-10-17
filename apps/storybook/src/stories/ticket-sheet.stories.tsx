import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn } from "storybook/test"
import {
  Ticket,
  TicketLabel,
  TicketNote,
  TicketSheet,
  TicketValue,
} from "@workspace/ui/components/ticket-sheet"

const meta = {
  title: "Money/Ticket sheet",
  component: TicketSheet,
  args: { onValueChange: fn(), defaultValue: "50", "aria-label": "Credit pack" },
  parameters: { layout: "centered" },
  render: (args) => (
    <TicketSheet {...args} className="w-80">
      <Ticket value="10" tone="vermilion">
        <TicketLabel>Credits</TicketLabel>
        <TicketValue>$10</TicketValue>
        <TicketNote>+ $0.59 fee</TicketNote>
      </Ticket>
      <Ticket value="50" tone="ultramarine">
        <TicketLabel>Credits</TicketLabel>
        <TicketValue>$50</TicketValue>
        <TicketNote>+ $1.75 fee</TicketNote>
      </Ticket>
      <Ticket value="100" tone="emerald">
        <TicketLabel>Credits</TicketLabel>
        <TicketValue>$100</TicketValue>
        <TicketNote>+ $3.20 fee</TicketNote>
      </Ticket>
      <Ticket value="200" tone="ochre" disabled>
        <TicketLabel>Credits</TicketLabel>
        <TicketValue>$200</TicketValue>
        <TicketNote>Owners only</TicketNote>
      </Ticket>
    </TicketSheet>
  ),
} satisfies Meta<typeof TicketSheet>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("radiogroup", { name: "Credit pack" })).toBeVisible()
    await expect(canvas.getByRole("radio", { name: /\$50/ })).toBeChecked()
  },
}

export const PickWithPointerAndKeys: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: /\$10\b/ }))
    await expect(args.onValueChange).toHaveBeenLastCalledWith("10", expect.anything())
    await userEvent.keyboard("{ArrowRight}")
    await expect(canvas.getByRole("radio", { name: /\$50/ })).toBeChecked()
    await expect(canvas.getByRole("radio", { name: /\$200/ })).toHaveAttribute("aria-disabled", "true")
  },
}
