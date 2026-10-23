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

const cards: {
  id: string
  brand: string
  last4: string
  tone: PaymentCardTone
}[] = [
  { id: "visa", brand: "Visa", last4: "4242", tone: "graphite" },
  { id: "amex", brand: "Amex", last4: "1005", tone: "sapphire" },
  { id: "debit", brand: "Debit", last4: "8210", tone: "gold" },
]

/** Choose a card to pay with. The chosen card lifts; the others dim. */
export function PaymentCardPicker() {
  return (
    <div className="flex scale-[1.6] flex-col gap-4 p-16">
      <p id="pay-with" className="text-sm font-semibold">
        Pay with
      </p>
      <RadioGroup
        aria-labelledby="pay-with"
        defaultValue="amex"
        className="flex gap-4"
      >
        {cards.map((card) => (
          <PaymentCard
            key={card.id}
            tone={card.tone}
            render={<Radio.Root value={card.id} />}
            className="w-56 cursor-pointer transition-[translate,filter] duration-(--bevel-duration-small) ease-(--bevel-ease-out) not-data-checked:brightness-(--bevel-dim) motion-reduce:transition-none data-checked:-translate-y-2"
          >
            <PaymentCardBrand>{card.brand}</PaymentCardBrand>
            <PaymentCardNumber last4={card.last4} />
            <PaymentCardChip />
          </PaymentCard>
        ))}
      </RadioGroup>
    </div>
  )
}
