import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect } from "storybook/test"
import {
  Annunciator,
  AnnunciatorAcknowledge,
  AnnunciatorPanel,
  AnnunciatorTile,
} from "@workspace/ui/components/annunciator"

function Harness({ budget = false, tests = false }) {
  const [over, setOver] = React.useState(budget)
  return (
    <div className="flex w-96 flex-col gap-3">
      <Annunciator aria-label="Agent alerts">
        <AnnunciatorPanel>
          <AnnunciatorTile id="budget" active={over} tone="red">Over budget</AnnunciatorTile>
          <AnnunciatorTile id="tests" active={tests}>Tests failing</AnnunciatorTile>
          <AnnunciatorTile id="rate" active={false}>Rate limited</AnnunciatorTile>
        </AnnunciatorPanel>
        <AnnunciatorAcknowledge />
      </Annunciator>
      <button type="button" onClick={() => setOver((o) => !o)}>
        Toggle budget
      </button>
    </div>
  )
}

const meta: Meta<typeof Harness> = {
  title: "Instruments/Annunciator",
  component: Harness,
  parameters: { layout: "centered" },
}

export default meta
type Story = StoryObj<typeof Harness>

export const Default: Story = {}
export const Alarming: Story = { args: { budget: true, tests: true } }
export const Dark: Story = { args: { budget: true }, globals: { theme: "dark" } }

/** An alarm latches: it stays unseen after its condition clears, until acknowledged. */
export const LatchAndAcknowledge: Story = {
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole("button", { name: "Toggle budget" })
    await userEvent.click(toggle)
    await expect(canvas.getByRole("status")).toHaveTextContent("Alarm: Over budget.")
    await expect(canvas.getByRole("button", { name: "Over budget: new alarm" })).toBeVisible()
    await userEvent.click(toggle)
    await expect(canvas.getByRole("button", { name: "Over budget: cleared, not yet seen" })).toBeVisible()
    await userEvent.click(toggle)
    const ack = canvas.getByRole("button", { name: "Acknowledge 1" })
    ack.focus()
    await userEvent.keyboard("{Enter}")
    await expect(canvas.getByRole("button", { name: "Over budget: active, acknowledged" })).toBeVisible()
    await userEvent.click(toggle)
    await expect(canvas.getByRole("button", { name: "Over budget: normal" })).toBeVisible()
  },
}
