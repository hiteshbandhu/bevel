import type { Meta, StoryObj } from "@storybook/react-vite"
import { ArrowUpRight, History, Plus } from "lucide-react"
import * as React from "react"
import { expect, fn, waitFor } from "storybook/test"
import {
  Wallet,
  WalletAction,
  WalletAmount,
  WalletBalance,
  WalletCard,
  WalletCards,
  WalletDetail,
  WalletDetailLabel,
  WalletDetails,
  WalletDetailValue,
  WalletFooter,
  WalletHeader,
  WalletLabel,
  WalletMeter,
  WalletMeterLabel,
  WalletMeterValue,
  WalletPocket,
  WalletSeparator,
  WalletStatus,
} from "@workspace/ui/components/wallet"
import { PaymentCardBrand, PaymentCardNumber } from "@workspace/ui/components/payment-card"

function Cards() {
  return (
    <WalletCards>
      <WalletCard />
      <WalletCard />
      <WalletCard />
    </WalletCards>
  )
}

const meta = {
  title: "Money/Wallet",
  component: Wallet,
  args: { variant: "saddle", status: "default" },
  argTypes: {
    variant: { control: "inline-radio", options: ["saddle", "noir", "oxblood"] },
    status: { control: "inline-radio", options: ["default", "low", "empty", "insufficient"] },
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof Wallet>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Wallet {...args}>
      <Cards />
      <WalletPocket>
        <WalletHeader>
          <WalletLabel>Wallet balance</WalletLabel>
          <WalletStatus />
        </WalletHeader>
        <WalletBalance value={124.5} currency="USD" />
      </WalletPocket>
    </Wallet>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Active")).toBeVisible()
    const balance = canvas.getByText("124", { exact: false }).closest("[data-slot=wallet-balance]")
    await expect(balance).toHaveTextContent("$124.50")
  },
}

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-start gap-8">
      {(["saddle", "noir", "oxblood"] as const).map((variant) => (
        <Wallet key={variant} {...args} variant={variant} className="w-80">
          <Cards />
          <WalletPocket>
            <WalletLabel className="capitalize">{variant}</WalletLabel>
            <WalletBalance value={2048.75} currency="EUR" locale="de-DE" />
          </WalletPocket>
        </Wallet>
      ))}
    </div>
  ),
}

/** Paying for an order with stored balance. */
export const Checkout: Story = {
  args: { onClick: fn() },
  render: ({ onClick, ...args }) => {
    return (
      <Wallet {...args}>
        <Cards />
        <WalletPocket>
          <WalletHeader>
            <WalletLabel>Pay with balance</WalletLabel>
            <WalletStatus />
          </WalletHeader>
          <WalletBalance value={124.5} currency="USD" />
          <WalletSeparator />
          <WalletDetails>
            <WalletDetail>
              <WalletDetailLabel>Order total</WalletDetailLabel>
              <WalletDetailValue>
                <WalletAmount value={-86.4} currency="USD" />
              </WalletDetailValue>
            </WalletDetail>
            <WalletDetail>
              <WalletDetailLabel>Left after payment</WalletDetailLabel>
              <WalletDetailValue>
                <WalletAmount value={38.1} currency="USD" />
              </WalletDetailValue>
            </WalletDetail>
          </WalletDetails>
          <WalletFooter>
            <WalletAction onClick={() => onClick?.({} as never)}>Pay $86.40</WalletAction>
          </WalletFooter>
        </WalletPocket>
      </Wallet>
    )
  },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Pay $86.40" }))
    await expect(args.onClick).toHaveBeenCalledOnce()
    const amounts = [...canvasElement.querySelectorAll("[data-slot=amount]")]
    await expect(amounts.map((a) => a.textContent)).toContain("-$86.40")
  },
}

/** Balance doesn't cover the order: the shortfall and the fix are both on the wallet. */
export const CheckoutInsufficient: Story = {
  args: { status: "insufficient" },
  render: (args) => (
    <Wallet {...args}>
      <Cards />
      <WalletPocket>
        <WalletHeader>
          <WalletLabel>Pay with balance</WalletLabel>
          <WalletStatus />
        </WalletHeader>
        <WalletBalance value={42} currency="USD" />
        <WalletSeparator />
        <WalletDetails>
          <WalletDetail>
            <WalletDetailLabel>Order total</WalletDetailLabel>
            <WalletDetailValue>
              <WalletAmount value={86.4} currency="USD" />
            </WalletDetailValue>
          </WalletDetail>
          <WalletDetail>
            <WalletDetailLabel>Short by</WalletDetailLabel>
            <WalletDetailValue>
              <WalletAmount value={44.4} currency="USD" />
            </WalletDetailValue>
          </WalletDetail>
        </WalletDetails>
        <WalletFooter>
          <WalletAction>
            <Plus /> Add $44.40
          </WalletAction>
          <WalletAction>Split payment</WalletAction>
        </WalletFooter>
      </WalletPocket>
    </Wallet>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Insufficient")).toBeVisible()
  },
}

