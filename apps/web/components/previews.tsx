import type * as React from "react"
import { ToggleLever } from "@workspace/ui/components/toggle-lever"
import { DueDateSlip } from "@workspace/ui/components/due-date-slip"
import { DipSwitch, DipSwitchBank, DipSwitchToggle } from "@workspace/ui/components/dip-switch"
import { PatchBay, PatchBayJack, PatchBayPanel, PatchBayRow } from "@workspace/ui/components/patch-bay"
import { TimeCard } from "@workspace/ui/components/time-card"
import { SplitFlap, SplitFlapRow, SplitFlapText } from "@workspace/ui/components/split-flap"
import { ContactSheet, ContactSheetFrame } from "@workspace/ui/components/contact-sheet"
import { VisibleFile, VisibleFileRow, VisibleFileSignal } from "@workspace/ui/components/visible-file"
import { KeysortFilter, KeysortFilterCard, KeysortFilterDeck, KeysortFilterNeedle, KeysortFilterNeedles } from "@workspace/ui/components/keysort-filter"
import { Mixer, MixerStrip, MixerStripFader, MixerStripMute, MixerStripName, MixerStripSolo } from "@workspace/ui/components/mixer-strip"
import { MotorizedFader } from "@workspace/ui/components/motorized-fader"
import { PushToTalk, PushToTalkKey } from "@workspace/ui/components/push-to-talk"
import { DetentKnob, DetentKnobStop } from "@workspace/ui/components/detent-knob"
import { Annunciator, AnnunciatorPanel, AnnunciatorTile } from "@workspace/ui/components/annunciator"
import { EngineTelegraph, EngineTelegraphDial, EngineTelegraphOrder } from "@workspace/ui/components/engine-telegraph"
import { TakeANumber, TakeANumberSign } from "@workspace/ui/components/take-a-number"
import { Lockout, LockoutAction, LockoutHasp, LockoutLock } from "@workspace/ui/components/lockout"
import { Vigilance, VigilanceButton, VigilanceLamps } from "@workspace/ui/components/vigilance"
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
  "toggle-lever": () => (
    <div className="pointer-events-none flex scale-150 flex-col items-center gap-2">
      <ToggleLever aria-label="On" defaultChecked tabIndex={-1} />
      <ToggleLever aria-label="Off" tabIndex={-1} />
    </div>
  ),
  "time-card": () => (
    <TimeCard
      title="Week 43"
      timeZone="UTC"
      locale="en-GB"
      rows={4}
      entries={[
        { in: "2026-10-19T08:58:00Z", out: "2026-10-19T12:31:00Z" },
        { in: "2026-10-19T13:15:00Z", out: "2026-10-19T17:42:00Z" },
        { in: "2026-10-20T09:04:00Z" },
      ]}
      className="pointer-events-none w-72"
    />
  ),
  "patch-bay": () => (
    <PatchBay
      aria-label="Routing"
      defaultValue={[
        ["a", "x"],
        ["a", "y"],
        ["b", "z"],
        ["c", "y"],
      ]}
      className="pointer-events-none w-72"
    >
      <PatchBayPanel className="p-3">
        <PatchBayRow side="source" label="Events">
          <PatchBayJack value="a" tabIndex={-1}>paid</PatchBayJack>
          <PatchBayJack value="b" tabIndex={-1}>failed</PatchBayJack>
          <PatchBayJack value="c" tabIndex={-1}>ending</PatchBayJack>
        </PatchBayRow>
        <PatchBayRow side="destination" label="Handlers">
          <PatchBayJack value="x" tabIndex={-1}>Receipt</PatchBayJack>
          <PatchBayJack value="y" tabIndex={-1}>Ledger</PatchBayJack>
          <PatchBayJack value="z" tabIndex={-1}>Dunning</PatchBayJack>
        </PatchBayRow>
      </PatchBayPanel>
    </PatchBay>
  ),
  "dip-switch": () => (
    <DipSwitch aria-label="Flags" defaultValue={["a", "c", "d", "g"]} className="pointer-events-none scale-125">
      <DipSwitchBank>
        {["a", "b", "c", "d", "e", "f", "g", "h"].map((v) => (
          <DipSwitchToggle key={v} value={v} tabIndex={-1}>
            {v}
          </DipSwitchToggle>
        ))}
      </DipSwitchBank>
    </DipSwitch>
  ),
  "due-date-slip": () => (
    <DueDateSlip title="API key" dates={["2026-08-14", "2026-09-13", "2026-11-12"]} now="2026-10-17" className="pointer-events-none w-48 scale-90" />
  ),
  "split-flap": () => (
    <SplitFlap aria-label="Board" className="pointer-events-none text-sm">
      <SplitFlapRow name="a">
        <SplitFlapText value="EU-WEST" length={7} />
        <SplitFlapText value="LIVE" length={4} tone="amber" />
      </SplitFlapRow>
      <SplitFlapRow name="b">
        <SplitFlapText value="US-EAST" length={7} />
        <SplitFlapText value="TEST" length={4} tone="amber" />
      </SplitFlapRow>
    </SplitFlap>
  ),
  "contact-sheet": () => (
    <ContactSheet aria-label="Frames" columns={3} defaultValue={{ b: "pick", c: "reject" }} className="pointer-events-none max-w-60 p-2">
      {[["a", 40], ["b", 230], ["c", 350]].map(([id, h]) => (
        <ContactSheetFrame key={id} id={id as string} label={id as string} tabIndex={-1}>
          <span className="block size-full" style={{ background: `oklch(0.65 0.1 ${h})` }} />
        </ContactSheetFrame>
      ))}
    </ContactSheet>
  ),
  "visible-file": () => (
    <VisibleFile aria-label="Tasks" scale={["Q", "P", "B", "T", "D"]} className="pointer-events-none max-w-64 grid-cols-[4.5rem_1fr]">
      <VisibleFileRow title="Login">
        <VisibleFileSignal value={3} label="Stage" />
      </VisibleFileRow>
      <VisibleFileRow title="Billing">
        <VisibleFileSignal value={1} label="Stage" tone="amber" />
      </VisibleFileRow>
      <VisibleFileRow title="Docs">
        <VisibleFileSignal value={4} label="Stage" tone="green" />
      </VisibleFileRow>
    </VisibleFile>
  ),
  "keysort-filter": () => (
    <KeysortFilter aria-label="Contracts" defaultValue={["a"]} className="pointer-events-none max-w-64">
      <KeysortFilterNeedles>
        <KeysortFilterNeedle value="a">NDA</KeysortFilterNeedle>
        <KeysortFilterNeedle value="b">EU</KeysortFilterNeedle>
      </KeysortFilterNeedles>
      <KeysortFilterDeck>
        <KeysortFilterCard notches={["a", "b"]}>Acme NDA</KeysortFilterCard>
        <KeysortFilterCard notches={["b"]}>Globex SOW</KeysortFilterCard>
        <KeysortFilterCard notches={["a"]}>Wayne NDA</KeysortFilterCard>
      </KeysortFilterDeck>
    </KeysortFilter>
  ),
  "mixer-strip": () => (
    <Mixer aria-label="Agents" className="pointer-events-none scale-75">
      {[["Plan", 70], ["Code", 40], ["Test", 55]].map(([name, v]) => (
        <MixerStrip key={name} name={name as string}>
          <MixerStripName />
          <MixerStripMute tabIndex={-1} pressed={name === "Test"} />
          <MixerStripSolo tabIndex={-1} />
          <MixerStripFader tabIndex={-1} value={v as number} />
        </MixerStrip>
      ))}
    </Mixer>
  ),
  "motorized-fader": () => (
    <MotorizedFader aria-label="Level" value={65} changedBy="Agent" tabIndex={-1} className="pointer-events-none" />
  ),
  "push-to-talk": () => (
    <PushToTalk talking={false} className="pointer-events-none w-40 gap-3 p-3">
      <PushToTalkKey tabIndex={-1} className="h-16" />
    </PushToTalk>
  ),
  "detent-knob": () => (
    <DetentKnob aria-label="Effort" defaultValue="high" className="pointer-events-none scale-75">
      <DetentKnobStop value="low">Low</DetentKnobStop>
      <DetentKnobStop value="medium">Medium</DetentKnobStop>
      <DetentKnobStop value="high">High</DetentKnobStop>
      <DetentKnobStop value="max">Max</DetentKnobStop>
    </DetentKnob>
  ),
  annunciator: () => (
    <Annunciator aria-label="Alerts" className="pointer-events-none max-w-60 p-2">
      <AnnunciatorPanel className="grid-cols-2 sm:grid-cols-2">
        <AnnunciatorTile id="a" active tone="red">Over budget</AnnunciatorTile>
        <AnnunciatorTile id="b" active={false}>Rate limited</AnnunciatorTile>
        <AnnunciatorTile id="c" active={false}>Tests failing</AnnunciatorTile>
        <AnnunciatorTile id="d" active tone="green">Deploy live</AnnunciatorTile>
      </AnnunciatorPanel>
    </Annunciator>
  ),
  "engine-telegraph": () => (
    <EngineTelegraph aria-label="Autonomy" value="act" confirmed="ask" className="pointer-events-none max-w-52">
      <EngineTelegraphDial />
      <div className="hidden">
        <EngineTelegraphOrder value="stop">Stop</EngineTelegraphOrder>
        <EngineTelegraphOrder value="ask">Ask</EngineTelegraphOrder>
        <EngineTelegraphOrder value="act">Act</EngineTelegraphOrder>
        <EngineTelegraphOrder value="auto">Auto</EngineTelegraphOrder>
      </div>
    </EngineTelegraph>
  ),
  "take-a-number": () => (
    <TakeANumber aria-label="Queue" serving={42} ticket={44} className="pointer-events-none">
      <TakeANumberSign />
    </TakeANumber>
  ),
  lockout: () => (
    <Lockout aria-label="Migration">
      <LockoutHasp>
        <LockoutLock id="p" owner="Priya" />
        <LockoutLock id="s" owner="Sam" />
      </LockoutHasp>
    </Lockout>
  ),
  vigilance: () => (
    <div className="flex justify-center">
      <Vigilance aria-label="Supervision" interval={600000} running={false}>
        <VigilanceLamps />
        <VigilanceButton />
      </Vigilance>
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
