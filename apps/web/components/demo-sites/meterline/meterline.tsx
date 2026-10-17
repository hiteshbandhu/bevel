"use client"

import * as React from "react"
import { ArrowDown, CreditCard, Pause, Play, ReceiptText } from "lucide-react"
import { Amount } from "@workspace/ui/components/amount"
import { Breaker, BreakerPanel, BreakerPanelTitle, BreakerRow } from "@workspace/ui/components/breaker"
import { Button } from "@workspace/ui/components/button"
import { DueDateSlip, DueDateSlipRenew, DueDateSlipStatus } from "@workspace/ui/components/due-date-slip"
import {
  Ledger,
  LedgerAmount,
  LedgerBody,
  LedgerCell,
  LedgerHead,
  LedgerHeader,
  LedgerNumber,
  LedgerRow,
  LedgerTable,
  LedgerTitle,
} from "@workspace/ui/components/ledger"
import {
  Meter,
  MeterButton,
  MeterFlag,
  MeterFooter,
  MeterHeader,
  MeterLabel,
  MeterReading,
  MeterUnit,
} from "@workspace/ui/components/meter"
import { PaymentCardBrand, PaymentCardNumber } from "@workspace/ui/components/payment-card"
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
import { Ticket, TicketLabel, TicketNote, TicketSheet, TicketValue } from "@workspace/ui/components/ticket-sheet"
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
import { MeterlineHeader } from "./header"
import {
  cardName,
  cards,
  clockText,
  flowing,
  formatUsd,
  hourlyRate,
  initialState,
  keyInfo,
  keyValid,
  LOW_BALANCE,
  MAX_STAMPS,
  NOW,
  packs,
  raiseBy,
  reducer,
  TICK_MS,
  totalSpent,
  trafficIds,
  type CircuitId,
  type KeyId,
  type State,
} from "./state"

const CENTS = { minimumFractionDigits: 2, maximumFractionDigits: 2 }
const WHOLE = { maximumFractionDigits: 0 }
const statusTone = { Settled: "black", Received: "green", Bonus: "blue" } as const

function Panel({
  id,
  title,
  description,
  className,
  children,
}: {
  id: string
  title: string
  description?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`flex min-w-0 scroll-mt-4 flex-col gap-4 rounded-xl border bg-card p-4 sm:p-6 ${className ?? ""}`}
    >
      <div className="flex flex-col gap-1">
        <h2 id={`${id}-title`} className="text-base font-semibold tracking-tight">
          {title}
        </h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  )
}

function runwayText(state: State) {
  if (state.balance <= 0) return "Out of credit"
  const rate = hourlyRate(state)
  if (!state.running || rate === 0) return "Not drawing"
  const minutes = Math.round((state.balance / rate) * 60)
  const h = Math.floor(minutes / 60)
  return h > 0 ? `About ${h} h ${minutes % 60} m` : `About ${minutes} m`
}

