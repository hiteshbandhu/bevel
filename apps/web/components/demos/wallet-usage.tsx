"use client"

import { ArrowUpRight } from "lucide-react"
import {
  Wallet,
  WalletAction,
  WalletBalance,
  WalletCard,
  WalletCards,
  WalletFooter,
  WalletHeader,
  WalletLabel,
  WalletMeter,
  WalletMeterLabel,
  WalletMeterValue,
  WalletPocket,
  WalletStatus,
} from "@workspace/ui/components/wallet"

const allowance = 50000
const remaining = 9480

export function WalletUsage() {
  return (
    <Wallet variant="oxblood" status={remaining / allowance < 0.25 ? "low" : "default"}>
      <WalletCards>
        <WalletCard />
        <WalletCard />
      </WalletCards>
      <WalletPocket>
        <WalletHeader>
          <WalletLabel>Credits remaining</WalletLabel>
          <WalletStatus />
        </WalletHeader>
        <WalletBalance value={remaining} />
        <WalletMeter value={remaining} max={allowance}>
          <WalletMeterLabel>Of 50,000 this cycle</WalletMeterLabel>
          <WalletMeterValue>
            {(_, value) => `${Math.round((value / allowance) * 100)}%`}
          </WalletMeterValue>
        </WalletMeter>
        <WalletFooter>
          <WalletAction>
            Buy credits <ArrowUpRight />
          </WalletAction>
        </WalletFooter>
      </WalletPocket>
    </Wallet>
  )
}
