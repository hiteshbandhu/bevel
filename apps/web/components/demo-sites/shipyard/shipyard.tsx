"use client"

import * as React from "react"
import {
  SplitFlap,
  SplitFlapRow,
  SplitFlapText,
} from "@workspace/ui/components/split-flap"
import {
  VisibleFile,
  VisibleFileRow,
  VisibleFileSignal,
} from "@workspace/ui/components/visible-file"
import {
  TakeANumber,
  TakeANumberDispenser,
  TakeANumberSign,
  TakeANumberStatus,
} from "@workspace/ui/components/take-a-number"
import {
  Lockout,
  LockoutAction,
  LockoutHasp,
  LockoutLock,
} from "@workspace/ui/components/lockout"
import {
  GuardedSwitch,
  GuardedSwitchControl,
  GuardedSwitchLabel,
  GuardedSwitchStatus,
} from "@workspace/ui/components/guarded-switch"
import {
  Annunciator,
  AnnunciatorAcknowledge,
  AnnunciatorPanel,
  AnnunciatorTile,
} from "@workspace/ui/components/annunciator"

/* ------------------------------------------------------------------ data */

const RELEASE = "checkout v2.15"
const FROM = "V2.14"
const TO = "V2.15"

const stages = ["Queued", "Build", "Test", "Canary", "Live"]
const CANARY = 3
const LIVE = 4

const services = [
  { id: "checkout-api", owner: "Lena Okafor" },
  { id: "cart-worker", owner: "Dev Hartmann" },
  { id: "price-engine", owner: "Ama Reyes" },
  { id: "receipt-mailer", owner: "You" },
]
/** The service whose first canary goes bad. */
const FLAKY = "cart-worker"

const regions = ["US-EAST", "US-WEST", "EU-WEST", "EU-NORTH", "AP-SOUTH"]
const regionStatus = ["QUEUED", "ROLLOUT", "LIVE"]

/** Deploys ahead of you in the queue, by ticket number. */
const queueAhead: Record<number, { release: string; who: string }> = {
  41: { release: "search-indexer v3.2", who: "Rosa Lindqvist" },
  42: { release: "auth-gateway v1.9", who: "Theo Brandt" },
  43: { release: "ledger-sync v0.8", who: "Ines Moraes" },
}
const FIRST_SERVING = 41
const FIRST_FREE = 44

type Lock = { id: string; owner: string; reason: string }
const startLocks: Lock[] = [
  { id: "mara", owner: "Mara (SRE)", reason: "Incident review open" },
  { id: "payments", owner: "Payments", reason: "Ledger migration" },
  { id: "you", owner: "You", reason: "Checking release notes" },
]

type LogEntry = { id: number; at: string; text: string }

const panel =
  "tray flex min-w-0 flex-col gap-4 rounded-(--bevel-radius-xl) p-4 sm:p-5"
const button =
  "h-9 rounded-md border bg-card px-3 text-sm font-medium outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"

function PanelHeading({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <h2 id={id} className="text-base font-semibold tracking-tight">
        {title}
      </h2>
      {children && <p className="text-sm text-muted-foreground">{children}</p>}
    </div>
  )
}

/* ------------------------------------------------------------------ app */

