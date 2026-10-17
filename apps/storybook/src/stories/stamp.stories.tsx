import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { Seal, Stamp, StampDetail } from "@workspace/ui/components/stamp"

const meta = {
  title: "Marks/Stamp and seal",
  component: Stamp,
  args: { tone: "red", shape: "rect", children: "Received" },
  argTypes: {
    tone: { control: "inline-radio", options: ["red", "blue", "green", "amber", "black"] },
    shape: { control: "inline-radio", options: ["rect", "round"] },
  },
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="bevel-paper rounded-(--bevel-radius-xs) p-10">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Stamp>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Received")).toBeVisible()
  },
}

export const Tones: Story = {
  render: () => (
    <div className="flex gap-4">
      <Stamp>Received</Stamp>
      <Stamp tone="blue">Refunded</Stamp>
      <Stamp tone="green">Auto</Stamp>
      <Stamp tone="amber">Caution</Stamp>
      <Stamp tone="black">Held</Stamp>
    </div>
  ),
}

export const WithDate: Story = {
  args: {
    children: (
      <>
        Paid
        <StampDetail>17 Oct 2026</StampDetail>
      </>
    ),
  },
}

export const Round: Story = { args: { shape: "round", tone: "green", children: "Auto" } }

export const EmbossedSeal: Story = {
  render: () => <Seal text="Bevel · Credits verified ·">Paid</Seal>,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("img", { name: /credits verified.*paid/i })).toBeVisible()
  },
}