export function Meterline() {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const topUpRef = React.useRef<HTMLHeadingElement>(null)

  React.useEffect(() => {
    if (!state.running) return
    const timer = setInterval(() => {
      dispatch({
        type: "tick",
        draws: { production: Math.random(), staging: Math.random(), batch: Math.random() },
      })
    }, TICK_MS)
    return () => clearInterval(timer)
  }, [state.running])

  const spent = totalSpent(state.circuits)
  const live = trafficIds.filter((id) => flowing(state, id))
  const metering = state.running && live.length > 0
  const walletStatus = state.balance <= 0 ? "empty" : state.balance < LOW_BALANCE ? "low" : "default"
  const pack = packs.find((p) => p.id === state.pack)!
  const expiringSoon = trafficIds.filter((id) => {
    const last = new Date(state.keys[id].at(-1)!)
    const days = (last.getTime() - NOW.getTime()) / 86_400_000
    return days >= 0 && days <= 7
  }).length
  const expired = trafficIds.filter((id) => !keyValid(state.keys[id])).length

  const trafficText = !state.running
    ? state.balance <= 0
      ? "Stopped: out of credit"
      : "Paused"
    : metering
      ? `Running on ${live.length} of ${trafficIds.length} circuits`
      : "Blocked: every circuit is off or tripped"

  const goToTopUp = () => {
    document.getElementById("top-up")?.scrollIntoView({ behavior: "smooth", block: "start" })
    topUpRef.current?.focus({ preventScroll: true })
  }

  const circuitLabel: Record<CircuitId, string> = {
    main: "Account",
    production: "Production",
    staging: "Staging",
    batch: "Batch",
  }

  const breakerDescription = (id: CircuitId) => {
    const c = state.circuits[id]
    if (id !== "main" && !keyValid(state.keys[id])) return "Key expired"
    const used = id === "main" ? spent : c.spent
    return `${formatUsd(used)} of ${formatUsd(c.cap)}`
  }

  return (
    <div className="min-h-svh bg-background">
      <MeterlineHeader />
      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6">
        <div id="overview" className="flex scroll-mt-4 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Halvorsen Labs · Pay as you go</p>
            <h1 className="text-3xl font-bold tracking-tight">Usage and billing</h1>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:flex sm:gap-8">
            <div>
              <dt className="text-muted-foreground">Traffic</dt>
              <dd className="font-medium">{trafficText}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Clock (60× speed)</dt>
              <dd className="font-medium tabular-nums">17 Oct, {clockText(state.clock)}</dd>
            </div>
          </dl>
        </div>
        <p role="status" className="rounded-lg border bg-muted/50 px-3 py-2 text-sm">
          {state.event}
        </p>

        <Panel
          id="usage"
          title="Live usage"
          description="Simulated API traffic runs the meter and draws the balance down. Each circuit has a daily cap: when spend reaches it, the breaker trips and its requests are refused. Resetting a tripped breaker raises its cap for the rest of the day."
        >
          <div className="tray grid gap-6 rounded-(--bevel-radius-xl) p-4 sm:p-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
            <Meter state={metering ? "running" : spent > 0 ? "stopped" : "idle"} aria-label="Spend today" className="mx-auto lg:mx-0">
              <MeterHeader>
                <MeterLabel>Spend today</MeterLabel>
                <MeterFlag>{metering ? "Metering" : state.running ? "Blocked" : "Paused"}</MeterFlag>
              </MeterHeader>
              <div className="flex flex-col gap-1">
                <MeterReading value={spent} currency="USD" format={CENTS} />
                <MeterUnit>of {formatUsd(state.circuits.main.cap)} account cap</MeterUnit>
              </div>
              <div className="flex flex-col gap-0.5">
                <MeterUnit>
                  <Amount value={state.requests} format={WHOLE} /> requests today
                </MeterUnit>
                <MeterUnit>
                  <Amount value={state.refused} format={WHOLE} /> refused by caps
                </MeterUnit>
              </div>
              <MeterFooter>
                <MeterButton
                  onClick={() => dispatch({ type: state.running ? "pause" : "start" })}
                  disabled={!state.running && state.balance <= 0}
                >
                  {state.running ? <Pause /> : <Play />}
                  {state.running ? "Pause traffic" : "Start traffic"}
                </MeterButton>
                <MeterButton disabled={state.pending.calls === 0} onClick={() => dispatch({ type: "settle" })}>
                  Settle now
                </MeterButton>
              </MeterFooter>
            </Meter>

            <div className="flex min-w-0 flex-col gap-3">
              <BreakerPanel aria-label="Daily spend caps">
                <BreakerPanelTitle>Daily caps</BreakerPanelTitle>
                <BreakerRow className="justify-center sm:justify-start">
                  {(["main", ...trafficIds] as CircuitId[]).map((id) => {
                    const c = state.circuits[id]
                    const keyOk = id === "main" || keyValid(state.keys[id])
                    return (
                      <Breaker
                        key={id}
                        label={id === "main" ? "Account" : circuitLabel[id]}
                        description={breakerDescription(id)}
                        checked={c.on && keyOk}
                        tripped={c.tripped}
                        disabled={!keyOk}
                        onCheckedChange={(on) => dispatch({ type: "breaker", id, on })}
                      />
                    )
                  })}
                </BreakerRow>
              </BreakerPanel>
              <p className="text-sm text-muted-foreground">
                The account breaker cuts every circuit. Resets raise caps by{" "}
                {(["main", ...trafficIds] as CircuitId[])
                  .map((id) => `${formatUsd(raiseBy[id])} (${circuitLabel[id].toLowerCase()})`)
                  .join(", ")}
                . Staging needs a valid key: see API keys below.
              </p>
            </div>
          </div>
        </Panel>

        <div id="billing" className="grid scroll-mt-4 gap-6 lg:grid-cols-3">
          <Panel id="balance" title="Balance" description="Prepaid credit. Pick the card to charge from the wallet.">
            <div className="tray flex justify-center rounded-(--bevel-radius-xl) p-4 sm:p-6">
              <Wallet variant="noir" status={walletStatus}>
                <WalletCards value={state.card} onValueChange={(id) => dispatch({ type: "card", id })} aria-label="Card to charge">
                  {cards.map((card) => (
                    <WalletCard key={card.id} value={card.id} tone={card.tone}>
                      <PaymentCardBrand>{card.brand}</PaymentCardBrand>
                      <PaymentCardNumber last4={card.last4} />
                    </WalletCard>
                  ))}
                </WalletCards>
                <WalletPocket>
                  <WalletHeader>
                    <WalletLabel>Credit balance</WalletLabel>
                    <WalletStatus />
                  </WalletHeader>
                  <WalletBalance value={state.balance} currency="USD" />
                  <WalletDetails>
                    <WalletDetail>
                      <WalletDetailLabel>Spent today</WalletDetailLabel>
                      <WalletDetailValue>
                        <WalletAmount value={spent} currency="USD" />
                      </WalletDetailValue>
                    </WalletDetail>
                    <WalletDetail>
                      <WalletDetailLabel>Not yet settled</WalletDetailLabel>
                      <WalletDetailValue>
                        <WalletAmount value={state.pending.amount} currency="USD" />
                      </WalletDetailValue>
                    </WalletDetail>
                    <WalletDetail>
                      <WalletDetailLabel>Runway</WalletDetailLabel>
                      <WalletDetailValue>{runwayText(state)}</WalletDetailValue>
                    </WalletDetail>
                  </WalletDetails>
                  <WalletFooter>
                    <WalletAction onClick={goToTopUp}>
                      <ArrowDown /> Top up
                    </WalletAction>
                  </WalletFooter>
                </WalletPocket>
              </Wallet>
            </div>
          </Panel>

          <section
            id="top-up"
            aria-labelledby="top-up-title"
            className="flex min-w-0 scroll-mt-4 flex-col gap-4 rounded-xl border bg-card p-4 sm:p-6"
          >
            <div className="flex flex-col gap-1">
              <h2 id="top-up-title" ref={topUpRef} tabIndex={-1} className="text-base font-semibold tracking-tight outline-none">
                Top up
              </h2>
              <p className="text-sm text-muted-foreground">Credits never expire. Larger packs come with bonus credit.</p>
            </div>
            <div data-bevel-family="paper" className="tray flex flex-col gap-4 rounded-(--bevel-radius-xl) p-4 sm:p-6">
              <TicketSheet
                aria-label="Credit pack"
                value={state.pack}
                onValueChange={(id) => dispatch({ type: "pack", id: id as string })}
              >
                {packs.map((p) => (
                  <Ticket key={p.id} value={p.id} tone={p.tone}>
                    <TicketLabel>Credits</TicketLabel>
                    <TicketValue>${p.credits}</TicketValue>
                    <TicketNote>{p.note}</TicketNote>
                  </Ticket>
                ))}
              </TicketSheet>
              <dl className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Charge to</dt>
                  <dd className="font-medium">{cardName(state.card)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Added to balance</dt>
                  <dd className="font-medium">
                    <Amount value={pack.credits + pack.bonus} currency="USD" />
                  </dd>
                </div>
              </dl>
              <Button size="lg" className="w-full" onClick={() => dispatch({ type: "pay" })}>
                <CreditCard /> Pay {formatUsd(pack.credits)}
              </Button>
            </div>
          </section>

          <Panel id="receipt" title="Latest receipt" description="Printed when a top-up goes through.">
            <div data-bevel-family="paper" className="tray flex justify-center rounded-(--bevel-radius-xl) p-4 sm:p-6">
              <Receipt aria-label={`Receipt ${state.receipt.no}`}>
                <ReceiptHeader>
                  <ReceiptTitle>Meterline credits</ReceiptTitle>
                  <ReceiptMeta>
                    {state.receipt.no} · {state.receipt.time}
                  </ReceiptMeta>
                </ReceiptHeader>
                <ReceiptSeparator />
                <ReceiptItems>
                  {state.receipt.lines.map((line) => (
                    <ReceiptItem key={`${state.receipt.no}-${line.label}`}>
                      <ReceiptLabel>{line.label}</ReceiptLabel>
                      <ReceiptValue>
                        {line.amount === 0 ? "Free" : <Amount value={line.amount} currency="USD" />}
                      </ReceiptValue>
                    </ReceiptItem>
                  ))}
                  <ReceiptItem key={`${state.receipt.no}-card`}>
                    <ReceiptLabel>Card</ReceiptLabel>
                    <ReceiptValue>{state.receipt.card}</ReceiptValue>
                  </ReceiptItem>
                </ReceiptItems>
                <ReceiptSeparator />
                <ReceiptTotal key={`${state.receipt.no}-total`}>
                  <ReceiptLabel>Charged</ReceiptLabel>
                  <ReceiptValue>
                    <Amount value={state.receipt.total} currency="USD" />
                  </ReceiptValue>
                </ReceiptTotal>
                <ReceiptMark>
                  <Stamp key={state.receipt.no} tone="green" animate={state.receipt.no !== initialState.receipt.no}>
                    Paid
                    <StampDetail>{state.receipt.stampDate}</StampDetail>
                  </Stamp>
                </ReceiptMark>
                <ReceiptFooter>Halvorsen Labs · billing@halvorsen.example</ReceiptFooter>
              </Receipt>
            </div>
          </Panel>
        </div>

        <Panel
          id="ledger"
          title="Ledger"
          description="Every top-up and charge. Usage settles in batches while traffic runs, and whenever you pause, top up or reset a cap."
        >
          <Ledger>
            <LedgerTitle>
              <ReceiptText aria-hidden className="mr-2 size-4" />
              Credit ledger
            </LedgerTitle>
            <LedgerTable>
              <LedgerHeader>
                <LedgerRow>
                  <LedgerHead>No.</LedgerHead>
                  <LedgerHead>Time</LedgerHead>
                  <LedgerHead>Entry</LedgerHead>
                  <LedgerHead className="text-right">Amount</LedgerHead>
                  <LedgerHead className="text-right">Balance</LedgerHead>
                  <LedgerHead>Status</LedgerHead>
                </LedgerRow>
              </LedgerHeader>
              <LedgerBody>
                {state.entries.map((entry) => (
                  <LedgerRow key={entry.no}>
                    <LedgerCell>
                      <LedgerNumber value={entry.no} />
                    </LedgerCell>
                    <LedgerCell>{entry.time}</LedgerCell>
                    <LedgerCell>{entry.what}</LedgerCell>
                    <LedgerCell className="text-right">
                      <LedgerAmount value={entry.amount} currency="USD" />
                    </LedgerCell>
                    <LedgerCell className="text-right">
                      <Amount value={entry.after} currency="USD" />
                    </LedgerCell>
                    <LedgerCell>
                      <Stamp tone={statusTone[entry.status]} className="px-1 py-0.5 text-(length:--bevel-fine)">
                        {entry.status}
                      </Stamp>
                    </LedgerCell>
                  </LedgerRow>
                ))}
              </LedgerBody>
            </LedgerTable>
          </Ledger>
        </Panel>

        <Panel
          id="keys"
          title="API keys"
          description={
            <>
              Keys expire unless renewed; each renewal adds 90 days and is stamped on the key&apos;s slip. An expired
              key stops its circuit from sending traffic.{" "}
              <span className="font-medium text-foreground">
                {expired > 0 ? `${expired} expired` : "None expired"}
                {expiringSoon > 0 ? `, ${expiringSoon} due within 7 days.` : "."}
              </span>
            </>
          }
        >
          <div data-bevel-family="paper" className="tray flex flex-wrap justify-center gap-6 rounded-(--bevel-radius-xl) p-4 sm:p-6 lg:justify-start">
            {trafficIds.map((id: KeyId) => {
              const dates = state.keys[id]
              const full = dates.length >= MAX_STAMPS
              return (
                <div key={id} className="flex flex-col gap-2">
                  <DueDateSlip title={keyInfo[id].title} dates={dates} now={NOW}>
                    <DueDateSlipStatus />
                    <DueDateSlipRenew onClick={() => dispatch({ type: "renew", id })} disabled={full}>
                      {full ? "Slip full: rotate key" : "Renew 90 days"}
                    </DueDateSlipRenew>
                  </DueDateSlip>
                  <p className="w-64 text-xs text-muted-foreground">{keyInfo[id].uses}</p>
                </div>
              )
            })}
          </div>
        </Panel>
      </main>
    </div>
  )
}