/** Account credit on a billing page. */
export const Billing: Story = {
  render: (args) => (
    <Wallet {...args} variant="noir">
      <Cards />
      <WalletPocket>
        <WalletHeader>
          <WalletLabel>Account credit</WalletLabel>
          <WalletStatus />
        </WalletHeader>
        <WalletBalance value={1240} currency="USD" />
        <WalletDetails>
          <WalletDetail>
            <WalletDetailLabel>Next invoice · Nov 1</WalletDetailLabel>
            <WalletDetailValue>
              <WalletAmount value={320} currency="USD" />
            </WalletDetailValue>
          </WalletDetail>
          <WalletDetail>
            <WalletDetailLabel>Auto top-up below</WalletDetailLabel>
            <WalletDetailValue>
              <WalletAmount value={100} currency="USD" format={{ maximumFractionDigits: 0 }} />
            </WalletDetailValue>
          </WalletDetail>
        </WalletDetails>
        <WalletFooter>
          <WalletAction>
            <Plus /> Add funds
          </WalletAction>
          <WalletAction>
            <History /> History
          </WalletAction>
        </WalletFooter>
      </WalletPocket>
    </Wallet>
  ),
}

/** Prepaid credits with a meter. */
export const Usage: Story = {
  args: { status: "low" },
  render: (args) => (
    <Wallet {...args} variant="oxblood">
      <Cards />
      <WalletPocket>
        <WalletHeader>
          <WalletLabel>Credits remaining</WalletLabel>
          <WalletStatus />
        </WalletHeader>
        <WalletBalance value={9480} />
        <WalletMeter value={9480} max={50000}>
          <WalletMeterLabel>Of 50,000 this cycle</WalletMeterLabel>
          <WalletMeterValue>{(_, value) => `${Math.round((value / 50000) * 100)}%`}</WalletMeterValue>
        </WalletMeter>
        <WalletFooter>
          <WalletAction>
            Buy credits <ArrowUpRight />
          </WalletAction>
        </WalletFooter>
      </WalletPocket>
    </Wallet>
  ),
  play: async ({ canvas }) => {
    const meter = canvas.getByRole("meter", { name: "Of 50,000 this cycle" })
    await expect(meter).toHaveAttribute("aria-valuenow", "9480")
    await expect(canvas.getByText("Low balance")).toBeVisible()
  },
}

/** The whole wallet as one control, e.g. selecting a payment method. */
export const AsButton: Story = {
  args: { onClick: fn() },
  render: (args) => (
    <Wallet {...args} render={<button type="button" />} aria-label="Pay with wallet balance, $124.50">
      <Cards />
      <WalletPocket>
        <WalletLabel>Wallet balance</WalletLabel>
        <WalletBalance value={124.5} currency="USD" />
      </WalletPocket>
    </Wallet>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const wallet = canvas.getByRole("button", { name: /pay with wallet balance/i })
    wallet.focus()
    await userEvent.keyboard("{Enter}")
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}

export const KeyboardActions: Story = {
  args: { onClick: fn() },
  render: (args) => (
    <Wallet>
      <Cards />
      <WalletPocket>
        <WalletBalance value={124.5} currency="USD" />
        <WalletFooter>
          <WalletAction onClick={() => args.onClick?.({} as never)}>Top up</WalletAction>
          <WalletAction disabled>Withdraw</WalletAction>
        </WalletFooter>
      </WalletPocket>
    </Wallet>
  ),
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.tab()
    await expect(canvas.getByRole("button", { name: "Top up" })).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    await userEvent.keyboard(" ")
    await expect(args.onClick).toHaveBeenCalledTimes(2)
    await expect(canvas.getByRole("button", { name: "Withdraw" })).toBeDisabled()
  },
}

export const EdgeCases: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-8">
      <Wallet status="empty" className="w-80">
        <Cards />
        <WalletPocket>
          <WalletHeader>
            <WalletLabel>Overdrawn</WalletLabel>
            <WalletStatus />
          </WalletHeader>
          <WalletBalance value={-12.3} currency="USD" />
        </WalletPocket>
      </Wallet>
      <Wallet className="w-80">
        <Cards />
        <WalletPocket>
          <WalletLabel>Large balance</WalletLabel>
          <WalletBalance value={98765432.1} currency="JPY" locale="ja-JP" />
        </WalletPocket>
      </Wallet>
      <Wallet className="w-64">
        <Cards />
        <WalletPocket>
          <WalletLabel>A very long label that has to wrap onto a second line</WalletLabel>
          <WalletBalance value={0} currency="INR" locale="en-IN" />
        </WalletPocket>
      </Wallet>
    </div>
  ),
}

