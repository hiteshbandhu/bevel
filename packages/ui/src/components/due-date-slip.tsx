"use client"

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cn } from "cn"
import { Stamp } from "@workspace/ui/components/stamp"

const DAY = 86_400_000

type DueDateSlipContextValue = { latest: Date | undefined; now: Date; statusId: string }

const DueDateSlipContext = React.createContext<DueDateSlipContextValue | null>(null)

function useDueDateSlip() {
  const context = React.useContext(DueDateSlipContext)
  if (!context) throw new Error("DueDateSlip parts must be inside <DueDateSlip>")
  return context
}

function toDate(d: Date | string) {
  return typeof d === "string" ? new Date(d) : d
}

/** Fixed locale and time zone, so server and client stamp the same date. */
function stampText(d: Date) {
  return d
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })
    .toUpperCase()
}

type DueDateSlipProps = React.ComponentProps<"div"> & {
  /** What's on loan: a key, a seat, a trial. Printed at the top. */
  title: string
  /** Every due date stamped so far, oldest first. The last one counts. */
  dates: (Date | string)[]
  /** Today. Pass it to keep server and client in step. */
  now?: Date | string
}

/**
 * A library date-due slip. Each loan or renewal stamps the next line;
 * the last date is when it's due. Overdue dates are stamped in red.
 */
function DueDateSlip({ className, title, dates, now: nowProp, children, ...props }: DueDateSlipProps) {
  const statusId = React.useId()
  const now = React.useMemo(() => toDate(nowProp ?? new Date()), [nowProp])
  const parsed = dates.map(toDate)
  const latest = parsed.at(-1)
  // Stamp only dates added after the slip appeared, not the history.
  const initial = React.useRef(dates.length)
  return (
    <DueDateSlipContext value={{ latest, now, statusId }}>
      <div
        role="group"
        aria-label={`${title}: date due`}
        data-slot="due-date-slip"
        data-overdue={latest && latest < now ? "" : undefined}
        className={cn("bevel-paper flex w-64 flex-col rounded-(--bevel-radius-xs) px-4 pt-3 pb-4", className)}
        {...props}
      >
        <p className="truncate text-xs font-semibold">{title}</p>
        <p
          aria-hidden
          className="mt-1 border-b-2 border-(--due-date-slip-header) pb-1 text-center text-sm font-black tracking-(--bevel-tracking-label) text-(--due-date-slip-header)"
        >
          DATE DUE
        </p>
        <ol
          aria-label="Due dates"
          className="mb-3 flex flex-col bg-[linear-gradient(to_bottom,transparent_calc(var(--due-date-slip-line)-1px),var(--due-date-slip-rule)_calc(var(--due-date-slip-line)-1px))] bg-size-[100%_var(--due-date-slip-line)]"
        >
          {parsed.map((d, i) => {
            const last = i === parsed.length - 1
            return (
              <li
                key={`${d.getTime()}-${i}`}
                className={cn("flex h-(--due-date-slip-line) items-center justify-center", !last && "opacity-60")}
              >
                <Stamp tone={d < now ? "red" : "blue"} animate={i >= initial.current} className="py-0.5">
                  {stampText(d)}
                </Stamp>
              </li>
            )
          })}
          {/* Empty lines below, waiting for renewals. */}
          {Array.from({ length: Math.max(0, 4 - parsed.length) }, (_, i) => (
            <li key={`empty-${i}`} aria-hidden className="h-(--due-date-slip-line)" />
          ))}
        </ol>
        {children}
      </div>
    </DueDateSlipContext>
  )
}

/** When it's due, in words: “Due in 12 days” or “Overdue by 3 days”. Announced when it changes. */
function DueDateSlipStatus({ className, ...props }: React.ComponentProps<"p">) {
  const { latest, now, statusId } = useDueDateSlip()
  let text = "Not on loan."
  if (latest) {
    const days = Math.round((latest.getTime() - now.getTime()) / DAY)
    const date = stampText(latest).toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase())
    text =
      days > 1
        ? `Due ${date}, in ${days} days.`
        : days === 1
          ? `Due tomorrow, ${date}.`
          : days === 0
            ? `Due today.`
            : `Overdue by ${-days} day${days === -1 ? "" : "s"}. Was due ${date}.`
  }
  return (
    <p
      id={statusId}
      role="status"
      data-slot="due-date-slip-status"
      className={cn("text-xs in-data-overdue:font-semibold in-data-overdue:text-(--bevel-ink-red)", className)}
      {...props}
    >
      {text}
    </p>
  )
}

/** Renews the loan. Your handler adds the next date. */
function DueDateSlipRenew({ className, ...props }: ButtonPrimitive.Props) {
  const { statusId } = useDueDateSlip()
  return (
    <ButtonPrimitive
      data-slot="due-date-slip-renew"
      aria-describedby={statusId}
      className={cn(
        "bevel-raised mt-2 h-9 rounded-(--bevel-radius-sm) px-4 text-sm font-semibold text-(--bevel-paper-foreground) outline-none [--bevel-material:var(--bevel-paper)]",
        "transition-[translate,box-shadow] duration-(--bevel-duration-press) ease-(--bevel-ease-out) active:translate-y-0.5 active:bevel-pressed motion-reduce:transition-none",
        "focus-visible:ring-3 focus-visible:ring-ring/60 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { DueDateSlip, DueDateSlipStatus, DueDateSlipRenew }
export type { DueDateSlipProps }
