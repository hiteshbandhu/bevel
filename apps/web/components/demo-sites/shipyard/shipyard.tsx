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
import { cn } from "@workspace/ui/lib/utils"
import { Legend, PanelKey, Screw, Screws, StatusStrip } from "../shared/environment"
import { signFace } from "../shared/fonts"

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

/** Board columns: what they're called on the housing, and how many flaps. */
const columns = [
  { label: "Region", length: 8, hideOnPhone: false },
  { label: "Version", length: 5, hideOnPhone: true },
  { label: "Status", length: 7, hideOnPhone: false },
]

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

/** Keys on the light steel desk are moulded darker, so their legends read. */
const deskKey = "[--bevel-material:#2F363A]"

const FIRST_NEWS = "Mara (SRE) froze promotions during an incident review."

/* ------------------------------------------------------------ environment */

/** Lettering painted on the hall wall. */
function WallSign({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "text-[22px] leading-none font-extrabold text-[#EEF2EC] [text-shadow:0_1px_0_rgb(0_0_0/0.35)]",
        className
      )}
      {...props}
    />
  )
}

/** An engraved label plate screwed to the desk: white letters cut through black. */
function DeskLegend({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <Legend
      className={cn(
        "inline-block self-start rounded-[3px] bg-[#1E2427] px-3 py-1.5 shadow-(--bevel-depth-raised)",
        className
      )}
      {...props}
    />
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

  // The latest event, shown on the strip under the board.
  const [news, setNews] = React.useState(FIRST_NEWS)
  const note = React.useCallback((text: string) => setNews(text), [])

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

  const rollBack = () => {
    setCanaryFailing(false)
    setAt((all) => ({ ...all, [FLAKY]: CANARY - 1 }))
    note(`${FLAKY} canary rolled back; retrying with the fix.`)
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
    setNews("Board reset.")
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

  const promoteLine = refused
    ? `Blocked. ${blocker}`
    : done
      ? "Shipped to every region. Close the cover when you're done."
      : blocker
        ? `Not ready. ${blocker}`
        : promoting
          ? "Rolling out region by region. Close the cover to pause."
          : started
            ? "Paused. Lift the cover and flip to resume."
            : "Ready. Lift the cover, then flip the switch."

  return (
    <div
      className={cn(
        signFace.variable,
        "min-h-svh overflow-x-clip bg-[#3F4F48] font-[family-name:var(--font-sign)] text-[#EEF2EC]",
        // The hall is lit from above; the board catches most of it.
        "bg-[radial-gradient(ellipse_75%_45%_at_50%_0%,rgb(255_255_255/0.11),transparent_72%)]",
        "[--foreground:#EEF2EC] [--muted-foreground:#B5C2BB] [--legend:#E8ECEA]"
      )}
    >
      {/* ------------------------------------------------ the wall */}
      <main className="mx-auto max-w-[1360px] px-4 sm:px-8">
        <header className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-7 pb-8 sm:pt-9">
          {/* An enamel station sign. */}
          <p className="rounded-[6px] bg-[#1D3B5C] px-4 py-2 text-[22px] leading-none font-extrabold text-[#F4F6F2] shadow-(--bevel-depth-raised) ring-2 ring-[#F4F6F2]/85 ring-inset">
            Shipyard
          </p>
          <h1 className="min-w-0 text-[24px] leading-tight font-semibold text-[#EEF2EC] sm:text-[28px]">
            {RELEASE} to 5 regions
          </h1>
          <p className="flex items-center gap-2.5 text-[20px] font-semibold text-[#B5C2BB] sm:ml-auto">
            <span
              aria-hidden
              className={cn(
                "size-2.5 rounded-full",
                done || promoting
                  ? "bg-[#7FE3A4] shadow-[0_0_8px_rgb(127_227_164/0.7)]"
                  : canaryFailing
                    ? "bg-[#FF7A6B] shadow-[0_0_8px_rgb(255_122_107/0.7)]"
                    : "bg-[#E8C46A] shadow-[0_0_8px_rgb(232_196_106/0.6)]"
              )}
            />
            {releaseState}
          </p>
        </header>

        {/* The departures board: the hero, centred on the wall. */}
        <section
          aria-labelledby="shipyard-board"
          className="flex flex-col items-center gap-4"
        >
          <WallSign
            id="shipyard-board"
            className="text-[26px] sm:text-[32px]"
          >
            Departures
          </WallSign>
          <div className="relative max-w-full">
            {/* Wall brackets holding the housing. */}
            {["top-[18%]", "bottom-[18%]"].map((y) => (
              <React.Fragment key={y}>
                <span
                  aria-hidden
                  className={cn(
                    "bevel-metal absolute -left-7 hidden h-12 w-9 rounded-l-[4px] shadow-(--bevel-depth-raised) [--bevel-material:#6F787D] lg:block",
                    y
                  )}
                >
                  <Screw className="top-1/2 left-2 -translate-y-1/2" angle={40} />
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "bevel-metal absolute -right-7 hidden h-12 w-9 rounded-r-[4px] shadow-(--bevel-depth-raised) [--bevel-material:#6F787D] lg:block",
                    y
                  )}
                >
                  <Screw className="top-1/2 right-2 -translate-y-1/2" angle={110} />
                </span>
              </React.Fragment>
            ))}
            <div className="relative text-[15px] sm:text-[24px] md:text-[30px] lg:text-[38px] xl:text-[44px]">
              <SplitFlap
                aria-label="Region rollout board"
                className="p-[0.4em] pt-[0.3em]"
              >
                {/* Column heads, printed on the housing. */}
                <li
                  aria-hidden
                  className="flex gap-3 pb-[0.1em] text-[#C9CFD3]"
                >
                  {columns.map((c) => (
                    <span
                      key={c.label}
                      className={cn("shrink-0", c.hideOnPhone && "max-sm:hidden")}
                      style={{
                        width: `calc(${c.length} * (var(--split-flap-cell-width) + 1px) - 1px)`,
                      }}
                    >
                      <span className="block font-[family-name:var(--font-sign)] text-[max(0.36em,12px)] font-semibold">
                        {c.label}
                      </span>
                    </span>
                  ))}
                </li>
                {regions.map((r, i) => (
                  <SplitFlapRow key={r} name={r}>
                    <SplitFlapText value={r} length={8} />
                    {/* On a phone the board drops the version column to keep status in view. */}
                    <SplitFlapText
                      value={rollout[i] === 2 ? TO : FROM}
                      length={5}
                      className="max-sm:hidden"
                    />
                    <SplitFlapText
                      value={regionLabel(i)}
                      length={7}
                      tone="amber"
                    />
                  </SplitFlapRow>
                ))}
              </SplitFlap>
            </div>
            {/* The news strip under the board: the latest thing that happened. */}
            <StatusStrip className="mt-3">{news}</StatusStrip>
          </div>
        </section>

        {/* Below the board: the Kardex and the alarm panel, hung on the wall. */}
        <div className="mt-12 grid gap-10 pb-12 lg:grid-cols-[3fr_2fr] lg:gap-12 [&>*]:min-w-0">
          <section
            aria-labelledby="shipyard-pipeline"
            className="flex flex-col gap-4"
          >
            <WallSign id="shipyard-pipeline">Pipeline</WallSign>
            <VisibleFile
              aria-label="Services by stage"
              scale={stages}
              className="max-sm:grid-cols-[7.5rem_minmax(0,1fr)] max-sm:px-2 [&_[data-slot=visible-file-row]_span]:text-[15px]"
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
          </section>

          <section
            aria-labelledby="shipyard-alarms"
            className="flex flex-col gap-4"
          >
            <WallSign id="shipyard-alarms">Alarms</WallSign>
            <Annunciator aria-label="Release alarms" className="max-w-none">
              <AnnunciatorPanel className="grid-cols-2 sm:grid-cols-3">
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
        </div>
      </main>

      {/* ------------------------------------------------ the desk ledge */}
      <div className="mx-auto max-w-[1440px] sm:px-4">
        <div
          className={cn(
            "relative text-[#15191B] [--foreground:#15191B] [--muted-foreground:#283034] [--legend:#E8ECEA]"
          )}
        >
          {/* The raised front lip, catching the light. */}
          <span
            aria-hidden
            className="bevel-metal absolute inset-x-0 top-0 z-10 h-3 rounded-t-[10px] shadow-(--bevel-depth-raised) [--bevel-material:#A9B1B5] sm:rounded-t-[14px]"
          />
          <div className="bevel-metal relative rounded-t-[10px] px-4 pt-10 pb-10 shadow-(--bevel-depth-object) [--bevel-material:#8E979C] [--bevel-material-edge:#5C6468] sm:rounded-t-[14px] sm:px-10 lg:px-12">
            <Screws inset="4" />
            <div className="grid gap-y-10 lg:grid-cols-[1fr_1.35fr_1fr] [&>*]:min-w-0">
              {/* Take a number. */}
              <section
                aria-labelledby="shipyard-queue"
                className="flex flex-col gap-5 lg:pr-10"
              >
                <DeskLegend id="shipyard-queue">Deploy queue</DeskLegend>
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
                  <TakeANumberStatus className="text-[16px] text-[#283034]" />
                </TakeANumber>
              </section>

              {/* The freeze: a hasp bolted to the desk front. */}
              <section
                aria-labelledby="shipyard-freeze"
                className="flex flex-col gap-5 border-[#5C6468]/60 pt-10 max-lg:border-t lg:border-x lg:px-10 lg:pt-0"
              >
                <DeskLegend id="shipyard-freeze">Freeze</DeskLegend>
                <Lockout
                  aria-label="Release freeze"
                  className="max-w-none [&_[role=status]]:text-[15px] [&_[role=status]]:text-[#283034]"
                >
                  <div className="relative">
                    <Screw className="top-0.5 left-1 z-20" angle={15} />
                    <Screw className="top-0.5 right-1 z-20" angle={95} />
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
                                  setLocks((all) =>
                                    all.filter((x) => x.id !== "you")
                                  )
                                  note("You removed your lock.")
                                }
                              : undefined
                          }
                        />
                      ))}
                    </LockoutHasp>
                  </div>
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

              {/* Promote, and the keys beside it. */}
              <section
                aria-labelledby="shipyard-promote"
                className="flex flex-col gap-5 border-[#5C6468]/60 pt-10 max-lg:border-t lg:pt-0 lg:pl-10"
              >
                <DeskLegend id="shipyard-promote">Promote</DeskLegend>
                <div className="flex flex-wrap items-start gap-x-6 gap-y-5">
                  <GuardedSwitch
                    checked={promoting}
                    onCheckedChange={onPromote}
                    autoClose={false}
                    aria-describedby="shipyard-promote-why"
                    className="shrink-0"
                  >
                    <GuardedSwitchLabel>Promote to prod</GuardedSwitchLabel>
                    <GuardedSwitchControl />
                    <GuardedSwitchStatus />
                  </GuardedSwitch>
                  <div className="flex min-w-0 flex-1 basis-40 flex-col gap-4">
                    <p
                      id="shipyard-promote-why"
                      className={cn(
                        "text-[17px] leading-snug",
                        refused
                          ? "font-semibold text-[#8E1A12]"
                          : "text-[#15191B]"
                      )}
                    >
                      {promoteLine}
                    </p>
                    <div className="flex flex-col items-start gap-3">
                      <PanelKey
                        tone={canaryFailing ? "go" : "plain"}
                        className={deskKey}
                        disabled={!canaryFailing}
                        onClick={rollBack}
                      >
                        Roll back canary
                      </PanelKey>
                      <PanelKey className={deskKey} onClick={reset}>Start over</PanelKey>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
          {/* The desk's front face. */}
          <span
            aria-hidden
            className="bevel-metal block h-5 [--bevel-material:#5C6468]"
          />
        </div>
      </div>
    </div>
  )
}
