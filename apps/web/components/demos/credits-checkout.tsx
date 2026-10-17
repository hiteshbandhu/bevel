"use client"

import * as React from "react"
import { Amount } from "@workspace/ui/components/amount"
import {
  Receipt,
  ReceiptFooter,
  ReceiptHeader,
  ReceiptItem,
  ReceiptItems,
  ReceiptLabel,
  ReceiptMark,
  ReceiptMeta,
  ReceiptSeparator,
  ReceiptTitle,
  ReceiptTotal,
  ReceiptValue,
} from "@workspace/ui/components/receipt"
import { Stamp, StampDetail } from "@workspace/ui/components/stamp"
import {
  Ticket,
  TicketLabel,
  TicketNote,
  TicketSheet,
  TicketValue,
} from "@workspace/ui/components/ticket-sheet"

const packs = [
  { id: "10", credits: 10, tone: "vermilion" },
  { id: "50", credits: 50, tone: "ultramarine" },
  { id: "100", credits: 100, tone: "emerald" },
  { id: "200", credits: 200, tone: "ochre" },
] as const

const feeFor = (credits: number) => +(0.3 + credits * 0.029).toFixed(2)

/** Pick a pack, watch the receipt print, pay and it gets stamped. */
export function CreditsCheckout() {
  const [packId, setPackId] = React.useState<string>("50")
  const [paid, setPaid] = React.useState(false)
  const pack = packs.find((p) => p.id === packId)!
  const fee = feeFor(pack.credits)

  return (
    <div data-bevel-family="paper" className="flex flex-col items-center gap-6">
      <TicketSheet
        aria-label="Credit pack"
        value={packId}
        onValueChange={(value) => {
          setPackId(value)
          setPaid(false)
        }}
        className="w-full"
      >
        {packs.map((p) => (
          <Ticket key={p.id} value={p.id} tone={p.tone}>
            <TicketLabel>Credits</TicketLabel>
            <TicketValue>${p.credits}</TicketValue>
            <TicketNote>+ ${feeFor(p.credits).toFixed(2)} fee</TicketNote>
          </Ticket>
        ))}
      </TicketSheet>

      <Receipt>
        <ReceiptHeader>
          <ReceiptTitle>Credit purchase</ReceiptTitle>
          <ReceiptMeta>17 Oct 2026, 14:02</ReceiptMeta>
        </ReceiptHeader>
        <ReceiptSeparator />
        <ReceiptItems>
          <ReceiptItem key={`credits-${pack.id}`}>
            <ReceiptLabel>{pack.credits} credits</ReceiptLabel>
            <ReceiptValue>
              <Amount value={pack.credits} currency="USD" />
            </ReceiptValue>
          </ReceiptItem>
          <ReceiptItem key={`fee-${pack.id}`}>
            <ReceiptLabel>Card fee</ReceiptLabel>
            <ReceiptValue>
              <Amount value={fee} currency="USD" />
            </ReceiptValue>
          </ReceiptItem>
        </ReceiptItems>
        <ReceiptSeparator />
        <ReceiptTotal>
          <ReceiptLabel>Total</ReceiptLabel>
          <ReceiptValue>
            <Amount value={pack.credits + fee} currency="USD" />
          </ReceiptValue>
        </ReceiptTotal>
        {paid ? (
          <ReceiptMark>
            <Stamp animate role="status">
              Paid
              <StampDetail>17 Oct</StampDetail>
            </Stamp>
          </ReceiptMark>
        ) : (
          <button
            type="button"
            onClick={() => setPaid(true)}
            className="mt-2 h-9 rounded-sm border border-current/40 text-sm font-semibold hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Pay
          </button>
        )}
        <ReceiptFooter>Credits never expire.</ReceiptFooter>
      </Receipt>
    </div>
  )
}
