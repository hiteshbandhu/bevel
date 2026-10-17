import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { Redaction } from "@workspace/ui/components/redaction"

const meta: Meta<typeof Redaction> = {
  title: "Marks/Redaction",
  component: Redaction,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <p className="bevel-paper max-w-md p-6 leading-relaxed">
        The client told us that <Story /> before signing.
      </p>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Redaction>

/** Withheld text is never rendered, even if it's passed in by mistake. */
export const Hidden: Story = {
  args: { length: 18, reason: "privileged", children: "the side letter was backdated" },
  play: async ({ canvasElement }) => {
    const bar = canvasElement.querySelector("[data-slot=redaction]")!
    await expect(bar).toHaveTextContent("Redacted: privileged")
    await expect(canvasElement.textContent).not.toContain("backdated")
  },
}

export const Revealed: Story = {
  args: { revealed: true, children: "the side letter was backdated" },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("[data-slot=redaction]")).toHaveTextContent(/backdated/)
  },
}

export const Lengths: Story = {
  decorators: [],
  render: () => (
    <p className="bevel-paper flex max-w-md flex-wrap items-baseline gap-2 p-6">
      <Redaction length={3} />
      <Redaction length={10} />
      <Redaction length={24} />
    </p>
  ),
}
