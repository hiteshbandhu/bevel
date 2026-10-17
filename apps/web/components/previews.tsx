import type * as React from "react"
import {
  Wallet,
  WalletBalance,
  WalletCard,
  WalletCards,
  WalletHeader,
  WalletLabel,
  WalletPocket,
  WalletStatus,
} from "@workspace/ui/components/wallet"
import {
  PaymentCard,
  PaymentCardBrand,
  PaymentCardChip,
  PaymentCardNumber,
} from "@workspace/ui/components/payment-card"

/** Still previews for component tiles: no controls, nothing focusable. */
export const previews: Record<string, React.ComponentType> = {
  "payment-card": () => (
    <PaymentCard tone="sapphire">
      <PaymentCardBrand>Visa</PaymentCardBrand>
      <PaymentCardNumber last4="4242" />
      <PaymentCardChip />
    </PaymentCard>
  ),
  wallet: () => (
    <Wallet>
      <WalletCards>
        <WalletCard>
          <PaymentCardBrand>Amex</PaymentCardBrand>
          <PaymentCardNumber last4="1005" />
        </WalletCard>
        <WalletCard>
          <PaymentCardBrand>Visa</PaymentCardBrand>
          <PaymentCardNumber last4="4242" />
        </WalletCard>
      </WalletCards>
      <WalletPocket>
        <WalletHeader>
          <WalletLabel>Wallet balance</WalletLabel>
          <WalletStatus />
        </WalletHeader>
        <WalletBalance value={124.5} currency="USD" />
      </WalletPocket>
    </Wallet>
  ),
}
