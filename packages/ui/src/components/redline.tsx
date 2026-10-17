"use client"

import * as React from "react"
import { cn } from "cn"

type RedlineDecision = "accepted" | "rejected"

type RedlineContextValue = {
  decisions: Record<string, RedlineDecision>
  decide: (id: string, decision: RedlineDecision | undefined) => void
  /** Decide several changes in one update. */
  decideMany: (updates: Record<string, RedlineDecision>) => void
  register: (id: string) => () => void
  ids: string[]
}

const RedlineContext = React.createContext<RedlineContextValue | null>(null)

function useRedline() {
  const context = React.useContext(RedlineContext)
  if (!context) throw new Error("Redline parts must be inside <Redline>")
  return context
}

type RedlineProps = React.ComponentProps<"div"> & {
  decisions?: Record<string, RedlineDecision>
  defaultDecisions?: Record<string, RedlineDecision>
  onDecisionsChange?: (decisions: Record<string, RedlineDecision>) => void
}

/** A document with proposed edits. Nothing is applied until someone decides. */
function Redline({
  className,
  decisions: decisionsProp,
  defaultDecisions = {},
  onDecisionsChange,
  ...props
}: RedlineProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultDecisions)
  const decisions = decisionsProp ?? uncontrolled
  const [ids, setIds] = React.useState<string[]>([])
  // Stable, so a decision doesn't make every change re-register.
  const register = React.useCallback((id: string) => {
    setIds((list) => (list.includes(id) ? list : [...list, id]))
    return () => setIds((list) => list.filter((x) => x !== id))
  }, [])

  const context = React.useMemo<RedlineContextValue>(
    () => ({
      decisions,
      ids,
      decide: (id, decision) => {
        const next = { ...decisions }
        if (decision) next[id] = decision
        else delete next[id]
        if (decisionsProp === undefined) setUncontrolled(next)
        onDecisionsChange?.(next)
      },
      decideMany: (updates) => {
        const next = { ...decisions, ...updates }
        if (decisionsProp === undefined) setUncontrolled(next)
        onDecisionsChange?.(next)
      },
      register,
    }),
    [decisions, ids, decisionsProp, onDecisionsChange, register]
  )

  return (
    <RedlineContext value={context}>
      <div
        data-slot="redline"
        className={cn("bevel-paper flex w-full max-w-xl flex-col rounded-(--bevel-radius-xs)", className)}
        {...props}
      />
    </RedlineContext>
  )
}

/** The text being edited. */
function RedlineDocument({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="redline-document"
      className={cn("p-5 text-base leading-loose text-(--bevel-paper-foreground)", className)}
      {...props}
    />
  )
}

type RedlineChangeProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** Stable id for this change. */
  id: string
  /** Text taken out. */
  deletion?: string
  /** Text put in. */
  insertion?: string
}

/**
 * One proposed edit, marked in red ink with a flag to accept or reject it.
 * Accepted shows the new text; rejected keeps the original.
 */
function RedlineChange({ id, deletion, insertion, className, ...props }: RedlineChangeProps) {
  const { decisions, decide, register } = useRedline()
  React.useEffect(() => register(id), [id, register])
  const decision = decisions[id]

  if (decision === "accepted") {
    return (
      <span data-slot="redline-change" data-decision="accepted" className={className} {...props}>
        {insertion}
      </span>
    )
  }
  if (decision === "rejected") {
    return (
      <span data-slot="redline-change" data-decision="rejected" className={className} {...props}>
        {deletion}
      </span>
    )
  }

  const summary = [deletion && `delete “${deletion}”`, insertion && `insert “${insertion}”`]
    .filter(Boolean)
    .join(", ")

  return (
    <span
      data-slot="redline-change"
      data-decision="pending"
      role="group"
      aria-label={`Proposed change: ${summary}`}
      className={cn("text-(--bevel-pen-red)", className)}
      {...props}
    >
      {deletion && (
        <del className="decoration-(--bevel-pen-red) decoration-(length:--redline-strike)">
          <span className="sr-only">deleted: </span>
          {deletion}
        </del>
      )}
      {deletion && insertion && " "}
      {insertion && (
        <ins className="underline decoration-(--bevel-pen-red) decoration-double underline-offset-4">
          <span className="sr-only">inserted: </span>
          {insertion}
        </ins>
      )}
      <span
        data-slot="redline-flag"
        className="redline-flag-shape mx-1 inline-flex translate-y-0.5 items-center gap-0.5 bg-(--redline-flag) py-0.5 pr-1 pl-2.5 align-middle text-(--redline-flag-foreground) shadow-(--bevel-depth-sheet)"
      >
        <FlagButton label="Accept change" onClick={() => decide(id, "accepted")}>
          <path d="M3 8.5l3 3 7-7.5" />
        </FlagButton>
        <FlagButton label="Reject change" onClick={() => decide(id, "rejected")}>
          <path d="M4 4l8 8M12 4l-8 8" />
        </FlagButton>
      </span>
    </span>
  )
}

function FlagButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-grid size-6 cursor-pointer place-items-center rounded-(--bevel-radius-xs) outline-none hover:bg-(--redline-flag-foreground)/10 focus-visible:ring-2 focus-visible:ring-(--bevel-pen-blue)/60"
    >
      <svg viewBox="0 0 16 16" aria-hidden className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </button>
  )
}

/** Count of open changes, with accept-all and reject-all. */
function RedlineToolbar({ className, ...props }: React.ComponentProps<"div">) {
  const { ids, decisions, decideMany } = useRedline()
  const pending = ids.filter((id) => !decisions[id])
  const applyAll = (decision: RedlineDecision) =>
    decideMany(Object.fromEntries(pending.map((id) => [id, decision])))
  return (
    <div
      role="toolbar"
      aria-label="Changes"
      data-slot="redline-toolbar"
      className={cn(
        "flex items-center justify-between gap-3 border-t border-(--bevel-paper-rule) px-5 py-3 text-sm",
        className
      )}
      {...props}
    >
      <span aria-live="polite" className="text-(--bevel-paper-muted)">
        {pending.length === 0
          ? "All changes decided"
          : `${pending.length} change${pending.length === 1 ? "" : "s"} to review`}
      </span>
      <span className="flex gap-2">
        <ToolbarButton disabled={pending.length === 0} onClick={() => applyAll("rejected")}>
          Reject all
        </ToolbarButton>
        <ToolbarButton disabled={pending.length === 0} onClick={() => applyAll("accepted")}>
          Accept all
        </ToolbarButton>
      </span>
    </div>
  )
}

function ToolbarButton(props: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className="h-8 rounded-(--bevel-radius-sm) border border-(--bevel-paper-foreground)/30 px-3 font-medium text-(--bevel-paper-foreground) outline-none hover:bg-(--bevel-paper-foreground)/5 focus-visible:ring-2 focus-visible:ring-(--bevel-pen-blue)/50 disabled:opacity-50"
      {...props}
    />
  )
}

export { Redline, RedlineDocument, RedlineChange, RedlineToolbar }
export type { RedlineDecision, RedlineProps, RedlineChangeProps }
