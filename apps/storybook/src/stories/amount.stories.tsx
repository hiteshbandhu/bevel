import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { Amount } from "@workspace/ui/components/amount"

const meta = {
  title: "Money/Amount",
  component: Amount,
  args: { value: 1240.5, currency: "USD" },
  parameters: { layout: "centered" },
} satisfies Meta<typeof Amount>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("[data-slot=amount]")).toHaveTextContent("$1,240.50")
  },
}

export const Signed: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Amount value={500} signed />
      <Amount value={-18.4} currency="USD" signed />
      <Amount value={0} currency="USD" signed />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [credit, debit, zero] = [...canvasElement.querySelectorAll("[data-slot=amount]")]
    await expect(credit).toHaveTextContent("+500")
    await expect(credit).toHaveAttribute("data-sign", "positive")
    await expect(debit).toHaveTextContent("-$18.40")
    await expect(zero).toHaveAttribute("data-sign", "zero")
  },
}

export const Locales: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Amount value={1240.5} currency="EUR" locale="de-DE" />
      <Amount value={98765} currency="JPY" locale="ja-JP" />
      <Amount value={1234567.8} currency="INR" locale="en-IN" />
    </div>
  ),
}
