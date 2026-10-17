import type * as React from "react"
import { Vigilance, VigilanceButton, VigilanceLamps } from "@workspace/ui/components/vigilance"
import { Interlock, InterlockLever } from "@workspace/ui/components/interlock"
import { GuardedSwitch, GuardedSwitchControl, GuardedSwitchLabel } from "@workspace/ui/components/guarded-switch"
import {
  ActivityLog,
  ActivityLogEntries,
  ActivityLogEntry,
} from "@workspace/ui/components/activity-log"
import { Amount } from "@workspace/ui/components/amount"
import {
  Approval,
  ApprovalActions,
  ApprovalReject,
  ApprovalSeal,
  ApprovalTitle,
} from "@workspace/ui/components/approval"
import { Breaker, BreakerPanel, BreakerRow } from "@workspace/ui/components/breaker"
import { Citation, CitationTrigger } from "@workspace/ui/components/citation"
import {
  DelegationAgent,
  DelegationBoard,
  DelegationSlot,
  DelegationTask,
} from "@workspace/ui/components/delegation-board"
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
import { Redaction } from "@workspace/ui/components/redaction"
import { Redline, RedlineChange, RedlineDocument } from "@workspace/ui/components/redline"
import { Seal, Stamp, StampDetail } from "@workspace/ui/components/stamp"
import { TaskPlan, TaskPlanStep, TaskPlanSteps } from "@workspace/ui/components/task-plan"
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
  vigilance: () => (
    <div className="flex justify-center">
      <Vigilance aria-label="Supervision" interval={600000} running={false}>
        <VigilanceLamps />
        <VigilanceButton />
      </Vigilance>
    </div>
  ),
  interlock: () => (
    <div className="flex justify-center">
      <Interlock aria-label="Levers" defaultValues={{ a: true }}>
        <InterlockLever id="a" label="Migrations" />
        <InterlockLever id="b" label="Promote" tone="red" requires={["a", "c"]} />
      </Interlock>
    </div>
  ),
  "guarded-switch": () => (
    <div className="flex justify-center">
      <GuardedSwitch autoClose={false}>
        <GuardedSwitchLabel>Deploy</GuardedSwitchLabel>
        <GuardedSwitchControl />
      </GuardedSwitch>
    </div>
  ),
  redaction: () => (
    <div className="bevel-paper flex flex-col gap-3 rounded-(--bevel-radius-xs) p-5 text-sm leading-relaxed">
      <Stamp tone="red" className="self-start">
        Privileged
      </Stamp>
      <p>
        Notice was sent by <Redaction length={14} /> on 3 March, so <Redaction length={20} />.
      </p>
    </div>
  ),
  redline: () => (
    <Redline>
      <RedlineDocument className="text-sm">
        End on <RedlineChange id="p" deletion="thirty" insertion="sixty" /> days&apos; notice.
      </RedlineDocument>
    </Redline>
  ),
  "delegation-board": () => (
    <DelegationBoard aria-label="Subagents" className="grid-cols-2">
      <DelegationSlot status="active">
        <DelegationAgent>
          <NameTag variant="plain">
            <NameTagName>Research</NameTagName>
          </NameTag>
        </DelegationAgent>
        <DelegationTask>Find cases</DelegationTask>
      </DelegationSlot>
      <DelegationSlot status="complete">
        <DelegationAgent>
          <NameTag variant="plain">
            <NameTagName>Cite</NameTagName>
          </NameTag>
        </DelegationAgent>
        <DelegationTask>Verified</DelegationTask>
      </DelegationSlot>
    </DelegationBoard>
  ),
  approval: () => (
    <Approval>
      <ApprovalTitle>Send the redline</ApprovalTitle>
      <ApprovalActions>
        <ApprovalReject>Send back</ApprovalReject>
        <ApprovalSeal />
      </ApprovalActions>
    </Approval>
  ),
  "activity-log": () => (
    <ActivityLog aria-label="Activity">
      <ActivityLogEntries>
        <ActivityLogEntry kind="action" time="14:02">Opened lease.pdf</ActivityLogEntry>
        <ActivityLogEntry kind="question" time="14:03">Email as notice?</ActivityLogEntry>
        <ActivityLogEntry kind="response" time="14:05">Redline ready</ActivityLogEntry>
      </ActivityLogEntries>
    </ActivityLog>
  ),
  "task-plan": () => (
    <TaskPlan>
      <TaskPlanSteps>
        <TaskPlanStep status="done">Read the lease</TaskPlanStep>
        <TaskPlanStep status="current">Check notice periods</TaskPlanStep>
        <TaskPlanStep status="pending">Draft a redline</TaskPlanStep>
      </TaskPlanSteps>
    </TaskPlan>
  ),
  citation: () => (
    <p className="bevel-paper rounded-(--bevel-radius-xs) p-5 text-sm leading-relaxed">
      Notice must be in writing
      <Citation>
        <CitationTrigger>1</CitationTrigger>
      </Citation>{" "}
      and sent to the scheduled address
      <Citation>
        <CitationTrigger tone="blue">2</CitationTrigger>
      </Citation>
      .
    </p>
  ),
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
