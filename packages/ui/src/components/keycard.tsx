"use client"

import * as React from "react"
import { cn } from "cn"
import { PaymentCard, type PaymentCardProps } from "@workspace/ui/components/payment-card"

/** An access key as a plastic card with a magnetic stripe. A PaymentCard underneath. */
function Keycard({ className, children, tone = "graphite", ...props }: PaymentCardProps) {
  return (
    <PaymentCard
      tone={tone}
      data-keycard=""
      className={cn("flex-col items-stretch gap-1 pt-3", className)}
      {...props}
    >
      <span aria-hidden data-slot="keycard-stripe" className="absolute inset-x-0 bottom-[18%] h-[16%] bg-(--keycard-stripe)" />
      {children}
    </PaymentCard>
  )
}

function KeycardLabel({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="keycard-label"
      className={cn(
        "text-(length:--bevel-fine) font-semibold tracking-(--bevel-tracking-print) uppercase",
        className
      )}
      {...props}
    />
  )
}

type KeycardKeyProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** The full key. Only its prefix and last four are shown unless revealed. */
  value: string
  revealed?: boolean
}

/** The key itself, masked to its prefix and last four characters. */
function KeycardKey({ value, revealed = false, className, ...props }: KeycardKeyProps) {
  const prefix = value.match(/^[a-z]+[-_]/i)?.[0] ?? ""
  const last4 = value.slice(-4)
  return (
    <span
      data-slot="keycard-key"
      data-revealed={revealed ? "" : undefined}
      className={cn("font-mono text-(length:--bevel-fine) break-all", className)}
      {...props}
    >
      {revealed ? (
        value
      ) : (
        <>
          {prefix}
          <span aria-hidden>••••••••</span>
          <span className="sr-only">ending in </span>
          {last4}
        </>
      )}
    </span>
  )
}

type KeycardSlotProps = React.ComponentProps<"div"> & {
  /** The card is in the reader. */
  inserted?: boolean
  /** Text on the reader plate. Defaults describe whether a key is in. */
  status?: React.ReactNode
}

/** A brass card reader. Put a Keycard inside; set `inserted` and it slides into the slot. */
function KeycardSlot({ className, inserted = false, status, children, ...props }: KeycardSlotProps) {
  return (
    <div
      data-slot="keycard-slot"
      data-inserted={inserted ? "" : undefined}
      className={cn("relative w-full max-w-xs pb-(--keycard-plate-height)", className)}
      {...props}
    >
      {/* The reader hides whatever part of the card is inside it. */}
      <div className="keycard-mouth">
        <div
          className={cn(
            "transition-[translate] duration-(--bevel-duration-move) ease-(--bevel-ease-in-out) motion-reduce:transition-none",
            inserted && "translate-y-(--keycard-insert)"
          )}
        >
          {children}
        </div>
      </div>
      <div
        data-slot="keycard-reader"
        className="bevel-metal bevel-object absolute inset-x-0 bottom-0 z-10 flex h-(--keycard-plate-height) flex-col justify-end rounded-(--bevel-radius-sm) px-4 pb-3"
      >
        <span aria-hidden className="bevel-recessed absolute inset-x-3 top-2 h-1.5 rounded-full" />
        <span
          aria-live="polite"
          className="bevel-deboss flex items-center gap-1.5 text-(length:--bevel-fine) font-semibold tracking-(--bevel-tracking-print) text-(--bevel-ivory-foreground) uppercase"
        >
          <span aria-hidden className="bevel-led size-1.5 rounded-full" />
          {status ?? (inserted ? "Key in use" : "No key inserted")}
        </span>
      </div>
    </div>
  )
}

export { Keycard, KeycardLabel, KeycardKey, KeycardSlot }
export type { KeycardKeyProps, KeycardSlotProps }