const savedCards = [
  { id: "amex-1005", brand: "Amex", last4: "1005" },
  { id: "debit-8210", brand: "Debit", last4: "8210" },
  { id: "visa-4242", brand: "Visa", last4: "4242" },
]

/** Cards are a radio group: the chosen card is pulled out of the pocket. */
export const PickACard: Story = {
  args: { onClick: fn() },
  render: ({ onClick }) => (
    <Wallet status="insufficient">
      <WalletCards
        defaultValue="visa-4242"
        onValueChange={(value) => onClick?.(value as never)}
      >
        {savedCards.map((card) => (
          <WalletCard key={card.id} value={card.id}>
            <PaymentCardBrand>{card.brand}</PaymentCardBrand>
            <PaymentCardNumber last4={card.last4} />
          </WalletCard>
        ))}
      </WalletCards>
      <WalletPocket>
        <WalletHeader>
          <WalletLabel>Pay the rest with</WalletLabel>
          <WalletStatus />
        </WalletHeader>
        <WalletBalance value={42} currency="USD" />
      </WalletPocket>
    </Wallet>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const group = canvas.getByRole("radiogroup", { name: "Payment methods" })
    await expect(group).toBeVisible()
    const visa = canvas.getByRole("radio", { name: /visa.*ending in 4242/i })
    await expect(visa).toBeChecked()

    // Pointer: the back card's visible strip is a real target.
    await userEvent.click(canvas.getByRole("radio", { name: /amex/i }))
    await expect(canvas.getByRole("radio", { name: /amex/i })).toBeChecked()
    await expect(args.onClick).toHaveBeenLastCalledWith("amex-1005")

    // Keyboard: arrows move the selection.
    await userEvent.keyboard("{ArrowRight}")
    await expect(canvas.getByRole("radio", { name: /debit/i })).toBeChecked()
  },
}

/** The stack lays itself out for any number of cards, including none. */
export const CardCounts: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-8">
      {[0, 1, 3, 5].map((count) => (
        <Wallet key={count} className="w-72">
          <WalletCards>
            {Array.from({ length: count }, (_, i) => (
              <WalletCard key={i}>
                <PaymentCardBrand>Card {i + 1}</PaymentCardBrand>
                <PaymentCardNumber last4={String(1000 + i * 1111)} />
              </WalletCard>
            ))}
          </WalletCards>
          <WalletPocket>
            <WalletLabel>{count === 0 ? "No saved cards" : `${count} saved`}</WalletLabel>
            <WalletBalance value={64} currency="USD" />
          </WalletPocket>
        </Wallet>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const stacks = [...canvasElement.querySelectorAll("[data-slot=wallet-cards]")]
    const heights = stacks.map((s) => s.getBoundingClientRect().height)
    // Empty and single-card stacks share the base height; each extra card adds one step.
    await expect(heights[0]).toBe(heights[1])
    await expect(heights[2]).toBeGreaterThan(heights[1]!)
    await expect(heights[3]).toBeGreaterThan(heights[2]!)
  },
}

function AddCardDemo() {
  const [cards, setCards] = React.useState(savedCards.slice(0, 1))
  return (
    <Wallet>
      <WalletCards>
        {cards.map((card) => (
          <WalletCard key={card.id}>
            <PaymentCardBrand>{card.brand}</PaymentCardBrand>
            <PaymentCardNumber last4={card.last4} />
          </WalletCard>
        ))}
      </WalletCards>
      <WalletPocket>
        <WalletBalance value={124.5} currency="USD" />
        <WalletFooter>
          <WalletAction
            disabled={cards.length === savedCards.length}
            onClick={() => setCards(savedCards.slice(0, cards.length + 1))}
          >
            <Plus /> Add card
          </WalletAction>
        </WalletFooter>
      </WalletPocket>
    </Wallet>
  )
}

/** Cards added after first render slide down into the pocket. */
export const AddCard: Story = {
  render: () => <AddCardDemo />,
  play: async ({ canvasElement, canvas, userEvent }) => {
    const first = canvasElement.querySelector("[data-wallet-card]")!
    await userEvent.click(canvas.getByRole("button", { name: "Add card" }))
    await waitFor(() => expect(canvas.getByText("8210")).toBeInTheDocument())
    const added = [...canvasElement.querySelectorAll("[data-wallet-card]")].at(-1)!
    // Only the new card fades in. The original may still move (it now sits
    // behind and takes a tilt), but it must not re-enter.
    const fades = (el: Element) =>
      el.getAnimations().some((a) => (a as CSSTransition).transitionProperty === "opacity")
    await expect(fades(added)).toBe(true)
    await expect(fades(first)).toBe(false)
  },
}
