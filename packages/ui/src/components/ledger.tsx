"use client"

import * as React from "react"
import { cn } from "cn"
import { Amount, type AmountProps } from "@workspace/ui/components/amount"

/** A ruled ledger page. Every row sits on one rule. */
function Ledger({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="ledger"
      className={cn(
        "bevel-paper ledger-ruling relative w-full overflow-x-auto rounded-(--bevel-radius-xs) pt-(--ledger-rule) pb-(--ledger-rule) text-sm",
        className
      )}
      {...props}
    />
  )
}

function LedgerTitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="ledger-title"
      className={cn(
        "flex h-(--ledger-rule) items-end pr-4 pb-1 pl-(--ledger-indent) font-semibold tracking-(--bevel-tracking-label) uppercase",
        className
      )}
      {...props}
    />
  )
}

function LedgerTable({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <table
      data-slot="ledger-table"
      className={cn("w-full border-collapse text-left", className)}
      {...props}
    />
  )
}

function LedgerHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="ledger-header"
      className={cn("text-(length:--bevel-fine) tracking-(--bevel-tracking-print) text-(--bevel-paper-muted) uppercase", className)}
      {...props}
    />
  )
}

function LedgerBody(props: React.ComponentProps<"tbody">) {
  return <tbody data-slot="ledger-body" {...props} />
}

function LedgerRow({ className, ...props }: React.ComponentProps<"tr">) {
  return <tr data-slot="ledger-row" className={cn("h-(--ledger-rule)", className)} {...props} />
}

function LedgerHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="ledger-head"
      scope="col"
      className={cn("px-3 align-bottom font-semibold whitespace-nowrap first:w-(--ledger-margin) first:px-2", className)}
      {...props}
    />
  )
}

function LedgerCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="ledger-cell"
      className={cn("px-3 align-middle whitespace-nowrap first:w-(--ledger-margin) first:px-2", className)}
      {...props}
    />
  )
}

/** The entry number in the margin column: "No. 0042". */
function LedgerNumber({ value, className, ...props }: { value: number } & Omit<React.ComponentProps<"span">, "children">) {
  return (
    <span
      data-slot="ledger-number"
      className={cn("font-mono text-(length:--bevel-fine) text-(--bevel-paper-muted) tabular-nums", className)}
      {...props}
    >
      <span aria-hidden>No.&nbsp;</span>
      <span className="sr-only">Entry </span>
      {String(value).padStart(4, "0")}
    </span>
  )
}

/** A signed amount: credits in green ink, debits in black. */
function LedgerAmount({ className, ...props }: AmountProps) {
  return (
    <Amount
      signed
      className={cn(
        "font-semibold text-(--ledger-debit) data-[sign=positive]:text-(--ledger-credit)",
        className
      )}
      {...props}
    />
  )
}

export {
  Ledger,
  LedgerTitle,
  LedgerTable,
  LedgerHeader,
  LedgerBody,
  LedgerRow,
  LedgerHead,
  LedgerCell,
  LedgerNumber,
  LedgerAmount,
}
