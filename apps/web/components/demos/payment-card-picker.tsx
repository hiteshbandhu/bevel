"use client"

import { Radio } from "@base-ui/react/radio"
import { RadioGroup } from "@base-ui/react/radio-group"
import {
  PaymentCard,
  PaymentCardBrand,
  PaymentCardChip,
  PaymentCardNumber,
  type PaymentCardTone,
} from "@workspace/ui/components/payment-card"

const cards: { id: string; brand: string; last4: string; tone: PaymentCardTone }[] = [
  { id: "visa-4242", brand: "Visa", last4: "4242", tone: "graphite" },
  { id: "amex-1005", brand: "Amex", last4: "1005", tone: "sapphire" },
  { id: "debit-8210", brand: "Debit", last4: "8210", tone: "gold" },
  { id: "corp-7731", brand: "Corporate", last4: "7731", tone: "graphite" },
]

export function PaymentCardPicker() {
  return (
    <RadioGroup aria-label="Pay with" defaultValue="visa-4242" className="grid grid-cols-2 gap-4">
      {cards.map((card) => (
        <PaymentCard
          key={card.id}
          tone={card.tone}
          render={<Radio.Root value={card.id} />}
          className="cursor-pointer transition-[translate,filter] duration-(--bevel-duration-small) ease-(--bevel-ease-out) not-data-checked:brightness-(--bevel-dim) data-checked:-translate-y-1.5 motion-reduce:transition-none"
        >
          <PaymentCardBrand>{card.brand}</PaymentCardBrand>
          <PaymentCardNumber last4={card.last4} />
          <PaymentCardChip />
        </PaymentCard>
      ))}
    </RadioGroup>
  )
}
