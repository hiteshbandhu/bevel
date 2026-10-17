/** Meterline's account state: one reducer so a tick of traffic moves the meter, wallet, caps and ledger together. */

export const NOW = new Date("2026-10-17T00:00:00Z")
const DAY = 86_400_000
/** Simulated seconds per tick. Traffic runs at 60x: one 600ms tick is 36 seconds of the day. */
export const TICK_MS = 600
export const SIM_SECONDS_PER_TICK = 36
const SETTLE_EVERY = 8
export const LOW_BALANCE = 20

export type TrafficId = "production" | "staging" | "batch"
export type CircuitId = "main" | TrafficId
export type KeyId = TrafficId

export const traffic: Record<TrafficId, { name: string; min: number; max: number; price: number }> = {
  production: { name: "Production", min: 180, max: 420, price: 0.0004 },
  staging: { name: "Staging", min: 20, max: 80, price: 0.0002 },
  batch: { name: "Batch", min: 60, max: 200, price: 0.0003 },
}
export const trafficIds = Object.keys(traffic) as TrafficId[]

/** How much a reset lifts a cap that's been hit, for the rest of the day. */
export const raiseBy: Record<CircuitId, number> = { main: 10, production: 5, staging: 2, batch: 2 }

export type Circuit = { on: boolean; tripped: boolean; cap: number; spent: number }

export type Entry = {
  no: number
  time: string
  what: string
  amount: number
  after: number
  status: "Settled" | "Received" | "Bonus"
}

export type ReceiptData = {
  no: string
  time: string
  card: string
  lines: { label: string; amount: number }[]
  total: number
  stampDate: string
}

export type Card = { id: string; brand: string; last4: string; tone: "sapphire" | "gold" | "graphite" }
export const cards: Card[] = [
  { id: "debit-8210", brand: "Debit", last4: "8210", tone: "gold" },
  { id: "visa-4417", brand: "Visa", last4: "4417", tone: "sapphire" },
]
export const cardName = (id: string) => {
  const card = cards.find((c) => c.id === id)!
  return `${card.brand} ··${card.last4}`
}

export const packs = [
  { id: "25", credits: 25, bonus: 0, tone: "vermilion", note: "Top-up" },
  { id: "50", credits: 50, bonus: 0, tone: "ultramarine", note: "Most bought" },
  { id: "100", credits: 100, bonus: 4, tone: "emerald", note: "+ $4 bonus" },
  { id: "250", credits: 250, bonus: 15, tone: "ochre", note: "+ $15 bonus" },
] as const

export const keyInfo: Record<KeyId, { title: string; uses: string }> = {
  production: { title: "Production · ml_live_…7c1e", uses: "Signs requests on the production circuit." },
  staging: { title: "Staging · ml_test_…09ab", uses: "Signs requests on the staging circuit." },
  batch: { title: "Batch worker · ml_live_…a3d0", uses: "Signs nightly and batch jobs." },
}
export const MAX_STAMPS = 6

export type State = {
  running: boolean
  clock: number
  ticks: number
  balance: number
  /** Balance as of the last ledger line, in exact cents. */
  ledgerBalance: number
  requests: number
  refused: number
  circuits: Record<CircuitId, Circuit>
  pending: { calls: number; amount: number }
  entries: Entry[]
  nextNo: number
  keys: Record<KeyId, string[]>
  card: string
  pack: string
  receipt: ReceiptData
  receiptNo: number
  event: string
}

const round2 = (n: number) => Math.round(n * 100) / 100
const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" })
export const formatUsd = usd

