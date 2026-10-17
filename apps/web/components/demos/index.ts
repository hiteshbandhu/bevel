import type * as React from "react"
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
