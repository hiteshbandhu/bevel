import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect } from "storybook/test"
import { Breaker, BreakerPanel, BreakerPanelTitle, BreakerRow } from "@workspace/ui/components/breaker"

const meta = {
  title: "Instruments/Breaker",
  component: Breaker,
  args: { label: "Workspace", description: "$500 a month", defaultChecked: true },
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <BreakerPanel aria-label="Caps">
        <Story />
      </BreakerPanel>
    ),
  ],
} satisfies Meta<typeof Breaker>

export default meta
type Story = StoryObj<typeof meta>

export const On: Story = {
  play: async ({ canvas, userEvent }) => {
    const breaker = canvas.getByRole("switch", { name: "Workspace" })
    await expect(breaker).toBeChecked()
    await expect(breaker).toHaveAccessibleDescription(/On.*\$500 a month/)
    breaker.focus()
    await userEvent.keyboard(" ")
    await expect(breaker).not.toBeChecked()
    await expect(canvas.getByText("Off")).toBeVisible()
  },
}

function TrippedThenReset() {
  const [state, setState] = React.useState({ on: true, tripped: true })
  return (
    <Breaker
      label="Per person"
      checked={state.on}
      tripped={state.tripped}
      onCheckedChange={(on) => setState({ on, tripped: false })}
    />
  )
}

/** A tripped breaker reads as off with a "Tripped" status; switching it resets it. */
export const Tripped: Story = {
  render: () => <TrippedThenReset />,
  play: async ({ canvas, userEvent }) => {
    const breaker = canvas.getByRole("switch", { name: "Per person" })
    await expect(breaker).not.toBeChecked()
    await expect(breaker).toHaveAccessibleDescription("Tripped")
    await userEvent.click(breaker)
    await expect(breaker).toHaveAccessibleDescription(/On|Off/)
  },
}

export const Locked: Story = {
  args: { label: "Overage", description: "Owners only", disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("switch", { name: "Overage" })).toHaveAttribute("aria-disabled", "true")
  },
}

export const Panel: Story = {
  render: () => (
    <>
      <BreakerPanelTitle>Spending caps</BreakerPanelTitle>
      <BreakerRow>
        <Breaker label="Workspace" defaultChecked />
        <Breaker label="Per person" tripped />
        <Breaker label="Per case with a long name" />
      </BreakerRow>
    </>
  ),
}
