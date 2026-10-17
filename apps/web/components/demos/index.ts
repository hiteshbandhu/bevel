import type * as React from "react"
import { DueDateSlipKey } from "./due-date-slip-key"
import { SplitFlapDeploys } from "./split-flap-deploys"
import { ContactSheetVariants } from "./contact-sheet-variants"
import { VisibleFileTasks } from "./visible-file-tasks"
import { KeysortFilterContracts } from "./keysort-filter-contracts"
import { MixerStripAgents } from "./mixer-strip-agents"
import { MotorizedFaderTemperature } from "./motorized-fader-temperature"
import { PushToTalkAgent } from "./push-to-talk-agent"
import { DetentKnobMode } from "./detent-knob-mode"
import { AnnunciatorAgent } from "./annunciator-agent"
import { EngineTelegraphAutonomy } from "./engine-telegraph-autonomy"
import { TakeANumberSupport } from "./take-a-number-support"
import { KanbanRackRuns } from "./kanban-rack-runs"
import { ChessClockReview } from "./chess-clock-review"
import { LockoutMigration } from "./lockout-migration"
import { TokenInstrumentEdit } from "./token-instrument-edit"
import { BallotBoardTools } from "./ballot-board-tools"
import { VigilanceAgent } from "./vigilance-agent"
import { InterlockDeploy } from "./interlock-deploy"
import { GuardedSwitchDeploy } from "./guarded-switch-deploy"
import { ActivityLogAgent } from "./activity-log-agent"
import { AmountFormats } from "./amount-formats"
import { ApprovalSend } from "./approval-send"
import { BreakerCaps } from "./breaker-caps"
import { CitationAnswer } from "./citation-answer"
import { CreditsCheckout } from "./credits-checkout"
import { DelegationBoardAgents } from "./delegation-board-agents"
import { DialAutoTopUp } from "./dial-auto-top-up"
import { DialRunway } from "./dial-runway"
import { KeycardByok } from "./keycard-byok"
import { KeycardSwipeDemo } from "./keycard-swipe"
import { LedgerHistory } from "./ledger-history"
import { MeterLiveUsage } from "./meter-live-usage"
import { NameTagAgents } from "./name-tag-agents"
import { MeterPostage } from "./meter-postage"
import { NumberWheelCounter } from "./number-wheel-counter"
import { PaymentCardPicker } from "./payment-card-picker"
import { PrivilegeMarks } from "./privilege-marks"
import { RedlineClause } from "./redline-clause"
import { StampMarks } from "./stamp-marks"
import { TaskPlanAgent } from "./task-plan-agent"
import { TicketSheetPlans } from "./ticket-sheet-plans"
import { WalletBilling } from "./wallet-billing"
import { WalletCheckout } from "./wallet-checkout"
import { WalletUsage } from "./wallet-usage"

/** Demo components by file name, matching `Example.file` in the catalog. */
export const demos: Record<string, React.ComponentType> = {
  "due-date-slip-key.tsx": DueDateSlipKey,
  "split-flap-deploys.tsx": SplitFlapDeploys,
  "contact-sheet-variants.tsx": ContactSheetVariants,
  "visible-file-tasks.tsx": VisibleFileTasks,
  "keysort-filter-contracts.tsx": KeysortFilterContracts,
  "mixer-strip-agents.tsx": MixerStripAgents,
  "motorized-fader-temperature.tsx": MotorizedFaderTemperature,
  "push-to-talk-agent.tsx": PushToTalkAgent,
  "detent-knob-mode.tsx": DetentKnobMode,
  "annunciator-agent.tsx": AnnunciatorAgent,
  "engine-telegraph-autonomy.tsx": EngineTelegraphAutonomy,
  "take-a-number-support.tsx": TakeANumberSupport,
  "kanban-rack-runs.tsx": KanbanRackRuns,
  "chess-clock-review.tsx": ChessClockReview,
  "lockout-migration.tsx": LockoutMigration,
  "token-instrument-edit.tsx": TokenInstrumentEdit,
  "ballot-board-tools.tsx": BallotBoardTools,
  "vigilance-agent.tsx": VigilanceAgent,
  "interlock-deploy.tsx": InterlockDeploy,
  "guarded-switch-deploy.tsx": GuardedSwitchDeploy,
  "activity-log-agent.tsx": ActivityLogAgent,
  "amount-formats.tsx": AmountFormats,
  "approval-send.tsx": ApprovalSend,
  "breaker-caps.tsx": BreakerCaps,
  "citation-answer.tsx": CitationAnswer,
  "credits-checkout.tsx": CreditsCheckout,
  "delegation-board-agents.tsx": DelegationBoardAgents,
  "dial-auto-top-up.tsx": DialAutoTopUp,
  "dial-runway.tsx": DialRunway,
  "keycard-byok.tsx": KeycardByok,
  "keycard-swipe.tsx": KeycardSwipeDemo,
  "ledger-history.tsx": LedgerHistory,
  "meter-live-usage.tsx": MeterLiveUsage,
  "meter-postage.tsx": MeterPostage,
  "name-tag-agents.tsx": NameTagAgents,
  "number-wheel-counter.tsx": NumberWheelCounter,
  "payment-card-picker.tsx": PaymentCardPicker,
  "privilege-marks.tsx": PrivilegeMarks,
  "redline-clause.tsx": RedlineClause,
  "stamp-marks.tsx": StampMarks,
  "task-plan-agent.tsx": TaskPlanAgent,
  "ticket-sheet-plans.tsx": TicketSheetPlans,
  "wallet-billing.tsx": WalletBilling,
  "wallet-checkout.tsx": WalletCheckout,
  "wallet-usage.tsx": WalletUsage,
}
