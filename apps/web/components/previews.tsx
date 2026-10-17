import type * as React from "react"
import { Amount } from "@workspace/ui/components/amount"
import { Breaker, BreakerPanel, BreakerRow } from "@workspace/ui/components/breaker"
import { DialMark, Gauge } from "@workspace/ui/components/dial"
import { Keycard, KeycardKey, KeycardLabel, KeycardSlot } from "@workspace/ui/components/keycard"
import {
  Ledger,
  LedgerAmount,
  LedgerBody,
  LedgerCell,
  LedgerNumber,
  LedgerRow,
  LedgerTable,
} from "@workspace/ui/components/ledger"
import { Meter, MeterFlag, MeterHeader, MeterLabel, MeterReading } from "@workspace/ui/components/meter"
import { NameTag, NameTagDetail, NameTagName } from "@workspace/ui/components/name-tag"
import { NumberWheel } from "@workspace/ui/components/number-wheel"
import {
  Receipt,
  ReceiptItem,
  ReceiptItems,
  ReceiptLabel,
  ReceiptMark,
  ReceiptTitle,
  ReceiptTotal,
  ReceiptValue,
} from "@workspace/ui/components/receipt"
import { Seal, Stamp, StampDetail } from "@workspace/ui/components/stamp"
import { Ticket, TicketLabel, TicketSheet, TicketValue } from "@workspace/ui/components/ticket-sheet"
import {
  Wallet,
  WalletBalance,
  WalletCard,
  WalletCards,
  WalletHeader,
  WalletLabel,
  WalletPocket,
  WalletStatus,
} from "@workspace/ui/components/wallet"
import {
  PaymentCard,
  PaymentCardBrand,
  PaymentCardChip,
  PaymentCardNumber,
} from "@workspace/ui/components/payment-card"

/** Still previews for component tiles: no controls, nothing focusable. */
export const previews: Record<string, React.ComponentType> = {
  "name-tag": () => (
    <div className="flex justify-center">
      <NameTag>
        <NameTagName>Research</NameTagName>
        <NameTagDetail>acting for Priya</NameTagDetail>
      </NameTag>
    </div>
  ),
  amount: () => (
    <div className="flex flex-col items-center gap-1 py-6 text-center">
      <span className="text-4xl font-semibold tracking-tight">
        <Amount value={1240.5} currency="USD" />
      </span>
      <span className="text-sm text-muted-foreground">
        <Amount value={1240.5} currency="EUR" locale="de-DE" />
      </span>
    </div>
  ),
  "number-wheel": () => (
    <div className="flex justify-center py-8">
      <NumberWheel value={10482} className="text-4xl" />
    </div>
  ),
  meter: () => (
    <Meter state="running" aria-label="Live usage">
      <MeterHeader>
        <MeterLabel>This turn</MeterLabel>
        <MeterFlag />
      </MeterHeader>
      <MeterReading value={0.142} currency="USD" format={{ minimumFractionDigits: 3 }} />
    </Meter>
  ),
  stamp: () => (
    <div className="bevel-paper flex items-center justify-center gap-5 rounded-(--bevel-radius-xs) px-4 py-8">
      <Stamp>
        Received
        <StampDetail>17 Oct</StampDetail>
      </Stamp>
      <Seal text="Credits verified ·" className="w-24">
        Paid
      </Seal>
    </div>
  ),
  receipt: () => (
    <Receipt className="mx-auto max-w-56">
      <ReceiptTitle className="text-center">Credits</ReceiptTitle>
      <ReceiptItems>
        <ReceiptItem>
          <ReceiptLabel>50 credits</ReceiptLabel>
          <ReceiptValue>$50.00</ReceiptValue>
        </ReceiptItem>
      </ReceiptItems>
      <ReceiptTotal>
        <ReceiptLabel>Total</ReceiptLabel>
        <ReceiptValue>$50.00</ReceiptValue>
      </ReceiptTotal>
      <ReceiptMark>
        <Stamp>Paid</Stamp>
      </ReceiptMark>
    </Receipt>
  ),
  "ticket-sheet": () => (
    <TicketSheet aria-label="Packs" defaultValue="50">
      <Ticket value="10" tone="vermilion">
        <TicketLabel>Credits</TicketLabel>
        <TicketValue>$10</TicketValue>
      </Ticket>
      <Ticket value="50" tone="ultramarine">
        <TicketLabel>Credits</TicketLabel>
        <TicketValue>$50</TicketValue>
      </Ticket>
    </TicketSheet>
  ),
  dial: () => (
    <div className="flex justify-center py-2">
      <Gauge value={12} max={30} ticks={30} aria-label="Runway" marks={<DialMark value={5} tone="amber" />} className="w-40" />
    </div>
  ),
  breaker: () => (
    <BreakerPanel aria-label="Caps" className="mx-auto w-fit p-4">
      <BreakerRow className="flex-nowrap justify-center gap-3">
        <Breaker label="Team" defaultChecked />
        <Breaker label="Person" tripped />
      </BreakerRow>
    </BreakerPanel>
  ),
  ledger: () => (
    <Ledger>
      <LedgerTable>
        <LedgerBody>
          <LedgerRow>
            <LedgerCell>
              <LedgerNumber value={42} />
            </LedgerCell>
            <LedgerCell>Credits</LedgerCell>
            <LedgerCell className="text-right">
              <LedgerAmount value={10} currency="USD" />
            </LedgerCell>
          </LedgerRow>
          <LedgerRow>
            <LedgerCell>
              <LedgerNumber value={43} />
            </LedgerCell>
            <LedgerCell>Usage</LedgerCell>
            <LedgerCell className="text-right">
              <LedgerAmount value={-4.2} currency="USD" />
            </LedgerCell>
          </LedgerRow>
        </LedgerBody>
      </LedgerTable>
    </Ledger>
  ),
  keycard: () => (
    <KeycardSlot inserted className="mx-auto">
      <Keycard>
        <KeycardLabel>Your key</KeycardLabel>
        <KeycardKey value="sk-proj-1234567890abcd" />
      </Keycard>
    </KeycardSlot>
  ),
  "payment-card": () => (
    <PaymentCard tone="sapphire">
      <PaymentCardBrand>Visa</PaymentCardBrand>
      <PaymentCardNumber last4="4242" />
      <PaymentCardChip />
    </PaymentCard>
  ),
  wallet: () => (
    <Wallet>
      <WalletCards slots={2}>
        <WalletCard>
          <PaymentCardBrand>Amex</PaymentCardBrand>
          <PaymentCardNumber last4="1005" />
        </WalletCard>
        <WalletCard>
          <PaymentCardBrand>Visa</PaymentCardBrand>
          <PaymentCardNumber last4="4242" />
        </WalletCard>
      </WalletCards>
      <WalletPocket>
        <WalletHeader>
          <WalletLabel>Wallet balance</WalletLabel>
          <WalletStatus />
        </WalletHeader>
        <WalletBalance value={124.5} currency="USD" />
      </WalletPocket>
    </Wallet>
  ),
}
