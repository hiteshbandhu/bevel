"use client"

import * as React from "react"
import {
  Annunciator,
  AnnunciatorAcknowledge,
  AnnunciatorPanel,
  AnnunciatorTile,
} from "@workspace/ui/components/annunciator"
import {
  EngineTelegraph,
  EngineTelegraphDial,
  EngineTelegraphOrder,
  EngineTelegraphOrders,
  EngineTelegraphStatus,
} from "@workspace/ui/components/engine-telegraph"
import {
  GuardedSwitch,
  GuardedSwitchControl,
  GuardedSwitchLabel,
  GuardedSwitchStatus,
} from "@workspace/ui/components/guarded-switch"
import {
  Mixer,
  MixerStrip,
  MixerStripFader,
  MixerStripMute,
  MixerStripName,
  MixerStripSolo,
} from "@workspace/ui/components/mixer-strip"
import { PushToTalk, PushToTalkKey, PushToTalkStatus } from "@workspace/ui/components/push-to-talk"
import {
  TaskPlan,
  TaskPlanHeader,
  TaskPlanProgress,
  TaskPlanStep,
  TaskPlanSteps,
  TaskPlanTitle,
} from "@workspace/ui/components/task-plan"
import { Vigilance, VigilanceButton, VigilanceLamps, VigilanceTimer } from "@workspace/ui/components/vigilance"
import { cn } from "@workspace/ui/lib/utils"
import { Legend, PanelKey, Screws, StatusStrip } from "../shared/environment"
import { consoleFace } from "../shared/fonts"
import { baseSeconds, channelOf, currentIndex, initialRun, runReducer, voiceNotes, type Phase } from "./run"

type Autonomy = "stop" | "plan" | "ask" | "act" | "auto"

const autonomyMeaning: Record<Autonomy, string> = {
  stop: "The agent holds where it is and changes nothing.",
  plan: "The agent reads and plans, but holds before changing any files.",
  ask: "The agent asks you before each step that changes files or runs tests.",
  act: "The agent works through the plan on its own. Merging is still yours.",
  auto: "The agent works faster and doesn't stop to explain. Merging is still yours.",
}

type Channel = { name: string; share: number; by: string; muted: boolean }

const startChannels: Channel[] = [
  { name: "Explore", share: 70, by: "Lead", muted: false },
  { name: "Code", share: 40, by: "Lead", muted: false },
  { name: "Tests", share: 20, by: "Lead", muted: false },
  { name: "Docs", share: 15, by: "Lead", muted: false },
]

/** Effort above this, summed across subagents, is over the run's budget. */
const BUDGET = 220
const CHECK_IN_MS = 30000
const SUPERVISOR = "Mara Okafor"

const needsApproval = (phase: Phase) => phase === "code" || phase === "tests" || phase === "you"

/** Relay: one person supervising a coding agent and its subagents through a run. */
export function RelayApp() {
  // A new run starts everything over.
  const [runKey, setRunKey] = React.useState(0)
  return <RelayRun key={runKey} onNewRun={() => setRunKey((k) => k + 1)} />
}

