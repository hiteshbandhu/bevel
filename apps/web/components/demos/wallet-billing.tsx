"use client"

import * as React from "react"
import { History, Plus } from "lucide-react"
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
  WalletPocket,
  WalletStatus,
} from "@workspace/ui/components/wallet"
import { PaymentCardBrand, PaymentCardNumber } from "@workspace/ui/components/payment-card"

type SavedCard = { id: string; brand: string; last4: string }

export function WalletBilling() {
  const [cards, setCards] = React.useState<SavedCard[]>([
    { id: "amex-1005", brand: "Amex", last4: "1005" },
    { id: "debit-8210", brand: "Debit", last4: "8210" },
  ])

  function addCard() {
    const last4 = String(1000 + Math.floor(Math.random() * 9000))
    setCards((c) => [...c, { id: `visa-${last4}`, brand: "Visa", last4 }])
  }

  return (
    <Wallet variant="noir">
      <WalletCards>
        {cards.map((c) => (
          <WalletCard key={c.id}>
            <PaymentCardBrand>{c.brand}</PaymentCardBrand>
            <PaymentCardNumber last4={c.last4} />
          </WalletCard>
        ))}
      </WalletCards>
      <WalletPocket>
        <WalletHeader>
          <WalletLabel>Account credit</WalletLabel>
          <WalletStatus />
        </WalletHeader>
        <WalletBalance value={1240} currency="USD" />
        <WalletDetails>
          <WalletDetail>
            <WalletDetailLabel>Next invoice, Nov 1</WalletDetailLabel>
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
