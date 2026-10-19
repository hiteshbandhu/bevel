"use client"

import * as React from "react"
import { demoMilestone } from "../shared/events"
import { ArrowDown, CreditCard } from "lucide-react"
import { Amount } from "@workspace/ui/components/amount"
import { Breaker, BreakerPanel, BreakerRow } from "@workspace/ui/components/breaker"
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
import { Meter, MeterButton, MeterFlag, MeterFooter, MeterHeader, MeterReading, MeterUnit } from "@workspace/ui/components/meter"
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
import { cn } from "@workspace/ui/lib/utils"
import { Legend, PanelKey, StatusStrip } from "../shared/environment"
import { ledgerFace } from "../shared/fonts"
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
  reducer,
  TICK_MS,
  totalSpent,
  trafficIds,
  type CircuitId,
  type State,
} from "./state"

const CENTS = { minimumFractionDigits: 2, maximumFractionDigits: 2 }
const WHOLE = { maximumFractionDigits: 0 }
const statusTone = { Settled: "black", Received: "green", Bonus: "blue" } as const

const circuitLabel: Record<CircuitId, string> = {
  main: "Account",
  production: "Production",
  staging: "Staging",
  batch: "Batch",
}

/** Each key slip lies at its own angle in the card file, as if dropped there. */
const slipTilt = ["-rotate-2", "rotate-1", "-rotate-1"]

/** The desk: walnut, lit from a lamp above, with the grain running across. */
const deskStyle: React.CSSProperties = {
  backgroundColor: "#4A3022",
  backgroundImage: [
    "radial-gradient(ellipse 75% 55% at 50% 0%, rgb(255 214 160 / 0.17), transparent 72%)",
    "radial-gradient(ellipse 120% 80% at 50% 120%, rgb(0 0 0 / 0.35), transparent 70%)",
    "repeating-linear-gradient(177deg, rgb(0 0 0 / 0.07) 0 1px, transparent 1px 6px)",
    "repeating-linear-gradient(182deg, rgb(255 230 200 / 0.035) 0 2px, transparent 2px 29px)",
  ].join(", "),
}

