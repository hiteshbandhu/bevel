"use client"

import * as React from "react"
import { ArrowUpRight, History, Plus } from "lucide-react"
import {
  Wallet,
  WalletAction,
  WalletAmount,
  WalletBalance,
  WalletCard,
  WalletCardBrand,
  WalletCardNumber,
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

function Cards() {
  return (
    <WalletCards>
      <WalletCard />
      <WalletCard />
      <WalletCard />
    </WalletCards>
  )
}

type PaymentCard = { id: string; brand: string; last4: string }

const savedCards: PaymentCard[] = [
  { id: "amex-1005", brand: "Amex", last4: "1005" },
  { id: "mc-8210", brand: "Debit", last4: "8210" },
  { id: "visa-4242", brand: "Visa", last4: "4242" },
]

function PaymentCards({
  cards,
  ...props
}: { cards: PaymentCard[] } & React.ComponentProps<typeof WalletCards>) {
  return (
    <WalletCards {...props}>
      {cards.map((card) => (
        <WalletCard key={card.id} value={card.id}>
          <WalletCardBrand>{card.brand}</WalletCardBrand>
          <WalletCardNumber last4={card.last4} />
        </WalletCard>
      ))}
    </WalletCards>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="grid gap-8 border-t py-12 md:grid-cols-[1fr_auto] md:items-center">
      <div className="max-w-sm">
        <h2 className="font-medium">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}

function CheckoutDemo() {
  const total = 86.4
  const [balance, setBalance] = React.useState(124.5)
  const [cardId, setCardId] = React.useState("visa-4242")
  const covers = balance >= total
  const shortfall = +(total - balance).toFixed(2)
  const card = savedCards.find((c) => c.id === cardId)!
  return (
    <Wallet status={covers ? "default" : "insufficient"} className="w-full md:w-96">
      <PaymentCards cards={savedCards} value={cardId} onValueChange={setCardId} />
      <WalletPocket>
        <WalletHeader>
          <WalletLabel>Pay with balance</WalletLabel>
          <WalletStatus />
        </WalletHeader>
        <WalletBalance value={balance} currency="USD" />
        <WalletSeparator />
        <WalletDetails>
          <WalletDetail>
            <WalletDetailLabel>Order total</WalletDetailLabel>
            <WalletDetailValue>
              <WalletAmount value={total} currency="USD" />
            </WalletDetailValue>
          </WalletDetail>
          <WalletDetail>
            <WalletDetailLabel>
              {covers ? "Left after payment" : `Rest on ${card.brand} ${card.last4}`}
            </WalletDetailLabel>
            <WalletDetailValue>
              <WalletAmount value={Math.abs(balance - total)} currency="USD" />
            </WalletDetailValue>
          </WalletDetail>
        </WalletDetails>
        <WalletFooter>
          {covers ? (
            <WalletAction onClick={() => setBalance((b) => +(b - total).toFixed(2))}>
              Pay $86.40
            </WalletAction>
          ) : (
            <WalletAction onClick={() => setBalance(124.5)}>
              Pay ${shortfall.toFixed(2)} with •••• {card.last4}
            </WalletAction>
          )}
        </WalletFooter>
      </WalletPocket>
    </Wallet>
  )
}

function BillingDemo() {
  const [cards, setCards] = React.useState(savedCards.slice(0, 2))
  function addCard() {
    const last4 = String(1000 + Math.floor(Math.random() * 9000))
    setCards((c) => [...c, { id: `card-${last4}`, brand: "Visa", last4 }])
  }
  return (
    <Wallet variant="noir" className="w-full md:w-96">
      <PaymentCards cards={cards} />
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
          <WalletAction onClick={addCard} disabled={cards.length >= 5}>
            <Plus /> Add card
          </WalletAction>
          <WalletAction>
            <History /> History
          </WalletAction>
        </WalletFooter>
      </WalletPocket>
    </Wallet>
  )
}

export default function Page() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <header className="pb-12">
        <h1 className="text-2xl font-semibold tracking-tight">Wallet</h1>
        <p className="mt-2 max-w-prose text-muted-foreground">
          A customer&apos;s stored balance, shown as the object it stands for. Composable parts
          for checkout, billing and usage-based products.
        </p>
        <p className="mt-4 font-mono text-xs text-muted-foreground">
          Press <kbd>d</kbd> to toggle dark mode
        </p>
      </header>

      <Section
        title="Checkout"
        description="Pay from stored balance. Pay once to drain it, then pick which card covers the rest: the chosen card is pulled out of the pocket."
      >
        <CheckoutDemo />
      </Section>

      <Section
        title="Billing"
        description="Account credit and saved cards. Add a card to slide it into the wallet."
      >
        <BillingDemo />
      </Section>

      <Section
        title="Usage"
        description="Prepaid credits draining over a billing cycle. The meter and light turn amber when low."
      >
        <Wallet variant="oxblood" status="low" className="w-full md:w-96">
          <Cards />
          <WalletPocket>
            <WalletHeader>
              <WalletLabel>Credits remaining</WalletLabel>
              <WalletStatus />
            </WalletHeader>
            <WalletBalance value={9480} />
            <WalletMeter value={9480} max={50000}>
              <WalletMeterLabel>Of 50,000 this cycle</WalletMeterLabel>
              <WalletMeterValue>
                {(_, value) => `${Math.round((value / 50000) * 100)}%`}
              </WalletMeterValue>
            </WalletMeter>
            <WalletFooter>
              <WalletAction>
                Buy credits <ArrowUpRight />
              </WalletAction>
            </WalletFooter>
          </WalletPocket>
        </Wallet>
      </Section>
    </main>
  )
}
