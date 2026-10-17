import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { expect, waitFor } from "storybook/test"
import { SplitFlap, SplitFlapRow, SplitFlapText } from "@workspace/ui/components/split-flap"

function Harness({ status = "BUILDING" }) {
  const [value, setValue] = React.useState(status)
  return (
    <div className="flex flex-col items-center gap-3">
      <SplitFlap aria-label="Deploys">
        <SplitFlapRow name="US East">
          <SplitFlapText value="US-EAST" length={8} />
          <SplitFlapText value={value} length={9} tone="amber" />
        </SplitFlapRow>
        <SplitFlapRow name="EU West">
          <SplitFlapText value="EU-WEST" length={8} />
          <SplitFlapText value="LIVE" length={9} tone="amber" />
        </SplitFlapRow>
      </SplitFlap>
      <button type="button" onClick={() => setValue("LIVE")}>
        Go live
      </button>
    </div>
  )
}

const meta: Meta<typeof Harness> = {
  title: "Records/Split Flap",
  component: Harness,
  parameters: { layout: "centered" },
}

export default meta
type Story = StoryObj<typeof Harness>

export const Default: Story = {}
export const Dark: Story = { globals: { theme: "dark" } }

/** The text reads as written, and a change is announced once, by row. */
export const AnnouncesByRow: Story = {
  play: async ({ canvas, userEvent }) => {
    // Only the source text matches whole words; the flaps hold one character each, hidden.
    await expect(canvas.getByText("BUILDING")).toBeInTheDocument()
    await userEvent.click(canvas.getByRole("button", { name: "Go live" }))
    await expect(canvas.queryByText("BUILDING")).toBeNull()
    await expect(canvas.getAllByText("LIVE")).toHaveLength(2)
    await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent("Updated: US East."), { timeout: 3000 })
  },
}