/** A legend tooled in gold leaf into the blotter's leather. */
function Tooled({ className, ...props }: React.ComponentProps<typeof Legend>) {
  return (
    <Legend
      className={cn(
        "font-[family-name:var(--font-ledger)] text-[19px] font-bold tracking-normal text-[#C9A44A] [text-shadow:0_1px_0_rgb(0_0_0/0.6),0_-1px_0_rgb(255_236_180/0.14)]",
        className
      )}
      {...props}
    />
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
  const topUpRef = React.useRef<HTMLParagraphElement>(null)

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
  const keysNote = [expired > 0 && `${expired} expired`, expiringSoon > 0 && `${expiringSoon} due this week`]
    .filter(Boolean)
    .join(", ")
  const printed = state.receipt.no !== initialState.receipt.no

  const goToTopUp = () => {
    document.getElementById("top-up")?.scrollIntoView({ behavior: "smooth", block: "center" })
    topUpRef.current?.focus({ preventScroll: true })
  }

  const breakerDescription = (id: CircuitId) => {
    const c = state.circuits[id]
    if (id !== "main" && !keyValid(state.keys[id])) return "Key expired"
    const used = id === "main" ? spent : c.spent
    return `${formatUsd(used)} of ${formatUsd(c.cap)}`
  }

  return (
    <div
      style={deskStyle}
      className={cn(ledgerFace.variable, "min-h-svh overflow-x-clip text-[#EADFC8]")}
    >
      <MeterlineHeader
        clock={clockText(state.clock)}
        running={state.running}
        canStart={state.balance > 0}
        onTraffic={() => dispatch({ type: state.running ? "pause" : "start" })}
      />

      <main className="mx-auto max-w-[1440px] px-2 pb-12 sm:px-8">
        {/* The blotter: green leather set into the walnut, stitched round its edge. */}
        <div
          className={cn(
            "bevel-leather relative rounded-[22px] px-4 py-7 sm:p-8 xl:p-12 [--bevel-material:#2E4A3B]",
            "shadow-[inset_0_2px_3px_rgb(0_0_0/0.45),inset_0_0_0_1px_rgb(0_0_0/0.35),0_1px_0_rgb(255_230_190/0.12),0_24px_48px_-24px_rgb(0_0_0/0.7)]"
          )}
        >
          <span
            aria-hidden
            className="bevel-stitch pointer-events-none absolute inset-2.5 rounded-[14px] [--bevel-stitch:rgb(201_164_74/0.55)]"
          />

          <div className="relative grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,11fr)_minmax(0,13fr)] [&>*]:min-w-0">
            {/* The one line of news, on a small backlit display at the head of the desk. */}
            <div role="status" className="lg:col-start-2 lg:row-start-1">
              <StatusStrip className="font-[family-name:var(--font-ledger)] [&>p]:text-[16px] [&>p]:leading-snug [&>p]:tracking-normal sm:[&>p]:whitespace-normal">
                {state.event}
              </StatusStrip>
            </div>

            {/* The hero: the wallet, open, with the latest receipt tucked under it. */}
            <section aria-labelledby="ml-balance" className="flex flex-col gap-4 lg:col-start-1 lg:row-span-2 lg:row-start-1">
              <Tooled id="ml-balance">Balance</Tooled>
              <div className="flex flex-col items-center lg:items-start">
                <div
                  data-bevel-family="leather"
                  className="relative z-20 w-full max-w-sm -rotate-1 xl:[zoom:1.2] xl:min-[1400px]:[zoom:1.4]"
                >
                  <Wallet variant="noir" status={walletStatus} className="max-w-none">
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

                {/* Each top-up prints a fresh receipt that slides out from under the wallet. */}
                <div
                  key={state.receipt.no}
                  data-bevel-family="paper"
                  className={cn(
                    "relative z-10 -mt-5 w-full max-w-[18.5rem] rotate-2 self-end sm:mr-6 lg:mr-0 lg:self-center lg:translate-x-16",
                    printed &&
                      "transition-[translate,opacity] duration-(--bevel-duration-move) ease-(--bevel-ease-out) starting:-translate-y-16 starting:opacity-0 motion-reduce:transition-none"
                  )}
                >
                  <Receipt aria-label={`Receipt ${state.receipt.no}`}>
                    <ReceiptHeader>
                      <ReceiptTitle>Meterline credits</ReceiptTitle>
                      <ReceiptMeta>
                        {state.receipt.no}, {state.receipt.time}
                      </ReceiptMeta>
                    </ReceiptHeader>
                    <ReceiptSeparator />
                    <ReceiptItems>
                      {state.receipt.lines.map((line) => (
                        <ReceiptItem key={line.label}>
                          <ReceiptLabel>{line.label}</ReceiptLabel>
                          <ReceiptValue>{line.amount === 0 ? "Free" : <Amount value={line.amount} currency="USD" />}</ReceiptValue>
                        </ReceiptItem>
                      ))}
                      <ReceiptItem>
                        <ReceiptLabel>Card</ReceiptLabel>
                        <ReceiptValue>{state.receipt.card}</ReceiptValue>
                      </ReceiptItem>
                    </ReceiptItems>
                    <ReceiptSeparator />
                    <ReceiptTotal>
                      <ReceiptLabel>Charged</ReceiptLabel>
                      <ReceiptValue>
                        <Amount value={state.receipt.total} currency="USD" />
                      </ReceiptValue>
                    </ReceiptTotal>
                    <ReceiptMark>
                      <Stamp tone="green" animate={printed}>
                        Paid
                        <StampDetail>{state.receipt.stampDate}</StampDetail>
                      </Stamp>
                    </ReceiptMark>
                    <ReceiptFooter>billing@halvorsen.example</ReceiptFooter>
                  </Receipt>
                </div>
              </div>
            </section>

            {/* The instruments: the spend counter, and the breaker panel beside it. */}
            <div className="flex flex-col gap-10 lg:col-start-2 lg:row-start-2">
              <div className="grid gap-x-10 gap-y-10 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] [&>*]:min-w-0">
                <section aria-labelledby="ml-spend" className="flex flex-col gap-4">
                  <Tooled id="ml-spend">Spend today</Tooled>
                  <Meter
                    state={metering ? "running" : spent > 0 ? "stopped" : "idle"}
                    aria-labelledby="ml-spend"
                    className="mx-auto rotate-[0.6deg] sm:mx-0"
                  >
                    <MeterHeader className="justify-end">
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
                      <MeterButton disabled={state.pending.calls === 0} onClick={() => dispatch({ type: "settle" })}>
                        Settle now
                      </MeterButton>
                    </MeterFooter>
                  </Meter>
                </section>

                <section aria-labelledby="ml-caps" className="flex flex-col gap-4">
                  <Tooled id="ml-caps">Daily caps</Tooled>
                  <BreakerPanel aria-labelledby="ml-caps" className="w-fit max-w-full self-center sm:self-start">
                    <BreakerRow className="justify-center">
                      {(["main", ...trafficIds] as CircuitId[]).map((id) => {
                        const c = state.circuits[id]
                        const keyOk = id === "main" || keyValid(state.keys[id])
                        return (
                          <Breaker
                            key={id}
                            label={circuitLabel[id]}
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
                </section>
              </div>

              {/* A sheet of credit tickets, and the key that pays for the one torn off. */}
              <section id="top-up" aria-labelledby="ml-top-up" className="flex scroll-mt-6 flex-col gap-4">
                <Tooled id="ml-top-up" ref={topUpRef} tabIndex={-1} className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#C9A44A]">
                  Top up
                </Tooled>
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-10 lg:flex-col lg:items-start xl:flex-row xl:items-center">
                  <div data-bevel-family="paper" className="w-full max-w-[21rem] -rotate-1 sm:w-[21rem] sm:shrink-0">
                    <TicketSheet aria-label="Credit pack" value={state.pack} onValueChange={(id) => dispatch({ type: "pack", id: id as string })}>
                      {packs.map((p) => (
                        <Ticket key={p.id} value={p.id} tone={p.tone}>
                          <TicketLabel>Credits</TicketLabel>
                          <TicketValue>${p.credits}</TicketValue>
                          <TicketNote>{p.note}</TicketNote>
                        </Ticket>
                      ))}
                    </TicketSheet>
                  </div>
                  <div className="flex w-full max-w-[21rem] flex-col gap-4 sm:w-auto">
                    <p className="font-[family-name:var(--font-ledger)] text-[17px] leading-relaxed text-[#B8AA8E]">
                      Adds{" "}
                      <span className="text-[#EADFC8]">
                        <Amount value={pack.credits + pack.bonus} currency="USD" />
                      </span>{" "}
                      to the balance, charged to <span className="text-[#EADFC8]">{cardName(state.card)}</span> from the wallet.
                    </p>
                    <PanelKey tone="go" onClick={() => {
                      dispatch({ type: "pay" })
                      demoMilestone("meterline", "top_up")
                    }} className="h-12 gap-2 self-start text-[16px] [&_svg]:size-4">
                      <CreditCard aria-hidden /> Pay {formatUsd(pack.credits)}
                    </PanelKey>
                  </div>
                </div>
              </section>
            </div>

            {/* The ledger book, open across the foot of the blotter, and the card file of key slips. */}
            <div className="grid gap-x-10 gap-y-10 lg:col-span-2 xl:grid-cols-[minmax(0,1fr)_auto] [&>*]:min-w-0">
              <section aria-labelledby="ml-ledger" className="flex flex-col gap-4">
                <Tooled id="ml-ledger">Ledger</Tooled>
                <div className="relative -rotate-[0.4deg]">
                  <div
                    data-bevel-family="paper"
                    className="bevel-leather rounded-[10px] p-2.5 shadow-[0_18px_30px_-14px_rgb(0_0_0/0.75)] [--bevel-material:#5B2A22]"
                  >
                    <Ledger>
                      <LedgerTitle>October 2026</LedgerTitle>
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
                              <LedgerCell className="whitespace-nowrap">{entry.time}</LedgerCell>
                              <LedgerCell className="whitespace-nowrap">{entry.what.replace(" · ", ", ")}</LedgerCell>
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
                  </div>
                  {/* A ribbon marker hanging from the book. */}
                  <span
                    aria-hidden
                    className="absolute right-14 -bottom-7 h-10 w-3 bg-[#9E2B25] shadow-[1px_2px_3px_rgb(0_0_0/0.4)] [clip-path:polygon(0_0,100%_0,100%_100%,50%_calc(100%-6px),0_100%)]"
                  />
                </div>
              </section>

              <section aria-labelledby="ml-keys" className="flex flex-col gap-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <Tooled id="ml-keys">API keys</Tooled>
                  {keysNote && <p className="font-[family-name:var(--font-ledger)] text-[17px] text-[#EADFC8]">{keysNote}</p>}
                </div>
                <div data-bevel-family="paper" className="flex flex-wrap justify-center gap-6 xl:flex-nowrap xl:justify-start xl:gap-0 xl:[&>*:not(:first-child)]:-ml-1">
                  {trafficIds.map((id, i) => {
                    const dates = state.keys[id]
                    const full = dates.length >= MAX_STAMPS
                    return (
                      <div
                        key={id}
                        className={cn(
                          "relative transition-[translate] duration-(--bevel-duration-small) ease-(--bevel-ease-out) hover:z-10 hover:-translate-y-1 focus-within:z-10 focus-within:-translate-y-1 motion-reduce:transition-none",
                          slipTilt[i % slipTilt.length]
                        )}
                      >
                        <DueDateSlip className="w-48" title={keyInfo[id].title.replace(" · ", ", ")} dates={dates} now={NOW}>
                          <DueDateSlipStatus />
                          <DueDateSlipRenew onClick={() => dispatch({ type: "renew", id })} disabled={full}>
                            {full ? "Slip full: rotate key" : "Renew 90 days"}
                          </DueDateSlipRenew>
                        </DueDateSlip>
                      </div>
                    )
                  })}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
