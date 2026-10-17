"use client"

import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cn } from "cn"

type PaymentCardTone = "sapphire" | "gold" | "graphite"

type PaymentCardProps = useRender.ComponentProps<"div"> & {
  tone?: PaymentCardTone
}

/**
 * A plastic payment card. Works on its own, in a list or picker (pass
 * `render={<Radio.Root value="…" />}`), or inside a Wallet.
 */
function PaymentCard({ className, render, tone = "graphite", ...props }: PaymentCardProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        "data-slot": "payment-card",
        "data-tone": tone,
        className: cn(
          "bevel-plastic relative flex aspect-[85.6/53.98] w-full items-start gap-2 overflow-hidden rounded-(--bevel-radius-md) px-3 pt-1 text-(--payment-card-foreground) outline-none select-none",
          "focus-visible:ring-2 focus-visible:ring-(--payment-card-foreground)/80",
          "data-disabled:cursor-not-allowed data-disabled:brightness-75 data-disabled:saturate-50",
          "forced-colors:border forced-colors:border-[CanvasText]",
          className
        ),
      } as React.ComponentProps<"div">,
      props
    ),
  })
}

function PaymentCardBrand({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="payment-card-brand"
      className={cn(
        "inline-flex items-center gap-1 text-(length:--bevel-fine) leading-4 font-semibold tracking-(--bevel-tracking-print) uppercase [&_svg]:h-3 [&_svg]:w-auto",
        className
      )}
      {...props}
    />
  )
}

function PaymentCardNumber({
  last4,
  className,
  ...props
}: { last4: string } & Omit<React.ComponentProps<"span">, "children">) {
  return (
    <span
      data-slot="payment-card-number"
      className={cn("ms-auto font-mono text-(length:--bevel-fine) leading-4 tabular-nums", className)}
      {...props}
    >
      <span aria-hidden>•••• </span>
      <span className="sr-only">ending in </span>
      {last4}
    </span>
  )
}

/** The contact chip. Decorative. */
function PaymentCardChip({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="payment-card-chip"
      aria-hidden
      className={cn(
        "bevel-metal absolute top-[38%] left-[9%] aspect-[4/3] w-[13%] rounded-(--bevel-radius-xs) [--bevel-material:var(--payment-card-chip)]",
        className
      )}
      {...props}
    />
  )
}

export { PaymentCard, PaymentCardBrand, PaymentCardNumber, PaymentCardChip }
export type { PaymentCardProps, PaymentCardTone }
