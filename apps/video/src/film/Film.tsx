import * as React from "react"
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion"
import { ApprovalSend } from "../../../web/components/demos/approval-send"
import { BreakerCaps } from "../../../web/components/demos/breaker-caps"
import { CitationAnswer } from "../../../web/components/demos/citation-answer"
import { DialRunway } from "../../../web/components/demos/dial-runway"
import { DueDateSlipKey } from "../../../web/components/demos/due-date-slip-key"
import { KeycardSwipeDemo } from "../../../web/components/demos/keycard-swipe"
import { LockoutMigration } from "../../../web/components/demos/lockout-migration"
import { MeterLiveUsage } from "../../../web/components/demos/meter-live-usage"
import { NameTagAgents } from "../../../web/components/demos/name-tag-agents"
import { PaymentCardPicker } from "../../../web/components/demos/payment-card-picker"
import { RedlineClause } from "../../../web/components/demos/redline-clause"
import { StampMarks } from "../../../web/components/demos/stamp-marks"
import { TaskPlanAgent } from "../../../web/components/demos/task-plan-agent"
import { TicketSheetPlans } from "../../../web/components/demos/ticket-sheet-plans"
import { VisibleFileTasks } from "../../../web/components/demos/visible-file-tasks"
import { WalletCheckout } from "../../../web/components/demos/wallet-checkout"
import "../style.css"
import { Grain, Vignette, cues } from "./fx"
import {
  Cold,
  ControlsScene,
  DemosScene,
  EndScene,
  InstallScene,
  LampsScene,
  MixerScene,
  MontageScene,
  RecordsScene,
  Reveal,
  SwitchScene,
  type Shot,
} from "./scenes"

const shots: Shot[] = [
  { name: "Wallet", node: <div style={{ width: 380 }}><WalletCheckout /></div>, scale: 2.6 },
  { name: "Meter", node: <div style={{ width: 380 }}><MeterLiveUsage /></div>, scale: 3.0 },
  { name: "Stamp", node: <StampMarks />, scale: 2.9 },
  { name: "Keycard", node: <KeycardSwipeDemo />, scale: 3.3 },
  { name: "Payment card", node: <PaymentCardPicker />, scale: 2.8 },
  { name: "Ticket sheet", node: <TicketSheetPlans />, scale: 3.1 },
  { name: "Gauge and dial", node: <DialRunway />, scale: 2.6 },
  { name: "Breaker", node: <BreakerCaps />, scale: 2.7 },
  { name: "Task plan", node: <div style={{ width: 460 }}><TaskPlanAgent /></div>, scale: 2.4 },
  { name: "Name tag", node: <NameTagAgents />, scale: 2.7 },
  { name: "Citation", node: <div style={{ width: 560 }}><CitationAnswer /></div>, scale: 2.4 },
  { name: "Redline", node: <div style={{ width: 600 }}><RedlineClause /></div>, scale: 2.3 },
  { name: "Approval seal", node: <ApprovalSend />, scale: 2.5 },
  { name: "Due-date slip", node: <DueDateSlipKey />, scale: 2.4 },
  { name: "Lockout", node: <LockoutMigration />, scale: 2.5 },
  { name: "Visible file", node: <div style={{ width: 640 }}><VisibleFileTasks /></div>, scale: 2.3 },
]

const S = cues.scenes
const order: [keyof typeof S, () => React.ReactNode][] = [
  ["cold", () => <Cold />],
  ["reveal", () => <Reveal />],
  ["switch", () => <SwitchScene />],
  ["lamps", () => <LampsScene />],
  ["mixer", () => <MixerScene />],
  ["controls", () => <ControlsScene />],
  ["records", () => <RecordsScene />],
  ["montage", () => <MontageScene shots={shots} />],
  ["demos", () => <DemosScene />],
  ["install", () => <InstallScene />],
  ["end", () => <EndScene />],
]

export const filmLength = S.end[1]

/** The launch film. Scenes cut on the bar; every cue is an absolute frame in cues.json. */
export function Film() {
  const frame = useCurrentFrame()
  const current = order.find(([name]) => frame >= S[name][0] && frame < S[name][1])
  return (
    <AbsoluteFill style={{ background: "var(--night)" }}>
      <Audio src={staticFile("score.mp3")} />
      {current?.[1]()}
      <Vignette strength={0.28} />
      <Grain opacity={0.07} />
    </AbsoluteFill>
  )
}
