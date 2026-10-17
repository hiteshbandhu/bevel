import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect, fn } from "storybook/test"
import {
  TokenInstrument,
  TokenInstrumentAction,
  TokenInstrumentSlot,
  TokenInstrumentStatus,
} from "@workspace/ui/components/token-instrument"

function Harness({ initial, onRequest }: { initial: string | null; onRequest?: (h: string) => void }) {
  const [holder, setHolder] = React.useState(initial)
  return (
    <TokenInstrument
      section="Lease draft"
      holder={holder}
      you="You"
      onTake={() => setHolder("You")}
      onReturn={() => setHolder(null)}
      onRequest={onRequest}
    >
      <TokenInstrumentSlot />
      <TokenInstrumentStatus />
      <TokenInstrumentAction />
    </TokenInstrument>
  )
}

const meta: Meta<typeof TokenInstrument> = {
  title: "Coordination/Token instrument",
  component: TokenInstrument,
  parameters: { layout: "centered" },
}

export default meta
type Story = StoryObj<typeof TokenInstrument>

export const TakeAndReturn: Story = {
  render: () => <Harness initial={null} />,
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole("status")).toHaveTextContent("Lease draft is free to take.")
    await userEvent.click(canvas.getByRole("button", { name: "Take token" }))
    await expect(canvas.getByRole("status")).toHaveTextContent("You hold the Lease draft token.")
    await userEvent.click(canvas.getByRole("button", { name: "Return token" }))
    await expect(canvas.getByRole("status")).toHaveTextContent("free to take")
  },
}

/** Someone else has it: the slot says who, and the action asks them for it. */
export const HeldBySomeoneElse: Story = {
  render: (args) => <Harness initial="Priya" onRequest={(args as unknown as { onRequest: (h: string) => void }).onRequest} />,
  args: { onRequest: fn() } as never,
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole("group", { name: "Lease draft token" })).toHaveTextContent("Priya has it")
    await userEvent.click(canvas.getByRole("button", { name: "Ask Priya" }))
    await expect((args as unknown as { onRequest: () => void }).onRequest).toHaveBeenCalledWith("Priya")
  },
}