export function Shipyard() {
  // Deploy queue
  const [serving, setServing] = React.useState(FIRST_SERVING)
  const [ticket, setTicket] = React.useState<number | null>(null)
  const yourTurn = ticket !== null && serving >= ticket

  // Pipeline
  const [at, setAt] = React.useState<Record<string, number>>(() =>
    Object.fromEntries(services.map((s) => [s.id, 0]))
  )
  const [canaryFailing, setCanaryFailing] = React.useState(false)
  const [failedOnce, setFailedOnce] = React.useState(false)
  const atCanary = services.every((s) => at[s.id]! >= CANARY)

  // Freeze
  const [locks, setLocks] = React.useState(startLocks)
  const [cleared, setCleared] = React.useState(false)
  const frozen = locks.length > 0 || !cleared

  // Promote and rollout
  const [promoting, setPromoting] = React.useState(false)
  const [rollout, setRollout] = React.useState(() => regions.map(() => 0))
  const done = rollout.every((r) => r === 2)
  const started = rollout.some((r) => r > 0)
  const [blockedNote, setBlockedNote] = React.useState<string | null>(null)

  // Activity
  const startedAt = React.useRef(0)
  const nextId = React.useRef(3)
  const [log, setLog] = React.useState<LogEntry[]>([
    { id: 2, at: "-4m", text: "Freeze hung by Payments: ledger migration." },
    {
      id: 1,
      at: "-9m",
      text: "Mara (SRE) froze promotions during an incident review.",
    },
  ])
  const note = React.useCallback((text: string) => {
    if (!startedAt.current) startedAt.current = Date.now()
    const s = Math.round((Date.now() - startedAt.current) / 1000)
    const stamp = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
    setLog((all) =>
      [{ id: nextId.current++, at: stamp, text }, ...all].slice(0, 8)
    )
  }, [])
  React.useEffect(() => {
    startedAt.current = Date.now()
  }, [])

  /* The queue moves while you're waiting in it. */
  React.useEffect(() => {
    if (ticket === null || serving >= ticket) return
    const timer = setTimeout(() => {
      const next = serving + 1
      setServing(next)
      if (next === ticket)
        note(`Ticket ${ticket} called: ${RELEASE} starts building.`)
      else
        note(`Now deploying ${queueAhead[next]?.release ?? `ticket ${next}`}.`)
    }, 3000)
    return () => clearTimeout(timer)
  }, [serving, ticket, note])

  /* On your turn, services work their way to canary, one step at a time. */
  React.useEffect(() => {
    if (!yourTurn || atCanary || canaryFailing) return
    const timer = setTimeout(() => {
      const open = services.filter((s) => at[s.id]! < CANARY)
      const pick = open[Math.floor(Math.random() * open.length)]!
      const stage = at[pick.id]! + 1
      setAt((all) => ({ ...all, [pick.id]: stage }))
      if (stage === CANARY && pick.id === FLAKY && !failedOnce) {
        setCanaryFailing(true)
        setFailedOnce(true)
        note(`${pick.id} canary: error rate 4.1% against a 1% budget.`)
      } else if (stage === CANARY) {
        note(`${pick.id} canary healthy.`)
      }
    }, 1500)
    return () => clearTimeout(timer)
  }, [yourTurn, atCanary, canaryFailing, at, failedOnce, note])

  /* Other people's locks come off as their work wraps up. Yours is yours to remove. */
  React.useEffect(() => {
    if (!yourTurn) return
    const others = locks.filter((l) => l.id !== "you")
    if (!others.length) return
    const timer = setTimeout(() => {
      const lock = others[0]!
      setLocks((all) => all.filter((l) => l.id !== lock.id))
      note(`${lock.owner} removed their lock.`)
    }, 7000)
    return () => clearTimeout(timer)
  }, [yourTurn, locks, note])

  /* Promoted: regions go one by one, QUEUED, ROLLOUT, LIVE. */
  React.useEffect(() => {
    if (!promoting || done) return
    const timer = setTimeout(() => {
      const i = rollout.findIndex((r) => r < 2)
      const next = rollout[i]! + 1
      setRollout((all) => all.map((r, j) => (j === i ? next : r)))
      note(
        `${regions[i]}: ${next === 1 ? "rolling out" : `live on ${TO.toLowerCase()}`}.`
      )
      if (next === 2 && i === regions.length - 1) {
        setAt(Object.fromEntries(services.map((s) => [s.id, LIVE])))
        note(`${RELEASE} is live in every region.`)
      }
    }, 2200)
    return () => clearTimeout(timer)
  }, [promoting, done, rollout, note])

  /* Once everything is live, your deploy leaves the queue. */
  React.useEffect(() => {
    if (!done || ticket === null || serving > ticket) return
    const timer = setTimeout(() => setServing(ticket + 1), 2500)
    return () => clearTimeout(timer)
  }, [done, ticket, serving])

  const blocker = done
    ? "Already live in every region."
    : ticket === null
      ? "Take a number in the deploy queue first."
      : !yourTurn
        ? `Waiting in the deploy queue: ${ticket - serving} ahead of you.`
        : canaryFailing
          ? `${FLAKY} canary is failing. Roll it back first.`
          : !atCanary
            ? "Services are still building and testing."
            : locks.length
              ? `Release freeze: locked by ${locks.map((l) => l.owner).join(", ")}.`
              : !cleared
                ? "All locks are off. Lift the freeze to promote."
                : null

  /** A refused flip is called out until the reason changes. */
  const refused = blockedNote !== null && blockedNote === blocker

  const onPromote = (next: boolean) => {
    if (next && blocker) {
      setBlockedNote(blocker)
      note(`Promote blocked: ${blocker}`)
      return
    }
    if (next === promoting) return
    setPromoting(next)
    if (done) return
    note(
      next
        ? `Promoted ${RELEASE} to production.`
        : "Cover closed: rollout paused."
    )
  }

  const reset = () => {
    setServing(FIRST_SERVING)
    setTicket(null)
    setAt(Object.fromEntries(services.map((s) => [s.id, 0])))
    setCanaryFailing(false)
    setFailedOnce(false)
    setLocks(startLocks)
    setCleared(false)
    setPromoting(false)
    setRollout(regions.map(() => 0))
    setBlockedNote(null)
    startedAt.current = Date.now()
    setLog([{ id: nextId.current++, at: "0:00", text: "Board reset." }])
  }

  const releaseState = done
    ? "Live"
    : promoting
      ? "Rolling out"
      : started
        ? "Paused"
        : yourTurn
          ? atCanary && !canaryFailing
            ? "In canary"
            : "Building"
          : ticket !== null
            ? "In queue"
            : "Not queued"

  const regionLabel = (i: number) => {
    const r = rollout[i]!
    if (r === 0 && started && !promoting) return "PAUSED"
    return regionStatus[r]!
  }

  return (
    <main className="min-h-svh bg-background pb-16">
      {/* Product header */}
      <div className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <p className="flex items-center gap-2 font-semibold tracking-tight">
            <span
              aria-hidden
              className="grid size-6 place-items-center rounded-md bg-foreground text-xs text-background"
            >
              S
            </span>
            Shipyard
          </p>
          <nav
            aria-label="Shipyard"
            className="-mx-1 flex min-w-0 gap-1 overflow-x-auto text-sm"
          >
            {[
              ["Board", "#board"],
              ["Pipeline", "#pipeline"],
              ["Queue", "#queue"],
              ["Freeze", "#freeze"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="shrink-0 rounded-md px-2 py-1 text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                {label}
              </a>
            ))}
          </nav>
          <p className="ml-auto text-sm text-muted-foreground">
            Team Harbor · 6 on call
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Release summary */}
        <div className="flex flex-wrap items-end justify-between gap-4 py-6 sm:py-8">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Release</p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {RELEASE}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              4 services · 5 regions · {FROM.toLowerCase()} to{" "}
              {TO.toLowerCase()} ·{" "}
              <span className="font-medium text-foreground">
                {releaseState}
              </span>
            </p>
          </div>
          <button type="button" onClick={reset} className={button}>
            Start over
          </button>
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3 lg:items-start">
          {/* Departures board */}
          <section
            id="board"
            aria-labelledby="board-title"
            className={`${panel} lg:col-span-2`}
          >
            <PanelHeading id="board-title" title="Regions">
              {done
                ? "All regions live"
                : `${rollout.filter((r) => r === 2).length} of ${regions.length} live`}
            </PanelHeading>
            <SplitFlap
              aria-label="Region rollout board"
              className="self-center"
            >
              <SplitFlapRow
                name="Header"
                aria-hidden
                className="text-(length:--bevel-fine)"
              >
                <SplitFlapText value="REGION" length={8} />
                <SplitFlapText value="VER" length={5} />
                <SplitFlapText value="STATUS" length={7} />
              </SplitFlapRow>
              {regions.map((r, i) => (
                <SplitFlapRow key={r} name={r}>
                  <SplitFlapText value={r} length={8} />
                  <SplitFlapText
                    value={rollout[i] === 2 ? TO : FROM}
                    length={5}
                  />
                  <SplitFlapText
                    value={regionLabel(i)}
                    length={7}
                    tone="amber"
                  />
                </SplitFlapRow>
              ))}
            </SplitFlap>
          </section>

          {/* Alarms */}
          <section aria-labelledby="alarms-title" className={panel}>
            <PanelHeading id="alarms-title" title="Alarms">
              Press a lamp to acknowledge it
            </PanelHeading>
            <Annunciator aria-label="Release alarms" className="max-w-none">
              <AnnunciatorPanel className="sm:grid-cols-3 lg:grid-cols-2">
                <AnnunciatorTile
                  id="freeze"
                  tone="amber"
                  active={frozen && !done}
                >
                  Freeze active
                </AnnunciatorTile>
                <AnnunciatorTile id="canary" tone="red" active={canaryFailing}>
                  Canary failing
                </AnnunciatorTile>
                <AnnunciatorTile
                  id="errors"
                  tone="amber"
                  active={canaryFailing}
                >
                  Error rate high
                </AnnunciatorTile>
                <AnnunciatorTile
                  id="turn"
                  tone="white"
                  active={yourTurn && !done}
                >
                  Your turn
                </AnnunciatorTile>
                <AnnunciatorTile
                  id="rolling"
                  tone="green"
                  active={promoting && !done}
                >
                  Rolling out
                </AnnunciatorTile>
                <AnnunciatorTile id="live" tone="green" active={done}>
                  All regions live
                </AnnunciatorTile>
              </AnnunciatorPanel>
              <AnnunciatorAcknowledge />
            </Annunciator>
          </section>

          {/* Pipeline */}
          <section
            id="pipeline"
            aria-labelledby="pipeline-title"
            className={`${panel} lg:col-span-2`}
          >
            <PanelHeading id="pipeline-title" title="Pipeline">
              {!yourTurn
                ? "Starts when your number is called"
                : done
                  ? "Every service is live"
                  : `${services.filter((s) => at[s.id]! >= CANARY).length} of ${services.length} in canary`}
            </PanelHeading>
            <VisibleFile
              aria-label="Services by stage"
              scale={stages}
              className="max-sm:grid-cols-[7.5rem_minmax(0,1fr)] max-sm:px-2"
            >
              {services.map((s) => {
                const failing = canaryFailing && s.id === FLAKY
                return (
                  <VisibleFileRow key={s.id} title={s.id} detail={s.owner}>
                    <VisibleFileSignal
                      value={at[s.id]!}
                      label={failing ? "Failing at" : "Stage"}
                      tone={
                        failing
                          ? "red"
                          : at[s.id] === LIVE
                            ? "green"
                            : at[s.id] === CANARY
                              ? "amber"
                              : "blue"
                      }
                    />
                  </VisibleFileRow>
                )
              })}
            </VisibleFile>
            {canaryFailing && (
              <div className="flex flex-wrap items-center gap-3 rounded-md border border-destructive/40 bg-card px-3 py-2 text-sm">
                <p className="min-w-0 flex-1">
                  <span className="font-semibold text-destructive">
                    {FLAKY}
                  </span>{" "}
                  canary is at 4.1% errors. Roll it back to test and try again.
                </p>
                <button
                  type="button"
                  className={button}
                  onClick={() => {
                    setCanaryFailing(false)
                    setAt((all) => ({ ...all, [FLAKY]: CANARY - 1 }))
                    note(`${FLAKY} canary rolled back; retrying with the fix.`)
                  }}
                >
                  Roll back canary
                </button>
              </div>
            )}
          </section>

          {/* Deploy queue */}
          <section id="queue" aria-labelledby="queue-title" className={panel}>
            <PanelHeading id="queue-title" title="Deploy queue">
              One deploy at a time
            </PanelHeading>
            <TakeANumber
              aria-label="Deploy queue"
              serving={serving}
              ticket={ticket}
              className="max-w-none"
            >
              <TakeANumberSign />
              <TakeANumberDispenser
                onClick={() => {
                  setTicket(FIRST_FREE)
                  note(`You took ticket ${FIRST_FREE} for ${RELEASE}.`)
                }}
              />
              <TakeANumberStatus />
            </TakeANumber>
            <ol
              aria-label="Queue"
              className="divide-y rounded-md border bg-card text-sm"
            >
              {[41, 42, 43, 44].map((n) => {
                const mine = n === FIRST_FREE
                if (mine && ticket === null) return null
                const item = mine
                  ? { release: RELEASE, who: "You" }
                  : queueAhead[n]!
                const state =
                  n < serving
                    ? "Shipped"
                    : n === serving
                      ? "Deploying"
                      : "Waiting"
                return (
                  <li key={n} className="flex items-center gap-3 px-3 py-2">
                    <span className="w-6 font-mono text-muted-foreground tabular-nums">
                      {n}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate ${mine ? "font-semibold" : ""}`}
                      >
                        {item.release}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.who}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 text-xs ${state === "Deploying" ? "font-semibold" : "text-muted-foreground"}`}
                    >
                      {state}
                    </span>
                  </li>
                )
              })}
            </ol>
          </section>

          {/* Freeze */}
          <section
            id="freeze"
            aria-labelledby="freeze-title"
            className={`${panel} lg:col-span-2`}
          >
            <PanelHeading id="freeze-title" title="Release freeze">
              Nothing promotes until every lock is off
            </PanelHeading>
            <Lockout
              aria-label="Release freeze"
              className="max-w-none self-center"
            >
              <LockoutHasp>
                {locks.map((l) => (
                  <LockoutLock
                    key={l.id}
                    id={l.id}
                    owner={l.owner}
                    reason={l.reason}
                    onRemove={
                      l.id === "you"
                        ? () => {
                            setLocks((all) => all.filter((x) => x.id !== "you"))
                            note("You removed your lock.")
                          }
                        : undefined
                    }
                  />
                ))}
              </LockoutHasp>
              <LockoutAction
                onClick={() => {
                  if (cleared) return
                  setCleared(true)
                  note("Freeze lifted. Promotion is open.")
                }}
              >
                {cleared ? "Freeze lifted" : "Lift the freeze"}
              </LockoutAction>
            </Lockout>
          </section>

          {/* Promote */}
          <section aria-labelledby="promote-title" className={panel}>
            <PanelHeading id="promote-title" title="Promote" />
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start lg:flex-col lg:items-center">
              <GuardedSwitch
                checked={promoting}
                onCheckedChange={onPromote}
                autoClose={false}
                className="shrink-0"
              >
                <GuardedSwitchLabel>Promote to prod</GuardedSwitchLabel>
                <GuardedSwitchControl />
                <GuardedSwitchStatus />
              </GuardedSwitch>
              <div className="flex min-w-0 flex-col gap-2 text-sm">
                <p
                  className={
                    refused
                      ? "font-medium text-destructive"
                      : "text-muted-foreground"
                  }
                >
                  {refused
                    ? `Blocked. ${blocker}`
                    : done
                      ? "Shipped to every region. Close the cover when you're done."
                      : blocker
                        ? `Not ready. ${blocker}`
                        : promoting
                          ? "Rolling out region by region. Close the cover to pause."
                          : started
                            ? "Paused. Lift the cover and flip to resume."
                            : "Ready. Lift the cover, then flip the switch."}
                </p>
              </div>
            </div>
          </section>

          {/* Activity */}
          <section
            aria-labelledby="activity-title"
            className={`${panel} lg:col-span-3`}
          >
            <PanelHeading id="activity-title" title="Activity" />
            <ol className="flex flex-col gap-1.5 text-sm">
              {log.map((e) => (
                <li key={e.id} className="flex gap-3">
                  <span className="w-10 shrink-0 font-mono text-xs leading-5 text-muted-foreground tabular-nums">
                    {e.at}
                  </span>
                  <span className="min-w-0">{e.text}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </main>
  )
}
