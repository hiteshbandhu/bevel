"use client"

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cn } from "cn"
import { useBevelFeedback } from "@workspace/ui/lib/feedback"

const DAY = 86_400_000

/** One session on the card. No `out` yet means the clock is still running. */
type TimeCardEntry = { in: Date | string; out?: Date | string | null }
type TimeCardPunchEvent = { kind: "in" | "out"; at: Date }

type Formatters = {
  date: (d: Date) => string
  time: (d: Date) => string
  day: (d: Date) => string
  duration: (ms: number) => string
}

type TimeCardContextValue = {
  open: boolean
  last: { in: Date; out: Date | null } | undefined
  total: number
  format: Formatters | undefined
  punch: () => void
  statusId: string
}

const TimeCardContext = React.createContext<TimeCardContextValue | null>(null)

function useTimeCard() {
  const context = React.useContext(TimeCardContext)
  if (!context) throw new Error("TimeCard parts must be inside <TimeCard>")
  return context
}

const toDate = (d: Date | string) => (typeof d === "string" ? new Date(d) : d)

function formatters(locale: string | undefined, timeZone: string): Formatters {
  const date = new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short", timeZone })
  const time = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", timeZone })
  const day = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone })
  const hours = new Intl.NumberFormat(locale, { style: "unit", unit: "hour", unitDisplay: "narrow" })
  const minutes = new Intl.NumberFormat(locale, { style: "unit", unit: "minute", unitDisplay: "narrow" })
  return {
    date: (d) => date.format(d),
    time: (d) => time.format(d),
    day: (d) => day.format(d),
    duration: (ms) => {
      const total = Math.max(0, Math.round(ms / 60_000))
      const h = Math.floor(total / 60)
      const m = total % 60
      return h ? (m ? `${hours.format(h)} ${minutes.format(m)}` : hours.format(h)) : minutes.format(m)
    },
  }
}

type TimeCardProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** Whose card, and for when: printed at the top and used as the table's caption. */
  title: string
  /** Sessions, oldest first. */
  entries: TimeCardEntry[]
  /** The clock was punched: add a session (in) or close the open one (out). */
  onPunch?: (event: TimeCardPunchEvent) => void
  /** Ruled lines on the card; it grows past this. */
  rows?: number
  locale?: string
  /** Pass one to print times on the server too; otherwise they print once the browser's zone is known. */
  timeZone?: string
}

/**
 * A punched time card: each session is a row with its date, the time in,
 * the time out and how long it lasted. TimeCardPunch stamps the current
 * time on the next line.
 */
