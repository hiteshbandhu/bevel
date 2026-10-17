import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { VisibleFile, VisibleFileRow, VisibleFileSignal } from "@workspace/ui/components/visible-file"

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const meta: Meta<typeof VisibleFile> = {
  title: "Records/Visible File",
  component: VisibleFile,
  parameters: { layout: "padded" },
  args: { "aria-label": "Renewals", scale: months },
  render: (args) => (
    <VisibleFile {...args} className="max-w-2xl">
      <VisibleFileRow title="Acme Corp" detail="$48,000 / yr">
        <VisibleFileSignal value={2} label="Renews" tone="red" />
      </VisibleFileRow>
      <VisibleFileRow title="Globex" detail="$12,500 / yr">
        <VisibleFileSignal value={6} label="Renews" tone="amber" />
      </VisibleFileRow>
      <VisibleFileRow title="Initech" detail="$7,200 / yr">
        <VisibleFileSignal value={10} label="Renews" tone="green" />
      </VisibleFileRow>
      <VisibleFileRow title="A very long customer name that truncates" detail="$900 / yr">
        <VisibleFileSignal value={0} label="Renews" />
        <VisibleFileSignal value={11} label="Review" tone="amber" />
      </VisibleFileRow>
    </VisibleFile>
  ),
}

export default meta
type Story = StoryObj<typeof VisibleFile>

export const Default: Story = {}
export const Dark: Story = { globals: { theme: "dark" } }

/** Each record reads as its name, then each signal and where it sits. */
export const ReadsInWords: Story = {
  play: async ({ canvas }) => {
    const row = canvas.getByText("Acme Corp").closest("li")!
    await expect(row).toHaveTextContent("Acme Corp$48,000 / yrRenews: Mar.")
    await expect(canvas.getAllByRole("listitem")).toHaveLength(4)
  },
}
