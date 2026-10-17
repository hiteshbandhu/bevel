import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, waitFor, within } from "storybook/test"
import {
  Citation,
  CitationContent,
  CitationLocation,
  CitationQuote,
  CitationSource,
  CitationStatus,
  CitationTrigger,
} from "@workspace/ui/components/citation"

const meta: Meta<typeof CitationTrigger> = {
  title: "Documents/Citation",
  component: CitationTrigger,
  args: { tone: "yellow" },
  argTypes: { tone: { control: "inline-radio", options: ["yellow", "blue", "white"] } },
  parameters: { layout: "centered" },
  render: (args) => (
    <p className="max-w-md leading-relaxed">
      The notice period is thirty days unless the tenant is in breach
      <Citation>
        <CitationTrigger {...args}>4</CitationTrigger>
        <CitationContent>
          <CitationSource>Lease agreement, Harbor Street</CitationSource>
          <CitationLocation>p. 14, clause 9.2</CitationLocation>
          <CitationQuote>Either party may end this lease on thirty (30) days&apos; written notice.</CitationQuote>
          <CitationStatus status="verified" />
        </CitationContent>
      </Citation>
      .
    </p>
  ),
}

export default meta
type Story = StoryObj<typeof CitationTrigger>

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const sticker = canvas.getByRole("button", { name: "Exhibit 4" })
    await userEvent.click(sticker)
    // The slip is portalled; it's titled by the source.
    const slip = await waitFor(() => within(document.body).getByRole("dialog", { name: "Lease agreement, Harbor Street" }))
    // It grows in from the sticker; wait for it to finish arriving.
    await waitFor(() => expect(within(slip).getByText("Verified")).toBeVisible())
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(within(document.body).queryByRole("dialog")).toBeNull())
    await expect(sticker).toHaveFocus()
  },
}

export const KeyboardOpens: Story = {
  play: async ({ canvas, userEvent }) => {
    canvas.getByRole("button", { name: "Exhibit 4" }).focus()
    await userEvent.keyboard("{Enter}")
    await waitFor(() => expect(within(document.body).getByRole("dialog")).toBeVisible())
  },
}

export const Tones: Story = {
  render: () => (
    <p className="flex gap-4">
      {(["yellow", "blue", "white"] as const).map((tone, i) => (
        <Citation key={tone}>
          <CitationTrigger tone={tone}>{i + 1}</CitationTrigger>
        </Citation>
      ))}
    </p>
  ),
}

export const Statuses: Story = {
  render: () => (
    <div className="bevel-paper flex gap-4 p-6">
      <CitationStatus status="verified" />
      <CitationStatus status="caution" />
      <CitationStatus status="unverified" />
    </div>
  ),
}

/** A custom prefix: "Tab 12", read as "Tab 12". */
export const CustomLabel: Story = {
  render: () => (
    <Citation>
      <CitationTrigger abbreviation="Tab" label="Tab">
        12
      </CitationTrigger>
    </Citation>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Tab 12" })).toBeVisible()
  },
}
