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
import { Panel } from "./panel"
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

const statusDot: Record<string, string> = {
  Running: "bg-emerald-500",
  Shipped: "bg-emerald-500",
  Paused: "bg-red-500",
  "Waiting for you": "bg-amber-500",
  Holding: "bg-muted-foreground",
}

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
    <div className="min-h-svh bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <p className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span aria-hidden className="grid size-7 place-items-center rounded-md bg-foreground text-sm text-background">
              R
            </span>
            Relay
          </p>
          <nav aria-label="Relay" className="order-last w-full overflow-x-auto sm:order-none sm:w-auto">
            <ul className="flex gap-1 text-sm">
              {["Runs", "Agents", "Repositories", "Settings"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    aria-current={item === "Runs" ? "page" : undefined}
                    onClick={(event) => event.preventDefault()}
                    className="block rounded-md px-2.5 py-1.5 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:bg-muted aria-[current=page]:font-medium aria-[current=page]:text-foreground"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <p className="ml-auto text-sm text-muted-foreground">
            Supervising as <span className="font-medium text-foreground">{SUPERVISOR}</span>
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-sm break-all text-muted-foreground">tidewater/gateway · run 1184</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Fix burst 429s in the rate limiter</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm">
              <span
                aria-hidden
                className={cn("size-2 rounded-full", statusDot[runStatus])}
              />
              Status: <span className="font-medium">{runStatus}</span>
            </p>
            {run.shipped && (
              <button
                type="button"
                onClick={onNewRun}
                className="h-9 rounded-md border bg-card px-3 text-sm font-medium outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
              >
                Start a new run
              </button>
            )}
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Now: {step ? step.text : "Plan complete"}. {hold ?? "Working."}
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-6">
            <Panel
              title="Plan"
              description="The lead agent's plan. Your instructions join it as you give them."
              trayClassName="p-0 sm:p-0 overflow-hidden"
              footer={
                awaitingApproval ? (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span>The agent wants to start this step.</span>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "approve" })}
                      className="h-9 rounded-md bg-foreground px-3 text-sm font-medium text-background outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                    >
                      Approve step
                    </button>
                  </div>
                ) : (
                  hold ?? `Working on it with ${channel?.name ?? "the lead"}.`
                )
              }
            >
              <TaskPlan className="max-w-none rounded-none">
                <TaskPlanHeader>
                  <TaskPlanTitle>Fix burst 429s (#217)</TaskPlanTitle>
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
            </Panel>

            <Panel
              title="Talk to the agent"
              description="Hold the key, or hold Space, and say what you want. It becomes the next step."
              footer={
                voiceLog.length ? (
                  <ul aria-label="Voice notes" className="flex flex-col gap-1">
                    {voiceLog.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                ) : (
                  "No voice notes yet."
                )
              }
            >
              <PushToTalk talking={talking} onTalkingChange={onTalkingChange} disabled={run.shipped}>
                <PushToTalkKey>Hold to talk</PushToTalkKey>
                <PushToTalkStatus idle={run.shipped ? "Run finished" : "Not listening"} />
                <span aria-hidden className="h-4 font-mono text-xs tabular-nums opacity-70">
                  {talking ? `${seconds.toFixed(1)}s` : ""}
                </span>
              </PushToTalk>
            </Panel>
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            <Panel
              title="Autonomy"
              description="Order how much the agent may do alone. It confirms between actions."
              footer={autonomyMeaning[autonomy]}
            >
              <EngineTelegraph
                aria-label="Agent autonomy"
                value={order}
                onValueChange={(v) => setOrder(v as Autonomy)}
                confirmed={autonomy}
              >
                <EngineTelegraphDial />
                <EngineTelegraphOrders>
                  <EngineTelegraphOrder value="stop">Stop</EngineTelegraphOrder>
                  <EngineTelegraphOrder value="plan">Plan</EngineTelegraphOrder>
                  <EngineTelegraphOrder value="ask">Ask</EngineTelegraphOrder>
                  <EngineTelegraphOrder value="act">Act</EngineTelegraphOrder>
                  <EngineTelegraphOrder value="auto">Auto</EngineTelegraphOrder>
                </EngineTelegraphOrders>
                <EngineTelegraphStatus />
              </EngineTelegraph>
            </Panel>

            <Panel
              title="Subagents"
              description="The lead splits effort toward the current step. Take a fader to override it."
              trayClassName="px-1 sm:px-1"
              footer={
                <div className="flex flex-col gap-2">
                  <p>
                    {paused
                      ? "All subagents are paused."
                      : `Total effort ${totalEffort} of ${BUDGET} budgeted${totalEffort > BUDGET ? ": over budget" : ""}.`}
                  </p>
                  {channels.some((c) => c.by === "You") && (
                    <button
                      type="button"
                      onClick={() => setChannels((all) => all.map((c) => ({ ...c, by: "Lead" })))}
                      className="h-9 self-start rounded-md border bg-card px-3 text-sm font-medium text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Hand faders back to the lead
                    </button>
                  )}
                </div>
              }
            >
              <Mixer aria-label="Subagent effort">
                {channels.map((c) => (
                  <MixerStrip key={c.name} name={c.name} muted={!isRunning(c)}>
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
            </Panel>
          </div>

          <div className="grid min-w-0 gap-6 md:col-span-2 md:grid-cols-2 lg:col-span-1 lg:grid-cols-1 lg:content-start">
            <Panel
              title="Supervision"
              description={`The run continues only while you check in, every ${CHECK_IN_MS / 1000} seconds.`}
              footer={
                !supervised
                  ? run.shipped
                    ? "The run is over. No check-ins needed."
                    : "Not counting: the agent is at Stop."
                  : paused
                    ? "The agent stopped before its next action. Resume to carry on."
                    : "Checking in keeps the agent going."
              }
            >
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
            </Panel>

            <Panel title="Alerts" description="New alerts flash until you acknowledge them.">
              <Annunciator aria-label="Run alerts">
                <AnnunciatorPanel>
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
                <AnnunciatorAcknowledge />
              </Annunciator>
            </Panel>

            <Panel
              title="Ship"
              description="Merging is never automatic. Lift the cover, then flip the switch."
              footer={<p>{shipNote && !run.shipped ? shipNote : shipBlock}</p>}
            >
              <GuardedSwitch checked={run.shipped} onCheckedChange={onShip} safeOnClose={!run.shipped}>
                <GuardedSwitchLabel>Merge #482</GuardedSwitchLabel>
                <GuardedSwitchControl />
                <GuardedSwitchStatus />
              </GuardedSwitch>
            </Panel>
          </div>
        </div>
      </main>
    </div>
  )
}
