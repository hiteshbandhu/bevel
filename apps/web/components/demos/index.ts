import type * as React from "react"
import { PaymentCardPicker } from "./payment-card-picker"
import { WalletBilling } from "./wallet-billing"
import { WalletCheckout } from "./wallet-checkout"
import { WalletUsage } from "./wallet-usage"

/** Demo components by file name, matching `Example.file` in the catalog. */
export const demos: Record<string, React.ComponentType> = {
  "payment-card-picker.tsx": PaymentCardPicker,
  "wallet-checkout.tsx": WalletCheckout,
  "wallet-billing.tsx": WalletBilling,
  "wallet-usage.tsx": WalletUsage,
}
