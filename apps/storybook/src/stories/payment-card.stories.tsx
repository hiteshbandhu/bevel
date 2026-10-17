import type { Meta, StoryObj } from "@storybook/react-vite"
import { Radio } from "@base-ui/react/radio"
import { RadioGroup } from "@base-ui/react/radio-group"
import { expect } from "storybook/test"
import {
  PaymentCard,
  PaymentCardBrand,
  PaymentCardChip,
  PaymentCardNumber,
} from "@workspace/ui/components/payment-card"

const meta = {
  title: "Money/Payment card",
  component: PaymentCard,
  args: { tone: "graphite" },
  argTypes: { tone: { control: "inline-radio", options: ["sapphire", "gold", "graphite"] } },
  parameters: { layout: "centered" },
  render: (args) => (
    <div className="w-80">
      <PaymentCard {...args}>
        <PaymentCardBrand>Visa</PaymentCardBrand>
        <PaymentCardNumber last4="4242" />
        <PaymentCardChip />
      </PaymentCard>
    </div>
  ),
} satisfies Meta<typeof PaymentCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText(/ending in/)).toBeInTheDocument()
    const card = canvasElement.querySelector("[data-slot=payment-card]")!
    const { width, height } = card.getBoundingClientRect()
    // ID-1 proportions, 85.60 × 53.98 mm.
    await expect(width / height).toBeCloseTo(85.6 / 53.98, 1)
  },
}

export const Tones: Story = {
  render: () => (
    <div className="grid w-[40rem] grid-cols-3 gap-4">
      {(["sapphire", "gold", "graphite"] as const).map((tone) => (
        <PaymentCard key={tone} tone={tone}>
          <PaymentCardBrand className="capitalize">{tone}</PaymentCardBrand>
          <PaymentCardNumber last4="4242" />
          <PaymentCardChip />
        </PaymentCard>
      ))}
    </div>
  ),
}

/** Borrowed outside a wallet: cards as a radio group. */
export const AsRadioGroup: Story = {
  render: () => (
    <RadioGroup aria-label="Pay with" defaultValue="visa" className="grid w-[30rem] grid-cols-2 gap-4">
      <PaymentCard tone="graphite" render={<Radio.Root value="visa" />}>
        <PaymentCardBrand>Visa</PaymentCardBrand>
        <PaymentCardNumber last4="4242" />
      </PaymentCard>
      <PaymentCard tone="sapphire" render={<Radio.Root value="amex" />}>
        <PaymentCardBrand>Amex</PaymentCardBrand>
        <PaymentCardNumber last4="1005" />
      </PaymentCard>
      <PaymentCard tone="gold" render={<Radio.Root value="debit" disabled />}>
        <PaymentCardBrand>Expired</PaymentCardBrand>
        <PaymentCardNumber last4="8210" />
      </PaymentCard>
    </RadioGroup>
  ),
  play: async ({ canvas, userEvent }) => {
    const visa = canvas.getByRole("radio", { name: /visa.*ending in 4242/i })
    await expect(visa).toBeChecked()
    await userEvent.click(canvas.getByRole("radio", { name: /amex/i }))
    await expect(canvas.getByRole("radio", { name: /amex/i })).toBeChecked()
    await expect(canvas.getByRole("radio", { name: /expired/i })).toHaveAttribute("aria-disabled", "true")
  },
}
