import type * as React from "react"
import { BadgeDeploys } from "./badge-deploys"
import { IconKeyToolbar } from "./icon-key-toolbar"
import { KbdShortcuts } from "./kbd-shortcuts"
import { KeyForm } from "./key-form"
import { KeyVariants } from "./key-variants"
import { TextFieldSettings } from "./text-field-settings"
import { TextFieldSearch } from "./text-field-search"
import { ToggleLeverNotifications } from "./toggle-lever-notifications"
import { LatchCheckboxPermissions } from "./latch-checkbox-permissions"
import { PresetKeysExample } from "./preset-keys-example"
import { PresetKeysRange } from "./preset-keys-range"
import { TooltipToolbar } from "./tooltip-toolbar"
import { TooltipTapes } from "./tooltip-tapes"
import { PopoverShare } from "./popover-share"
import { MenuCopyPage } from "./menu-copy-page"
import { MenuFileActions } from "./menu-file-actions"
import { DialogDeleteProject } from "./dialog-delete-project"
import { DialogRename } from "./dialog-rename"
import { DialogCommand } from "./dialog-command"
import { DipSwitchFlags } from "./dip-switch-flags"
import { PatchBayWebhooks } from "./patch-bay-webhooks"
import { TimeCardTimesheet } from "./time-card-timesheet"
import { DueDateSlipKey } from "./due-date-slip-key"
import { SplitFlapDeploys } from "./split-flap-deploys"
import { ContactSheetVariants } from "./contact-sheet-variants"
import { VisibleFileTasks } from "./visible-file-tasks"
import { KeysortFilterContracts } from "./keysort-filter-contracts"
import { MixerStripAgents } from "./mixer-strip-agents"
import { MotorizedFaderTemperature } from "./motorized-fader-temperature"
import { PushToTalkAgent } from "./push-to-talk-agent"
import { DetentKnobEffort } from "./detent-knob-effort"
import { AnnunciatorAgent } from "./annunciator-agent"
import { EngineTelegraphAutonomy } from "./engine-telegraph-autonomy"
import { TakeANumberSupport } from "./take-a-number-support"
import { LockoutMigration } from "./lockout-migration"
import { VigilanceAgent } from "./vigilance-agent"
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
  "key-form.tsx": KeyForm,
  "key-variants.tsx": KeyVariants,
  "icon-key-toolbar.tsx": IconKeyToolbar,
  "kbd-shortcuts.tsx": KbdShortcuts,
  "badge-deploys.tsx": BadgeDeploys,
  "dip-switch-flags.tsx": DipSwitchFlags,
  "patch-bay-webhooks.tsx": PatchBayWebhooks,
  "time-card-timesheet.tsx": TimeCardTimesheet,
  "due-date-slip-key.tsx": DueDateSlipKey,
  "split-flap-deploys.tsx": SplitFlapDeploys,
  "contact-sheet-variants.tsx": ContactSheetVariants,
  "visible-file-tasks.tsx": VisibleFileTasks,
  "keysort-filter-contracts.tsx": KeysortFilterContracts,
  "mixer-strip-agents.tsx": MixerStripAgents,
  "motorized-fader-temperature.tsx": MotorizedFaderTemperature,
  "push-to-talk-agent.tsx": PushToTalkAgent,
  "detent-knob-effort.tsx": DetentKnobEffort,
  "annunciator-agent.tsx": AnnunciatorAgent,
  "engine-telegraph-autonomy.tsx": EngineTelegraphAutonomy,
  "take-a-number-support.tsx": TakeANumberSupport,
  "lockout-migration.tsx": LockoutMigration,
  "vigilance-agent.tsx": VigilanceAgent,
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
  "text-field-settings.tsx": TextFieldSettings,
  "text-field-search.tsx": TextFieldSearch,
  "toggle-lever-notifications.tsx": ToggleLeverNotifications,
  "latch-checkbox-permissions.tsx": LatchCheckboxPermissions,
  "preset-keys-example.tsx": PresetKeysExample,
  "preset-keys-range.tsx": PresetKeysRange,
  "tooltip-toolbar.tsx": TooltipToolbar,
  "tooltip-tapes.tsx": TooltipTapes,
  "popover-share.tsx": PopoverShare,
  "menu-copy-page.tsx": MenuCopyPage,
  "menu-file-actions.tsx": MenuFileActions,
  "dialog-delete-project.tsx": DialogDeleteProject,
  "dialog-rename.tsx": DialogRename,
  "dialog-command.tsx": DialogCommand,
}
