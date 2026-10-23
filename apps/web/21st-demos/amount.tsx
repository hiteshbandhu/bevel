"use client"

import * as React from "react"
import { Amount } from "@workspace/ui/components/amount"

const locales = [
  { id: "usd", label: "US", value: 1240.5, currency: "USD", locale: "en-US" },
  {
    id: "eur",
    label: "Germany",
    value: 1240.5,
    currency: "EUR",
    locale: "de-DE",
  },
  {
    id: "inr",
    label: "India",
    value: 1240.5,
    currency: "INR",
    locale: "en-IN",
  },
  { id: "jpy", label: "Japan", value: 1240, currency: "JPY", locale: "ja-JP" },
] as const

/** One balance, set the way each locale writes money. Pick a locale; the digits hold their width. */
export function AmountLocales() {
  const [id, setId] = React.useState<(typeof locales)[number]["id"]>("usd")
  const current = locales.find((l) => l.id === id)!
  return (
    <div className="flex w-[22rem] flex-col gap-6 rounded-2xl border bg-card p-7 shadow-sm">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Balance</p>
        <Amount
          value={current.value}
          currency={current.currency}
          locale={current.locale}
          className="text-5xl font-semibold tracking-tight"
        />
      </div>
      <div
        role="radiogroup"
        aria-label="Locale"
        className="grid grid-cols-4 gap-1 rounded-lg bg-muted p-1 text-xs"
      >
        {locales.map((l) => (
          <button
            key={l.id}
            role="radio"
            aria-checked={l.id === id}
            onClick={() => setId(l.id)}
            className="rounded-md px-2 py-1.5 text-muted-foreground aria-checked:bg-background aria-checked:text-foreground aria-checked:shadow-sm"
          >
            {l.label}
          </button>
        ))}
      </div>
      <dl className="flex flex-col gap-2 border-t pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Credits, signed</dt>
          <dd>
            <Amount value={500} signed />
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Refund</dt>
          <dd>
            <Amount
              value={-18.4}
              currency={current.currency}
              locale={current.locale}
            />
          </dd>
        </div>
      </dl>
    </div>
  )
}
