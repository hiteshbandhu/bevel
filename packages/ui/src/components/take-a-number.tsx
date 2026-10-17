"use client"

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cn } from "cn"
import { NumberWheel } from "@workspace/ui/components/number-wheel"

type TakeANumberContextValue = {
  serving: number
  ticket: number | null
  statusId: string
}

const TakeANumberContext = React.createContext<TakeANumberContextValue | null>(null)

function useTakeANumber() {
  const context = React.useContext(TakeANumberContext)
  if (!context) throw new Error("TakeANumber parts must be inside <TakeANumber>")
  return context
}

const ticketFormat: Intl.NumberFormatOptions = { minimumIntegerDigits: 2, useGrouping: false }

type TakeANumberProps = React.ComponentProps<"div"> & {
  /** The number being served now. */
  serving: number
  /** The number in your hand, or null before you take one. */
  ticket: number | null
}

/**
 * A take-a-number queue: a Now Serving sign and a ticket dispenser. Your
 * place is the number you hold. Give it an aria-label.
 */
function TakeANumber({ className, serving, ticket, children, ...props }: TakeANumberProps) {
  const statusId = React.useId()
  const context = React.useMemo(() => ({ serving, ticket, statusId }), [serving, ticket, statusId])
  return (
    <TakeANumberContext value={context}>
      <div
        role="group"
        data-slot="take-a-number"
        data-turn={ticket === serving ? "" : undefined}
        className={cn("flex w-full max-w-md flex-col items-center gap-5", className)}
        {...props}
      >
        {children}
      </div>
    </TakeANumberContext>
  )
}

/** The Now Serving sign. Its drums roll to each new number. */
function TakeANumberSign({ className, ...props }: React.ComponentProps<"div">) {
  const { serving, ticket } = useTakeANumber()
  return (
    <div
      data-slot="take-a-number-sign"
      className={cn(
        "bevel-plastic flex items-center gap-4 rounded-(--bevel-radius-md) px-5 py-3 text-(--take-a-number-foreground)",
        className
      )}
      {...props}
    >
      <p className="flex flex-col text-(length:--bevel-fine) font-black tracking-(--bevel-tracking-label) uppercase leading-tight">
        <span>Now</span>
        <span>serving</span>
      </p>
      <NumberWheel value={serving} format={ticketFormat} tone="black" className="text-(length:--bevel-amount)" />
      <span
        aria-hidden
        className={cn(
          "size-2.5 rounded-full transition-opacity duration-(--bevel-duration-small) motion-reduce:transition-none",
          ticket === serving ? "bevel-led" : "bg-(--bevel-shade-strong)"
        )}
      />
    </div>
  )
}

/** The dispenser. Taking a number tears a ticket off the roll; you hold one at a time. */
function TakeANumberDispenser({ className, children = "Take a number", ...props }: ButtonPrimitive.Props) {
  const { ticket, statusId } = useTakeANumber()
  return (
    <div data-slot="take-a-number-dispenser" className="flex items-end gap-4">
      <div className="flex flex-col items-center">
        <span aria-hidden className="bevel-plastic relative z-10 flex h-14 w-20 items-end justify-center rounded-t-full pb-2">
          <span className="h-1.5 w-12 rounded-full bg-(--bevel-material-recess) shadow-(--bevel-depth-recessed)" />
        </span>
        {/* The next ticket, hanging from the slot. */}
        <span aria-hidden className="bevel-paper -mt-2 h-4 w-10 rounded-b-(--bevel-radius-xs)" />
        <ButtonPrimitive
          disabled={ticket !== null}
          focusableWhenDisabled
          aria-describedby={statusId}
          className={cn(
            "bevel-raised mt-3 h-10 rounded-(--bevel-radius-sm) px-4 text-sm font-semibold text-(--take-a-number-foreground) outline-none",
            "transition-[translate,box-shadow] duration-(--bevel-duration-press) ease-(--bevel-ease-out) active:translate-y-0.5 active:bevel-pressed motion-reduce:transition-none",
            "focus-visible:ring-3 focus-visible:ring-ring/60 data-disabled:cursor-not-allowed data-disabled:opacity-50",
            className
          )}
          {...props}
        >
          {children}
        </ButtonPrimitive>
      </div>
      {ticket !== null && (
        <span
          key={ticket}
          data-slot="take-a-number-ticket"
          className={cn(
            "bevel-paper mb-12 flex w-20 flex-col items-center px-1 text-center rounded-(--bevel-radius-xs) border-y-2 border-dashed border-(--bevel-paper-rule) py-2",
            "transition-[translate,opacity] duration-(--bevel-duration-move) ease-(--bevel-ease-out) starting:-translate-y-(--bevel-lift) starting:opacity-0 motion-reduce:transition-none"
          )}
        >
          <span className="text-(length:--bevel-fine) font-bold tracking-(--bevel-tracking-label) uppercase">Your number</span>
          <span className="font-mono text-2xl font-bold tabular-nums">
            {ticket.toLocaleString("en-US", ticketFormat)}
          </span>
        </span>
      )}
    </div>
  )
}

/** Where you stand, in words. Announced when the number being served changes. */
function TakeANumberStatus({ className, ...props }: React.ComponentProps<"p">) {
  const { serving, ticket, statusId } = useTakeANumber()
  const ahead = ticket === null ? 0 : ticket - serving
  const message =
    ticket === null
      ? `Now serving ${serving}. Take a number to join the queue.`
      : ahead > 0
        ? `Now serving ${serving}. You're ${ticket}: ${ahead} ahead of you.`
        : ahead === 0
          ? `Now serving ${serving}. It's your turn.`
          : `Number ${ticket} has been served.`
  return (
    <p
      id={statusId}
      role="status"
      data-slot="take-a-number-status"
      className={cn("text-center text-sm text-muted-foreground in-data-turn:font-semibold in-data-turn:text-foreground", className)}
      {...props}
    >
      {message}
    </p>
  )
}

export { TakeANumber, TakeANumberSign, TakeANumberDispenser, TakeANumberStatus }
export type { TakeANumberProps }
