"use client"

import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cn } from "cn"

type KanbanRackContextValue = {
  capacity: number
  inUse: string[]
  free: number
  statusId: string
}

const KanbanRackContext = React.createContext<KanbanRackContextValue | null>(null)

function useKanbanRack() {
  const context = React.useContext(KanbanRackContext)
  if (!context) throw new Error("KanbanRack parts must be inside <KanbanRack>")
  return context
}

type KanbanRackProps = React.ComponentProps<"div"> & {
  /** How many cards the rack holds: the most work allowed in progress. */
  capacity: number
  /** What each card that's out is being used for, in the order taken. */
  inUse: string[]
}

/**
 * A rack of kanban cards. Starting work takes a card; finishing returns
 * it. When the rack is empty, nothing new starts. Give it an aria-label.
 */
function KanbanRack({ className, capacity, inUse, children, ...props }: KanbanRackProps) {
  const statusId = React.useId()
  const free = Math.max(0, capacity - inUse.length)
  const context = React.useMemo(() => ({ capacity, inUse, free, statusId }), [capacity, inUse, free, statusId])
  return (
    <KanbanRackContext value={context}>
      <div
        role="group"
        data-slot="kanban-rack"
        data-full={free === 0 ? "" : undefined}
        className={cn("flex w-full max-w-md flex-col items-center gap-4", className)}
        {...props}
      >
        {children}
      </div>
    </KanbanRackContext>
  )
}

/** The board of pockets: a card stands in each free pocket; an empty one says what its card is doing. */
function KanbanRackPockets({ className, ...props }: React.ComponentProps<"ul">) {
  const { capacity, inUse } = useKanbanRack()
  return (
    <ul
      aria-label="Cards"
      data-slot="kanban-rack-pockets"
      className={cn(
        "bevel-metal bevel-object grid w-full grid-flow-col auto-cols-fr gap-2 rounded-(--bevel-radius-md) px-3 pt-8 pb-3",
        className
      )}
      {...props}
    >
      {Array.from({ length: capacity }, (_, i) => {
        // Cards leave from the right, so the free ones stay together on the left.
        const task = inUse[capacity - 1 - i]
        return <KanbanRackPocket key={i} number={i + 1} task={task} />
      })}
    </ul>
  )
}

function KanbanRackPocket({ number, task }: { number: number; task?: string }) {
  const out = task !== undefined
  return (
    <li
      data-slot="kanban-rack-pocket"
      data-out={out ? "" : undefined}
      className="relative h-16 min-w-0 rounded-(--bevel-radius-xs) bg-(--bevel-material-recess) shadow-(--bevel-depth-recessed)"
    >
      <span
        aria-hidden
        data-slot="kanban-rack-card"
        className={cn(
          "absolute inset-x-1 bottom-2 flex h-20 flex-col overflow-hidden rounded-(--bevel-radius-xs) bg-(--kanban-rack-card) text-(--kanban-rack-card-foreground) shadow-(--bevel-depth-sheet)",
          "transition-[translate,opacity] duration-(--bevel-duration-move) ease-(--bevel-ease-out) motion-reduce:transition-none",
          "in-data-out:-translate-y-(--bevel-lift) in-data-out:opacity-0"
        )}
      >
        <span className="h-2 bg-(--kanban-rack-card-stripe)" />
        <span className="px-1.5 pt-1 text-(length:--bevel-fine) font-bold tracking-(--bevel-tracking-label) uppercase">
          Card {number}
        </span>
      </span>
      {/* The pocket's front lip hides the card's lower half. */}
      <span aria-hidden className="bevel-metal absolute inset-x-0 bottom-0 h-7 rounded-b-(--bevel-radius-xs)" />
      <span className="absolute inset-x-0 bottom-0 flex h-7 items-center justify-center px-1 text-center text-(length:--bevel-fine) leading-tight font-semibold">
        {out ? (
          <span className="truncate rounded-(--bevel-radius-xs) bg-(--kanban-rack-out) px-1 text-(--kanban-rack-card-foreground)">
            <span className="sr-only">Out: </span>
            {task}
          </span>
        ) : (
          <span className="sr-only">Card {number}, free</span>
        )}
      </span>
    </li>
  )
}

/** "1 of 3 free", or that the rack is empty. */
function KanbanRackStatus({ className, ...props }: React.ComponentProps<"p">) {
  const { capacity, free, statusId } = useKanbanRack()
  return (
    <p id={statusId} role="status" data-slot="kanban-rack-status" className={cn("text-center text-sm text-muted-foreground", className)} {...props}>
      {free === 0 ? `No cards free. Finish something to start more.` : `${free} of ${capacity} free`}
    </p>
  )
}

/** Starts work by taking a card. Disabled while the rack is empty. */
function KanbanRackTake({ className, ...props }: ButtonPrimitive.Props) {
  const { free, statusId } = useKanbanRack()
  return (
    <ButtonPrimitive
      data-slot="kanban-rack-take"
      disabled={free === 0}
      focusableWhenDisabled
      aria-describedby={statusId}
      className={cn(
        "bevel-raised h-10 rounded-(--bevel-radius-sm) px-5 text-sm font-semibold text-(--kanban-rack-card-foreground) outline-none [--bevel-material:var(--kanban-rack-card)]",
        "transition-[translate,box-shadow] duration-(--bevel-duration-press) ease-(--bevel-ease-out) active:translate-y-0.5 active:bevel-pressed motion-reduce:transition-none",
        "focus-visible:ring-3 focus-visible:ring-ring/60 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { KanbanRack, KanbanRackPockets, KanbanRackStatus, KanbanRackTake }
export type { KanbanRackProps }
