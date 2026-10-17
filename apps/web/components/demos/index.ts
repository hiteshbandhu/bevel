import type * as React from "react"
import { AmountFormats } from "./amount-formats"
import { BreakerCaps } from "./breaker-caps"
import { CitationAnswer } from "./citation-answer"
import { CreditsCheckout } from "./credits-checkout"
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
import { StampMarks } from "./stamp-marks"
import { TicketSheetPlans } from "./ticket-sheet-plans"
import { WalletBilling } from "./wallet-billing"
import { WalletCheckout } from "./wallet-checkout"
import { WalletUsage } from "./wallet-usage"

/** Demo components by file name, matching `Example.file` in the catalog. */
export const demos: Record<string, React.ComponentType> = {
  "amount-formats.tsx": AmountFormats,
  "breaker-caps.tsx": BreakerCaps,
  "citation-answer.tsx": CitationAnswer,
  "credits-checkout.tsx": CreditsCheckout,
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
  "stamp-marks.tsx": StampMarks,
  "ticket-sheet-plans.tsx": TicketSheetPlans,
  "wallet-billing.tsx": WalletBilling,
  "wallet-checkout.tsx": WalletCheckout,
  "wallet-usage.tsx": WalletUsage,
}