function RelayRun({ onNewRun }: { onNewRun: () => void }) {
  const [run, dispatch] = React.useReducer(runReducer, initialRun)
  const [order, setOrder] = React.useState<Autonomy>("ask")
  const [autonomy, setAutonomy] = React.useState<Autonomy>("ask")
  const [paused, setPaused] = React.useState(false)
  const [channels, setChannels] = React.useState(startChannels)
  const [solo, setSolo] = React.useState<string | null>(null)
  const [talking, setTalking] = React.useState(false)
  const [seconds, setSeconds] = React.useState(0)
  const [voiceLog, setVoiceLog] = React.useState<string[]>([])
  const [shipNote, setShipNote] = React.useState("")

  const at = currentIndex(run)
  const step = run.steps[at]
  const done = run.steps.filter((s) => s.status === "done").length
  const channelName = step ? channelOf[step.phase] : null
  const channel = channels.find((c) => c.name === channelName)
  const isRunning = (c: Channel) => !c.muted && (solo === null || solo === c.name) && !paused
  const totalEffort = channels.reduce((sum, c) => sum + (c.muted ? 0 : c.share), 0)

  // Why the agent isn't working on the current step, if it isn't.
  const hold = (() => {
    if (run.shipped) return "Merged."
    if (!step) return "Nothing left in the plan."
    if (paused) return "Paused: nobody checked in."
    if (autonomy === "stop") return "Holding: autonomy is at Stop."
    if (step.phase === "ship") return run.testsFailing ? "Holding: tests are failing." : "Waiting for you to merge."
    if (autonomy === "plan" && step.phase !== "research") return "Holding: autonomy is at Plan, so no file changes."
    if (channel && channel.muted) return `Holding: ${channel.name} is muted.`
    if (channel && solo !== null && solo !== channel.name) return `Holding: ${solo} is soloed, so ${channel.name} waits.`
    if (autonomy === "ask" && needsApproval(step.phase) && !step.approved) return "Waiting for your approval."
    return null
  })()
  const working = hold === null
  const awaitingApproval = hold === "Waiting for your approval."
  const readyToShip = !!step && step.phase === "ship" && !run.testsFailing && !paused && autonomy !== "stop"

  /* The agent answers an order once it's between actions. Stop is always answered; others wait out a pause. */
  React.useEffect(() => {
    if (order === autonomy) return
    if (paused && order !== "stop") return
    const timer = setTimeout(() => setAutonomy(order), order === "stop" ? 900 : 1800)
    return () => clearTimeout(timer)
  }, [order, autonomy, paused])

  /* Work the current step. More effort on its subagent, sooner it's done. */
  const pace = React.useRef(1)
  const share = channel?.share ?? 50
  pace.current = Math.min(3, Math.max(0.5, 55 / Math.max(share, 5))) * (autonomy === "auto" ? 0.65 : 1)
  const phase = step?.phase
  React.useEffect(() => {
    if (!working || !phase) return
    const tick = 500
    const timer = setInterval(() => {
      dispatch({ type: "advance", amount: tick / (baseSeconds[phase] * 1000 * pace.current) })
    }, tick)
    return () => clearInterval(timer)
  }, [working, phase])

  /* The lead agent rebalances toward what the plan needs now and next. Faders you took stay yours. */
  const nextPhase = run.steps.find((s, j) => j > at && s.status === "pending")?.phase
  const leadActive = !paused && autonomy !== "stop" && !run.shipped
  React.useEffect(() => {
    if (!leadActive) return
    const now = phase ? channelOf[phase] : null
    const next = nextPhase ? channelOf[nextPhase] : null
    const rebalance = () =>
      setChannels((all) =>
        all.map((c) => {
          if (c.by !== "Lead") return c
          const target = c.name === now ? 70 : c.name === next ? 40 : 15
          const jitter = Math.round((Math.random() - 0.5) * 2) * 5
          const share = Math.min(100, Math.max(5, target + jitter))
          return share === c.share ? c : { ...c, share }
        })
      )
    rebalance()
    const timer = setInterval(rebalance, 3200)
    return () => clearInterval(timer)
  }, [leadActive, phase, nextPhase])

  /* Push to talk: time the hold, and turn what you said into an instruction in the plan. */
  const heldSince = React.useRef(0)
  const onTalkingChange = (next: boolean) => {
    setTalking(next)
    if (next) {
      heldSince.current = Date.now()
      return
    }
    const held = (Date.now() - heldSince.current) / 1000
    if (held < 0.6) {
      setVoiceLog((log) => [...log.slice(-2), "Too short to hear. Hold the key while you speak."])
      return
    }
    const text = voiceNotes[run.notes % voiceNotes.length]!
    dispatch({ type: "note", text })
    setVoiceLog((log) => [...log.slice(-2), `${held.toFixed(1)}s: “${text}”, added to the plan`])
  }
  React.useEffect(() => {
    if (!talking) return
    const started = Date.now()
    const timer = setInterval(() => setSeconds((Date.now() - started) / 1000), 100)
    return () => {
      clearInterval(timer)
      setSeconds(0)
    }
  }, [talking])

  /* The dead man's switch counts only while the agent could act. Coming back from Stop starts a fresh window. */
  const supervised = !run.shipped && autonomy !== "stop"
  const [window_, setWindow] = React.useState(0)
  const wasSupervised = React.useRef(supervised)
  React.useEffect(() => {
    if (supervised && !wasSupervised.current) setWindow((w) => w + 1)
    wasSupervised.current = supervised
  }, [supervised])
  const onTrip = React.useCallback(() => setPaused(true), [])
  const onResume = React.useCallback(() => setPaused(false), [])

  const onShip = (on: boolean) => {
    if (!on || run.shipped) return
    if (readyToShip) {
      dispatch({ type: "ship" })
      setShipNote("")
      return
    }
    setShipNote(`Not merged. ${shipBlock}`)
  }
  const shipBlock = run.shipped
    ? `Merged into main by ${SUPERVISOR}.`
    : run.testsFailing
      ? "Blocked: tests are failing."
      : paused
        ? "Blocked: the run is paused."
        : autonomy === "stop"
          ? "Blocked: autonomy is at Stop."
          : step?.phase !== "ship"
            ? `Blocked: the plan isn't finished (${done} of ${run.steps.length} done).`
            : "Ready. Lift the cover and flip the switch to merge #482."

  // A refusal note is about the moment you tried; drop it once things change.
  React.useEffect(() => setShipNote(""), [shipBlock])

  const runStatus = run.shipped
    ? "Shipped"
    : paused
      ? "Paused"
      : working
        ? "Running"
        : awaitingApproval || step?.phase === "ship"
          ? "Waiting for you"
          : "Holding"

  return (
    <div
      className={cn(
        consoleFace.variable,
        "relay-room min-h-svh bg-[#27313B] font-[family-name:var(--font-console)] text-[#E3E8EC]",
        // The room is lit from above; the console catches most of it.
        "bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgb(255_255_255/0.09),transparent_70%)]",
        "[--foreground:#E9EDF0] [--muted-foreground:#A3ADB5] [--legend:#B9C2C9]"
      )}
    >
      <header className="mx-auto flex max-w-[1360px] flex-wrap items-baseline gap-x-6 gap-y-1 px-4 pt-5 pb-4 sm:px-8">
        <p className="text-2xl font-bold tracking-wide">Relay</p>
        <p className="text-lg text-[#A3ADB5]">Run 1184 on tidewater/gateway, {runStatus.toLowerCase()}</p>
        <p className="ml-auto text-lg text-[#A3ADB5]">{SUPERVISOR} on duty</p>
      </header>

      <main className="mx-auto max-w-[1360px] px-2 pb-10 sm:px-8">
        {/* The console: one slab of gunmetal, everything mounted in it. */}
        <div className="bevel-metal relative rounded-[28px] p-4 shadow-(--bevel-depth-object) [--bevel-material:#4E565E] [--bevel-material-edge:#2C3238] sm:p-8 lg:p-10">
          <Screws inset="4" />

          <div className="grid gap-x-10 gap-y-9 lg:grid-cols-12 [&>*]:min-w-0">
            {/* Name plate and the status strip. */}
            <div className="flex flex-col gap-4 lg:col-span-12 lg:flex-row lg:items-stretch">
              <h1 className="bevel-metal relative rounded-(--bevel-radius-sm) px-6 py-3 text-[26px] leading-tight font-bold tracking-wide text-[#3A2E10] shadow-(--bevel-depth-raised) [--bevel-material:#CDB06A] [--bevel-material-edge:#8C7536] [text-shadow:0_1px_0_rgb(255_255_255/0.35)] lg:w-[46%]">
                Fix burst 429s in the rate limiter
              </h1>
              <StatusStrip className="flex-1 self-center lg:self-stretch lg:py-0 lg:[&>p]:leading-[52px]">
                {hold ?? `Working: ${step?.text ?? "plan complete"}.`}
              </StatusStrip>
            </div>

            {/* The lamps run the width of the console. */}
            <section aria-labelledby="relay-alerts" className="flex flex-col gap-3 lg:col-span-12">
              <Legend id="relay-alerts">Alerts</Legend>
              <Annunciator aria-label="Run alerts" className="max-w-none flex-row items-center gap-4 p-3">
                <AnnunciatorPanel className="flex-1 grid-cols-3 sm:grid-cols-6">
                  <AnnunciatorTile id="paused" tone="red" active={paused}>
                    Run paused
                  </AnnunciatorTile>
                  <AnnunciatorTile id="budget" tone="red" active={!paused && totalEffort > BUDGET}>
                    Over budget
                  </AnnunciatorTile>
                  <AnnunciatorTile id="tests" tone="amber" active={run.testsFailing}>
                    Tests failing
                  </AnnunciatorTile>
                  <AnnunciatorTile id="hold" tone="amber" active={!paused && !run.shipped && !working && !awaitingApproval && step?.phase !== "ship"}>
                    Agent holding
                  </AnnunciatorTile>
                  <AnnunciatorTile id="approval" tone="white" active={awaitingApproval}>
                    Needs approval
                  </AnnunciatorTile>
                  <AnnunciatorTile id="ship" tone="green" active={readyToShip}>
                    Ready to merge
                  </AnnunciatorTile>
                </AnnunciatorPanel>
                <AnnunciatorAcknowledge className="hidden self-auto sm:flex" />
              </Annunciator>
            </section>

            {/* The plan, clipped to the console. */}
            <section aria-labelledby="relay-plan" className="flex flex-col gap-3 lg:col-span-4">
              <Legend id="relay-plan">Plan</Legend>
              <div className="relative pt-4">
                <span aria-hidden className="bevel-metal absolute top-0 left-1/2 z-10 h-7 w-28 -translate-x-1/2 rounded-(--bevel-radius-sm) [--bevel-material:#9AA3AA]" />
                <TaskPlan className="max-w-none">
                  <TaskPlanHeader>
                    <TaskPlanTitle>Issue #217</TaskPlanTitle>
                    <TaskPlanProgress value={done} max={run.steps.length} />
                  </TaskPlanHeader>
                  <TaskPlanSteps>
                    {run.steps.map((s) => (
                      <TaskPlanStep key={s.id} status={s.status}>
                        {s.text}
                      </TaskPlanStep>
                    ))}
                  </TaskPlanSteps>
                </TaskPlan>
              </div>
            </section>

            {/* The hero: the order telegraph. */}
            <section aria-labelledby="relay-autonomy" className="flex flex-col items-center gap-3 lg:col-span-5">
              <Legend id="relay-autonomy" className="self-start lg:self-center">
                Autonomy
              </Legend>
              <EngineTelegraph
                aria-label="Agent autonomy"
                value={order}
                onValueChange={(v) => setOrder(v as Autonomy)}
                confirmed={autonomy}
                className="max-w-[460px]"
              >
                <EngineTelegraphDial />
                <EngineTelegraphOrders>
                  <EngineTelegraphOrder value="stop">Stop</EngineTelegraphOrder>
                  <EngineTelegraphOrder value="plan">Plan</EngineTelegraphOrder>
                  <EngineTelegraphOrder value="ask">Ask</EngineTelegraphOrder>
                  <EngineTelegraphOrder value="act">Act</EngineTelegraphOrder>
                  <EngineTelegraphOrder value="auto">Auto</EngineTelegraphOrder>
                </EngineTelegraphOrders>
                <EngineTelegraphStatus className="text-base" />
              </EngineTelegraph>
              <p className="max-w-[46ch] text-center text-[17px] text-[#A3ADB5]">{autonomyMeaning[autonomy]}</p>
            </section>

            {/* Check in, approve, merge. */}
            <div className="grid content-start gap-9 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-1">
              <section aria-labelledby="relay-checkin" className="flex flex-col gap-3">
                <Legend id="relay-checkin">Check in every {CHECK_IN_MS / 1000}s</Legend>
                <Vigilance
                  key={window_}
                  aria-label="Supervision"
                  interval={CHECK_IN_MS}
                  running={supervised}
                  onTrip={onTrip}
                  onResume={onResume}
                  className="max-w-full"
                >
                  <VigilanceLamps />
                  <VigilanceTimer />
                  <VigilanceButton />
                </Vigilance>
              </section>
              <section aria-labelledby="relay-merge" className="flex flex-col items-start gap-3">
                <Legend id="relay-merge">Merge #482</Legend>
                <div className="flex items-end gap-5">
                  <GuardedSwitch
                    checked={run.shipped}
                    onCheckedChange={onShip}
                    safeOnClose={!run.shipped}
                    aria-describedby="relay-merge-why"
                  >
                    <GuardedSwitchLabel>Merge</GuardedSwitchLabel>
                    <GuardedSwitchControl />
                    <GuardedSwitchStatus />
                  </GuardedSwitch>
                  <div className="flex flex-col gap-3 pb-1">
                    {awaitingApproval && (
                      <PanelKey tone="go" onClick={() => dispatch({ type: "approve" })}>
                        Approve step
                      </PanelKey>
                    )}
                    {run.shipped && <PanelKey onClick={onNewRun}>New run</PanelKey>}
                  </div>
                </div>
                <p id="relay-merge-why" className="text-[17px] leading-snug text-[#A3ADB5]">
                  {shipNote && !run.shipped ? shipNote : shipBlock}
                </p>
              </section>
            </div>

            {/* The desk: subagent faders, and the talk key beside them. */}
            <section aria-labelledby="relay-subagents" className="flex min-w-0 flex-col gap-3 lg:col-span-8">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <Legend id="relay-subagents">Subagents</Legend>
                <p className="text-[17px] text-[#A3ADB5]">
                  {paused ? "All paused" : `Effort ${totalEffort} of ${BUDGET}`}
                  {channels.some((c) => c.by === "You") && (
                    <button
                      type="button"
                      onClick={() => setChannels((all) => all.map((c) => ({ ...c, by: "Lead" })))}
                      className="ml-4 rounded-sm underline underline-offset-4 outline-none hover:text-[#E9EDF0] focus-visible:ring-2 focus-visible:ring-[#E9D28A]"
                    >
                      Hand back to the lead
                    </button>
                  )}
                </p>
              </div>
              <div className="rounded-(--bevel-radius-md) bg-[#3B4248] p-3 shadow-(--bevel-depth-recessed)">
                <Mixer aria-label="Subagent effort" className="justify-between sm:justify-around">
                  {channels.map((c) => (
                    <MixerStrip key={c.name} name={c.name} muted={!isRunning(c)} className="w-[4.5rem] sm:w-24">
                      <MixerStripName />
                      <MixerStripMute
                        pressed={c.muted}
                        onPressedChange={(muted) =>
                          setChannels((all) => all.map((x) => (x.name === c.name ? { ...x, muted } : x)))
                        }
                      />
                      <MixerStripSolo pressed={solo === c.name} onPressedChange={(on) => setSolo(on ? c.name : null)} />
                      <MixerStripFader
                        value={c.share}
                        changedBy={c.by}
                        format={(v) => `${v}%`}
                        onValueChange={(share) =>
                          setChannels((all) => all.map((x) => (x.name === c.name ? { ...x, share, by: "You" } : x)))
                        }
                      />
                    </MixerStrip>
                  ))}
                </Mixer>
              </div>
            </section>

            <section aria-labelledby="relay-talk" className="flex flex-col gap-3 lg:col-span-4">
              <Legend id="relay-talk">Talk to the agent</Legend>
              <div className="flex flex-wrap items-start gap-6">
                <PushToTalk talking={talking} onTalkingChange={onTalkingChange} disabled={run.shipped}>
                  <PushToTalkKey>Hold to talk</PushToTalkKey>
                  <PushToTalkStatus idle={run.shipped ? "Run finished" : "Hold Space, or the key"} />
                  <span aria-hidden className="h-4 text-sm tabular-nums opacity-70">
                    {talking ? `${seconds.toFixed(1)}s` : ""}
                  </span>
                </PushToTalk>
                <ul aria-label="Voice notes" className="flex min-w-0 flex-1 flex-col gap-2 text-[17px] leading-snug text-[#A3ADB5]">
                  {voiceLog.length ? voiceLog.map((line, i) => <li key={i}>{line}</li>) : <li>Your instructions join the plan as the next step.</li>}
                </ul>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