function TimeCard({
  className,
  title,
  entries,
  onPunch,
  rows = 6,
  locale,
  timeZone: timeZoneProp,
  children,
  ...props
}: TimeCardProps) {
  const statusId = React.useId()
  const feedback = useBevelFeedback()
  // The browser's zone is only known after mount; printing before then would
  // disagree with the server's render.
  const [clientZone, setClientZone] = React.useState<string>()
  React.useEffect(() => {
    if (!timeZoneProp) setClientZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [timeZoneProp])
  const timeZone = timeZoneProp ?? clientZone
  const format = React.useMemo(() => (timeZone ? formatters(locale, timeZone) : undefined), [locale, timeZone])

  const sessions = entries.map((e) => ({ in: toDate(e.in), out: e.out ? toDate(e.out) : null }))
  const last = sessions.at(-1)
  const open = !!last && !last.out
  const total = sessions.reduce((sum, s) => (s.out ? sum + (s.out.getTime() - s.in.getTime()) : sum), 0)

  // Stamps already on the card when it appeared don't land again.
  const [initial] = React.useState(() => new Set(sessions.flatMap((s, i) => (s.out ? [`${i}in`, `${i}out`] : [`${i}in`]))))

  const punch = React.useCallback(() => {
    feedback.thunk()
    onPunch?.({ kind: open ? "out" : "in", at: new Date() })
  }, [feedback, onPunch, open])

  const stamp = (d: Date | null, key: string) =>
    d ? (
      <time
        dateTime={d.toISOString()}
        data-slot="time-card-stamp"
        data-fresh={initial.has(key) ? undefined : ""}
        className={cn(
          "bevel-ink inline-block font-mono tabular-nums [--bevel-ink:var(--time-card-ink)]",
          "data-fresh:transition-[scale,opacity] data-fresh:duration-(--bevel-duration-move) data-fresh:ease-(--bevel-ease-spring)",
          "data-fresh:starting:scale-(--time-card-land-scale) data-fresh:starting:opacity-0 motion-reduce:transition-none"
        )}
      >
        {format ? format.time(d) : "··:··"}
      </time>
    ) : null

  return (
    <TimeCardContext value={{ open, last, total, format, punch, statusId }}>
      <div
        data-slot="time-card"
        data-open={open ? "" : undefined}
        className={cn("flex w-full max-w-sm flex-col items-stretch gap-3", className)}
        {...props}
      >
        <div data-slot="time-card-card" className="bevel-paper rounded-(--bevel-radius-xs) px-3 pt-3 pb-4">
          <p
            aria-hidden
            className="border-b-2 border-(--time-card-header) pb-1 text-center text-sm font-black tracking-(--bevel-tracking-label) text-(--time-card-header)"
          >
            TIME CARD
          </p>
          <table className="w-full border-collapse text-sm">
            <caption className="py-1.5 text-left text-xs font-semibold">{title}</caption>
            <thead className="text-(length:--bevel-fine) tracking-(--bevel-tracking-print) text-(--bevel-paper-muted) uppercase">
              <tr className="border-y border-(--time-card-rule)">
                <th scope="col" className="py-1 pr-2 text-left font-semibold">Date</th>
                <th scope="col" className="border-l border-(--time-card-rule) px-2 py-1 text-left font-semibold">In</th>
                <th scope="col" className="border-l border-(--time-card-rule) px-2 py-1 text-left font-semibold">Out</th>
                <th scope="col" className="border-l border-(--time-card-rule) py-1 pl-2 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => {
                const overnight = format && s.out ? Math.round((Date.parse(format.day(s.out)) - Date.parse(format.day(s.in))) / DAY) : 0
                return (
                  <tr key={`${s.in.getTime()}-${i}`} className="h-(--time-card-line) border-b border-(--time-card-rule)">
                    <th scope="row" className="pr-2 text-left text-xs font-medium whitespace-nowrap">
                      {format ? format.date(s.in) : ""}
                    </th>
                    <td className="border-l border-(--time-card-rule) px-2">{stamp(s.in, `${i}in`)}</td>
                    <td className="border-l border-(--time-card-rule) px-2 whitespace-nowrap">
                      {stamp(s.out, `${i}out`)}
                      {overnight > 0 && (
                        <sup className="ml-0.5 text-(length:--bevel-fine) text-(--bevel-paper-muted)">
                          +{overnight}
                          <span className="sr-only"> day{overnight === 1 ? "" : "s"}</span>
                        </sup>
                      )}
                      {!s.out && <span className="sr-only">Still clocked in</span>}
                    </td>
                    <td className="border-l border-(--time-card-rule) pl-2 text-right font-mono text-xs whitespace-nowrap tabular-nums">
                      {s.out && format ? format.duration(s.out.getTime() - s.in.getTime()) : ""}
                    </td>
                  </tr>
                )
              })}
              {Array.from({ length: Math.max(0, rows - sessions.length) }, (_, i) => (
                <tr key={`empty-${i}`} aria-hidden className="h-(--time-card-line) border-b border-(--time-card-rule)">
                  <td />
                  <td className="border-l border-(--time-card-rule)" />
                  <td className="border-l border-(--time-card-rule)" />
                  <td className="border-l border-(--time-card-rule)" />
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" colSpan={3} className="pt-2 text-right text-(length:--bevel-fine) font-semibold tracking-(--bevel-tracking-print) uppercase">
                  Total
                </th>
                <td className="pt-2 pl-2 text-right font-mono text-sm font-bold whitespace-nowrap tabular-nums">
                  {format ? format.duration(total) : ""}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        {children}
      </div>
    </TimeCardContext>
  )
}

/** Clocked in or out, in words: “Clocked in at 09:02.” Describes the punch button. */
function TimeCardStatus({ className, ...props }: React.ComponentProps<"p">) {
  const { open, last, total, format, statusId } = useTimeCard()
  const text = !last
    ? "Not clocked in yet."
    : open
      ? `Clocked in${format ? ` at ${format.time(last.in)}` : ""}.`
      : `Clocked out${format && last.out ? ` at ${format.time(last.out)}` : ""}. ${format ? format.duration(total) : ""} on this card.`
  return (
    <p
      id={statusId}
      role="status"
      data-slot="time-card-status"
      className={cn("flex items-center gap-2 text-sm", className)}
      {...props}
    >
      <span aria-hidden className="bevel-led size-2 shrink-0 rounded-full" />
      {text}
    </p>
  )
}

/** The punch clock's key. Stamps the time now: in if you're out, out if you're in. */
function TimeCardPunch({ className, children, onClick, ...props }: ButtonPrimitive.Props) {
  const { open, punch, statusId } = useTimeCard()
  return (
    <ButtonPrimitive
      data-slot="time-card-punch"
      data-kind={open ? "out" : "in"}
      aria-describedby={statusId}
      onClick={(event) => {
        onClick?.(event)
        punch()
      }}
      className={cn(
        "bevel-raised flex h-12 items-center justify-center gap-2 rounded-(--bevel-radius-md) px-5 text-sm font-bold tracking-(--bevel-tracking-label) text-(--time-card-key-foreground) uppercase outline-none",
        "transition-[translate,box-shadow] duration-(--bevel-duration-press) ease-(--bevel-ease-out) active:translate-y-1 active:bevel-pressed motion-reduce:transition-none",
        "focus-visible:ring-3 focus-visible:ring-ring/60 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children ?? (open ? "Punch out" : "Punch in")}
    </ButtonPrimitive>
  )
}

export { TimeCard, TimeCardStatus, TimeCardPunch }
export type { TimeCardProps, TimeCardEntry, TimeCardPunchEvent }
