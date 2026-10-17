"use client"

import * as React from "react"
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
  WalletSeparator,
  WalletStatus,
} from "@workspace/ui/components/wallet"
import { PaymentCardBrand, PaymentCardNumber } from "@workspace/ui/components/payment-card"

const cards = [
  { id: "amex-1005", brand: "Amex", last4: "1005" },
  { id: "debit-8210", brand: "Debit", last4: "8210" },
  { id: "visa-4242", brand: "Visa", last4: "4242" },
]

const total = 86.4

export function WalletCheckout() {
  const [balance, setBalance] = React.useState(124.5)
  const [cardId, setCardId] = React.useState("visa-4242")
  const card = cards.find((c) => c.id === cardId)!
  const covers = balance >= total
  const remainder = Math.abs(balance - total)

  return (
    <Wallet status={covers ? "default" : "insufficient"}>
      <WalletCards value={cardId} onValueChange={setCardId}>
        {cards.map((c) => (
          <WalletCard key={c.id} value={c.id}>
            <PaymentCardBrand>{c.brand}</PaymentCardBrand>
            <PaymentCardNumber last4={c.last4} />
          </WalletCard>
        ))}
      </WalletCards>
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
              <WalletAmount value={remainder} currency="USD" />
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
              Pay ${remainder.toFixed(2)} with •••• {card.last4}
            </WalletAction>
          )}
        </WalletFooter>
      </WalletPocket>
    </Wallet>
  )
}
