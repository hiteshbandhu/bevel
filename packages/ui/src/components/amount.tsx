"use client"

import * as React from "react"
import { cn } from "cn"
import { isDigitPart, useAmountParts, type AmountFormat } from "@workspace/ui/lib/format-amount"

type AmountProps = AmountFormat &
  Omit<React.ComponentProps<"span">, "children"> & {
    /** Show a leading + for positive values, for credits in a ledger. */
    signed?: boolean
  }

/** A formatted amount with steady digits. The building block for every figure in Bevel. */
function Amount({ value, currency, locale, format, signed, className, ...props }: AmountProps) {
  const parts = useAmountParts({
    value,
    currency,
    locale,
    format: signed ? { signDisplay: "exceptZero", ...format } : format,
  })
  return (
    <span
      data-slot="amount"
      data-sign={value > 0 ? "positive" : value < 0 ? "negative" : "zero"}
      className={cn("whitespace-nowrap", className)}
      {...props}
    >
      {parts.map((part, i) => (
        <span key={i} className={isDigitPart(part.type) ? "tabular-nums" : undefined}>
          {part.value}
        </span>
      ))}
    </span>
  )
}

export { Amount }
export type { AmountProps }
