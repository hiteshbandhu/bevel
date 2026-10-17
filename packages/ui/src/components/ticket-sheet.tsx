"use client"

import * as React from "react"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup } from "@base-ui/react/radio-group"
import { cn } from "cn"

type TicketSheetProps = RadioGroup.Props<string>

/** A sheet of perforated tickets, one per option. Picking one tears it off. */
function TicketSheet({ className, ...props }: TicketSheetProps) {
  return (
    <RadioGroup
      data-slot="ticket-sheet"
      className={cn("bevel-paper grid grid-cols-2 gap-1 rounded-(--bevel-radius-xs) p-3", className)}
      {...props}
    />
  )
}

type TicketProps = RadioPrimitive.Root.Props<string> & {
  tone?: "vermilion" | "ultramarine" | "emerald" | "ochre"
}

function Ticket({ className, tone = "vermilion", children, ...props }: TicketProps) {
  return (
    <RadioPrimitive.Root
      data-slot="ticket"
      data-tone={tone}
      className={cn(
        "ticket-perforated group/ticket relative block cursor-pointer bg-(--bevel-paper) outline-none select-none",
        "transition-[translate,rotate,filter] duration-(--bevel-duration-move) ease-(--bevel-ease-spring) motion-reduce:transition-none",
        "data-checked:-translate-y-(--ticket-tear-lift) data-checked:rotate-(--ticket-tear-tilt) data-checked:drop-shadow-(--bevel-depth-cast-sm)",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--ticket-tone)",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <span
        data-slot="ticket-face"
        className="relative flex h-full flex-col items-start gap-1 bg-(--ticket-tone) p-3 text-(--ticket-foreground) shadow-(--bevel-depth-flush) outline outline-1 -outline-offset-4 outline-current/40"
      >
        {children}
      </span>
    </RadioPrimitive.Root>
  )
}

function TicketValue({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="ticket-value"
      className={cn("text-(length:--bevel-amount-minor) leading-none font-black tabular-nums", className)}
      {...props}
    />
  )
}

function TicketLabel({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="ticket-label"
      className={cn(
        "text-(length:--bevel-fine) font-bold tracking-(--bevel-tracking-print) uppercase",
        className
      )}
      {...props}
    />
  )
}

/** Small print: a fee or what the option includes. */
function TicketNote({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="ticket-note"
      className={cn("mt-auto text-(length:--bevel-fine)", className)}
      {...props}
    />
  )
}

export { TicketSheet, Ticket, TicketValue, TicketLabel, TicketNote }
export type { TicketSheetProps, TicketProps }
