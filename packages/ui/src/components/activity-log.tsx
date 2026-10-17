"use client"

import * as React from "react"
import { cn } from "cn"

/** A docket of what an agent did. Give it an aria-label. */
function ActivityLog({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="activity-log"
      className={cn("bevel-paper flex w-full flex-col rounded-(--bevel-radius-xs) text-sm", className)}
      {...props}
    />
  )
}

function ActivityLogTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="activity-log-title"
      className={cn(
        "border-b border-(--bevel-paper-rule) px-4 py-3 text-(length:--bevel-label) font-semibold tracking-(--bevel-tracking-label) uppercase",
        className
      )}
      {...props}
    />
  )
}

const LogContext = React.createContext<{ mountedRef: React.RefObject<boolean> }>({
  mountedRef: { current: false },
})

type ActivityLogEntriesProps = React.ComponentProps<"div"> & {
  /** Keep the newest entry in view, but only if the reader was already at the bottom. */
  stickToBottom?: boolean
}

/**
 * The entries, oldest first. A live log: screen readers hear new entries
 * politely. Scrolls once it's taller than --activity-log-height.
 */
function ActivityLogEntries({ className, stickToBottom = true, children, ...props }: ActivityLogEntriesProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const atBottom = React.useRef(true)
  const mountedRef = React.useRef(false)
  const count = React.Children.count(children)

  React.useEffect(() => {
    mountedRef.current = true
  }, [])

  React.useLayoutEffect(() => {
    const el = ref.current
    if (el && stickToBottom && atBottom.current) el.scrollTop = el.scrollHeight
  }, [count, stickToBottom])

  const context = React.useMemo(() => ({ mountedRef }), [])

  return (
    <LogContext value={context}>
      <div
        ref={ref}
        role="log"
        tabIndex={0}
        data-slot="activity-log-entries"
        onScroll={(event) => {
          const el = event.currentTarget
          atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 8
        }}
        className={cn(
          "max-h-(--activity-log-height) overflow-y-auto overscroll-contain rounded-b-(--bevel-radius-xs) outline-none focus-visible:ring-2 focus-visible:ring-(--bevel-pen-blue)/40",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </LogContext>
  )
}

type ActivityLogKind = "thought" | "action" | "question" | "response" | "error"

const kindText: Record<ActivityLogKind, string> = {
  thought: "Thought",
  action: "Action",
  question: "Question",
  response: "Response",
  error: "Error",
}

type ActivityLogEntryProps = React.ComponentProps<"div"> & {
  kind?: ActivityLogKind
  /** When it happened, as shown. Pass a dateTime for machines. */
  time?: React.ReactNode
  dateTime?: string
}

/**
 * One entry: when, what kind, and what. Questions waiting on a person are
 * highlighted. Entries added after the log renders print in.
 */
function ActivityLogEntry({
  className,
  kind = "action",
  time,
  dateTime,
  children,
  ...props
}: ActivityLogEntryProps) {
  const { mountedRef } = React.useContext(LogContext)
  const [prints] = React.useState(() => mountedRef.current)
  return (
    <div
      data-slot="activity-log-entry"
      data-kind={kind}
      data-enter={prints ? "" : undefined}
      className={cn(
        "grid grid-cols-[var(--activity-log-time)_var(--activity-log-kind)_minmax(0,1fr)] items-baseline gap-x-2 border-b border-(--bevel-paper-rule) px-4 py-2.5 last:border-b-0",
        "data-[kind=question]:bg-(--activity-log-question)",
        "transition-[translate,opacity] duration-(--bevel-duration-move) ease-(--bevel-ease-out) motion-reduce:transition-none",
        "data-enter:starting:-translate-y-(--activity-log-print-in) data-enter:starting:opacity-0",
        className
      )}
      {...props}
    >
      <time
        dateTime={dateTime}
        className="font-mono text-(length:--bevel-fine) text-(--bevel-paper-muted) tabular-nums"
      >
        {time}
      </time>
      <span className="text-(length:--bevel-fine) font-bold tracking-(--bevel-tracking-print) text-(--activity-log-ink) uppercase">
        {kindText[kind]}
      </span>
      <div
        className={cn(
          "flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1 text-(--bevel-paper-foreground)",
          kind === "thought" && "text-(--bevel-pencil) italic"
        )}
      >
        {children}
      </div>
    </div>
  )
}

export { ActivityLog, ActivityLogTitle, ActivityLogEntries, ActivityLogEntry }
export type { ActivityLogKind, ActivityLogEntryProps }