const pad = (n: number) => String(n).padStart(2, "0")
export function clockText(seconds: number) {
  const s = Math.min(seconds, 23 * 3600 + 59 * 60)
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}`
}
const stampTime = (seconds: number) => `17 Oct ${clockText(seconds)}`

const iso = (d: Date) => d.toISOString().slice(0, 10)
const longDate = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })

export function keyValid(dates: string[]) {
  const last = dates.at(-1)
  return last ? new Date(last) >= NOW : false
}

export function totalSpent(circuits: Record<CircuitId, Circuit>) {
  return trafficIds.reduce((sum, id) => sum + circuits[id].spent, 0)
}

export function flowing(state: State, id: TrafficId) {
  const main = state.circuits.main
  const c = state.circuits[id]
  return main.on && !main.tripped && c.on && !c.tripped && keyValid(state.keys[id])
}

/** Expected spend per simulated hour from what's flowing right now. */
export function hourlyRate(state: State) {
  const perTick = trafficIds
    .filter((id) => flowing(state, id))
    .reduce((sum, id) => sum + ((traffic[id].min + traffic[id].max) / 2) * traffic[id].price, 0)
  return (perTick * 3600) / SIM_SECONDS_PER_TICK
}

export const initialState: State = {
  running: false,
  clock: 14 * 3600 + 2 * 60,
  ticks: 0,
  balance: 48.6,
  ledgerBalance: 48.6,
  requests: 36_212,
  refused: 0,
  circuits: {
    main: { on: true, tripped: false, cap: 25, spent: 0 },
    production: { on: true, tripped: false, cap: 15, spent: 10.8 },
    staging: { on: false, tripped: false, cap: 3, spent: 0 },
    batch: { on: true, tripped: false, cap: 6, spent: 3.69 },
  },
  pending: { calls: 0, amount: 0 },
  entries: [
    { no: 118, time: "17 Oct 13:58", what: "Usage · 4,812 calls", amount: -1.93, after: 48.6, status: "Settled" },
    { no: 117, time: "17 Oct 12:00", what: "Usage · 31,400 calls", amount: -12.56, after: 50.53, status: "Settled" },
    { no: 116, time: "16 Oct 23:59", what: "Usage · day close", amount: -54.91, after: 63.09, status: "Settled" },
    { no: 115, time: "12 Oct 10:41", what: "Credits · Visa ··4417", amount: 100, after: 118, status: "Received" },
  ],
  nextNo: 119,
  keys: {
    production: ["2026-04-23", "2026-07-22", "2026-10-21"],
    staging: ["2026-07-16", "2026-10-14"],
    batch: ["2026-11-07"],
  },
  card: "visa-4417",
  pack: "50",
  receipt: {
    no: "R-0412",
    time: "12 Oct 2026, 10:41",
    card: "Visa ··4417",
    lines: [{ label: "100 credits", amount: 100 }],
    total: 100,
    stampDate: "12 Oct",
  },
  receiptNo: 413,
  event: "Traffic paused. Start traffic to watch spend run.",
}

export type Action =
  | { type: "tick"; draws: Record<TrafficId, number> }
  | { type: "start" }
  | { type: "pause" }
  | { type: "settle" }
  | { type: "breaker"; id: CircuitId; on: boolean }
  | { type: "renew"; id: KeyId }
  | { type: "card"; id: string }
  | { type: "pack"; id: string }
  | { type: "pay" }

const MAX_ENTRIES = 12

/** Post unsettled usage to the ledger as one line. Keeps the ledger's arithmetic exact in cents. */
function settle(state: State): State {
  const posted = round2(state.pending.amount)
  if (state.pending.calls === 0 || posted < 0.01) return state
  const after = round2(state.ledgerBalance - posted)
  const entry: Entry = {
    no: state.nextNo,
    time: stampTime(state.clock),
    what: `Usage · ${state.pending.calls.toLocaleString("en-US")} calls`,
    amount: -posted,
    after,
    status: "Settled",
  }
  return {
    ...state,
    ledgerBalance: after,
    pending: { calls: 0, amount: state.pending.amount - posted },
    entries: [entry, ...state.entries].slice(0, MAX_ENTRIES),
    nextNo: state.nextNo + 1,
  }
}

function tick(state: State, draws: Record<TrafficId, number>): State {
  if (!state.running) return state
  const circuits = { ...state.circuits }
  let balance = state.balance
  let calls = 0
  let amount = 0
  let refused = state.refused
  let event: string | null = null
  let empty = false

  for (const id of trafficIds) {
    const c = circuits[id]
    const want = Math.round(traffic[id].min + draws[id] * (traffic[id].max - traffic[id].min))
    if (!c.on || !keyValid(state.keys[id])) continue
    if (c.tripped || circuits.main.tripped || !circuits.main.on) {
      refused += want
      continue
    }
    let cost = want * traffic[id].price
    let n = want
    const ownRoom = c.cap - c.spent
    const mainRoom = circuits.main.cap - totalSpent(circuits)
    const room = Math.min(ownRoom, mainRoom, balance)
    if (cost >= room) {
      n = Math.floor((want * Math.max(room, 0)) / cost)
      cost = Math.max(room, 0)
      refused += want - n
      if (room === balance) {
        empty = true
        event = "Out of credit. All traffic stopped. Top up to send requests again."
      } else if (room === ownRoom) {
        circuits[id] = { ...c, tripped: true }
        event = `${traffic[id].name} cap tripped at ${usd(c.cap)}. Requests on ${traffic[id].name.toLowerCase()} are refused until you reset it.`
      } else {
        circuits.main = { ...circuits.main, tripped: true }
        event = `Account cap tripped at ${usd(circuits.main.cap)}. Every request is refused until you reset the main breaker.`
      }
    }
    circuits[id] = { ...circuits[id], spent: circuits[id].spent + cost }
    balance = Math.max(0, balance - cost)
    calls += n
    amount += cost
    if (empty) break
  }

  const next: State = {
    ...state,
    circuits,
    balance: empty ? 0 : balance,
    running: !empty,
    clock: state.clock + SIM_SECONDS_PER_TICK,
    ticks: state.ticks + 1,
    requests: state.requests + calls,
    refused,
    pending: { calls: state.pending.calls + calls, amount: state.pending.amount + amount },
    event: event ?? state.event,
  }
  return event || next.ticks % SETTLE_EVERY === 0 ? settle(next) : next
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "tick":
      return tick(state, action.draws)
    case "start":
      if (state.balance <= 0) return state
      return { ...state, running: true, event: "Traffic running. Usage settles to the ledger every few minutes." }
    case "pause":
      return settle({ ...state, running: false, event: "Traffic paused." })
    case "settle":
      return settle(state)
    case "card":
      return { ...state, card: action.id }
    case "pack":
      return { ...state, pack: action.id }
    case "breaker": {
      const c = state.circuits[action.id]
      const name = action.id === "main" ? "Account" : traffic[action.id].name
      if (c.tripped && action.on) {
        const spent = action.id === "main" ? totalSpent(state.circuits) : c.spent
        const cap = spent >= c.cap - 0.005 ? c.cap + raiseBy[action.id] : c.cap
        return settle({
          ...state,
          circuits: { ...state.circuits, [action.id]: { ...c, tripped: false, on: true, cap } },
          event: `${name} cap reset${cap > c.cap ? ` and raised to ${usd(cap)} for today` : ""}.`,
        })
      }
      return settle({
        ...state,
        circuits: { ...state.circuits, [action.id]: { ...c, on: action.on, tripped: false } },
        event:
          action.id === "main"
            ? action.on
              ? "Main breaker on. Traffic can flow."
              : "Main breaker off. Every request is refused."
            : `${name} circuit switched ${action.on ? "on" : "off"}.`,
      })
    }
    case "renew": {
      const dates = state.keys[action.id]
      if (dates.length >= MAX_STAMPS) return state
      const last = new Date(dates.at(-1)!)
      const from = last < NOW ? NOW : last
      const due = new Date(from.getTime() + 90 * DAY)
      const wasExpired = !keyValid(dates)
      return {
        ...state,
        keys: { ...state.keys, [action.id]: [...dates, iso(due)] },
        event: `${traffic[action.id].name} key renewed to ${longDate(due)}.${
          wasExpired ? ` Switch the ${traffic[action.id].name.toLowerCase()} breaker on to send traffic.` : ""
        }`,
      }
    }
    case "pay": {
      const pack = packs.find((p) => p.id === state.pack)!
      const settled = settle(state)
      const time = stampTime(settled.clock)
      const card = cardName(settled.card)
      const afterCredits = round2(settled.ledgerBalance + pack.credits)
      const lines: Entry[] = [
        {
          no: settled.nextNo,
          time,
          what: `Credits · ${card}`,
          amount: pack.credits,
          after: afterCredits,
          status: "Received",
        },
      ]
      if (pack.bonus) {
        lines.unshift({
          no: settled.nextNo + 1,
          time,
          what: `Bonus on ${usd(pack.credits)} pack`,
          amount: pack.bonus,
          after: round2(afterCredits + pack.bonus),
          status: "Bonus",
        })
      }
      const added = pack.credits + pack.bonus
      return {
        ...settled,
        balance: settled.balance + added,
        ledgerBalance: round2(settled.ledgerBalance + added),
        entries: [...lines, ...settled.entries].slice(0, MAX_ENTRIES),
        nextNo: settled.nextNo + lines.length,
        receiptNo: settled.receiptNo + 1,
        receipt: {
          no: `R-0${settled.receiptNo}`,
          time: `17 Oct 2026, ${clockText(settled.clock)}`,
          card,
          lines: pack.bonus
            ? [
                { label: `${pack.credits} credits`, amount: pack.credits },
                { label: `${pack.bonus} bonus credits`, amount: 0 },
              ]
            : [{ label: `${pack.credits} credits`, amount: pack.credits }],
          total: pack.credits,
          stampDate: "17 Oct",
        },
        event: `Paid ${usd(pack.credits)} with ${card}. ${usd(added)} added to the balance.${
          settled.running || settled.balance > 0 ? "" : " Start traffic again when you're ready."
        }`,
      }
    }
  }
}
